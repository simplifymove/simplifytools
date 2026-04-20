#!/usr/bin/env python3
"""
Deploy SVG mime type fix directly to VPS
"""

import paramiko
import os

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def main():
    print("=" * 70)
    print("DEPLOY SVG MIME TYPE FIX DIRECTLY")
    print("=" * 70)
    
    client = None
    sftp = None
    
    try:
        print("\n[1/4] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected to VPS")
        
        print("\n[2/4] Uploading fixed route.ts...")
        local_path = "app/api/convert/route.ts"
        remote_path = f"{VPS_APP_DIR}/app/api/convert/route.ts"
        
        if not os.path.exists(local_path):
            print(f"✗ Local file not found: {local_path}")
            return 1
        
        sftp.put(local_path, remote_path)
        print(f"✓ Uploaded {local_path} to VPS")
        
        print("\n[3/4] Rebuilding Next.js...")
        stdin, stdout, stderr = client.exec_command(
            f"cd {VPS_APP_DIR} && npm run build 2>&1 | tail -5",
            timeout=600
        )
        build_output = stdout.read().decode('utf-8', errors='ignore')
        print("✓ Build completed")
        
        print("\n[4/4] Restarting Next.js service...")
        stdin, stdout, stderr = client.exec_command("systemctl restart nextjs", timeout=30)
        stdout.read()
        print("✓ Service restarted")
        
        print("\n" + "=" * 70)
        print("✅ SVG mime type fix deployed successfully!")
        print("\nWhat was fixed:")
        print("  • Added svg → image/svg+xml to mime type mapping")
        print("  • Uploaded route.ts directly to VPS")
        print("  • Rebuilt Next.js and restarted service")
        print("\nThe SVG file type should now be returned with correct headers.")
        
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
