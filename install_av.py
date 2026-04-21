#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Package info
package_name = 'av'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    print(f"[*] Installing {package_name} with --break-system-packages...")
    stdin, stdout, stderr = client.exec_command(f'python3 -m pip install --break-system-packages {package_name}', timeout=120)
    
    # Read output
    install_output = stdout.read().decode()
    install_error = stderr.read().decode()
    
    print(install_output[-1500:] if len(install_output) > 1500 else install_output)
    if install_error and "Successfully installed" not in install_error:
        print("\nWarnings/Errors (last 500 chars):", install_error[-500:])
    
    # Verify
    print("\n[*] Verifying installation...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show av')
    verify_output = stdout.read().decode()
    
    if verify_output.strip():
        print("[+] VERIFIED:")
        for line in verify_output.split('\n')[:4]:
            if line.strip():
                print("  ", line)
    else:
        print("[-] Still not found after installation")
    
    # Import test
    stdin, stdout, stderr = client.exec_command('python3 -c "import av; print(f\'✓ av (PyAV) {av.__version__} imported successfully\')"')
    import_output = stdout.read().decode()
    import_error = stderr.read().decode()
    
    if import_error:
        print("Import Error:", import_error[:300])
    else:
        print("[+]", import_output.strip())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
