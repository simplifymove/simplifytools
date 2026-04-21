#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

try:
    print("[*] Installing pikepdf and remaining packages...\n")
    
    # All PDF processing packages
    packages = 'pikepdf pillow-heif pydantic fitz ghostscript'
    
    stdin, stdout, stderr = client.exec_command(
        f'cd /var/www/simplifytools && .venv/bin/pip install --no-cache-dir {packages}',
        timeout=600
    )
    
    output = stdout.read().decode('utf-8', errors='ignore')
    lines = output.split('\n')
    for line in lines[-30:]:
        if line.strip():
            print(line)
    
    print("\n[*] Verifying pikepdf...")
    stdin, stdout, stderr = client.exec_command(
        '/var/www/simplifytools/.venv/bin/python -c "import pikepdf; print(\'✓ pikepdf installed\')"'
    )
    result = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    print(f"    {result if result else error[:100]}")
    
    print("\n✅ Done! Try PDF now")
    
    client.close()
    
except Exception as e:
    print(f"ERROR: {e}")
