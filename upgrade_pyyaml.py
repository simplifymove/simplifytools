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
    
    print("[*] Upgrading PyYAML to 6.0.3...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip install --upgrade PyYAML==6.0.3')
    install_output = stdout.read().decode()
    install_error = stderr.read().decode()
    
    print(install_output)
    if install_error:
        print("Errors/Warnings:", install_error)
    
    # Verify installation
    print("\n[*] Verifying installation...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show PyYAML')
    verify_output = stdout.read().decode()
    verify_error = stderr.read().decode()
    
    if verify_error:
        print("Error:", verify_error)
    else:
        print("[+] VERIFICATION:", verify_output)
    
    # Also test import
    stdin, stdout, stderr = client.exec_command('python3 -c "import yaml; print(f\'PyYAML version: {yaml.__version__}\')"')
    import_output = stdout.read().decode()
    import_error = stderr.read().decode()
    
    if import_error:
        print("Import Error:", import_error)
    else:
        print("[+] SUCCESS:", import_output.strip())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
