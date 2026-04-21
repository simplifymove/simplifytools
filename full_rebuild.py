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
    
    # Clean build
    print("\n[*] Cleaning old build...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && rm -rf .next .turbo out')
    stdout.read().decode()
    
    # Full rebuild
    print("[*] Running full production build (this may take 2-3 minutes)...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build 2>&1',
        timeout=300
    )
    
    # Stream output in real-time
    for line in stdout:
        line = line.decode('utf-8', errors='ignore').rstrip()
        if line:
            print(line)
    
    # Check for errors
    err = stderr.read().decode()
    if err:
        print("\n[!] Warnings/Errors:")
        print(err[-500:])
    
    # Verify build succeeded
    print("\n[*] Verifying build...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/ | head -15')
    output = stdout.read().decode()
    print(output)
    
    # Check for build-id or manifest
    stdin, stdout, stderr = client.exec_command('[[ -f /var/www/simplifytools/.next/BUILD_ID ]] && echo "BUILD_ID: $(cat /var/www/simplifytools/.next/BUILD_ID)" || echo "No BUILD_ID found"')
    build_id = stdout.read().decode()
    print(f"[+] {build_id.strip()}")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
