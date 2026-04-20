#!/usr/bin/env python3
"""Fix 502 by rebuilding - .next directory is missing"""
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

def run_cmd(cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

print("=" * 70)
print("FIXING 502 - REBUILD MISSING .next DIRECTORY")
print("=" * 70)

try:
    print("\n[1/5] Stopping PM2...")
    run_cmd("pm2 stop simplifytools || true", timeout=10)
    print("✓ Stopped")
    
    print("\n[2/5] Running npm build...")
    output = run_cmd("cd /var/www/simplifytools && npm run build 2>&1 | tail -20", timeout=180)
    print(output)
    
    if "Compiled successfully" not in output:
        print("⚠️ Build warnings, but continuing...")
    
    print("\n[3/5] Verifying .next directory...")
    output = run_cmd("ls -la /var/www/simplifytools/.next/ | head -5", timeout=10)
    print(output)
    
    print("\n[4/5] Starting PM2...")
    run_cmd("pm2 start simplifytools || pm2 restart simplifytools", timeout=10)
    print("✓ Started")
    
    time.sleep(5)
    
    print("\n[5/5] Testing app...")
    output = run_cmd("curl -s http://localhost:3000/ 2>&1 | head -20", timeout=10)
    
    if "<!DOCTYPE" in output or "<html" in output:
        print("✅ SUCCESS! App is responding")
    else:
        print("⚠️ Response:")
        print(output)
        
except Exception as e:
    print(f"✗ Error: {e}")

finally:
    client.close()
