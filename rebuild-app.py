#!/usr/bin/env python3
"""
Rebuild application on VPS
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"

def run_cmd(client, cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("REBUILD APPLICATION")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Stop PM2 process...")
        run_cmd(client, "pm2 stop simplifytools")
        time.sleep(2)
        
        print("\n[3] Clean .next directory...")
        run_cmd(client, f"rm -rf {APP_PATH}/.next")
        
        print("\n[4] Running npm build (this takes 3-5 minutes)...")
        output = run_cmd(client, f"cd {APP_PATH} && npm run build 2>&1", timeout=300)
        
        if "error" in output.lower():
            print("⚠ BUILD ERRORS:")
            print(output[-2000:])
        else:
            print("✓ Build completed successfully")
            # Show last 30 lines
            lines = output.split('\n')
            for line in lines[-30:]:
                if line.strip():
                    print(line)
        
        print("\n[5] Restarting PM2...")
        output = run_cmd(client, "pm2 start simplifytools")
        print(output)
        
        time.sleep(3)
        
        print("\n[6] Checking PM2 status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[7] Checking logs...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 10 --nostream 2>/dev/null | tail -15")
        print(output)
        
        print("\n" + "=" * 70)
        status = run_cmd(client, "pm2 status")
        if "online" in status.lower():
            print("✓ SUCCESS! Application is running")
            print("✓ Website should be working now!")
        else:
            print("⚠ Check logs above for issues")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
