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
    
    # Remove broken .venv
    print("\n[*] Removing broken .venv symlink...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && rm -rf .venv venv')
    stdout.read()
    print("[✓] Removed")
    
    # Clean build again
    print("\n[*] Cleaning .next directory...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && rm -rf .next .turbo')
    stdout.read()
    
    # Rebuild
    print("[*] Rebuilding without .venv issues...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build',
        timeout=300
    )
    
    output = stdout.read().decode()
    errors = stderr.read().decode()
    
    # Show last 60 lines
    all_output = output + errors
    lines = all_output.split('\n')
    print('\n'.join(lines[-60:]))
    
    # Verify BUILD_ID exists
    if 'BUILD_ID' in output or 'successfully' in output.lower():
        print("\n[✓] Build completed!")
        stdin, stdout, stderr = client.exec_command('cat /var/www/simplifytools/.next/BUILD_ID')
        build_id = stdout.read().decode()
        print(f"[+] BUILD_ID: {build_id.strip()}")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
