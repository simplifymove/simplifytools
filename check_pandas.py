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
    
    # Check if pandas is installed
    print("[*] Checking if pandas is installed...")
    stdin, stdout, stderr = client.exec_command('python3 -c "import pandas; print(pandas.__version__)"')
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if error and 'No module' in error:
        print("[!] pandas not installed")
    elif output:
        version = output.strip()
        print(f"[+] pandas is installed with version: {version}")
    else:
        print("[?] Could not determine pandas version")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
