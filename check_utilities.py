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
    
    # Standard utilities to check
    utilities = ['requests', 'click', 'tqdm', 'colorama', 'python-dotenv']
    
    for util in utilities:
        print(f"\n[*] Checking {util}...")
        stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {util}')
        output = stdout.read().decode()
        error = stderr.read().decode()
        
        if output.strip():
            # Extract version
            for line in output.split('\n'):
                if line.startswith('Version:'):
                    version = line.split(':')[1].strip()
                    print(f"[+] {util} installed (version {version})")
                    break
        else:
            print(f"[-] {util} not installed")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
