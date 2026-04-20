#!/usr/bin/env python3
"""Restart app with PM2 and test"""
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

def run_cmd(cmd, timeout=10):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

print("=" * 70)
print("RESTART APP AND TEST")
print("=" * 70)

print("\n[1] Restarting PM2...")
run_cmd("pm2 restart simplifytools", timeout=10)
time.sleep(5)

print("\n[2] Checking PM2 status...")
output = run_cmd("pm2 status simplifytools", timeout=10)
print(output)

print("\n[3] Testing port 3000...")
output = run_cmd("curl -s http://localhost:3000/ 2>&1 | head -50", timeout=10)

if "<!DOCTYPE" in output or "<html" in output:
    print("✅ APP IS RESPONDING!")
    print("\n✓ Site should now be working at https://www.simplifyconvert.com")
else:
    print("⚠️ App response:")
    print(output[:500])
    
print("\n" + "=" * 70)

client.close()
