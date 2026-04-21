#!/usr/bin/env python3
import paramiko
import sys

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
    stdout.read()
    
    # Full rebuild with longer timeout
    print("[*] Running production build (2-3 min)...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && NODE_ENV=production npm run build', timeout=300)
    build_output = stdout.read().decode()
    build_error = stderr.read().decode()
    
    # Show last 50 lines
    lines = (build_output + build_error).split('\n')
    print('\n'.join(lines[-50:]))
    
    # Verify
    print("\n[*] Checking build files...")
    stdin, stdout, stderr = client.exec_command('ls /var/www/simplifytools/.next/ && file /var/www/simplifytools/.next/BUILD_ID')
    verify = stdout.read().decode()
    print(verify)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
