#!/usr/bin/env python3
"""Check final CSS build status after CSS optimization disabled"""

import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("=" * 70)
print("FINAL CSS BUILD STATUS")
print("=" * 70)

# Check if build is still running
print("\n[1] Checking if build is still running...")
stdin, stdout, stderr = client.exec_command('ps aux | grep "next build" | grep -v grep', timeout=10)
build_proc = stdout.read().decode('utf-8', errors='ignore').strip()
if build_proc:
    print("✓ Build is still running, waiting 30 more seconds...")
    time.sleep(30)
else:
    print("✓ Build appears to be complete")

# Check CSS files
print("\n[2] Checking CSS files generated...")
stdin, stdout, stderr = client.exec_command('ls -lh /var/www/simplifytools/.next/static/chunks/*.css 2>/dev/null', timeout=10)
css_files = stdout.read().decode('utf-8', errors='ignore')
print(css_files if css_files else "No CSS files found!")

# Extract hashes
print("\n[3] Extracting CSS hashes...")
stdin, stdout, stderr = client.exec_command("ls /var/www/simplifytools/.next/static/chunks/*.css 2>/dev/null | xargs -n1 basename | sed 's/.css//'", timeout=10)
hashes = stdout.read().decode('utf-8', errors='ignore').strip().split('\n')
for h in hashes:
    if h:
        print(f"  - {h}")

# Test the HTML response
print("\n[4] Testing HTTP response (checking for old hash 98af741df7eb1c44)...")
stdin, stdout, stderr = client.exec_command('pkill -f "npm start" || true', timeout=5)
time.sleep(1)

stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm start > /tmp/next.log 2>&1 &', timeout=5)
time.sleep(5)  # Give app time to start

stdin, stdout, stderr = client.exec_command("curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort -u", timeout=10)
css_refs = stdout.read().decode('utf-8', errors='ignore')

print("CSS references in HTML:")
found_old = False
for ref in css_refs.strip().split('\n'):
    if ref:
        print(f"  - {ref}")
        if "98af741df7eb1c44" in ref:
            found_old = True

print("\n" + "=" * 70)
if found_old:
    print("⚠ FAILED: Old CSS hash still present in HTML")
else:
    print("✅ SUCCESS: Old CSS hash is gone!")
print("=" * 70)

client.close()
