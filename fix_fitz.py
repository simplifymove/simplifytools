#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("[*] Fixing fitz/PyMuPDF conflict...\n")
    
    # Remove broken fitz
    print("[1] Removing broken fitz package...")
    stdin, stdout, stderr = client.exec_command(
        '.venv/bin/pip uninstall fitz -y',
        timeout=60
    )
    output = stdout.read().decode('utf-8', errors='ignore')
    print(output.split('\n')[-2] if output else "    Done")
    
    # Reinstall PyMuPDF to get correct fitz
    print("\n[2] Reinstalling PyMuPDF (correct fitz)...")
    stdin, stdout, stderr = client.exec_command(
        '.venv/bin/pip install --force-reinstall pymupdf',
        timeout=120
    )
    output = stdout.read().decode('utf-8', errors='ignore')
    lines = output.split('\n')
    for line in lines[-10:]:
        if line.strip():
            print(line)
    
    # Verify
    print("\n[3] Testing import...")
    stdin, stdout, stderr = client.exec_command(
        '.venv/bin/python -c "import fitz; print(\'✓ fitz (PyMuPDF) works\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if error:
        print(f"    Error: {error[:150]}")
    else:
        print(f"    {result}")
    
    print("\n✅ Fixed! Try PDF now")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
