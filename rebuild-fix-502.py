#!/usr/bin/env python3
"""
Rebuild the application and fix 502 error
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("FIXING 502 - REBUILD APPLICATION")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Stopping application...")
        run_cmd(client, "pm2 stop simplifytools")
        time.sleep(2)
        print("✓ Stopped")
        
        print("\n[3] Removing old build...")
        run_cmd(client, "rm -rf /var/www/simplifytools/.next")
        print("✓ Old build removed")
        
        print("\n[4] Rebuilding Next.js application (this takes 3-5 minutes)...")
        output = run_cmd(client, "cd /var/www/simplifytools && npm run build 2>&1 | tail -50", timeout=600)
        print(output)
        
        if "error" in output.lower():
            print("\n❌ Build failed! Checking full logs...")
            output = run_cmd(client, "cd /var/www/simplifytools && npm run build")
            print(output[-2000:])
        else:
            print("\n✓ Build completed successfully")
        
        print("\n[5] Verifying .next directory...")
        output = run_cmd(client, "ls -la /var/www/simplifytools/.next/ | head -20")
        print(output)
        
        print("\n[6] Starting application...")
        run_cmd(client, "pm2 start simplifytools")
        time.sleep(5)
        print("✓ Started")
        
        print("\n[7] Checking status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[8] Testing connectivity (this may take 10 seconds)...")
        for i in range(5):
            time.sleep(2)
            output = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' https://www.simplifyconvert.com/all-tools/webp-to-avif")
            status = output.strip()
            print(f"   Attempt {i+1}: HTTP {status}")
            if status in ['200', '404']:
                print(f"\n✓ SUCCESS! Website responding with HTTP {status}")
                break
        
        print("\n[9] Full connectivity test...")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com/ 2>&1 | head -5")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ REBUILD COMPLETE!")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
