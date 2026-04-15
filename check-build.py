#!/usr/bin/env python3
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

# Check build-related files
print("=== CHECK: Build folder contents ===")
stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/ | head -20', timeout=10)
print(stdout.read().decode('utf-8')[:800])

# Check for server file
print("\n=== CHECK: .next/server/index.js ===")
stdin, stdout, stderr = client.exec_command('test -f /var/www/simplifytools/.next/server/index.js && echo "EXISTS" || echo "MISSING"', timeout=10)
print(stdout.read().decode('utf-8').strip())

# Test if server can start
print("\n=== CHECK: Can start server? ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && timeout 5 npm start 2>&1 | head -20', timeout=10)
output = stdout.read().decode('utf-8')
print(output[:600])

# Check if website loads
print("\n=== CHECK: Website connectivity ===")
stdin, stdout, stderr = client.exec_command('curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000', timeout=10)
print(stdout.read().decode('utf-8').strip())

client.close()
