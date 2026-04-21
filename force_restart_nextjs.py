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
    
    # Find and kill process using port 3000
    print("\n[*] Finding processes using port 3000...")
    stdin, stdout, stderr = client.exec_command('lsof -i :3000')
    output = stdout.read().decode()
    print(output)
    
    # Kill by port
    print("\n[*] Force killing process on port 3000...")
    stdin, stdout, stderr = client.exec_command('fuser -k 3000/tcp; sleep 1')
    stdout.read().decode()
    
    # Verify port is free
    print("[*] Verifying port 3000 is free...")
    stdin, stdout, stderr = client.exec_command('netstat -tlnp 2>/dev/null | grep 3000 || echo "Port 3000 is FREE"')
    verify = stdout.read().decode()
    print(verify)
    
    # Start Next.js
    print("\n[*] Starting Next.js application...")
    stdin, stdout, stderr = client.exec_command(
        'cd /var/www/simplifytools && NODE_ENV=production nohup npm run start > /tmp/next.log 2>&1 &',
        timeout=5
    )
    time.sleep(4)
    
    # Test connection
    print("[*] Testing Next.js connection...")
    stdin, stdout, stderr = client.exec_command('curl -s -f http://localhost:3000/api/health || curl -s http://localhost:3000/ | head -5')
    response = stdout.read().decode()
    if response.strip():
        print("[✓] SUCCESS! Next.js is responding:")
        print(response[:300])
    else:
        print("[!] Checking logs...")
        stdin, stdout, stderr = client.exec_command('tail -50 /tmp/next.log')
        logs = stdout.read().decode()
        print(logs)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
