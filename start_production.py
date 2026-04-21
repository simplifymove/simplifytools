#!/usr/bin/env python3
import paramiko
import sys
import time

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Kill any running process
    print("\n[*] Killing any existing Node processes...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; sleep 1')
    stdout.read()
    
    # Start production server
    print("[*] Starting Next.js production server...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next-prod.log 2>&1 &',
        timeout=5
    )
    time.sleep(4)
    
    # Test locally
    print("\n[*] Testing local connection...")
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000/ | head -10')
    response = stdout.read().decode()
    print(response)
    
    if '200' in response or '301' in response or '<' in response:
        print("\n[✓] Next.js is running on port 3000!")
    
    # Test CSS file
    print("\n[*] Testing CSS file access...")
    stdin, stdout, stderr = client.exec_command('curl -I http://localhost:3000/_next/static/css/*.css 2>/dev/null | head -15')
    css_test = stdout.read().decode()
    print(css_test if css_test.strip() else "[*] CSS path test (may show 404 due to wildcard)")
    
    # Reload nginx
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('nginx -s reload')
    stdout.read()
    print("[✓] Nginx reloaded")
    
    # Wait a moment then test external
    print("[*] Waiting for service to stabilize...")
    time.sleep(3)
    
    print("\n[✓] Service should be restored!")
    print("[*] Verify at: https://www.simplifyconvert.com/all-tools/pdf-tools")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
