#!/usr/bin/env python3
import paramiko
import time
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔧 Full Clean Rebuild (with verbose output)...\n")

app_path = '/var/www/simplifytools'

# Step 1: Stop the app
print("1️⃣  Stopping PM2 processes...")
stdin, stdout, stderr = client.exec_command('pm2 stop simplifytools', timeout=10)
stdout.read()
print("   ✓ Stopped")

# Step 2: Clean build artifacts
print("\n2️⃣  Cleaning build artifacts...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next {app_path}/.turbo', timeout=10)
stdout.read()
print("   ✓ Cleaned")

# Step 3: Verify node_modules
print("\n3️⃣  Checking node_modules...")
stdin, stdout, stderr = client.exec_command(f'ls {app_path}/node_modules | wc -l', timeout=10)
modules_count = stdout.read().decode('utf-8').strip()
print(f"   Found {modules_count} modules")

# Step 4: Run build with full output
print("\n4️⃣  Building (this takes 5-10 minutes)...")
print("   Starting npm run build...\n")

# Use unlimited timeout for build
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build', timeout=900)

# Read output as it streams
output_buffer = ""
while True:
    try:
        line = stdout.readline()
        if not line:
            break
        decoded = line.decode('utf-8', errors='ignore')
        output_buffer += decoded
        # Print lines with keywords
        if any(x in decoded.lower() for x in ['error', 'success', 'compiled', 'built', 'warning', '✓', '✗']):
            print(f"   {decoded.rstrip()}")
    except:
        break

# Show last 30 lines
print("\n   Final build output:")
for line in output_buffer.split('\n')[-30:]:
    if line.strip():
        print(f"   {line}")

# Check for errors
build_stderr = stderr.read().decode('utf-8')
if build_stderr and 'error' in build_stderr.lower():
    print("\n⚠️  Build errors:")
    print(build_stderr[-1000:])

# Step 5: Verify build success
print("\n5️⃣  Verifying build...")
stdin, stdout, stderr = client.exec_command(f'test -d {app_path}/.next/standalone && echo "✓ Build successful" || echo "❌ Build missing"', timeout=10)
verify = stdout.read().decode('utf-8').strip()
print(f"   {verify}")

# Step 6: Show .next folder contents
stdin, stdout, stderr = client.exec_command(f'du -sh {app_path}/.next 2>/dev/null && ls -la {app_path}/.next/ | head -15', timeout=10)
next_info = stdout.read().decode('utf-8')
print("\n   .next folder contents:")
for line in next_info.split('\n'):
    if line.strip():
        print(f"   {line}")

# Step 7: Restart PM2
print("\n6️⃣  Restarting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools --update-env', timeout=30)
restart_out = stdout.read().decode('utf-8')
if 'started' in restart_out.lower() or 'online' in restart_out.lower():
    print("   ✓ Started")
else:
    print(f"   {restart_out}")

time.sleep(5)

# Step 8: Check final status
print("\n7️⃣  Final Status:")
stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status:
    print("   ✅ Application is ONLINE")
    # Show last line (the app status)
    for line in status.split('\n'):
        if 'simplifytools' in line:
            print(f"   {line}")
else:
    print("   Status:")
    print(status)
    print("\n   Last logs:")
    stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 30', timeout=10)
    logs = stdout.read().decode('utf-8')
    for line in logs.split('\n')[-15:]:
        if line.strip():
            print(f"   {line}")

client.close()
print("\n✅ Rebuild complete!")
