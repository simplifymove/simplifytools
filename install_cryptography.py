#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Package info
package_name = 'cryptography'
required_version = '46.0.6'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    print(f"[*] Checking {package_name}...")
    stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {package_name}')
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if output.strip():
        # Extract version
        current_version = None
        for line in output.split('\n'):
            if line.startswith('Version:'):
                current_version = line.split(':')[1].strip()
                break
        
        if current_version:
            print(f"[+] {package_name} already installed (version {current_version})")
            print(f"[+] Required version: {required_version}")
            
            # Simple version comparison
            if current_version >= required_version:
                print(f"[+] Version {current_version} >= {required_version} ✓ SATISFIED")
            else:
                print(f"[!] Version {current_version} < {required_version} - Need to upgrade")
                print(f"[*] Upgrading {package_name} to {required_version}...")
                stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages --upgrade {package_name}=={required_version}')
                upgrade_output = stdout.read().decode()
                print(upgrade_output[-1000:] if len(upgrade_output) > 1000 else upgrade_output)
    else:
        print(f"[-] {package_name} not installed")
        print(f"[*] Installing {package_name}=={required_version}...")
        stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages {package_name}=={required_version}')
        install_output = stdout.read().decode()
        print(install_output[-1000:] if len(install_output) > 1000 else install_output)
        
        # Verify
        stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {package_name}')
        verify = stdout.read().decode()
        print("[+] VERIFIED:")
        for line in verify.split('\n')[:3]:
            if line.strip():
                print("  ", line)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
