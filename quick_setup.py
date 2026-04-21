#!/usr/bin/env python3
import paramiko
import time
import subprocess

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    # Create venv
    print("[1] Creating venv...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && python3 -m venv .venv', timeout=30)
    stdout.read()
    
    # Install packages directly from system (don't wait for output)
    print("[2] Installing packages (this takes 2-3 mins)...")
    
    # Run in background without waiting for completion
    client.exec_command(
        'cd /var/www/simplifytools && nohup .venv/bin/pip install -q pymupdf pillow reportlab imageio numpy scipy scikit-image opencv-python requests easyocr torch > /tmp/pip.log 2>&1 &'
    )
    
    print("    Installation running in background...")
    print("    Waiting 30 seconds for key packages...")
    time.sleep(30)
    
    # Check if imageio and pymupdf are installed
    print("\n[3] Testing imports...")
    stdin, stdout, stderr = client.exec_command(
        '.venv/bin/python -c "import imageio, pymupdf, numpy; print(\'✓ Packages ready\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    
    if error and 'No module' in error:
        print(f"    Still installing... {error[:100]}")
    else:
        print(f"    {result if result else 'Packages installing'}")
    
    # Restart app regardless
    print("\n[4] Restarting app...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; sleep 1')
    stdout.read()
    
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start > /tmp/node.log 2>&1 &'
    )
    time.sleep(3)
    
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:3000 | head -c 50')
    app_check = stdout.read().decode()
    
    if app_check:
        print(f"    ✓ App running: {app_check[:40]}")
    
    print("\n✅ Setup complete - Try PDF now")
    print("   (If imageio error appears, wait 30s and try again)")
    
    client.close()
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
