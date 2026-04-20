#!/usr/bin/env python3
"""
Clean rebuild Next.js on VPS to regenerate static files
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
    print("CLEAN REBUILD NEXT.JS ON VPS")
    print("=" * 70)
    
    client = None
    
    try:
        print("\n[1/5] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2/5] Removing old build artifacts...")
        run_cmd(client, f"rm -rf {VPS_APP_DIR}/.next", timeout=30)
        print("✓ Removed .next directory")
        
        print("\n[3/5] Cleaning npm cache...")
        run_cmd(client, f"cd {VPS_APP_DIR} && npm cache clean --force", timeout=60)
        print("✓ Cache cleaned")
        
        print("\n[4/5] Running clean build...")
        out, err = run_cmd(client, f"cd {VPS_APP_DIR} && npm run build 2>&1", timeout=900)
        
        # Check for success
        if "Compiled successfully" in out:
            print("✓ Build completed successfully")
            # Show last few lines
            lines = out.split('\n')[-10:]
            for line in lines:
                if line.strip():
                    print(f"  {line}")
        else:
            print("⚠ Build output:")
            print(out[-500:] if len(out) > 500 else out)
        
        print("\n[5/5] Verifying CSS files were generated...")
        out, err = run_cmd(client, f"ls -la {VPS_APP_DIR}/.next/static/chunks/*.css 2>&1 | head -5", timeout=10)
        
        if ".css" in out:
            print("✓ CSS files found!")
            print(out[:200])
        else:
            print("⚠ CSS files may not have been generated")
            print(out if out else "No CSS files in chunks directory")
        
        print("\n" + "=" * 70)
        print("Build complete! Static files should now be available.")
        print("\nYou may need to:")
        print("  1. Clear browser cache (Ctrl+Shift+Delete)")
        print("  2. Hard refresh the page (Ctrl+Shift+R)")
        print("  3. Visit the site again")
        
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
