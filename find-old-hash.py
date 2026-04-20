#!/usr/bin/env python3
import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("SEARCHING FOR OLD CSS HASH IN SERVER BUILD")
print("=" * 70)

# Search the entire server directory
print("\n[1] Searching .next/server for 98af741df7eb1c44...")
stdin, stdout, stderr = client.exec_command("grep -r '98af741df7eb1c44' /var/www/simplifytools/.next/server 2>/dev/null | head -20", timeout=10)
matches = stdout.read().decode().strip()

if matches:
    print("FOUND! References:")
    for line in matches.split('\n')[:10]:
        print(f"  {line[:150]}")
else:
    print("  No matches in .next/server")

# Check the static directory
print("\n[2] Searching .next/static for 98af741df7eb1c44...")
stdin, stdout, stderr = client.exec_command("grep -r '98af741df7eb1c44' /var/www/simplifytools/.next/static 2>/dev/null | head -20", timeout=10)
matches = stdout.read().decode().strip()

if matches:
    print("FOUND! References:")
    for line in matches.split('\n')[:10]:
        print(f"  {line[:150]}")
else:
    print("  No matches in .next/static")

# Check entire .next for the hash
print("\n[3] Searching entire .next directory...")
stdin, stdout, stderr = client.exec_command("grep -r '98af741df7eb1c44' /var/www/simplifytools/.next 2>/dev/null | head -30", timeout=10)
matches = stdout.read().decode().strip()

if matches:
    print("FOUND! Full references:")
    for line in matches.split('\n'):
        if line:
            # Extract just filename and snippet
            parts = line.split(':')
            filename = parts[0]
            content = ':'.join(parts[1:]) if len(parts) > 1 else ''
            print(f"  File: {filename}")
            print(f"       {content[:120]}")
else:
    print("  NOT FOUND ANYWHERE in .next build")

print("\n" + "=" * 70)
print("If hash not found in .next/, it's being generated at runtime")

client.close()
