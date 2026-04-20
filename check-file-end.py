#!/usr/bin/env python3
import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

stdin, stdout, stderr = client.exec_command("wc -l /var/www/simplifytools/app/all-tools/ai-tools/'[slug]'/page.tsx", timeout=10)
lines = stdout.read().decode().strip()
print(f"File info: {lines}")

# Get last 30 lines
stdin, stdout, stderr = client.exec_command("tail -30 /var/www/simplifytools/app/all-tools/ai-tools/'[slug]'/page.tsx", timeout=10)
content = stdout.read().decode()
print("\nLast 30 lines:")
print(content)

client.close()
