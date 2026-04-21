#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=username, password=password, timeout=10)
    
    print("[*] Removing duplicate mime-types.conf...")
    stdin, stdout, stderr = client.exec_command("rm /etc/nginx/conf.d/mime-types.conf")
    
    print("[*] Testing nginx config...")
    stdin, stdout, stderr = client.exec_command("nginx -t 2>&1")
    test = stdout.read().decode()
    
    if "successful" in test:
        print("[+] Config clean - reloading...")
        client.exec_command("systemctl reload nginx")
        print("[✓] Nginx optimized!")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
