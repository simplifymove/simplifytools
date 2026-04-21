#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Package info
package_name = 'ghostscript'
required_version = '0.8.1'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Check if package is installed
    print(f"[*] Checking {package_name} installation...")
    stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {package_name}')
    output = stdout.read().decode()
    
    if output.strip():
        # Parse current version
        for line in output.split('\n'):
            if line.startswith('Version:'):
                current_version = line.split(':', 1)[1].strip()
                
                # Compare versions
                curr_parts = [int(x) for x in current_version.split('.')]
                req_parts = [int(x) for x in required_version.split('.')]
                
                if curr_parts >= req_parts:
                    print(f"✓ {package_name} version {current_version} >= {required_version} SATISFIED")
                else:
                    print(f"[!] Version {current_version} < {required_version} - Upgrading...")
                    stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages --upgrade {package_name}=={required_version}', timeout=120)
                    install_output = stdout.read().decode()
                    print(install_output[-800:] if len(install_output) > 800 else install_output)
                    
                    # Verify upgrade
                    stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {package_name}')
                    verify_output = stdout.read().decode()
                    for line in verify_output.split('\n'):
                        if line.startswith('Version:'):
                            new_version = line.split(':', 1)[1].strip()
                            print(f"[+] After upgrade: {package_name} {new_version}")
                break
    else:
        # Package not installed
        print(f"[!] {package_name} not found - Installing {required_version}...")
        stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages {package_name}=={required_version}', timeout=120)
        install_output = stdout.read().decode()
        print(install_output[-800:] if len(install_output) > 800 else install_output)
        
        # Verify installation
        stdin, stdout, stderr = client.exec_command(f'python3 -m pip show {package_name}')
        verify_output = stdout.read().decode()
        for line in verify_output.split('\n'):
            if line.startswith('Version:'):
                installed_version = line.split(':', 1)[1].strip()
                print(f"[+] Successfully installed: {package_name} {installed_version}")
                break
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
