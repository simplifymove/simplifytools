#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔍 Running build with full error capture...\n")

app_path = '/var/www/simplifytools'

# Delete .next again
print("Cleaning .next...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next', timeout=10)
stdout.read()

# Run build and capture EVERYTHING
print("Running build...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build 2>&1', timeout=600)

# Read all output
build_output = stdout.read().decode('utf-8')
build_error = stderr.read().decode('utf-8')

# Print complete output
print("\n=== FULL BUILD OUTPUT ===\n")
print(build_output)
if build_error:
    print("\n=== STDERR ===\n")
    print(build_error)

# Look for errors
import re
errors = re.findall(r'(error|Error|ERROR|Failed|failed).*', build_output, re.IGNORECASE)
if errors:
    print("\n\n=== ERRORS DETECTED ===")
    for err in errors[:20]:  # Show first 20 errors
        print(f"  - {err[:150]}")

client.close()
