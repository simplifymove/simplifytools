#!/usr/bin/env python3
"""Deploy fix: Disable CSS optimization in next.config.ts"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

def main():
    client = None
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("=" * 70)
        print("DEPLOY CSS OPTIMIZATION FIX")
        print("=" * 70)
        
        print("\n[1] Uploading next.config.ts...")
        sftp = client.open_sftp()
        sftp.put("next.config.ts", "/var/www/simplifytools/next.config.ts")
        sftp.close()
        print("✓ File uploaded")
        
        print("\n[2] Killing Node.js...")
        run_cmd(client, "pkill -9 -f 'node.*next' || true")
        print("✓ Killed")
        
        print("\n[3] Removing .next directory for clean build...")
        run_cmd(client, "rm -rf /var/www/simplifytools/.next")
        print("✓ Removed")
        
        print("\n[4] Building with CSS optimization disabled...")
        output = run_cmd(client, "cd /var/www/simplifytools && npm run build 2>&1", timeout=120)
        if "Compiled successfully" in output:
            print("✓ Build successful")
        else:
            print("⚠ Build output:")
            print(output[-500:])
        
        print("\n[5] Listing CSS files generated...")
        output = run_cmd(client, "ls -1 /var/www/simplifytools/.next/static/chunks/*.css 2>/dev/null", timeout=10)
        print(output)
        
        print("\n[6] Starting Node.js application...")
        run_cmd(client, "cd /var/www/simplifytools && npm start > /tmp/next.log 2>&1 &", timeout=5)
        print("✓ Started")
        
        print("\n[7] Testing CSS references in HTML response...")
        import time
        time.sleep(3)  # Give app time to start
        
        output = run_cmd(client, "curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort -u", timeout=10)
        
        print("CSS hashes found:")
        lines = output.strip().split('\n')
        for line in lines:
            if line:
                print(f"  - {line}")
        
        if "98af741df7eb1c44" in output:
            print("\n⚠ Old hash still present")
            return 1
        else:
            print("\n✓ Old hash GONE! Only new hashes present")
            return 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    exit(main())
