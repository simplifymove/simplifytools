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
    
    # Check if .venv is referenced in compiled code
    print("\n[*] Searching for .venv references in compiled code...")
    stdin, stdout, stderr = client.exec_command('grep -r "\.venv" /var/www/simplifytools/.next 2>/dev/null | head -10')
    venv_refs = stdout.read().decode()
    
    if venv_refs.strip():
        print("[!] FOUND .venv references in compiled code:")
        print(venv_refs[:1000])
    else:
        print("[✓] NO .venv references in compiled code")
    
    # List what's in .next
    print("\n[*] Checking .next directory structure...")
    stdin, stdout, stderr = client.exec_command('ls -lah /var/www/simplifytools/.next | head -15')
    print(stdout.read().decode())
    
    # Check if python3 is available
    print("\n[*] Verifying python3 is available...")
    stdin, stdout, stderr = client.exec_command('which python3 && python3 --version')
    print(stdout.read().decode())
    
    # Test if we can actually call the pdf endpoint
    print("\n[*] Testing PDF API locally...")
    stdin, stdout, stderr = client.exec_command('curl -s http://localhost:3000/api/pdf -X POST -H "Content-Type: application/json" -d "{\"toolId\":\"merge-pdf\"}" | head -100')
    api_response = stdout.read().decode()
    print("Response (first 200 chars):")
    print(api_response[:200])
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
