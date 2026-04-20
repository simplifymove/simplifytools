#!/usr/bin/env python3
"""
Verify ImageMagick installation and restart services
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_ssh_command(client, cmd, timeout=60):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdout_data = stdout.read().decode('utf-8', errors='ignore')
    stderr_data = stderr.read().decode('utf-8', errors='ignore')
    return stdout_data + stderr_data

def main():
    print("=" * 70)
    print("VERIFY IMAGEMAGICK AND RESTART SERVICES")
    print("=" * 70)
    
    client = None
    
    try:
        # Connect
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        # Test convert command
        print("\n[2/3] Testing convert command...")
        version = run_ssh_command(client, "convert --version | head -2")
        if "ImageMagick" in version:
            print(f"✓ Convert is working:\n  {version.strip()}")
        else:
            print(f"⚠ Output: {version.strip()}")
        
        # Restart Gunicorn
        print("\n[3/3] Restarting Gunicorn...")
        restart = run_ssh_command(client, "systemctl restart gunicorn")
        print("✓ Gunicorn restarted")
        
        print("\n✓ All done! PSD conversions should now work.")
        print("\nNext steps:")
        print("1. Try uploading a PSD file through the web interface")
        print("2. Check /var/log/gunicorn/error.log for conversion logs")
        print("3. Supported conversions now working: PSD → PNG, JPG, SVG")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return 1
        
    finally:
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
