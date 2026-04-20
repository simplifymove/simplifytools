#!/usr/bin/env python3
"""
Diagnose static files issue on VPS
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def run_cmd(client, cmd, timeout=30):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore').strip()

def main():
    print("=" * 70)
    print("DIAGNOSE STATIC FILES ISSUE")
    print("=" * 70)
    
    client = None
    
    try:
        print("\n[1/5] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2/5] Checking .next directory...")
        result = run_cmd(client, f"ls -la {VPS_APP_DIR}/.next/static/chunks/ | head -20", timeout=10)
        print(result if result else "⚠ .next/static/chunks not found or empty")
        
        print("\n[3/5] Checking build status...")
        result = run_cmd(client, f"ls -la {VPS_APP_DIR}/.next/ | grep -E '^d'", timeout=10)
        print(result if result else "⚠ .next directory missing")
        
        print("\n[4/5] Checking Next.js service status...")
        result = run_cmd(client, "systemctl status nextjs | grep -E 'Active|Loaded'", timeout=10)
        print(result if result else "⚠ Service status unknown")
        
        print("\n[5/5] Checking for build errors...")
        result = run_cmd(client, f"tail -20 {VPS_APP_DIR}/npm-debug.log 2>/dev/null || echo 'No debug log'", timeout=10)
        print(result[:500] if result else "No build errors found")
        
        print("\n" + "=" * 70)
        print("Diagnosis: Static files may need rebuild")
        print("\nRecommended: Run a full rebuild on VPS")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
