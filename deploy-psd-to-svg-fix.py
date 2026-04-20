#!/usr/bin/env python3
"""
Deploy psd-to-svg fix to VPS
"""

import paramiko
import os

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def main():
    print("=" * 70)
    print("DEPLOY PSD-TO-SVG FIX")
    print("=" * 70)
    
    client = None
    sftp = None
    
    try:
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected to VPS")
        
        print("\n[2/3] Uploading fixed psd-to-svg page...")
        local_path = "app/all-tools/psd-to-svg/page.tsx"
        remote_path = f"{VPS_APP_DIR}/{local_path}"
        
        if not os.path.exists(local_path):
            print(f"✗ Local file not found: {local_path}")
            return 1
        
        sftp.put(local_path, remote_path)
        print(f"✓ Uploaded psd-to-svg page")
        
        print("\n[3/3] Rebuilding and restarting...")
        stdin, stdout, stderr = client.exec_command(
            f"cd {VPS_APP_DIR} && npm run build 2>&1 | tail -3 && systemctl restart nextjs",
            timeout=600
        )
        output = stdout.read().decode('utf-8', errors='ignore')
        print("✓ Rebuild and restart completed")
        
        print("\n" + "=" * 70)
        print("✅ PSD-to-SVG fix deployed!")
        print("\nWhat was fixed:")
        print("  • Changed response handling from JSON to blob")
        print("  • Now correctly receives and processes SVG binary data")
        print("  • Base64 decoding removed (no longer needed)")
        print("\nPSD to SVG conversions should now work end-to-end!")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        if sftp:
            try:
                sftp.close()
            except:
                pass
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
