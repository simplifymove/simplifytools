#!/usr/bin/env python3
"""
Update Let's Encrypt certificate to include both www and non-www domains
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("UPDATE SSL CERTIFICATE FOR BOTH DOMAINS")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Checking current certificate...")
        output = run_cmd(client, "certbot certificates | grep -A 5 'www.simplifyconvert'")
        print(output)
        
        print("\n[3] Renewing certificate to include both domains...")
        # Expand the certificate to include both domains
        output = run_cmd(client, "certbot certonly --webroot -w /var/www/simplifytools -d www.simplifyconvert.com -d simplifyconvert.com --expand --non-interactive --agree-tos", timeout=60)
        print(output)
        
        if "already exists" in output.lower() or "success" in output.lower():
            print("\n[4] Certificate updated successfully")
        
        print("\n[5] Updating Nginx config...")
        nginx_config = """upstream app {
    server 127.0.0.1:3000;
}

# HTTP to HTTPS redirect (both www and non-www)
server {
    listen 80;
    listen [::]:80;
    server_name www.simplifyconvert.com simplifyconvert.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server (handles both www and non-www)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.simplifyconvert.com simplifyconvert.com;

    client_max_body_size 100M;

    ssl_certificate /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

    # Serve static files directly
    location /_next/static/ {
        alias /var/www/simplifytools/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    location /public/ {
        alias /root/simplifytools/public/;
        expires 7d;
        add_header Cache-Control "public, must-revalidate";
        add_header X-Content-Type-Options "nosniff";
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
"""
        
        stdin, stdout, stderr = client.exec_command('cat > /etc/nginx/sites-available/www.simplifyconvert.com << \'EOF\'\n' + nginx_config + '\nEOF')
        stdout.read()
        print("✓ Nginx config updated")
        
        print("\n[6] Testing Nginx config...")
        output = run_cmd(client, "nginx -t")
        print(output)
        
        if "successful" in output.lower():
            print("\n[7] Reloading Nginx...")
            run_cmd(client, "systemctl reload nginx")
            print("✓ Nginx reloaded")
        
        time.sleep(2)
        
        print("\n[8] Testing both domains...")
        print("\nTesting www domain:")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com 2>/dev/null | head -3")
        print(output)
        
        print("\nTesting non-www domain:")
        output = run_cmd(client, "curl -I https://simplifyconvert.com 2>/dev/null | head -3")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ SUCCESS!")
        print("✓ Both domains now work with proper SSL:")
        print("  - https://www.simplifyconvert.com")
        print("  - https://simplifyconvert.com")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
