#!/usr/bin/env python3
"""
Quick status check - see what's happening on VPS
"""

import paramiko

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
        print("VPS STATUS CHECK")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] PM2 Status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[3] Node Process...")
        output = run_cmd(client, "ps aux | grep 'node\\|next\\|npm' | grep -v grep | head -5")
        print(output if output.strip() else "No Node process running!")
        
        print("\n[4] Recent Logs (Last 20 lines)...")
        output = run_cmd(client, "pm2 logs simplifytools --lines 20 --nostream 2>/dev/null || echo 'No logs'")
        print(output)
        
        print("\n[5] Check port 3000...")
        output = run_cmd(client, "ss -tuln | grep 3000 || lsof -i :3000 2>/dev/null || echo 'Port 3000 not in use'")
        print(output if output.strip() else "Port not in use")
        
        print("\n[6] Check Nginx...")
        output = run_cmd(client, "ps aux | grep nginx | grep -v grep | head -3")
        print(output if output.strip() else "Nginx not running")
        
        print("\n[7] System Info...")
        output = run_cmd(client, "free -h | head -3")
        print(output)
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
