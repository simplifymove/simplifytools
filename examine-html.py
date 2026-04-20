#!/usr/bin/env python3
"""
Examine raw HTML response to find where old CSS comes from
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    """Execute SSH command"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

def main():
    client = None
    
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("=" * 70)
        print("EXAMINING RAW HTML RESPONSE")
        print("=" * 70)
        
        print("\n[1] Getting raw HTML from http://localhost:3000/...")
        html = run_cmd(client, "curl -s http://localhost:3000/ 2>/dev/null", timeout=10)
        
        print("\n[2] Extracting CSS link tags...")
        lines = html.split('\n')
        for i, line in enumerate(lines):
            if '.css' in line.lower():
                print(f"Line {i}: {line.strip()[:200]}")
        
        print("\n[3] Counting CSS references by hash...")
        css_lines = [l for l in lines if '.css' in l.lower()]
        print(f"Total CSS-related lines: {len(css_lines)}")
        
        # Extract unique hashes
        import re
        hashes = set()
        for line in css_lines:
            matches = re.findall(r'([a-z0-9]{16})\.css', line)
            hashes.update(matches)
        
        print(f"\nUnique CSS hashes found in HTML:")
        for h in sorted(hashes):
            print(f"  - {h}")
        
        print("\n[4] Searching for where 98af741df7eb1c44 appears...")
        for i, line in enumerate(lines):
            if '98af741df7eb1c44' in line:
                print(f"  Line {i}: {line.strip()[:300]}")
        
        print("\n" + "=" * 70)
        
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
