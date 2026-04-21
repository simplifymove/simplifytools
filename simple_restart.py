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
    # 1. Kill everything
    print("[1] Killing Node...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node')
    stdout.read()
    time.sleep(2)
    
    # 2. Remove .next (forces complete rebuild)
    print("[2] Removing .next directory...")
    stdin, stdout, stderr = client.exec_command('rm -rf /var/www/simplifytools/.next')
    stdout.read()
    
    # 3. Remove .venv (no virtual env needed)
    print("[3] Removing .venv...")
    stdin, stdout, stderr = client.exec_command('rm -rf /var/www/simplifytools/.venv')
    stdout.read()
    
    # 4. Rebuild
    print("[4] Rebuilding...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build',
        timeout=300
    )
    build_out = stdout.read().decode()
    if 'BUILD_ID' in build_out:
        print("    ✓ Build successful")
    else:
        print(f"    Build output: {build_out[-200:]}")
    
    # 5. Start app
    print("[5] Starting app...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start &'
    )
    time.sleep(3)
    
    # 6. Verify running
    print("[6] Verifying...")
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:3000 | head -c 100')
    response = stdout.read().decode()
    if '<!DOCTYPE' in response or '<html' in response or '200' in response:
        print("    ✓ App is running")
    else:
        print(f"    Response: {response[:100]}")
    
    print("\n✅ DONE - Try PDF download now")
    
    client.close()
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
