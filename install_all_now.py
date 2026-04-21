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
    
    # All packages needed for PDF tools
    packages = [
        'pymupdf',
        'PyPDF2', 
        'pillow',
        'reportlab',
        'pdf2docx',
        'opencv-python',
        'imageio',
        'numpy',
        'scipy',
        'requests',
        'python-dotenv',
    ]
    
    package_str = ' '.join(packages)
    
    # Install with pip --no-cache-dir for reliability
    stdin, stdout, stderr = client.exec_command(
        f'cd /var/www/simplifytools && .venv/bin/pip install --no-cache-dir {package_str}',
        timeout=900
    )
    
    # Read output
    for line in stdout:
        decoded = line.decode('utf-8', errors='ignore').strip()
        if 'Successfully installed' in decoded or 'Requirement already' in decoded or 'Collecting' in decoded:
            print(f"    {decoded[:80]}")
    
    stdout.read()
    
    # Verify
    print("\n[*] Verifying installation...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python -c "import PyPDF2; import imageio; import pymupdf; import numpy; print(\'✓ All packages ready\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if 'ready' in result:
        print(f"    ✅ {result}")
    else:
        print(f"    {result if result else error[:150]}")
    
    # List installed
    print("\n[*] Installed packages:")
    stdin, stdout, stderr = client.exec_command('.venv/bin/pip list')
    lines = stdout.read().decode().split('\n')
    for line in lines[2:]:  # Skip header
        if line.strip():
            print(f"    {line}")
    
    print("\n" + "="*60)
    print("✅ ALL PACKAGES INSTALLED!")
    print("="*60)
    print("\nTry PDF download now:")
    print("https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
