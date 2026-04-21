#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Read the full site config
    print("[*] Reading simplifyconvert site configuration...\n")
    stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-available/www.simplifyconvert.com')
    config = stdout.read().decode()
    print(config)
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
