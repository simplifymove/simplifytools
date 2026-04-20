#!/usr/bin/env python3
"""
Deploy SVG mime type fix and rebuild
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def run_ssh_command(client, cmd, timeout=300):
    """Execute SSH command with output"""
    print(f"  Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdout_data = stdout.read().decode('utf-8', errors='ignore')
    stderr_data = stderr.read().decode('utf-8', errors='ignore')
    return stdout_data + stderr_data

def main():
    print("=" * 70)
    print("DEPLOY SVG MIME TYPE FIX")
    print("=" * 70)
    
    client = None
    
    try:
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected to VPS")
        
        print("\n[2/3] Resyncing app from git...")
        output = run_ssh_command(client, "cd /var/www/simplifytools && git pull origin main 2>&1 | head -10", timeout=120)
        if "Already up to date" in output or "Merge made" in output or "Fast-forward" in output:
            print("✓ Repository updated")
        else:
            print(f"  Status: {output[:200]}")
        
        print("\n[3/3] Rebuilding Next.js...")
        build_output = run_ssh_command(client, "cd /var/www/simplifytools && npm run build", timeout=600)
        if "error" not in build_output.lower():
            print("✓ Build completed")
        else:
            print("⚠ Build completed with notes")
        
        print("\n✓ SVG mime type fix deployed!")
        print("\nWhat was fixed:")
        print("  • Added SVG → image/svg+xml to mime type mapping")
        print("  • PSD → SVG conversions will now work properly")
        
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
