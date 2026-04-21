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
    
    # Read site-specific config
    print("[*] Reading www.simplifyconvert.com nginx config...")
    stdin, stdout, stderr = client.exec_command("cat /etc/nginx/sites-available/www.simplifyconvert.com")
    site_conf = stdout.read().decode()
    
    print("[+] Site configuration:")
    print(site_conf)
    
    # Check for add_header that might be forcing text/plain
    if "add_header" in site_conf and "Content-Type" in site_conf:
        print("\n[!] Found add_header with Content-Type - this might be overriding MIME types!")
    
    if "text/plain" in site_conf:
        print("[!] Found 'text/plain' in config - checking context...")
        stdin, stdout, stderr = client.exec_command("grep -n 'text/plain' /etc/nginx/sites-available/www.simplifyconvert.com")
        print(stdout.read().decode())
    
    # Check for charset settings
    if "charset" in site_conf:
        print("\n[*] Found charset configuration")
        stdin, stdout, stderr = client.exec_command("grep -n 'charset' /etc/nginx/sites-available/www.simplifyconvert.com")
        print(stdout.read().decode())
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
