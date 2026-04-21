#!/usr/bin/env python3
import paramiko
import sys
import time

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
    
    # Check PyYAML with pip show
    print("[*] Checking PyYAML version...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show PyYAML')
    output = stdout.read().decode()
    
    print(output)
    
    # Also test import
    print("\n[*] Testing import...")
    stdin, stdout, stderr = client.exec_command('python3 -c "import yaml; print(f\'PyYAML version: {yaml.__version__}\')"')
    import_output = stdout.read().decode()
    import_error = stderr.read().decode()
    
    if import_error:
        print("Error:", import_error)
    else:
        print("Success:", import_output.strip())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
