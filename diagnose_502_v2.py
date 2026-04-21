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
    
    # Check where Node is actually running from
    print("\n[*] Checking working directory of Node process...")
    stdin, stdout, stderr = client.exec_command('cat /proc/188614/cwd')
    cwd = stdout.read().decode().strip()
    print(f"[+] Working directory: {cwd}")
    
    # List .next directories
    print("\n[*] Checking for .next builds...")
    stdin, stdout, stderr = client.exec_command('find / -name ".next" -type d 2>/dev/null | grep -v proc')
    builds = stdout.read().decode()
    print(builds)
    
    # Check nginx error log
    print("\n[*] Checking nginx error logs...")
    stdin, stdout, stderr = client.exec_command('tail -30 /var/log/nginx/error.log')
    errors = stdout.read().decode()
    print(errors[-1000:] if len(errors) > 1000 else errors)
    
    # Check if the app is actually serving
    print("\n[*] Checking if Next.js app is responding...")
    stdin, stdout, stderr = client.exec_command('curl -I http://localhost:3000/ 2>&1 | head -5')
    response = stdout.read().decode()
    print(response)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
