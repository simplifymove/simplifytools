#!/usr/bin/env python3
"""
Verify psd-to-svg fix on VPS
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def main():
    client = None
    
    try:
        print("Verifying psd-to-svg fix on VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        stdin, stdout, stderr = client.exec_command(
            "grep -A 2 'const blob = await response.blob' /var/www/simplifytools/app/all-tools/psd-to-svg/page.tsx | head -3",
            timeout=10
        )
        output = stdout.read().decode('utf-8', errors='ignore')
        
        if "const blob" in output and "await response.blob" in output:
            print(f"✅ Verified! Blob response handling is in place:")
            print(output)
            print("\n✓ PSD-to-SVG fix confirmed on VPS")
            return 0
        else:
            print(f"⚠ Could not verify fix. Output: {output}")
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
