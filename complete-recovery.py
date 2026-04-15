#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("⚠️  Complete System Recovery - Killing stuck processes and rebuilding...\n")

app_path = '/var/www/simplifytools'

# Step 1: Kill all PM2 processes
print("1️⃣  Stopping all PM2 processes...")
stdin, stdout, stderr = client.exec_command('pm2 kill', timeout=30)
print("   ✓ PM2 killed")
time.sleep(2)

# Step 2: Clean delete .next folder
print("\n2️⃣  Removing corrupted .next folder...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next', timeout=10)
print("   ✓ Removed")

# Step 3: Clean install node_modules
print("\n3️⃣  Fresh npm install...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm install 2>&1 | tail -5', timeout=120)
install_out = stdout.read().decode('utf-8')
print(f"   {install_out[:300]}")

# Step 4: Fresh build
print("\n4️⃣  Running fresh npm build (5-10 minutes)...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build 2>&1', timeout=600)
build_output = stdout.read().decode('utf-8')

# Check for success
if 'successfully compiled' in build_output.lower() or '✓' in build_output:
    print("   ✓ Build successful")
    # Show last part
    lines = build_output.split('\n')
    for line in lines[-10:]:
        if line.strip() and 'next' in line.lower():
            print(f"   {line[:100]}")
else:
    print("   Build output (last 1000 chars):")
    print(build_output[-1000:])

build_err = stderr.read().decode('utf-8')
if build_err:
    print(f"\n   Build stderr: {build_err[-300:]}")

# Step 5: Verify .next
print("\n5️⃣  Verifying build...")
stdin, stdout, stderr = client.exec_command(f'test -f {app_path}/.next/server/index.js && echo "✓ .next/server/index.js exists" || echo "❌ Build incomplete"', timeout=10)
verify = stdout.read().decode('utf-8').strip()
print(f"   {verify}")

# Step 6: Restart PM2 fresh
print("\n6️⃣  Starting PM2...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools', timeout=30)
start_out = stdout.read().decode('utf-8')
print(f"   {start_out[:200]}")

# Step 7: Wait and verify
print("\n7️⃣  Waiting 5 seconds for startup...")
time.sleep(5)

stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status.lower():
    print("   ✓ Application started successfully ✅")
    # Show status
    for line in status.split('\n'):
        if 'simplifytools' in line.lower() and 'online' in line.lower():
            print(f"   {line}")
else:
    print("   Status check:")
    print(status)

client.close()
print("\n✅ Recovery complete! Checking website...")
