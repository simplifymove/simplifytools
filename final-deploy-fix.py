#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🚀 Final Deploy - Pulling fix and rebuilding...\n")

app_path = '/var/www/simplifytools'

# Step 1: Git pull
print("1️⃣  Pulling latest fix...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && git pull origin main', timeout=30)
pull_out = stdout.read().decode('utf-8')
if 'already up to date' in pull_out.lower() or 'fast-forward' in pull_out.lower():
    print("   ✓ Pull successful")
else:
    print(f"   {pull_out[:200]}")

# Step 2: Kill old PM2
print("\n2️⃣  Stopping old PM2...")
stdin, stdout, stderr = client.exec_command('pm2 kill', timeout=15)
stdout.read()
time.sleep(1)

# Step 3: Remove .next
print("3️⃣  Cleaning .next...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next', timeout=10)
stdout.read()

# Step 4: Build
print("\n4️⃣  Building application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build 2>&1 | tail -20', timeout=600)
build_out = stdout.read().decode('utf-8')
if 'successfully' in build_out.lower() or 'compiled' in build_out.lower():
    print("   ✓ Build successful")
else:
    print("   Build output (last 400 chars):")
    print(build_out[-400:] if len(build_out) > 400 else build_out)

build_err = stderr.read().decode('utf-8')
if 'error' in build_err.lower():
    print("   ⚠️  Build errors:")
    print(build_err[-300:])

# Step 5: Verify build
print("\n5️⃣  Verifying build...")
stdin, stdout, stderr = client.exec_command(f'test -f {app_path}/.next/server/index.js && echo "✓ Build valid" || echo "❌ Build invalid"', timeout=10)
verify = stdout.read().decode('utf-8').strip()
print(f"   {verify}")

# Step 6: Start PM2
print("\n6️⃣  Starting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools', timeout=30)
start_out = stdout.read().decode('utf-8')
if 'started' in start_out.lower() or 'done' in start_out.lower():
    print("   ✓ PM2 started")

# Step 7: Wait and check
print("\n7️⃣  Waiting for app...")
time.sleep(3)
stdin, stdout, stderr = client.exec_command('pm2 status | grep simplifytools', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status.lower():
    print("   ✓ Application ONLINE ✅")
else:
    print("   Status:")
    print(status)

client.close()
print("\n✅ Deploy complete! Website should be live now.")
