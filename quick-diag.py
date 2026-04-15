#!/usr/bin/env python3
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("=== QUICK DIAGNOSTIC ===\n")

# PM2 status
stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
print("=== PM2 STATUS ===")
print(stdout.read().decode('utf-8'))

# Latest PM2 logs
stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 50 2>&1', timeout=30)
logs = stdout.read().decode('utf-8')
print("\n=== PM2 LOGS (Last 50 lines) ===")
print(logs[-2000:] if len(logs) > 2000 else logs)

# Check .next
print("\n=== .NEXT FOLDER ===")
stdin, stdout, stderr = client.exec_command('test -f /var/www/simplifytools/.next/server/index.js && echo "✓ EXISTS" || echo "✗ MISSING"', timeout=10)
print(stdout.read().decode('utf-8').strip())

# Check if app is listening
print("\n=== PORT CHECK ===")
stdin, stdout, stderr = client.exec_command('netstat -tlnp 2>/dev/null | grep 3000 || echo "Not listening"', timeout=10)
print(stdout.read().decode('utf-8').strip()[:200])

client.close()
