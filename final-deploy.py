#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🚀 Deploying fixed code to production...\n")

app_path = '/var/www/simplifytools'

# Step 1: Git pull
print("1️⃣  Pulling latest code...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && git pull origin main', timeout=30)
pull_output = stdout.read().decode('utf-8')
print(f"   ✓ {pull_output.strip()[:150]}")

# Step 2: Stop PM2
print("\n2️⃣  Stopping PM2...")
stdin, stdout, stderr = client.exec_command('pm2 stop simplifytools', timeout=10)
stdout.read()
print("   ✓ Stopped")

# Step 3: Clean build
print("\n3️⃣  Cleaning and rebuilding...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && rm -rf .next .turbo && npm run build 2>&1 | tail -30', timeout=900)

build_output = stdout.read().decode('utf-8')
# Show key lines
for line in build_output.split('\n'):
    if any(x in line for x in ['error', 'success', 'successfully', 'compiled', '✓', 'Failed']):
        print(f"   {line}")

build_error = stderr.read().decode('utf-8')
if 'error' in build_error.lower():
    print("\n⚠️  Build failed:")
    print(build_error[-500:])
else:
    print("   ✓ Build successful")

# Step 4: Restart PM2
print("\n4️⃣  Restarting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools --update-env', timeout=30)
restart_out = stdout.read().decode('utf-8')
print("   ✓ Started")

time.sleep(5)

# Step 5: Check status
print("\n5️⃣  Checking status...")
stdin, stdout, stderr = client.exec_command('pm2 status | grep simplifytools | grep online', timeout=10)
status = stdout.read().decode('utf-8')
if status.strip():
    print("   ✅ Application ONLINE")
else:
    print("   Status check:")
    stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
    print(stdout.read().decode('utf-8'))

client.close()
print("\n✅ Deploy complete! Site should be live now.")
