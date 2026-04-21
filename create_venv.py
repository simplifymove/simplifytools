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
    print("[*] Creating virtual environment at /var/www/simplifytools/.venv...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && python3 -m venv .venv',
        timeout=60
    )
    stdout.read()
    stderr_out = stderr.read().decode()
    if stderr_out:
        print(f"    Stderr: {stderr_out[:200]}")
    
    print("[*] Installing required Python packages...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && .venv/bin/pip install --upgrade pip setuptools wheel -q',
        timeout=60
    )
    stdout.read()
    
    print("[*] Installing PyMuPDF and dependencies...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && .venv/bin/pip install pymupdf pillow reportlab pdf2docx -q',
        timeout=120
    )
    stdout.read()
    
    print("[*] Verifying python exists at path...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.venv/bin/python*')
    print(stdout.read().decode())
    
    print("[*] Testing python works...")
    stdin, stdout, stderr = client.exec_command('/var/www/simplifytools/.venv/bin/python --version')
    print(stdout.read().decode())
    
    print("\n✅ Virtual environment created!")
    print("Now restart the app...")
    
    # Kill and restart
    stdin, stdout, stderr = client.exec_command('pkill -9 node')
    stdout.read()
    time.sleep(1)
    
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start &'
    )
    time.sleep(3)
    
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:3000 | head -c 50')
    print("App status:", stdout.read().decode()[:50])
    
    print("\n✅ DONE - Try PDF download now")
    
    client.close()
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
