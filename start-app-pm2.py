#!/usr/bin/env python3
"""
Start Application with PM2 - Full Recovery
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"
APP_NAME = "simplifytools"

def run_cmd(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("STARTING APPLICATION WITH PM2")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Checking if .next exists...")
        output = run_cmd(client, f'test -d {APP_PATH}/.next && echo "✓ .next folder found" || echo "❌ .next not found"')
        print(output)
        
        print("\n[3] Checking package.json...")
        output = run_cmd(client, f'cat {APP_PATH}/package.json | head -20')
        print(output[:500])
        
        print("\n[4] Starting application with PM2...")
        # Start with start script from package.json
        output = run_cmd(client, f'cd {APP_PATH} && pm2 start npm --name {APP_NAME} -- start')
        print(output)
        
        time.sleep(2)
        
        print("\n[5] Checking PM2 status...")
        output = run_cmd(client, f'pm2 status')
        print(output)
        
        print("\n[6] Checking if app is listening on port 3000...")
        output = run_cmd(client, f'sleep 2 && netstat -tuln | grep 3000 || echo "Checking..."')
        print(output)
        
        print("\n[7] Checking Node process...")
        output = run_cmd(client, f'ps aux | grep node | grep -v grep')
        print(output if output.strip() else "No node process yet")
        
        print("\n[8] PM2 logs (last 10 lines)...")
        output = run_cmd(client, f'pm2 logs {APP_NAME} --lines 10 --nostream 2>/dev/null || echo "No logs yet"')
        print(output)
        
        print("\n" + "=" * 70)
        print("RESULT:")
        status = run_cmd(client, f'pm2 status {APP_NAME} --json')
        if "online" in status.lower():
            print("✓ SUCCESS! Application is now ONLINE")
            print("✓ Website should be accessible now")
        else:
            print("⚠ Application status unclear. Check logs above.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()
        print("=" * 70)

if __name__ == "__main__":
    main()
