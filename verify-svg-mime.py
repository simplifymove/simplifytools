#!/usr/bin/env python3
"""
Verify SVG mime type is in the deployed route.ts
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def main():
    client = None
    
    try:
        print("Verifying SVG mime type on VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        stdin, stdout, stderr = client.exec_command(
            "grep -n 'svg.*image/svg' /var/www/simplifytools/app/api/convert/route.ts",
            timeout=10
        )
        output = stdout.read().decode('utf-8', errors='ignore')
        
        if "svg" in output and "image/svg+xml" in output:
            print(f"✅ Verified! {output.strip()}")
            print("\n✓ SVG mime type is correctly deployed on VPS")
            return 0
        else:
            print(f"⚠ Could not find SVG mime type. Output: {output}")
            return 1
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1
        
    finally:
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
