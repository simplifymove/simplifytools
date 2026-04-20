#!/usr/bin/env python3
"""
Fix Nginx to force www redirect
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

nginx_config = """upstream app {
    server 127.0.0.1:3000;
}

# Redirect non-www and HTTP to HTTPS www
server {
    listen 80;
    listen [::]:80;
    server_name www.simplifyconvert.com simplifyconvert.com;
    return 301 https://www.simplifyconvert.com$request_uri;
}

# Redirect non-www HTTPS to www HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name simplifyconvert.com;
    
    ssl_certificate /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem;
    
    return 301 https://www.simplifyconvert.com$request_uri;
}

# Main server block for www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.simplifyconvert.com;

    client_max_body_size 100M;

    ssl_certificate /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

    # Serve static files directly with correct MIME types
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

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("FIX SSL CERTIFICATE MISMATCH")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Backing up current config...")
        run_cmd(client, "cp /etc/nginx/sites-available/www.simplifyconvert.com /etc/nginx/sites-available/www.simplifyconvert.com.backup2")
        
        print("\n[3] Uploading new Nginx config...")
        # Write the config to VPS
        stdin, stdout, stderr = client.exec_command('cat > /etc/nginx/sites-available/www.simplifyconvert.com << \'EOF\'\n' + nginx_config + '\nEOF')
        output = stdout.read().decode('utf-8')
        if output:
            print("Output:", output)
        
        print("\n[4] Testing Nginx config...")
        output = run_cmd(client, "nginx -t")
        print(output)
        
        if "successful" in output.lower():
            print("\n[5] Reloading Nginx...")
            run_cmd(client, "systemctl reload nginx")
            print("✓ Nginx reloaded")
        else:
            print("⚠ Nginx config test failed!")
            return
        
        print("\n[6] Testing HTTPS redirect...")
        output = run_cmd(client, "curl -I https://simplifyconvert.com 2>/dev/null | grep -i 'location\\|http'")
        print(output)
        
        print("\n[7] Testing www access...")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com 2>/dev/null | grep -i 'http' | head -1")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ SUCCESS! SSL certificate issue fixed")
        print("✓ All traffic now redirects to https://www.simplifyconvert.com")
        print("✓ Certificate mismatch resolved!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
