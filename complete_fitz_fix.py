#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("[*] Complete fitz/PyMuPDF fix...\n")
    
    # Uninstall broken fitz completely
    print("[1] Removing all fitz packages...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/pip uninstall fitz pymupdf -y 2>&1',
        timeout=60
    )
    stdout.read()
    
    # Clean install PyMuPDF
    print("[2] Installing correct PyMuPDF...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/pip install pymupdf --no-cache-dir',
        timeout=180
    )
    output = stdout.read().decode('utf-8', errors='ignore')
    if 'Successfully installed' in output:
        print("    ✓ Installed")
    else:
        print(output[-200:])
    
    # Verify
    print("\n[3] Testing...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python -c "import fitz; import pymupdf; print(\'✓✓ OK\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if 'OK' in result:
        print(f"    {result}")
    else:
        print(f"    Error: {error[:100]}")
    
    print("\n✅ Done!")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
