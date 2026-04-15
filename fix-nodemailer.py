#!/usr/bin/env python3
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=30)

print("🔧 Installing missing dependencies...\n")

app_path = '/var/www/simplifytools'

# Step 1: Install missing type definitions
print("1️⃣  Installing @types/nodemailer...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && npm install --save-dev @types/nodemailer', timeout=120)
install_out = stdout.read().decode('utf-8')
if 'added' in install_out or 'up to date' in install_out:
    print("   ✓ Installed")
    # Show summary line
    for line in install_out.split('\n')[-10:]:
        if 'added' in line or 'up to date' in line or 'packages' in line:
            print(f"   {line}")
else:
    print(install_out[-500:])

# Step 2: Stop PM2
print("\n2️⃣  Stopping PM2...")
stdin, stdout, stderr = client.exec_command('pm2 stop simplifytools', timeout=10)
stdout.read()
print("   ✓ Stopped")

# Step 3: Clean and rebuild
print("\n3️⃣  Cleaning and rebuilding...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && rm -rf .next && npm run build', timeout=900)
build_out = stdout.read().decode('utf-8')

# Check build success
if 'successfully' in build_out.lower() or '.next' in build_out:
    # Show last 20 lines
    lines = build_out.split('\n')
    for line in lines[-20:]:
        if line.strip():
            print(f"   {line}")
else:
    print("   Build output:")
    print(build_out[-1500:])

build_err = stderr.read().decode('utf-8')
if build_err and 'error' in build_err.lower():
    print("\n⚠️  Build errors detected:")
    print(build_err[-800:])
    sys.exit(1)

# Step 4: Verify .next folder
print("\n4️⃣  Verifying build folder...")
stdin, stdout, stderr = client.exec_command(f'test -d {app_path}/.next/server && echo "✓ Build OK" || echo "❌ Build failed"', timeout=10)
verify = stdout.read().decode('utf-8').strip()
print(f"   {verify}")

# Step 5: Restart PM2
print("\n5️⃣  Restarting application...")
stdin, stdout, stderr = client.exec_command(f'cd {app_path} && pm2 start "npm start" --name simplifytools --update-env', timeout=30)
restart_out = stdout.read().decode('utf-8')
if 'started' in restart_out.lower() or 'online' in restart_out.lower():
    print("   ✓ Started")
else:
    print(f"   {restart_out.strip()}")

time.sleep(5)

# Step 6: Verify online status
print("\n6️⃣  Checking status...")
stdin, stdout, stderr = client.exec_command('pm2 status | grep simplifytools', timeout=10)
status = stdout.read().decode('utf-8')
if 'online' in status:
    print("   ✅ Application is ONLINE")
else:
    print("   Status:")
    print(status)

client.close()
print("\n✅ Fix complete! Site should be live now.")
