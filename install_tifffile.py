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
    
    # Check if tifffile is installed
    print("[*] Checking if tifffile is installed...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show tifffile')
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if 'not found' in error.lower() or 'WARNING' in output or output.strip() == '':
        print("[!] tifffile not installed. Installing tifffile==2026.3.3...")
        
        # Install tifffile 2026.3.3
        stdin, stdout, stderr = client.exec_command('python3 -m pip install tifffile==2026.3.3')
        install_output = stdout.read().decode()
        install_error = stderr.read().decode()
        
        print(install_output)
        if install_error:
            print("Errors/Warnings:", install_error)
        
        # Verify installation
        print("\n[*] Verifying installation...")
        stdin, stdout, stderr = client.exec_command('python3 -c "import tifffile; print(f\'tifffile version: {tifffile.__version__}\')"')
        verify_output = stdout.read().decode()
        verify_error = stderr.read().decode()
        
        if verify_error:
            print("Error:", verify_error)
        else:
            print("[+] SUCCESS:", verify_output.strip())
    else:
        # Extract version from output
        for line in output.split('\n'):
            if line.startswith('Version:'):
                version = line.split(':')[1].strip()
                print(f"[+] tifffile already installed (version {version})")
        print(output)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
