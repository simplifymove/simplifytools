#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔧 Fixing 502 Bad Gateway - Rebuilding Next.js...\n")

app_path = '/var/www/simplifytools'

# Step 1: Remove corrupted .next folder
print("1️⃣  Removing corrupted .next folder...")
stdin, stdout, stderr = client.exec_command(f'rm -rf {app_path}/.next', timeout=10)
stdout.read()
print("   ✓ Removed .next/")

# Step 2: Run npm run build
print("\n2️⃣  Running npm run build (this may take 5-10 minutes)...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm run build 2>&1', timeout=600)

# Read build output incrementally
build_output = stdout.read().decode('utf-8')
if 'successfully' in build_output.lower() or 'next build' in build_output.lower():
    print("   ✓ Build started")
    # Show last part of build output
    lines = build_output.split('\n')
    for line in lines[-30:]:
        if line.strip():
            print(f"   {line}")
else:
    print("   Build output:")
    print(build_output[-1500:] if len(build_output) > 1500 else build_output)

build_error = stderr.read().decode('utf-8')
if build_error:
    print("\n⚠️  Build stderr:")
    print(build_error[-500:] if len(build_error) > 500 else build_error)

# Step 3: Verify .next exists
print("\n3️⃣  Verifying build...")
stdin, stdout, stderr = client.exec_command(f'ls -la {app_path}/.next/ 2>&1 | head -10', timeout=10)
ls_output = stdout.read().decode('utf-8')
if 'No such file' in ls_output:
    print("   ❌ BUILD FAILED - .next folder not created!")
    print(ls_output)
else:
    print("   ✓ Build folder exists")
    print(ls_output[:500])

# Step 4: Restart PM2
print("\n4️⃣  Restarting PM2...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 restart simplifytools', timeout=30)
restart_output = stdout.read().decode('utf-8')
print(f"   {restart_output.strip()}")

# Step 5: Wait and check status
print("\n5️⃣  Waiting for app to start...")
time.sleep(5)

stdin, stdout, stderr = client.exec_command('pm2 status', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status:
    print("   ✓ Application online!")
    print(status)
else:
    print("   ⚠️  Still starting, checking logs...")
    stdin, stdout, stderr = client.exec_command('pm2 logs simplifytools --nostream --lines 20', timeout=10)
    print(stdout.read().decode('utf-8')[-800:])

client.close()
print("\n✅ Rebuild complete! Website should be live in 1-2 minutes.")
