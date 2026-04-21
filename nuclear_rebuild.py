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
    
    # Kill all Node processes
    print("\n[*] Killing all Node processes...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; pkill -9 npm; sleep 2')
    stdout.read()
    
    # Clean everything
    print("[*] Cleaning build cache completely...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && rm -rf .next .turbo node_modules/.cache .turbopack-cache 2>&1',
        timeout=30
    )
    stdout.read()
    
    # Verify .venv is removed
    print("[*] Verifying .venv is removed...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/ | grep venv')
    venv_check = stdout.read().decode()
    if venv_check.strip():
        print(f"[!] WARNING: .venv still exists: {venv_check}")
        stdin, stdout, stderr = client.exec_command('rm -rf /var/www/simplifytools/.venv /var/www/simplifytools/venv')
        stdout.read()
    else:
        print("[✓] .venv directory removed")
    
    # Check package.json
    print("\n[*] Verifying package.json...")
    stdin, stdout, stderr = client.exec_command('head -5 /var/www/simplifytools/package.json')
    print(stdout.read().decode())
    
    # Fresh npm install
    print("[*] Fresh npm install...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && npm install 2>&1 | tail -20',
        timeout=120
    )
    npm_output = stdout.read().decode()
    print(npm_output[-1000:])
    
    # Full production build
    print("\n[*] Starting production build...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build 2>&1 | tail -50',
        timeout=300
    )
    build_output = stdout.read().decode()
    
    # Show last lines of build
    print("\n--- Build Output (Last 50 lines) ---")
    print(build_output)
    
    if 'error' in build_output.lower() and 'next' in build_output.lower():
        print("\n[!] Build had errors, checking stderr...")
        # Retry to see full error
        stdin, stdout, stderr = client.exec_command(
            'cd /var/www/simplifytools && NODE_ENV=production npm run build 2>&1',
            timeout=300
        )
        full_output = stdout.read().decode()
        if 'error' in full_output.lower():
            lines = full_output.split('\n')
            error_lines = [l for l in lines if 'error' in l.lower()]
            print("Errors found:")
            for line in error_lines[-10:]:
                print(f"  {line}")
    
    # Start app
    print("\n[*] Starting Next.js production server...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next-prod.log 2>&1 &',
        timeout=5
    )
    time.sleep(5)
    
    # Verify
    print("[*] Verifying app is running...")
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000/ | head -5')
    print(stdout.read().decode())
    
    # Reload nginx
    print("[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('nginx -s reload')
    stdout.read()
    
    print("\n[✓] Fresh rebuild complete!")
    print("[*] Test PDF at: https://www.simplifyconvert.com/all-tools/pdf-tools/annotate-pdf")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
