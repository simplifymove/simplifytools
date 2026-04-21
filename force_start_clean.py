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
    
    # Force kill port 3000
    print("\n[*] Force killing port 3000...")
    stdin, stdout, stderr = client.exec_command('fuser -k 3000/tcp 2>/dev/null; sleep 3')
    stdout.read()
    
    # Kill any remaining node
    stdin, stdout, stderr = client.exec_command('pkill -9 node; sleep 1')
    stdout.read()
    
    # Start fresh
    print("[*] Starting Next.js fresh...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production npm run start > /tmp/next.log 2>&1 &'
    )
    time.sleep(6)
    
    # Verify
    print("[*] Checking if running...")
    stdin, stdout, stderr = client.exec_command('curl -s -I http://localhost:3000 | head -1')
    response = stdout.read().decode()
    
    if '200' in response or '301' in response:
        print(f"[✓] Server ready: {response.strip()}")
        
        # Verify no .venv in error
        stdin, stdout, stderr = client.exec_command('tail -30 /tmp/next.log | grep -i ".venv" || echo "[✓] No .venv references"')
        check = stdout.read().decode()
        print(check)
    else:
        print(f"[!] Response: {response}")
        stdin, stdout, stderr = client.exec_command('tail -30 /tmp/next.log')
        print(stdout.read().decode())
    
    # Reload nginx
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('nginx -s reload')
    stdout.read()
    
    print("[✓] Ready for testing")
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
