#!/usr/bin/env python3
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("CHECKING FINAL CSS STATUS")
print("=" * 70)

# Fetch CSS files
stdin, stdout, stderr = client.exec_command("find /var/www/simplifytools/.next/static/chunks -name '*.css' -type f 2>/dev/null", timeout=10)
css_files = stdout.read().decode().strip().split('\n')
css_files = [f for f in css_files if f]

print(f"\nCSS Files ({len(css_files)}):")
hashes = []
for f in css_files:
    basename = f.split('/')[-1]
    print(f"  ✓ {basename}")
    hashes.append(basename.replace('.css', ''))

print(f"\nHashes: {hashes}")

# Test HTML
time.sleep(2)
stdin, stdout, stderr = client.exec_command("curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort -u", timeout=10)
html_refs = stdout.read().decode().strip().split('\n')
html_refs = [r.split('/')[-1] for r in html_refs if r]

print(f"\nCSS references in HTML ({len(html_refs)}):")
old_hash_found = False
for ref in html_refs:
    is_old = ref == '98af741df7eb1c44.css'
    marker = "⚠️  OLD" if is_old else "✓"
    print(f"  {marker} {ref}")
    if is_old:
        old_hash_found = True

print("\n" + "=" * 70)
if old_hash_found:
    print("❌ FAILED: Old CSS hash still present")
else:
    print("✅ SUCCESS: Old CSS hash fixed!")

client.close()
