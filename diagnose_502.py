#!/usr/bin/env python3
import paramiko
import sys

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Check if Node.js process is running
    print("\n[*] Checking Node.js process...")
    stdin, stdout, stderr = client.exec_command('ps aux | grep "node\|next" | grep -v grep')
    processes = stdout.read().decode()
    if processes.strip():
        print("[+] Node.js process found:")
        print(processes)
    else:
        print("[!] WARNING: No Node.js process running!")
    
    # Check npm error log
    print("\n[*] Checking for recent errors...")
    stdin, stdout, stderr = client.exec_command('tail -50 /root/simplifytools/.npm/_logs/*.log 2>/dev/null || echo "No logs found"')
    logs = stdout.read().decode()
    if logs.strip():
        print(logs[-1000:])  # Last 1000 chars
    
    # Check if .next directory exists
    print("\n[*] Checking .next build directory...")
    stdin, stdout, stderr = client.exec_command('ls -lah /root/simplifytools/.next/ 2>/dev/null | head -20')
    output = stdout.read().decode()
    print(output)
    
    # Check disk space
    print("\n[*] Checking disk space...")
    stdin, stdout, stderr = client.exec_command('df -h /')
    disk = stdout.read().decode()
    print(disk)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
