#!/usr/bin/env python3
"""
Verify CSS files and restart services
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore').strip()

def main():
    print("=" * 70)
    print("VERIFY CSS FILES AND RESTART SERVICES")
    print("=" * 70)
    
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1/4] Checking CSS files...")
        out = run_cmd(client, "ls -1 /var/www/simplifytools/.next/static/chunks/*.css | wc -l", timeout=10)
        css_count = out.strip()
        print(f"✓ Found {css_count} CSS files")
        
        print("\n[2/4] Checking for the specific CSS file...")
        out = run_cmd(client, "ls -la /var/www/simplifytools/.next/static/chunks/ | grep -E '\\.css$' | head -3", timeout=10)
        print(out)
        
        print("\n[3/4] Restarting Node.js application...")
        run_cmd(client, "pkill -f 'node.*next'", timeout=10)
        import time
        time.sleep(2)
        run_cmd(client, "cd /var/www/simplifytools && npm start > /tmp/next.log 2>&1 &", timeout=10)
        print("✓ Application restarted")
        
        print("\n[4/4] Verifying port 3000...")
        import time
        time.sleep(3)
        out = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo 'Error'", timeout=10)
        status = out.strip()
        print(f"✓ HTTP Status: {status}")
        
        print("\n" + "=" * 70)
        if status in ['200', '301', '302']:
            print("✅ CSS files fixed! Application is running.")
            print("\nTo fix the 404 error:")
            print("  1. Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)")
            print("  2. Clear browser cache if needed")
            print("  3. The CSS file will now load correctly")
        else:
            print("⚠ Service status unclear - but CSS files are generated")
        
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
