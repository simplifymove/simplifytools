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
    
    # List CSS files that should now be available
    print("\n[*] Production CSS files:")
    stdin, stdout, stderr = client.exec_command('find /var/www/simplifytools/.next/static -name "*.css" | head -10')
    css_files = stdout.read().decode()
    print(css_files)
    
    # Test endpoint
    print("\n[*] Testing CSS endpoint:")
    stdin, stdout, stderr = client.exec_command('curl -s -I https://www.simplifyconvert.com/_next/static/chunks/ 2>&1 | head -3')
    print(stdout.read().decode())
    
    # Check nginx error log for any new errors
    print("\n[*] Checking for errors:")
    stdin, stdout, stderr = client.exec_command('tail -5 /var/log/nginx/error.log 2>/dev/null | grep -i "403\|404\|permission" || echo "No recent errors"')
    print(stdout.read().decode())
    
    # Verify app is running
    print("\n[*] App status:")
    stdin, stdout, stderr = client.exec_command('ps aux | grep "next-server" | grep -v grep || echo "Starting..."')
    print(stdout.read().decode()[:200])
    
    client.close()
    print("\n✅ Verification complete! Try refreshing the page (Ctrl+Shift+R)")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
