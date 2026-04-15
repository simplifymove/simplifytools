#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🚀 Deploying fix to production...\n")

app_path = '/var/www/simplifytools'

# Step 1: Git pull
print("1️⃣  Pulling latest code...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && git pull origin main', timeout=60)
pull_output = stdout.read().decode('utf-8')
print(f"   {pull_output.strip()[:200]}")

# Step 2: Remove .next and rebuild
print("\n2️⃣  Rebuilding application...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next && cd {app_path} && npm run build 2>&1 | tail -20', timeout=600)
build_output = stdout.read().decode('utf-8')
if 'successfully' in build_output.lower():
    print("   ✓ Build successful")
else:
    # Show last lines of output
    lines = build_output.split('\n')
    for line in lines[-15:]:
        if line.strip():
            print(f"   {line}")

build_error = stderr.read().decode('utf-8')
if build_error and 'error' in build_error.lower():
    print("\n⚠️  Build errors detected:")
    print(build_error[-500:])

# Step 3: Restart PM2
print("\n3️⃣  Restarting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 restart simplifytools', timeout=30)
restart_out = stdout.read().decode('utf-8')
if 'online' in restart_out or '✓' in restart_out:
    print("   ✓ Restarted")

# Step 4: Check status
print("\n4️⃣  Checking status...")
time.sleep(3)
stdin, stdout, stderr = client.exec_command('pm2 status | tail -5', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status:
    print("   ✓ Application online ✅")
else:
    print("   Status:")
    print(status)

client.close()
print("\n✅ Deploy complete! Site should be live now.")
