#!/usr/bin/env python3
import paramiko
import json

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("SEARCHING FOR CSS MANIFEST FILES")
print("=" * 70)

# Find manifest JSON files
print("\n[1] Finding manifest files...")
stdin, stdout, stderr = client.exec_command("find /var/www/simplifytools/.next -name '*manifest*.json' -o -name '*build-manifest*' 2>/dev/null", timeout=10)
manifest_files = stdout.read().decode().strip().split('\n')

for mf in manifest_files:
    if mf:
        print(f"\n  File: {mf}")
        stdin, stdout, stderr = client.exec_command(f"cat {mf}", timeout=10)
        content = stdout.read().decode()
        
        # Pretty print JSON if possible
        try:
            data = json.loads(content)
            if "98af741df7eb1c44" in json.dumps(data):
                print(f"    ✓ FOUND OLD HASH IN THIS FILE!")
                print(json.dumps(data, indent=2)[:500])
            else:
                print(f"    Content preview: {json.dumps(data)[:200]}...")
        except:
            if "98af741df7eb1c44" in content:
                print(f"    ✓ FOUND OLD HASH IN THIS FILE!")
                print(content[:300])
            else:
                print(f"    (text file, first 100 chars: {content[:100]})")

# Check for CSS mapping files
print("\n[2] Looking for CSS chunk mappings...")
stdin, stdout, stderr = client.exec_command("ls -la /var/www/simplifytools/.next/ | grep -i css", timeout=10)
output = stdout.read().decode()
print(output if output else "  No CSS-specific files found")

# Check the fallback manifest
print("\n[3] Checking fallback-build-manifest.json...")
stdin, stdout, stderr = client.exec_command("cat /var/www/simplifytools/.next/fallback-build-manifest.json", timeout=10)
content = stdout.read().decode()
print(content)

if "98af741df7eb1c44" in content:
    print("\n  ✓ FOUND OLD HASH!")

client.close()
