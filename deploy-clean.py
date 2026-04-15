#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🚀 FINAL BUILD AND DEPLOY\n")

app_path = '/var/www/simplifytools'

# Step 1: Kill and clean
print("1️⃣  Stopping processes...")
stdin, stdout, stderr = client.exec_command('pm2 kill && sleep 1', timeout=30)
stdout.read()

stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next', timeout=10)
stdout.read()
print("   ✓ Cleaned")

# Step 2: Pull latest
print("\n2️⃣  Pulling latest code...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && git pull origin main', timeout=30)
print("   ✓ Pulled")

# Step 3: Install deps
print("\n3️⃣  Installing dependencies...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm install 2>&1 | tail -3', timeout=120)
print("   ✓ Installed")

# Step 4: Build
print("\n4️⃣  Building (this takes 5-10 minutes)...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build 2>&1 | tail -30', timeout=600)
build_out = stdout.read().decode('utf-8')

# Check for success
if 'successfully' in build_out.lower() or 'build worker exited' not in build_out.lower():
    print("   ✓ Build completed")
else:
    print("   Build output:")
    print(build_out[-800:] if len(build_out) > 800 else build_out)

# Step 5: Verify
print("\n5️⃣  Verifying build...")
stdin, stdout, stderr = client.exec_command(f'test -f {app_path}/.next/server/index.js && echo "✓ Valid" || echo "✗ Invalid"', timeout=10)
verify = stdout.read().decode('utf-8').strip()
print(f"   {verify}")

# Step 6: Start
print("\n6️⃣  Starting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools --wait-ready --listen-timeout 10000', timeout=30)
print("   ✓ Started")

# Step 7: Wait and verify
print("\n7️⃣  Waiting for app...")
time.sleep(5)

stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status.lower():
    print("   ✓ ONLINE ✅")
else:
    print(f"   Status: {status[:200]}")

# Step 8: Check connectivity
print("\n8️⃣  Testing connectivity...")
stdin, stdout, stderr = client.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/', timeout=10)
http_code = stdout.read().decode('utf-8').strip()
print(f"   HTTP {http_code}")

client.close()
print("\n✅ Deploy complete!")
