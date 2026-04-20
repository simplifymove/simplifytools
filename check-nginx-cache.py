#!/usr/bin/env python3
"""
Check nginx caching and add cache-busting headers
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
    print("CHECK NGINX CONFIG AND CACHE HEADERS")
    print("=" * 70)
    
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("\n[1/3] Checking nginx status...")
        out = run_cmd(client, "systemctl status nginx | grep -E 'Active|Loaded'", timeout=10)
        print(out if out else "nginx service not found")
        
        print("\n[2/3] Checking for nginx cache configuration...")
        out = run_cmd(client, "grep -r 'proxy_cache' /etc/nginx/ 2>/dev/null || echo 'No proxy cache found'", timeout=10)
        print(out[:300] if out else "No proxy caching configured")
        
        print("\n[3/3] Testing HTTP headers from server...")
        out = run_cmd(client, "curl -I https://www.simplifyconvert.com/ 2>/dev/null | grep -E 'Cache-Control|ETag|Last-Modified'", timeout=10)
        if out:
            print("Response headers:")
            print(out)
        else:
            print("Could not get response headers")
        
        print("\n" + "=" * 70)
        print("✅ SOLUTION - Clear your browser cache:")
        print("\nChrome/Edge:")
        print("  1. Press Ctrl + Shift + Delete")
        print("  2. Select 'All time'")
        print("  3. Check 'Cookies and cached images'")
        print("  4. Click 'Clear data'")
        print("  5. Then press Ctrl + Shift + R on the website")
        print("\nFirefox:")
        print("  1. Press Ctrl + Shift + Delete")
        print("  2. Select 'Everything'")
        print("  3. Click 'Clear Now'")
        print("  4. Then press Ctrl + F5 on the website")
        print("\nSafari:")
        print("  1. Press Cmd + Option + E (to empty cache)")
        print("  2. Then press Cmd + Shift + R on the website")
        print("\nOr use incognito/private mode to verify it works")
        print("=" * 70)
        
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
