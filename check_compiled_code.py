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
    
    # Check actual .js files (not source maps)
    print("\n[*] Searching for .venv references in actual compiled .js files...")
    stdin, stdout, stderr = client.exec_command('grep -r "\.venv" /var/www/simplifytools/.next --include="*.js" --exclude="*.map" 2>/dev/null | head -20')
    venv_refs = stdout.read().decode()
    
    if venv_refs.strip():
        print("[!] FOUND .venv in compiled .js files:")
        print(venv_refs)
    else:
        print("[✓] NO .venv references in actual compiled .js files")
    
    # Check the pdf route chunk
    print("\n[*] Checking PDF route for 'python3' vs 'python'...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/server/app/api/ | grep pdf')
    print(stdout.read().decode())
    
    # Find pdf route chunk
    print("\n[*] Searching for python executable references in code...")
    stdin, stdout, stderr = client.exec_command('find /var/www/simplifytools/.next -type f -name "*.js" -exec grep -l "spawn.*python" {} \\; 2>/dev/null')
    pdf_chunks = stdout.read().decode()
    if pdf_chunks.strip():
        print("Found python spawn in:")
        for chunk in pdf_chunks.split('\n')[:5]:
            if chunk:
                print(f"  {chunk}")
                # Read this chunk
                stdin, stdout, stderr = client.exec_command(f'grep -o "spawn([^,]*python[^,]*" "{chunk}" | head -3')
                matches = stdout.read().decode()
                if matches:
                    print(f"    Matches: {matches}")
    else:
        print("[✓] No python spawn references found")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
