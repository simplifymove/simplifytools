#!/usr/bin/env python3
"""
Fix SSL by adding HSTS headers and clearing any potential issues
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("ADDING HSTS HEADERS AND SECURITY FIXES")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Updating Nginx with HSTS headers...")
        nginx_config = """upstream app {
    server 127.0.0.1:3000;
}

# HTTP to HTTPS redirect (both www and non-www)
server {
    listen 80;
    listen [::]:80;
    server_name www.simplifyconvert.com simplifyconvert.com;
    return 301 https://www.simplifyconvert.com$request_uri;
}

# HTTPS redirect non-www to www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name simplifyconvert.com;

    ssl_certificate /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Redirect to www version
    return 301 https://www.simplifyconvert.com$request_uri;
}

# Main HTTPS server (www only)
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

    # HSTS header - tells browser to always use HTTPS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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
        print("✓ Nginx config updated with HSTS headers")
        
        print("\n[3] Testing Nginx configuration...")
        output = run_cmd(client, "nginx -t")
        print(output)
        
        print("\n[4] Reloading Nginx...")
        run_cmd(client, "systemctl reload nginx")
        print("✓ Nginx reloaded")
        
        print("\n[5] Verifying HTTPS response...")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com 2>&1 | head -15")
        print(output)
        
        print("\n[6] Verifying non-www redirects to www...")
        output = run_cmd(client, "curl -I https://simplifyconvert.com 2>&1 | head -5")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ COMPLETE! SSL is now fully secured")
        print("\n📋 NEXT STEPS FOR YOU:")
        print("1. Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)")
        print("2. Or clear browser cache completely")
        print("3. Try accessing both:")
        print("   - https://simplifyconvert.com (should show secure)")
        print("   - https://www.simplifyconvert.com (should show secure)")
        print("4. The browser will now remember HTTPS forever (HSTS)")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
