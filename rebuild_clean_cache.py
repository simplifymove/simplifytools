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
    stdin, stdout, stderr = client.exec_command('pkill -9 node; pkill -9 npm')
    stdout.read()
    time.sleep(2)
    
    # Remove caches
    print("[*] Clearing all build caches...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && rm -rf .next .turbo node_modules/.cache .turbopack-cache .swc 2>&1',
        timeout=30
    )
    stdout.read()
    
    # Double-check source file was updated
    print("\n[*] Checking source file has correct Python path...")
    stdin, stdout, stderr = client.exec_command(
        'grep -A2 "const pythonExe" /var/www/simplifytools/app/api/pdf/route.ts | head -5'
    )
    source_check = stdout.read().decode()
    print(source_check)
    
    if '.venv' in source_check:
        print("[!] ERROR: Source file still has .venv path!")
        sys.exit(1)
    
    # Clean npm cache
    print("\n[*] Cleaning npm cache...")
    stdin, stdout, stderr = client.exec_command('npm cache clean --force 2>&1 | tail -5')
    print(stdout.read().decode())
    
    # Production build with clean cache
    print("\n[*] Building with clean cache...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run build 2>&1 | tail -80',
        timeout=300
    )
    build_output = stdout.read().decode()
    print(build_output)
    
    # Verify built code doesn't have .venv
    print("\n[*] Verify compiled code doesn't reference .venv...")
    stdin, stdout, stderr = client.exec_command(
        'grep -r "\.venv.*python" /var/www/simplifytools/.next --include="*.js" --exclude="*.map" 2>/dev/null | grep -v node_modules | head -5'
    )
    venv_check = stdout.read().decode()
    
    if venv_check.strip():
        print("[!] WARNING: .venv still in compiled code:")
        print(venv_check[:500])
    else:
        print("[✓] No .venv references in compiled code")
    
    # Start app
    print("\n[*] Starting Next.js...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next.log 2>&1 &'
    )
    time.sleep(5)
    
    # Verify
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000/ | head -3')
    print(stdout.read().decode())
    
    print("\n[✓] Complete!")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
