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
    
    # Check if tensorflow is installed
    print("[*] Checking if tensorflow is installed...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show tensorflow')
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if 'not found' in error.lower() or 'WARNING' in output or output.strip() == '':
        print("[!] tensorflow not installed.")
        
        # Check if body-pix is installed (which should install tensorflow)
        print("[*] Checking if body-pix is installed...")
        stdin, stdout, stderr = client.exec_command('python3 -m pip show body-pix')
        bodypix_output = stdout.read().decode()
        
        if bodypix_output.strip():
            print("[+] body-pix is installed, tensorflow should be as indirect dependency")
            print(bodypix_output)
        else:
            print("[!] Neither tensorflow nor body-pix found. Installing body-pix...")
            stdin, stdout, stderr = client.exec_command('python3 -m pip install body-pix')
            install_output = stdout.read().decode()
            install_error = stderr.read().decode()
            print(install_output)
            if install_error:
                print("Errors/Warnings:", install_error)
        
        # Verify tensorflow installation
        print("\n[*] Verifying tensorflow installation...")
        stdin, stdout, stderr = client.exec_command('python3 -c "import tensorflow; print(f\'tensorflow version: {tensorflow.__version__}\')"')
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
                print(f"[+] tensorflow already installed (version {version})")
        print(output)
        
        # Also check body-pix
        print("\n[*] Checking which packages require tensorflow...")
        stdin, stdout, stderr = client.exec_command('python3 -m pip show tensorflow')
        tf_output = stdout.read().decode()
        for line in tf_output.split('\n'):
            if line.startswith('Required-by:'):
                print("Required by:", line.split(':')[1].strip())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
