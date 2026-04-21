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
    # Check if pip is still running
    print("[*] Checking if installation is complete...")
    stdin, stdout, stderr = client.exec_command('ps aux | grep pip')
    ps_output = stdout.read().decode()
    if 'pip install' in ps_output and 'grep' not in ps_output:
        print("    Installation still in progress...")
    else:
        print("    Installation appears complete")
    
    # Check installed packages
    print("\n[*] Checking installed packages in venv...")
    stdin, stdout, stderr = client.exec_command('.venv/bin/pip list | wc -l')
    count = stdout.read().decode().strip()
    print(f"    {count} packages installed")
    
    # Test critical imports
    print("\n[*] Testing key imports...")
    stdin, stdout, stderr = client.exec_command('.venv/bin/python -c "import imageio; import pymupdf; print(\'✓ OK\')"')
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    if result:
        print(f"    {result}")
    if error:
        print(f"    Error: {error[:200]}")
    
    # Kill node and restart app
    print("\n[*] Restarting app...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node')
    stdout.read()
    time.sleep(1)
    
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start &'
    )
    time.sleep(3)
    
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:3000 | head -c 50')
    print(f"    App: {stdout.read().decode()[:50]}")
    
    print("\n✅ Done! Try PDF now")
    
    client.close()
except Exception as e:
    print(f"ERROR: {e}")
