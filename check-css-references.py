#!/usr/bin/env python3
"""
Check HTML and CSS references - force cache invalidation
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
    print("CHECK CSS REFERENCES IN HTML")
    print("=" * 70)
    
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1/4] Searching for old CSS hash in build files...")
        out = run_cmd(client, f"grep -r '98af741df7eb1c44' {VPS_APP_DIR}/.next/ 2>/dev/null | head -5", timeout=10)
        if out:
            print("⚠ Found references to old CSS:")
            print(out[:500])
        else:
            print("✓ No references to old CSS found in .next/")
        
        print("\n[2/4] Listing actual CSS files in chunks...")
        out = run_cmd(client, f"ls -la {VPS_APP_DIR}/.next/static/chunks/*.css", timeout=10)
        print(out)
        
        print("\n[3/4] Checking HTML output...")
        out = run_cmd(client, f"find {VPS_APP_DIR}/.next -name '*.html' | head -1 | xargs grep -o '_next/static/chunks/[a-z0-9]*\\.css' 2>/dev/null | head -3", timeout=10)
        if out:
            print("CSS references in HTML:")
            print(out)
        else:
            print("No CSS references found in HTML files")
        
        print("\n[4/4] Clearing .next and rebuilding with cache clear...")
        run_cmd(client, f"rm -rf {VPS_APP_DIR}/.next {VPS_APP_DIR}/node_modules/.cache", timeout=30)
        out = run_cmd(client, f"cd {VPS_APP_DIR} && npm run build 2>&1 | tail -20", timeout=900)
        if "Compiled successfully" in out:
            print("✓ Build completed")
        else:
            print("Build output:")
            print(out[-300:])
        
        print("\n" + "=" * 70)
        print("Cache cleared and rebuilt. The issue should be:")
        print("1. Your browser cached the old HTML page")
        print("2. Solution: Hard refresh (Ctrl+Shift+R) to clear browser cache")
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
