#!/usr/bin/env python3
"""
Deep dive: Check what HTML is actually being served
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def run_cmd(client, cmd, timeout=60):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore').strip()

def main():
    print("=" * 70)
    print("CHECK ACTUAL HTML BEING SERVED")
    print("=" * 70)
    
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1/6] Checking server build directory structure...")
        out = run_cmd(client, f"ls -la {VPS_APP_DIR}/.next/server/app/ | head -10", timeout=10)
        print(out)
        
        print("\n[2/6] Finding HTML files in build...")
        out = run_cmd(client, f"find {VPS_APP_DIR}/.next -name '*.html' -type f | head -5", timeout=10)
        if out:
            print("HTML files found:")
            print(out)
        else:
            print("No standalone HTML files found")
        
        print("\n[3/6] Checking manifest files for CSS references...")
        out = run_cmd(client, f"find {VPS_APP_DIR}/.next -name '*manifest*' -type f | head -3", timeout=10)
        if out:
            print("Manifest files:")
            print(out)
        else:
            print("No manifest files found")
        
        print("\n[4/6] Searching for the old CSS hash ANYWHERE in .next/...")
        out = run_cmd(client, f"grep -r '98af741df7eb1c44' {VPS_APP_DIR}/.next/ 2>/dev/null | head -3", timeout=15)
        if out:
            print("⚠ FOUND OLD CSS HASH IN:")
            print(out)
            return 1
        else:
            print("✓ Old CSS hash NOT found in .next/")
        
        print("\n[5/6] Checking static files directory...")
        out = run_cmd(client, f"ls -la {VPS_APP_DIR}/public/ | grep -E '^d|^-' | head -10", timeout=10)
        print(out if out else "No public files")
        
        print("\n[6/6] Testing actual HTTP response from server...")
        out = run_cmd(client, f"curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | head -5", timeout=10)
        if out:
            print("CSS references in HTTP response:")
            print(out)
        else:
            print("Could not get CSS references from HTTP response")
        
        print("\n" + "=" * 70)
        print("Diagnosis: If old CSS hash appears above, rebuild is incomplete")
        print("=" * 70)
        
        return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
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
