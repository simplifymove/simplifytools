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
    
    # Check if build succeeded
    print("\n[*] Checking build status...")
    stdin, stdout, stderr = client.exec_command('tail -20 /var/www/simplifytools/.next/build-product-info.json 2>/dev/null || ls -la /var/www/simplifytools/.next/ | grep -E "total|build"')
    print(stdout.read().decode())
    
    # List CSS files
    print("\n[*] CSS files generated:")
    stdin, stdout, stderr = client.exec_command('find /var/www/simplifytools/.next -name "*.css" | sort')
    css_files = stdout.read().decode()
    print(css_files if css_files else "No CSS files found")
    
    # Check app status
    print("\n[*] Application running status:")
    stdin, stdout, stderr = client.exec_command('ps aux | grep -i "next\|node" | grep -v grep')
    procs = stdout.read().decode()
    print(procs if procs else "No Next.js/Node process running")
    
    # Test the endpoint
    print("\n[*] Testing CSS endpoint again:")
    stdin, stdout, stderr = client.exec_command('curl -s -I https://www.simplifyconvert.com/_next/static/chunks/ --max-time 5 | head -5')
    test = stdout.read().decode()
    print(test if test else "Unable to reach endpoint")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
