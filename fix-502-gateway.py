#!/usr/bin/env python3
"""
Diagnose and fix 502 Bad Gateway error
"""

import paramiko
import time

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
        print("DIAGNOSING 502 BAD GATEWAY ERROR")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Checking PM2 status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[3] Checking PM2 logs (last 30 lines)...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 30 --nostream")
        print(output[-1500:])
        
        print("\n[4] Checking if port 3000 is listening...")
        output = run_cmd(client, "netstat -tlnp | grep 3000")
        print(output if output.strip() else "Port 3000 NOT listening!")
        
        print("\n[5] Checking Nginx logs...")
        output = run_cmd(client, "tail -20 /var/log/nginx/error.log")
        print(output)
        
        print("\n[6] Checking application process...")
        output = run_cmd(client, "ps aux | grep node | grep -v grep")
        print(output if output.strip() else "No Node process running!")
        
        print("\n[7] Killing zombie processes and restarting...")
        run_cmd(client, "pkill -9 node")
        time.sleep(1)
        run_cmd(client, "pm2 restart simplifytools")
        time.sleep(3)
        print("✓ Restarted")
        
        print("\n[8] Checking status after restart...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[9] Testing connectivity...")
        time.sleep(2)
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com/all-tools/webp-to-avif 2>&1 | head -10")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ DIAGNOSTICS COMPLETE")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
