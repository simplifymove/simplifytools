#!/usr/bin/env python3
"""
Fix: Complete rebuild with no cache and restart services
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def run_cmd(client, cmd, timeout=600):
    """Execute SSH command"""
    print(f"  $ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def main():
    print("=" * 70)
    print("AGGRESSIVE REBUILD AND RESTART")
    print("=" * 70)
    
    client = None
    
    try:
        print("\n[1/7] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2/7] Killing Node.js process...")
        run_cmd(client, "pkill -9 -f 'node.*next' || true", timeout=10)
        time.sleep(2)
        print("✓ Killed")
        
        print("\n[3/7] Removing .next, node_modules cache, and turbopack...")
        run_cmd(client, f"rm -rf {VPS_APP_DIR}/.next {VPS_APP_DIR}/node_modules/.cache {VPS_APP_DIR}/.turbo", timeout=30)
        print("✓ Removed build artifacts")
        
        print("\n[4/7] Reinstalling dependencies...")
        out, err = run_cmd(client, f"cd {VPS_APP_DIR} && npm ci --prefer-offline 2>&1 | tail -10", timeout=120)
        if "added" in out or "up to date" in out:
            print("✓ Dependencies ready")
        else:
            print("⚠ Dependencies status unclear")
        
        print("\n[5/7] Running fresh build with environment variables...")
        out, err = run_cmd(client, f"cd {VPS_APP_DIR} && NEXT_PUBLIC_API_URL=https://www.simplifyconvert.com npm run build 2>&1", timeout=900)
        
        if "Compiled successfully" in out:
            print("✓ Build completed successfully")
        else:
            print("Build output (last 500 chars):")
            print(out[-500:] if len(out) > 500 else out)
        
        print("\n[6/7] Verifying CSS files exist with correct hashes...")
        out, err = run_cmd(client, f"ls -lh {VPS_APP_DIR}/.next/static/chunks/*.css", timeout=10)
        print(out)
        
        print("\n[7/7] Starting Node.js application...")
        run_cmd(client, f"cd {VPS_APP_DIR} && npm start > /tmp/next.log 2>&1 &", timeout=10)
        time.sleep(3)
        
        # Test the response
        out, err = run_cmd(client, f"curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort -u", timeout=10)
        print("\n✓ CSS references now being served:")
        if out:
            for line in out.strip().split('\n'):
                if line:
                    print(f"  - {line}")
        
        if "98af741df7eb1c44" in out:
            print("\n⚠ Old hash still present - may need additional intervention")
            return 1
        else:
            print("\n✅ Old CSS hash no longer served!")
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
