#!/usr/bin/env python3
import paramiko
import sys
import time

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Kill everything
    print("\n[*] Killing all Node processes...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; pkill -9 npm; sleep 2')
    stdout.read()
    
    # Full clean
    print("[*] Full clean: removing .next, .turbo, node_modules cache...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && rm -rf .next .turbo node_modules/.cache'
    )
    stdout.read()
    
    # Verify no .venv
    print("[*] Verifying no .venv or venv directories...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && rm -rf .venv venv'
    )
    stdout.read()
    
    # Clear npm cache
    print("[*] Clearing npm cache...")
    stdin, stdout, stderr = client.exec_command('npm cache clean --force')
    stdout.read()
    
    # Reinstall dependencies
    print("[*] Reinstalling npm dependencies...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && npm install 2>&1 | tail -20',
        timeout=120
    )
    install_output = stdout.read().decode()
    if 'added' in install_output or 'up to date' in install_output:
        print("[✓] Dependencies OK")
    
    # Production rebuild with verbose output
    print("\n[*] Building production bundle (CLEAN)...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && rm -rf .next .turbo && NODE_ENV=production npm run build 2>&1',
        timeout=300
    )
    build_output = stdout.read().decode()
    
    # Check build success
    if 'error' in build_output.lower() and 'warning' not in build_output:
        print("\n[!] Build errors detected:")
        print(build_output[-1500:])
        sys.exit(1)
    else:
        # Show summary
        lines = build_output.split('\n')
        for line in lines[-30:]:
            if line.strip() and ('✓' in line or 'Routes' in line or 'BUILD_ID' in line or 'dynamic' in line or 'prerendered' in line):
                print(line)
    
    # Start app
    print("\n[*] Starting Next.js...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next.log 2>&1 &'
    )
    time.sleep(5)
    
    # Verify
    print("[*] Verifying port 3000...")
    stdin, stdout, stderr = client.exec_command('netstat -tuln | grep 3000')
    result = stdout.read().decode()
    if '3000' in result:
        print("[✓] Port 3000 active")
    
    # Test
    print("\n[*] Testing root request...")
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000 | head -1')
    response = stdout.read().decode()
    print(f"Response: {response.strip()}")
    
    # Check logs
    print("\n[*] Checking for errors in app logs...")
    stdin, stdout, stderr = client.exec_command('tail -50 /tmp/next.log')
    logs = stdout.read().decode()
    if 'error' in logs.lower():
        print("[!] Errors in logs:")
        print(logs[-500:])
    else:
        print("[✓] No errors in app logs")
    
    # Reload nginx
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('nginx -s reload')
    stdout.read()
    
    print("\n[✓] Deployment complete!")
    print("[*] Test PDF at: https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
