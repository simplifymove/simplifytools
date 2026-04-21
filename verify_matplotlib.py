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
    
    print("[*] Verifying matplotlib installation...")
    stdin, stdout, stderr = client.exec_command('python3 -m pip show matplotlib')
    output = stdout.read().decode()
    errors = stderr.read().decode()
    
    if output.strip():
        print("[+] matplotlib installation verified:")
        for line in output.split('\n')[:5]:
            if line.strip():
                print("  ", line)
    else:
        print("[-] matplotlib not found")
        if errors:
            print("Errors:", errors[:500])
    
    # Try import
    print("\n[*] Testing import...")
    stdin, stdout, stderr = client.exec_command('python3 -c "import matplotlib; print(f\'✓ matplotlib {matplotlib.__version__} imported\')"')
    import_result = stdout.read().decode()
    import_error = stderr.read().decode()
    
    if import_error:
        print("Import Error:", import_error[:500])
    else:
        print("[+] SUCCESS:", import_result.strip())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] Connection error: {str(e)}')
    sys.exit(1)
