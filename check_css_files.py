#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Check what CSS files exist
    print("\n[*] CSS files in static/chunks/:")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/static/chunks/ | grep ".css" | head -10')
    print(stdout.read().decode())
    
    # Check current nginx config
    print("\n[*] Current nginx location block:")
    stdin, stdout, stderr = client.exec_command('grep -A 8 "location /_next/static" /etc/nginx/sites-available/www.simplifyconvert.com')
    print(stdout.read().decode())
    
    # Check if the specific file exists
    print("\n[*] Checking for the specific CSS file:")
    stdin, stdout, stderr = client.exec_command('find /var/www/simplifytools -name "0eb90d5d6985e755.css" 2>/dev/null')
    result = stdout.read().decode()
    print(result if result else "File not found - may need rebuild")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
