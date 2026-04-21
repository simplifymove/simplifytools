#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Package info
package_name = 'pip'
required_version = '26.0.1'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    print(f"[*] Checking {package_name}...")
    stdin, stdout, stderr = client.exec_command(f'python3 -m pip --version')
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    print(f"[+] Current pip status: {output.strip()}")
    
    # Extract version from "pip X.Y.Z from ..."
    if 'pip' in output:
        parts = output.split()
        if len(parts) >= 2:
            current_version = parts[1]
            print(f"[+] Current version: {current_version}")
            print(f"[+] Required version: {required_version}")
            
            # Simple version comparison
            if current_version >= required_version:
                print(f"[+] Version {current_version} >= {required_version} ✓ SATISFIED")
            else:
                print(f"[!] Version {current_version} < {required_version} - Upgrading...")
                print(f"[*] Upgrading pip to {required_version}...")
                stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages --upgrade pip=={required_version}')
                upgrade_output = stdout.read().decode()
                print(upgrade_output[-1000:] if len(upgrade_output) > 1000 else upgrade_output)
                
                # Verify
                stdin, stdout, stderr = client.exec_command('python3 -m pip --version')
                verify = stdout.read().decode()
                print(f"\n[+] After upgrade: {verify.strip()}")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
