#!/usr/bin/env python3
"""
Kill process on port 3000 and restart PM2
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("FIX PORT 3000 CONFLICT")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Finding all Node processes on port 3000...")
        output = run_cmd(client, "ps aux | grep -i 'node\\|next' | grep -v grep")
        print(output)
        
        print("\n[3] Killing all Node processes...")
        run_cmd(client, "pkill -f 'node.*next' || true")
        run_cmd(client, "pkill -f 'npm' || true")
        time.sleep(1)
        
        print("\n[4] Stopping PM2 completely...")
        run_cmd(client, "pm2 kill || true")
        time.sleep(2)
        
        print("\n[5] Resurrecting PM2...")
        output = run_cmd(client, "pm2 resurrect")
        print(output)
        
        time.sleep(3)
        
        print("\n[6] Checking PM2 status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[7] Checking app status...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 5 --nostream 2>/dev/null || echo 'Starting...'")
        print(output[:500])
        
        print("\n" + "=" * 70)
        print("RESULT:")
        status = run_cmd(client, "pm2 status")
        if "online" in status.lower():
            print("✓ SUCCESS! Application is ONLINE")
            print("✓ Try accessing your website now")
        else:
            print("⚠ Checking if running...")
            procs = run_cmd(client, "ps aux | grep 'node.*next' | grep -v grep")
            if procs.strip():
                print("✓ Node process is running!")
            else:
                print("Still checking...")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()
        print("=" * 70)

if __name__ == "__main__":
    main()
