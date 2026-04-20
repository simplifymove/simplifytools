#!/usr/bin/env python3
"""
Kill zombie processes and fully restart
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
        print("KILL ZOMBIE PROCESSES & RESTART")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Killing old process PID 789404...")
        run_cmd(client, "kill -9 789404 || echo 'Already killed'")
        time.sleep(1)
        
        print("\n[3] Killing all node/npm processes...")
        run_cmd(client, "pkill -9 node || true")
        run_cmd(client, "pkill -9 npm || true")
        time.sleep(1)
        
        print("\n[4] Kill PM2...")
        run_cmd(client, "pm2 kill || true")
        time.sleep(2)
        
        print("\n[5] Start PM2 fresh...")
        output = run_cmd(client, "cd /var/www/simplifytools && pm2 start 'npm start' --name simplifytools --max-memory-restart 500M")
        print(output)
        
        time.sleep(3)
        
        print("\n[6] Check status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[7] Check logs...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 15 --nostream 2>/dev/null | tail -20")
        print(output)
        
        print("\n" + "=" * 70)
        status = run_cmd(client, "pm2 status")
        if "online" in status.lower():
            print("✓ SUCCESS! App is ONLINE now")
            print("✓ Website should be working!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
