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
    
    # Check nginx config for the 403 issue
    print("\n[*] Checking nginx error log...")
    stdin, stdout, stderr = client.exec_command('tail -50 /var/log/nginx/error.log')
    error_log = stdout.read().decode()
    print(error_log[-1000:] if len(error_log) > 1000 else error_log)
    
    # Check file permissions
    print("\n[*] Checking static files directory permissions...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/html/simplifyconvert/.next/static/ 2>/dev/null | head -20')
    perms = stdout.read().decode()
    print(perms if perms else "Directory not found at expected location")
    
    # Find where Next.js files are actually located
    print("\n[*] Finding .next directory...")
    stdin, stdout, stderr = client.exec_command('find / -name ".next" -type d 2>/dev/null | head -10')
    next_dirs = stdout.read().decode()
    print(next_dirs if next_dirs else "No .next directories found")
    
    # Check nginx config for location blocks
    print("\n[*] Checking nginx config...")
    stdin, stdout, stderr = client.exec_command('grep -A 5 "location.*_next" /etc/nginx/sites-available/* 2>/dev/null')
    nginx_config = stdout.read().decode()
    print(nginx_config if nginx_config else "No location block for _next found")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
