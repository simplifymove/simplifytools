#!/usr/bin/env python3
"""
Install potrace for vector tracing (PNG to SVG conversion)
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
    print("INSTALL POTRACE FOR VECTOR TRACING")
    print("=" * 70)
    
    client = None
    
    try:
        # Connect
        print("\n[1/4] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected to VPS")
        
        # Check if potrace exists
        print("\n[2/4] Checking for potrace...")
        check = run_ssh_command(client, "which potrace")
        if "potrace" in check:
            print(f"✓ potrace already installed: {check.strip()}")
            version = run_ssh_command(client, "potrace --version")
            print(f"  Version: {version.strip()}")
        else:
            print("✗ potrace not found - installing...")
            
            # Update package manager
            print("\n[3/4] Installing potrace...")
            install = run_ssh_command(client, "apt-get install -y potrace", timeout=120)
            
            if "done" in install.lower() or "Setting up" in install:
                print("✓ potrace installed successfully")
            else:
                print(f"  Installation output: {install[:200]}")
            
            # Verify
            verify = run_ssh_command(client, "potrace --version")
            if "potrace" in verify:
                print(f"✓ Verified: {verify.strip()}")
            else:
                print(f"  Result: {verify.strip()}")
        
        # Also install autotrace (alternative vector tracing)
        print("\n[3/4] Installing autotrace (alternative vector tracer)...")
        install_auto = run_ssh_command(client, "apt-get install -y autotrace", timeout=120)
        if "Setting up" in install_auto or "done" in install_auto.lower():
            print("✓ autotrace installed successfully")
            verify_auto = run_ssh_command(client, "autotrace --version")
            if "autotrace" in verify_auto:
                print(f"  {verify_auto.strip()[:80]}")
        
        # Restart Gunicorn
        print("\n[4/4] Restarting Gunicorn...")
        restart = run_ssh_command(client, "systemctl restart gunicorn", timeout=30)
        print("✓ Gunicorn restarted")
        
        print("\n✓ Vector tracing tools installed! PSD → SVG should now work.")
        
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
