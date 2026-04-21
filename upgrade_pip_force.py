#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Package info
required_version = '26.0.1'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    print(f"[*] Upgrading pip to {required_version} with force-reinstall...")
    stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages --force-reinstall --no-cache-dir pip=={required_version}', timeout=120)
    
    # Read output
    install_output = stdout.read().decode()
    install_error = stderr.read().decode()
    
    print(install_output[-1500:] if len(install_output) > 1500 else install_output)
    if install_error and "Successfully installed" not in install_error:
        print("\nWarnings/Errors (last 500 chars):", install_error[-500:])
    
    # Verify
    print("\n[*] Verifying pip version...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip --version')
    verify_output = stdout.read().decode()
    
    print(f"[+] Pip version: {verify_output.strip()}")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
