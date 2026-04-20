#!/usr/bin/env python3
"""
Check detailed PM2 logs to diagnose startup issue
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("CHECKING PM2 LOGS FOR STARTUP ERROR")
        print("=" * 70)
        
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1] PM2 Status:")
        print(run_cmd(client, "pm2 status"))
        
        print("\n[2] Last 100 lines of error log:")
        print(run_cmd(client, "tail -100 /root/.pm2/logs/simplifytools-error.log"))
        
        print("\n[3] Last 50 lines of output log:")
        print(run_cmd(client, "tail -50 /root/.pm2/logs/simplifytools-out.log"))
        
        print("\n[4] Checking Node process directly:")
        print(run_cmd(client, "ps aux | grep 'node\\|next' | grep -v grep"))
        
        print("\n[5] Stopping and checking for errors:")
        run_cmd(client, "pm2 stop simplifytools")
        import time
        time.sleep(2)
        
        print("\n[6] Starting with visible errors:")
        print(run_cmd(client, "cd /var/www/simplifytools && npm start 2>&1 | head -50", timeout=15))
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
