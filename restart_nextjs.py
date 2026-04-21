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
    
    # 1. Kill all Node processes
    print("\n[*] Killing all Node.js processes...")
    stdin, stdout, stderr = client.exec_command('pkill -9 node; pkill -9 "next"')
    stdout.read().decode()
    time.sleep(2)
    
    # 2. Verify they're dead
    print("[*] Verifying processes killed...")
    stdin, stdout, stderr = client.exec_command('ps aux | grep "node  " | grep -v grep | wc -l')
    count = stdout.read().decode().strip()
    print(f"[+] Running Node processes: {count}")
    
    # 3. Check if .next exists
    print("\n[*] Checking .next build...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/static/ 2>/dev/null | head -10')
    output = stdout.read().decode()
    print(output if output.strip() else "[!] .next/static/ not found!")
    
    # 4. Start Next.js in background
    print("\n[*] Starting Next.js application...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next.log 2>&1 &',
        timeout=5
    )
    time.sleep(3)
    
    # 5. Verify it started
    print("[*] Verifying startup...")
    stdin, stdout, stderr = client.exec_command('sleep 2 && curl -s http://localhost:3000/ | head -20')
    response = stdout.read().decode()
    if response and 'html' in response.lower():
        print("[✓] Next.js is responding!")
        print(response[:200] + "...")
    else:
        print("[!] Next.js may not be responding yet, checking logs...")
        stdin, stdout, stderr = client.exec_command('tail -30 /tmp/next.log')
        logs = stdout.read().decode()
        print(logs[-800:])
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
