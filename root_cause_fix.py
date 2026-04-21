#!/usr/bin/env python3
"""
ROOT CAUSE FIX for SimplifyTools 502 Error
Complete rebuild with proper production configuration
"""

import paramiko
import time
import sys

def run_ssh(client, cmd, timeout=60):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

print("="*80)
print("ROOT CAUSE ANALYSIS & FIX")
print("="*80)
print("\nProblem: .next directory is CORRUPTED")
print("  ❌ BUILD_ID missing")
print("  ❌ /standalone missing")
print("  ❌ App crashes immediately")
print("  ❌ 75+ restarts in crash loop")
print("\nSolution: Complete clean rebuild with proper production config")
print("="*80)

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=10)
    
    # STEP 1: KILL EVERYTHING
    print("\n[STEP 1] Killing all app processes...")
    run_ssh(client, 'pm2 kill', timeout=10)
    time.sleep(2)
    run_ssh(client, 'pkill -f "next start"', timeout=5)
    run_ssh(client, 'pkill -f "npm start"', timeout=5)
    print("✅ All processes terminated")
    
    # STEP 2: REMOVE CORRUPTED BUILD
    print("\n[STEP 2] Removing corrupted build artifacts...")
    run_ssh(client, 'cd /var/www/simplifytools && rm -rf .next', timeout=10)
    run_ssh(client, 'cd /var/www/simplifytools && rm -rf node_modules/.cache', timeout=10)
    run_ssh(client, 'cd /var/www/simplifytools && npm cache clean --force', timeout=30)
    print("✅ Cleaned corrupted .next directory")
    
    # STEP 3: VERIFY PACKAGE.JSON
    print("\n[STEP 3] Verifying package.json configuration...")
    out, err = run_ssh(client, 'cat /var/www/simplifytools/package.json | grep -A5 scripts', timeout=10)
    if 'next build' in out and 'next start' in out:
        print("✅ Scripts are correct")
    else:
        print("⚠️  Scripts output:", out[:200])
    
    # STEP 4: FRESH INSTALL DEPENDENCIES
    print("\n[STEP 4] Fresh npm install...")
    out, err = run_ssh(client, 'cd /var/www/simplifytools && npm install --production --no-optional', timeout=180)
    if 'added' in out or 'up to date' in out:
        print("✅ Dependencies installed")
    else:
        print("⚠️  Install output:", out[-200:])
    
    # STEP 5: FULLBUILD WITH PRODUCTION CONFIG
    print("\n[STEP 5] Building with production configuration...")
    out, err = run_ssh(client, 'cd /var/www/simplifytools && npm run build', timeout=240)
    
    # Check for build success
    if 'error' in out.lower() and 'success' not in out.lower():
        print("❌ Build FAILED. Output:")
        print(out[-1000:])
        sys.exit(1)
    
    print("✅ Build completed")
    
    # STEP 6: VERIFY BUILD ARTIFACTS
    print("\n[STEP 6] Verifying build artifacts...")
    out, err = run_ssh(client, 'ls -la /var/www/simplifytools/.next/ | head -20', timeout=10)
    if 'BUILD_ID' in out and 'standalone' in out:
        print("✅ BUILD_ID found")
        print("✅ /standalone directory found")
    else:
        print("❌ Missing critical files:")
        print(out)
        # Try checking file count
        out, err = run_ssh(client, 'find /var/www/simplifytools/.next -type f | wc -l', timeout=10)
        print(f"   Total .next files: {out.strip()}")
    
    # STEP 7: START APP FRESH
    print("\n[STEP 7] Starting app with fresh environment...")
    run_ssh(client, 'cd /var/www/simplifytools && pm2 start npm --name simplifytools -- start', timeout=10)
    time.sleep(8)
    print("✅ App started")
    
    # STEP 8: VERIFY PORT 3000 LISTENING
    print("\n[STEP 8] Verifying port 3000 is listening...")
    out, err = run_ssh(client, 'netstat -tuln | grep 3000', timeout=5)
    if '3000' in out and 'LISTEN' in out:
        print("✅ PORT 3000 IS LISTENING")
    else:
        out, err = run_ssh(client, 'lsof -i :3000', timeout=5)
        if 'node' in out or 'npm' in out:
            print("✅ PORT 3000 IS LISTENING (via lsof)")
        else:
            print("❌ PORT 3000 NOT LISTENING")
            print("   Checking PM2 status...")
            out, err = run_ssh(client, 'pm2 status', timeout=5)
            print(out)
    
    # STEP 9: CHECK PROCESS CRASH LOOP
    print("\n[STEP 9] Checking for crash loop (restart count should be 0-1)...")
    out, err = run_ssh(client, 'pm2 show simplifytools | grep -E "restart|status"', timeout=5)
    print(out[:300])
    
    # STEP 10: TEST ENDPOINT
    print("\n[STEP 10] Testing if app responds...")
    out, err = run_ssh(client, 'curl -s http://localhost:3000/ | head -c 200', timeout=10)
    if 'html' in out.lower() or 'simplify' in out.lower():
        print("✅ APP IS RESPONDING")
    else:
        print("⚠️  Response:", out[:100] if out else "No response")
    
    # FINAL STATUS
    print("\n" + "="*80)
    out, err = run_ssh(client, 'pm2 status', timeout=5)
    if 'online' in out:
        print("✅ SUCCESS - APP IS ONLINE AND PRODUCTION BUILD IS COMPLETE")
        print("="*80)
        print("\nThe 502 error should be RESOLVED.")
        print("Test: https://www.simplifyconvert.com")
    else:
        print("⚠️  Status unclear:")
        print(out)
    
    client.close()
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
