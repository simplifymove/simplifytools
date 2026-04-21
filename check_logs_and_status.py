#!/usr/bin/env python3
import paramiko
import sys

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Checking app logs...")
    client.connect(host, username=username, password=password, timeout=10)
    
    print("\n=== NEXT.JS START LOG ===")
    stdin, stdout, stderr = client.exec_command('tail -100 /tmp/next.log')
    print(stdout.read().decode())
    
    print("\n=== NGINX ERROR LOG ===")
    stdin, stdout, stderr = client.exec_command('tail -30 /var/log/nginx/error.log')
    print(stdout.read().decode())
    
    print("\n=== NGINX ACCESS LOG (ERRORS) ===")
    stdin, stdout, stderr = client.exec_command('tail -20 /var/log/nginx/access.log | grep -v "200\|304"')
    print(stdout.read().decode())
    
    print("\n=== CHECKING PYTHON ===")
    stdin, stdout, stderr = client.exec_command('which python3 && python3 --version')
    print(stdout.read().decode())
    
    print("\n=== FILE CHECK ===")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next | head -20')
    print(stdout.read().decode())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
