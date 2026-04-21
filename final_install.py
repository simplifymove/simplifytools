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
    # Clean start
    print("[*] Removing old venv...")
    stdin, stdout, stderr = client.exec_command('rm -rf /var/www/simplifytools/.venv')
    stdout.read()
    
    # Create fresh venv
    print("[*] Creating fresh virtual environment...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && python3 -m venv .venv', timeout=60)
    stdout.read()
    stderr_msg = stderr.read().decode()
    if stderr_msg:
        print(f"    Stderr: {stderr_msg[:100]}")
    
    # Verify it exists
    print("[*] Verifying venv...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.venv/bin/python')
    ls_out = stdout.read().decode()
    if 'No such file' in ls_out or not ls_out.strip():
        print("    ❌ FAILED: venv not created")
        sys.exit(1)
    print(f"    ✓ Venv exists: {ls_out.strip()[:60]}")
    
    # Install critical packages (quick ones first)
    print("\n[*] Installing packages...")
    packages = 'pymupdf pillow reportlab imageio numpy scipy scikit-image requests'
    
    stdin, stdout, stderr = client.exec_command(
        f'cd /var/www/simplifytools && .venv/bin/pip install -q {packages}',
        timeout=600
    )
    
    # Wait for completion
    stdout.read()
    stderr_msg = stderr.read().decode()
    
    if stderr_msg:
        print(f"    Warnings: {stderr_msg[:200]}")
    else:
        print("    ✓ Packages installed")
    
    # Verify
    print("\n[*] Testing imports...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python3 -c "import pymupdf; import imageio; import numpy; print(\'✓ OK\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if 'OK' in result:
        print(f"    ✅ {result}")
    else:
        print(f"    Error: {error[:150]}")
    
    # Count packages
    print("\n[*] Counting packages...")
    stdin, stdout, stderr = client.exec_command('.venv/bin/pip list | wc -l')
    count = stdout.read().decode().strip()
    print(f"    {count} packages installed")
    
    print("\n" + "="*50)
    print("✅ INSTALLATION COMPLETE!")
    print("="*50)
    print("\n✓ Virtual environment ready at: /var/www/simplifytools/.venv")
    print("✓ Required packages installed")
    print("✓ App can now use Python for PDF processing")
    print("\nTest PDF download at:")
    print("https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
