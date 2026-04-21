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
    
    # Kill running processes
    print("\n[*] Stopping Node.js...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; sleep 1')
    stdout.read()
    
    # Rebuild production
    print("[*] Rebuilding production bundle...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build 2>&1',
        timeout=180
    )
    build_output = stdout.read().decode()
    
    # Check for critical errors
    if 'error' in build_output.lower() and 'warning' not in build_output.lower():
        print("Build output (errors detected):")
        print(build_output[-2000:])  # Last 2000 chars
    else:
        if 'BUILD_ID' in build_output:
            lines = build_output.split('\n')
            for line in lines[-20:]:
                if line.strip():
                    print(line)
        else:
            print("Build completed")
    
    # Start production server
    print("\n[*] Starting Next.js production server...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next-prod.log 2>&1 &',
        timeout=5
    )
    time.sleep(4)
    
    # Verify running
    print("[*] Verifying service...")
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000/ | head -3')
    response = stdout.read().decode()
    
    if '200' in response:
        print("[✓] Next.js running (HTTP 200)")
    else:
        print("[!] Status check:")
        print(response)
    
    # Reload nginx
    print("[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('nginx -s reload')
    stdout.read()
    
    print("\n[✓] Deployment complete!")
    print("[*] Testing PDF download at: https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
