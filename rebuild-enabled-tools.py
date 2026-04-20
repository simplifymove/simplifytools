#!/usr/bin/env python3
"""
Rebuild and deploy enabled tool pages
"""

import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("REBUILD WITH ENABLED TOOL PAGES")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Pulling latest code...")
        output = run_cmd(client, "cd /var/www/simplifytools && git pull")
        print(output[-500:])
        
        print("\n[3] Rebuilding Next.js application...")
        output = run_cmd(client, "cd /var/www/simplifytools && npm run build", timeout=600)
        if "error" in output.lower():
            print("Build output:", output[-1000:])
        else:
            print("✓ Build completed successfully")
        
        print("\n[4] Restarting application with PM2...")
        run_cmd(client, "pm2 restart simplifytools")
        time.sleep(2)
        print("✓ Application restarted")
        
        print("\n[5] Checking application status...")
        output = run_cmd(client, "pm2 status")
        print(output)
        
        print("\n[6] Testing new routes...")
        time.sleep(3)
        print("\nTesting webp-to-avif route:")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com/all-tools/webp-to-avif 2>&1 | head -5")
        print(output)
        
        print("\nTesting png-to-avif route:")
        output = run_cmd(client, "curl -I https://www.simplifyconvert.com/all-tools/png-to-avif 2>&1 | head -5")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ COMPLETE! All tool pages are now enabled")
        print("\nEnabled routes:")
        print("  • /all-tools/webp-to-avif")
        print("  • /all-tools/png-to-avif")
        print("  • /all-tools/jpg-to-avif")
        print("  • /all-tools/tiff-to-avif")
        print("  • /all-tools/heic-to-avif")
        print("  • /all-tools/webp-to-gif")
        print("  • /all-tools/jpg-to-gif")
        print("  • /all-tools/mp4-to-gif")
        print("  • /all-tools/png-to-svg")
        print("  • /all-tools/jpg-to-svg")
        print("  • /all-tools/tiff-to-svg")
        print("  • /all-tools/psd-to-svg")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
