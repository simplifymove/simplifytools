#!/usr/bin/env python3
"""
Verify and rebuild the Next.js app with proper error handling
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out + err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("CHECKING .next BUILD DIRECTORY")
        print("=" * 70)
        
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1] Checking if .next has build ID file...")
        output = run_cmd(client, "ls -la /var/www/simplifytools/.next/ | grep -i 'build\\|id\\|package'")
        print(output if output.strip() else "No build ID files found!")
        
        print("\n[2] Looking for .next/BUILD_ID file specifically...")
        output = run_cmd(client, "cat /var/www/simplifytools/.next/BUILD_ID 2>&1")
        print(output if output.strip() else "BUILD_ID file missing!")
        
        print("\n[3] Checking server/index.js...")
        output = run_cmd(client, "ls -la /var/www/simplifytools/.next/server/")
        print(output)
        
        print("\n[4] Stopping all processes...")
        run_cmd(client, "pm2 stop simplifytools")
        run_cmd(client, "pkill -f 'node.*next'")
        time.sleep(3)
        print("✓ Stopped")
        
        print("\n[5] Cleaning build cache...")
        run_cmd(client, "rm -rf /var/www/simplifytools/.next /var/www/simplifytools/.turbo")
        print("✓ Cleaned")
        
        print("\n[6] Running clean build with verbose output...")
        print("   This may take 5-10 minutes...")
        output = run_cmd(client, "cd /var/www/simplifytools && npm run build 2>&1 | tail -100", timeout=900)
        print(output)
        
        if "error" in output.lower() and "module-not-found" not in output.lower():
            print("\n❌ REAL BUILD ERROR DETECTED:")
            full_output = run_cmd(client, "cd /var/www/simplifytools && npm run build 2>&1 | grep -A5 'error'", timeout=900)
            print(full_output[-1500:])
        
        print("\n[7] Verifying BUILD_ID file...")
        output = run_cmd(client, "cat /var/www/simplifytools/.next/BUILD_ID 2>&1 || echo 'FILE MISSING'")
        print(f"BUILD_ID: {output}")
        
        print("\n[8] Listing .next structure...")
        output = run_cmd(client, "find /var/www/simplifytools/.next -type f -name 'BUILD_ID' -o -name 'package.json' | head -10")
        print(output)
        
        print("\n[9] Starting application...")
        run_cmd(client, "cd /var/www/simplifytools && pm2 start 'npm start' --name simplifytools")
        time.sleep(5)
        print("✓ Started")
        
        print("\n[10] Final check...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 20")
        print(output[-1000:])
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
