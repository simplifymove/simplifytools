#!/usr/bin/env python3
import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("SEARCHING FOR OLD HASH IN COMPILED JS FILES")
print("=" * 70)

# Search in JS files
print("\n[1] Searching in .next/server/app/page*.js...")
stdin, stdout, stderr = client.exec_command("grep -l '98af741df7eb1c44' /var/www/simplifytools/.next/server/**/*.js 2>/dev/null || echo 'Not found'", timeout=10)
result = stdout.read().decode().strip()
print(result)

# Try a simpler approach - just search the main JS
print("\n[2] Searching in all .js files...")
stdin, stdout, stderr = client.exec_command("find /var/www/simplifytools/.next/server -name '*.js' -exec grep -l '98af741df7eb1c44' {} \\; 2>/dev/null | head -5", timeout=10)
result = stdout.read().decode().strip()
if result:
    print(result)
    # Get the first file that contains it
    files = result.split('\n')
    if files[0]:
        print(f"\n[3] Extracting context from: {files[0]}")
        stdin, stdout, stderr = client.exec_command(f"grep -C 3 '98af741df7eb1c44' {files[0]} 2>/dev/null | head -20", timeout=10)
        context = stdout.read().decode()
        print(context)
else:
    print("Not found in JS files either")

print("\n" + "=" * 70)
print("Hash location unknown - may be dynamically generated")

client.close()
