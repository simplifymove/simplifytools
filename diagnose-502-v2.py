#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔍 Diagnosing 502 Bad Gateway...\n")

# Step 1: Check PM2 status
print("1️⃣  PM2 Status:")
stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
status = stdout.read().decode('utf-8')
print(status)

# Step 2: Get PM2 logs (last 100 lines)
print("\n2️⃣  Recent Error Logs:")
stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 100', timeout=10)
logs = stdout.read().decode('utf-8')
# Show last 50 lines
log_lines = logs.split('\n')
for line in log_lines[-50:]:
    if line.strip():
        print(line)

# Step 3: Check if process exists
print("\n3️⃣  Node Process:")
stdin, stdout, stderr = client.exec_command('ps aux | grep -i "next start" | grep -v grep', timeout=10)
ps_output = stdout.read().decode('utf-8')
print(ps_output if ps_output else "❌ No Next.js process running")

# Step 4: Check disk space
print("\n4️⃣  Disk Space:")
stdin, stdout, stderr = client.exec_command('df -h / | tail -1', timeout=10)
disk = stdout.read().decode('utf-8')
print(disk)

# Step 5: Check memory
print("\n5️⃣  Memory Usage:")
stdin, stdout, stderr = client.exec_command('free -h | grep Mem', timeout=10)
mem = stdout.read().decode('utf-8')
print(mem)

# Step 6: Check if .next build exists
print("\n6️⃣  Build Folder Check:")
stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/ 2>&1 | head -5', timeout=10)
next_check = stdout.read().decode('utf-8')
print(next_check if next_check else "❌ .next folder missing!")

client.close()
