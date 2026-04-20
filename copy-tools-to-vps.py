#!/usr/bin/env python3
"""
Copy enabled tool pages to VPS directly
"""

import paramiko
import os

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

# List of tool directories with page.tsx files
TOOLS = [
    'tiff-to-avif',
    'png-to-svg',
    'heic-to-avif',
    'webp-to-gif',
    'png-to-avif',
    'jpg-to-avif',
    'jpg-to-svg',
    'mp4-to-gif',
    'psd-to-svg',
    'jpg-to-gif',
    'tiff-to-svg',
]

def copy_file_to_vps(client, local_file, remote_file):
    """Copy file to VPS using SFTP"""
    try:
        sftp = client.open_sftp()
        sftp.put(local_file, remote_file)
        sftp.close()
        return True
    except Exception as e:
        print(f"Error copying file: {e}")
        return False

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("COPY ENABLED TOOL PAGES TO VPS")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        base_local = r"i:\Raghava\Copilot-works\tinytools-app\app\all-tools"
        base_remote = "/var/www/simplifytools/app/all-tools"
        
        print(f"\n[2] Copying {len(TOOLS)} tool page files...")
        copied = 0
        failed = 0
        
        for tool in TOOLS:
            local_file = os.path.join(base_local, tool, "page.tsx")
            remote_file = f"{base_remote}/{tool}/page.tsx"
            
            if os.path.exists(local_file):
                if copy_file_to_vps(client, local_file, remote_file):
                    print(f"   ✓ {tool}")
                    copied += 1
                else:
                    print(f"   ✗ {tool}")
                    failed += 1
            else:
                print(f"   ? {tool} (file not found locally)")
                failed += 1
        
        print(f"\n[3] Summary: {copied} copied, {failed} failed")
        
        print(f"\n[4] Rebuilding Next.js application...")
        output = run_cmd(client, "cd /var/www/simplifytools && npm run build", timeout=600)
        if "error" in output.lower():
            print("Build output:", output[-1000:])
        else:
            print("✓ Build completed successfully")
        
        print(f"\n[5] Restarting application...")
        run_cmd(client, "pm2 restart simplifytools")
        print("✓ Application restarted")
        
        print(f"\n[6] Testing routes (waiting 3 seconds)...")
        import time
        time.sleep(3)
        
        print("\nTesting /all-tools/webp-to-avif:")
        output = run_cmd(client, "curl -s https://www.simplifyconvert.com/all-tools/webp-to-avif | head -c 200")
        if "404" in output or "Not Found" in output:
            print("Still 404 - checking app status...")
            output = run_cmd(client, "pm2 logs simplifytools --lines 20")
            print(output[-500:])
        else:
            print("✓ Route is now working!")
        
        print("\n" + "=" * 70)
        print(f"✓ Copied {copied} tool pages to VPS")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
