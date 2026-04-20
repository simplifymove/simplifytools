#!/usr/bin/env python3
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Check build log
stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next 2>/dev/null | head -20', timeout=10)
print("Build directory status:")
print(stdout.read().decode('utf-8', errors='ignore'))

# Check if Node is running
stdin, stdout, stderr = client.exec_command('ps aux | grep "node.*next" | grep -v grep', timeout=10)
print("\nNode.js status:")
print(stdout.read().decode('utf-8', errors='ignore'))

client.close()
