#!/usr/bin/env python3
import paramiko

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=username, password=password, timeout=10)

# Read the exact lines from the VPS
stdin, stdout, stderr = client.exec_command(
    'sed -n "78,88p" /var/www/simplifytools/app/api/pdf/route.ts'
)
content = stdout.read().decode()
print("VPS file content (lines 78-88):")
print(content)

if '.venv' in content:
    print("\n[!] VPS file has OLD code with .venv reference!")
else:
    print("\n[✓] VPS file has CORRECT code")

client.close()
