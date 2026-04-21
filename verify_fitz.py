#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("[*] Checking fitz status...\n")
    
    # Test import
    print("[1] Testing fitz import...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python -c "import fitz; print(\'✓ fitz works\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if error:
        print(f"    ❌ Error: {error[:200]}")
    else:
        print(f"    ✅ {result}")
    
    # List installed
    print("\n[2] Installed PDF packages:")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/pip list | grep -E "pymupdf|fitz|PyPDF|pike"'
    )
    packages = stdout.read().decode()
    for line in packages.split('\n'):
        if line.strip():
            print(f"    {line}")
    
    print("\n✅ Ready! Try PDF now")
    print("https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
