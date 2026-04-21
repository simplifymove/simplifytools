#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Backup original
    print("[*] Backing up nginx config...")
    stdin, stdout, stderr = client.exec_command("cp /etc/nginx/sites-available/www.simplifyconvert.com /etc/nginx/sites-available/www.simplifyconvert.com.bak")
    
    # Create new config with static file handling
    new_config = """upstream app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name www.simplifyconvert.com simplifyconvert.com;
    return 301 https://$server_name$request_uri;
}

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
    
    # Serve static files directly with correct MIME types
    location /_next/static/ {
        alias /root/simplifytools/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        # Let nginx set proper MIME types
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
    
    # Write new config
    print("[*] Creating updated nginx config...")
    stdin, stdout, stderr = client.exec_command(f"""cat > /tmp/nginx_config_new << 'EOF'
{new_config}
EOF
""")
    
    # Move to proper location
    stdin, stdout, stderr = client.exec_command("mv /tmp/nginx_config_new /etc/nginx/sites-available/www.simplifyconvert.com")
    
    # Test config
    print("[*] Testing nginx configuration...")
    stdin, stdout, stderr = client.exec_command("nginx -t 2>&1")
    test_output = stdout.read().decode()
    
    print(f"[+] Test result: {test_output}")
    
    if "successful" in test_output:
        # Reload nginx
        print("[*] Reloading nginx...")
        stdin, stdout, stderr = client.exec_command("systemctl reload nginx")
        
        print("[+] Nginx reloaded successfully!")
        print("\n[✓] Static file serving configured!")
        
    else:
        print("[!] Configuration test failed, restoring backup...")
        stdin, stdout, stderr = client.exec_command("cp /etc/nginx/sites-available/www.simplifyconvert.com.bak /etc/nginx/sites-available/www.simplifyconvert.com")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
