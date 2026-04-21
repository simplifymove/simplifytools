#!/usr/bin/env python3
import paramiko
import time

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("[*] Installing ALL required Python packages...")
    print("    This will take 3-5 minutes...\n")
    
    # All packages needed
    packages = 'pymupdf PyPDF2 pillow reportlab pdf2docx opencv-python imageio numpy scipy requests python-dotenv'
    
    # Install
    stdin, stdout, stderr = client.exec_command(
        f'cd /var/www/simplifytools && .venv/bin/pip install --no-cache-dir {packages}',
        timeout=900
    )
    
    # Read all output
    output = stdout.read().decode('utf-8', errors='ignore')
    print("Installation output (last 50 lines):")
    lines = output.split('\n')
    for line in lines[-50:]:
        if line.strip():
            print(f"  {line}")
    
    # Verify
    print("\n[*] Verifying installation...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python -c "import PyPDF2; import imageio; import pymupdf; import numpy; print(\'✓ All packages ready\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if 'ready' in result:
        print(f"    ✅ {result}")
    elif error:
        print(f"    ❌ {error[:150]}")
    else:
        print(f"    {result if result else 'Check complete'}")
    
    # List installed
    print("\n[*] Checking installed packages:")
    stdin, stdout, stderr = client.exec_command('.venv/bin/pip list')
    lines = stdout.read().decode().split('\n')
    count = 0
    for line in lines:
        if line.strip() and 'Package' not in line and '-' not in line:
            count += 1
            print(f"    {line}")
    
    print(f"\n✅ Total: {count} packages installed")
    print("\nTry PDF download now:")
    print("https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
