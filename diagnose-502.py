#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Check PM2 status
print("=== PM2 STATUS ===")
stdin, stdout, stderr = client.exec_command('pm2 status', timeout=30)
pm2_output = stdout.read().decode('utf-8')
pm2_error = stderr.read().decode('utf-8')
print(pm2_output)
if pm2_error:
    print("STDERR:", pm2_error)

# Check PM2 logs
print("\n=== RECENT PM2 LOGS ===")
stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 50', timeout=30)
logs = stdout.read().decode('utf-8')
print(logs[-2000:] if len(logs) > 2000 else logs)  # Last 2000 chars

# Check Node processes
print("\n=== NODE PROCESSES ===")
stdin, stdout, stderr = client.exec_command('ps aux | grep -i node | grep -v grep', timeout=30)
print(stdout.read().decode('utf-8'))

# Check system resources
print("\n=== DISK USAGE ===")
stdin, stdout, stderr = client.exec_command('df -h', timeout=30)
print(stdout.read().decode('utf-8'))

print("\n=== MEMORY USAGE ===")
stdin, stdout, stderr = client.exec_command('free -h', timeout=30)
print(stdout.read().decode('utf-8'))

# Check if port 3000 is listening
print("\n=== PORT STATUS ===")
stdin, stdout, stderr = client.exec_command('netstat -tlnp 2>/dev/null | grep -E "3000|:80"', timeout=30)
port_output = stdout.read().decode('utf-8')
print(port_output if port_output else "No services found on ports 80/3000")

client.close()
