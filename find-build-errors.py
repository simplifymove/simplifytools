#!/usr/bin/env python3
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔧 Doing clean local build to find TypeScript errors...\n")

# Check local TypeScript first
print("=== LOCAL TYPESCRIPT CHECK ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npx tsc --noEmit 2>&1 | head -50', timeout=120)
output = stdout.read().decode('utf-8')
errors = stderr.read().decode('utf-8')

if output:
    print(output[:2000])
if errors:
    print("STDERR:", errors[:1000])

print("\n=== RUNNING NPM BUILD ===")
stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm run build 2>&1', timeout=600)
build_output = stdout.read().decode('utf-8')

# Find errors in output
import re
type_errors = re.findall(r'(.{0,100}Type error.{0,200})', build_output, re.DOTALL)
failed_lines = re.findall(r'(Failed to compile.*)', build_output)

print("\n=== BUILD ERRORS ===")
if type_errors:
    for err in type_errors[:5]:
        print(f"  {err[:150]}")

if failed_lines:
    for line in failed_lines[:5]:
        print(f"  {line[:150]}")

# Show last part of output
print("\n=== BUILD OUTPUT (Last 1500 chars) ===")
print(build_output[-1500:] if len(build_output) > 1500 else build_output)

client.close()
