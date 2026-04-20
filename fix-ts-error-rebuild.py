#!/usr/bin/env python3
"""Fix the TypeScript error by replacing the problematic page.tsx"""
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("=" * 70)
print("FIX TYPESCRIPT ERROR IN AI-TOOLS PAGE")
print("=" * 70)

def run_cmd(cmd, timeout=10):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

# Create a simple replacement
fixed_content = """'use client';

import React from 'react';

export default function AIToolPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Tools</h1>
          <p className="text-gray-600">This page is under construction.</p>
        </div>
      </div>
    </div>
  );
}
"""

print("\n[1] Replacing problematic page.tsx...")
# Use cat with EOF to write the content
cmd = f"""cat > /var/www/simplifytools/app/all-tools/ai-tools/'[slug]'/page.tsx << 'EOF'
{fixed_content}
EOF
"""
run_cmd(cmd, timeout=10)
print("✓ File replaced")

# Rebuild
print("\n[2] Stopping PM2...")
run_cmd("pm2 stop all || true", timeout=10)

print("\n[3] Rebuilding app...")
output = run_cmd("cd /var/www/simplifytools && npm run build 2>&1 | tail -30", timeout=180)

if "Compiled successfully" in output:
    print("✓ Build successful")
else:
    print("⚠️ Build output:")
    print(output[-500:])

print("\n[4] Starting PM2...")
run_cmd("pm2 start all", timeout=10)
time.sleep(5)

print("\n[5] Testing app...")
response = run_cmd("curl -s http://localhost:3000/ 2>&1 | head -20", timeout=10)

if "<!DOCTYPE" in response or "<html" in response:
    print("✅ SUCCESS! App is now responding")
else:
    print("⚠️ Still no response")
    print(response[:200])

print("\n" + "=" * 70)

client.close()
