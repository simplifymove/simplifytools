#!/usr/bin/env python3
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Get PM2 status
print('=== PM2 STATUS ===')
stdin, stdout, stderr = client.exec_command('pm2 status', timeout=30)
print(stdout.read().decode('utf-8'))

# Get logs
print('\n=== PM2 LOGS (Last 40 lines) ===')
stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 40', timeout=30)
logs = stdout.read().decode('utf-8')
print(logs[-2500:] if len(logs) > 2500 else logs)

# Check if .next exists
print('\n=== .NEXT BUILD CHECK ===')
stdin, stdout, stderr = client.exec_command('ls -lah /var/www/simplifytools/.next | head -20', timeout=10)
print(stdout.read().decode('utf-8'))

# Check node_modules
print('\n=== NODE_MODULES CHECK ===')
stdin, stdout, stderr = client.exec_command('ls /var/www/simplifytools/node_modules | head -10', timeout=10)
nm = stdout.read().decode('utf-8')
print(f"Modules: {nm[:200]}")

client.close()
