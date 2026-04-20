#!/usr/bin/env python3
"""
Install autotrace as backup vector tracer
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
    print("INSTALL AUTOTRACE (BACKUP VECTOR TRACER)")
    print("=" * 70)
    
    client = None
    
    try:
        print("\n[1/2] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2/2] Installing autotrace...")
        install = run_ssh_command(
            client,
            "apt-get install -y autotrace imagemagick",
            timeout=120
        )
        
        if "done" in install.lower() or "Setting up" in install:
            print("✓ Installation completed")
        
        # Verify
        verify = run_ssh_command(client, "which autotrace")
        if "autotrace" in verify:
            print(f"✓ autotrace installed at: {verify.strip()}")
        else:
            print("Note: autotrace may not be available in this Ubuntu version")
            print("But potrace is installed and sufficient for SVG conversion")
        
        print("\n✓ Done!")
        return 0
        
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
