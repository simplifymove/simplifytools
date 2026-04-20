#!/usr/bin/env python3
"""Nuclear rebuild - remove everything and start fresh"""
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("=" * 70)
print("NUCLEAR REBUILD - REMOVE EVERYTHING AND START FRESH")
print("=" * 70)

try:
    print("\n[1/6] Killing all Node processes...")
    run_cmd(client, "pkill -9 -f node || true", timeout=5)
    print("✓ Killed")
    
    print("\n[2/6] Removing everything (.next, node_modules, .turbo, .eslintcache)...")
    run_cmd(client, "cd /var/www/simplifytools && rm -rf .next node_modules .turbo .eslintcache .vercel .swc", timeout=30)
    print("✓ Removed")
    
    print("\n[3/6] Clearing npm cache...")
    run_cmd(client, "npm cache clean --force", timeout=30)
    print("✓ Cleared")
    
    print("\n[4/6] Fresh npm install with npm 10+ best practices...")
    output = run_cmd(client, "cd /var/www/simplifytools && npm install --no-audit --no-fund 2>&1 | tail -5", timeout=120)
    print(output)
    
    print("\n[5/6] Full production build...")
    output = run_cmd(client, "cd /var/www/simplifytools && NODE_ENV=production NEXT_PUBLIC_API_URL=https://www.simplifyconvert.com npm run build 2>&1 | tail -20", timeout=180)
    if "Compiled successfully" in output:
        print("✓ Build successful")
    else:
        print(output)
    
    # Wait before starting
    time.sleep(2)
    
    print("\n[6/6] Starting application...")
    run_cmd(client, "cd /var/www/simplifytools && npm start > /tmp/app.log 2>&1 &", timeout=5)
    
    # Wait for app to start
    time.sleep(5)
    
    print("\nTesting CSS references...")
    output = run_cmd(client, "curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort | uniq", timeout=10)
    
    print("\nCSS found in HTML:")
    for line in output.strip().split('\n'):
        if line:
            if "98af741df7eb1c44" in line:
                print(f"  ⚠️ {line}")
            else:
                print(f"  ✓ {line}")
    
    # Final check
    if "98af741df7eb1c44" in output:
        print("\n❌ Old hash still present - requires deeper investigation")
        print("Checking app logs...")
        logs = run_cmd(client, "tail -50 /tmp/app.log", timeout=10)
        print(logs)
    else:
        print("\n✅ SUCCESS! Old CSS hash is completely gone")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    client.close()
