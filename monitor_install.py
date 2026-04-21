#!/usr/bin/env python3
import paramiko
import time
import sys

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("🔄 Monitoring Python package installation...\n")
    
    # Monitor for up to 10 minutes
    for minute in range(0, 11):
        stdin, stdout, stderr = client.exec_command('tail -1 /tmp/pip.log 2>/dev/null')
        last_line = stdout.read().decode().strip()
        
        # Check if pip is still running
        stdin, stdout, stderr = client.exec_command('ps aux | grep "pip install" | grep -v grep')
        pip_running = stdout.read().decode().strip()
        
        if not pip_running and minute > 1:
            # Installation complete
            print("✅ Installation COMPLETE!\n")
            
            # Test imports
            print("🧪 Testing imports...")
            stdin, stdout, stderr = client.exec_command('.venv/bin/python -c "import imageio; import pymupdf; import numpy; import requests; print(\'✓ All imports OK\')"')
            result = stdout.read().decode().strip()
            error = stderr.read().decode().strip()
            
            if result:
                print(f"   {result}")
            if error:
                print(f"   ⚠️  {error[:100]}")
            
            # List installed packages
            print("\n📦 Installed packages:")
            stdin, stdout, stderr = client.exec_command('.venv/bin/pip list | head -20')
            packages = stdout.read().decode()
            for line in packages.split('\n')[:10]:
                if line and 'Package' not in line and '-' not in line:
                    print(f"   {line}")
            
            print("\n🚀 Ready to use PDF tools!")
            print("Try: https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
            break
        
        else:
            # Still installing
            if last_line:
                print(f"[{minute}m] {last_line[:70]}")
            else:
                print(f"[{minute}m] Installing packages...")
        
        if minute < 10:
            time.sleep(60)
    
    if pip_running:
        print("\n⏱️  Installation still in progress (taking longer than expected)")
        print("   Check back in a few minutes")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
