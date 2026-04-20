#!/usr/bin/env python3
"""
Check Next.js service and CSS file
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    return out, err

def main():
    print("=" * 70)
    print("CHECK NEXTJS SERVICE AND CSS FILES")
    print("=" * 70)
    
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1] NextJS Service Status:")
        out, err = run_cmd(client, "systemctl status nextjs", timeout=10)
        print(out[:500] if out else f"Error: {err[:500]}")
        
        print("\n[2] CSS File Search (98af741df7eb1c44.css):")
        out, err = run_cmd(client, "find /var/www/simplifytools -name '*98af741df7eb1c44.css' -o -name '*98af741d*'", timeout=10)
        if out:
            print(f"✓ Found: {out}")
        else:
            print("⚠ CSS file not found - rebuild needed")
        
        print("\n[3] Next.js build output directory:")
        out, err = run_cmd(client, "ls -lh /var/www/simplifytools/.next/static/ 2>/dev/null", timeout=10)
        print(out if out else "⚠ .next/static not found")
        
        print("\n[4] Checking if port 3000 is responding:")
        out, err = run_cmd(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo 'Error'", timeout=10)
        status = out.strip() if out else "Error"
        print(f"HTTP Status: {status}")
        
        if status not in ['200', '301', '302']:
            print("\n⚠ Next.js may not be running properly!")
            print("\nRebuilding and restarting...")
            return 1
        else:
            print("✓ Service appears to be running")
        
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
