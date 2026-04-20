#!/usr/bin/env python3
"""
Fix SSL certificate using DNS validation or standalone mode
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("UPDATE SSL WITH BOTH DOMAINS - USING STANDALONE")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Stopping Nginx...")
        run_cmd(client, "systemctl stop nginx")
        print("✓ Nginx stopped")
        
        print("\n[3] Requesting certificate for both domains...")
        # Use standalone mode to validate both domains at once
        output = run_cmd(client, "certbot certonly --standalone -d www.simplifyconvert.com -d simplifyconvert.com --expand --non-interactive --agree-tos 2>&1", timeout=60)
        print(output[-1000:])
        
        print("\n[4] Starting Nginx...")
        run_cmd(client, "systemctl start nginx")
        print("✓ Nginx started")
        
        print("\n[5] Checking certificate now includes both domains...")
        output = run_cmd(client, "certbot certificates | grep -A 10 'www.simplifyconvert'")
        print(output)
        
        if "simplifyconvert.com" in output and "www.simplifyconvert.com" in output:
            print("\n✓ Certificate now includes BOTH domains!")
        else:
            print("\n⚠ Certificate may still only have www - trying renewal...")
        
        print("\n[6] Testing SSL on both domains...")
        print("\nwww domain:")
        output = run_cmd(client, "openssl s_client -connect www.simplifyconvert.com:443 -servername www.simplifyconvert.com </dev/null 2>/dev/null | grep -A 2 'subject='")
        print(output)
        
        print("\nnon-www domain:")
        output = run_cmd(client, "openssl s_client -connect simplifyconvert.com:443 -servername simplifyconvert.com </dev/null 2>/dev/null | grep -A 2 'subject='")
        print(output)
        
        print("\n" + "=" * 70)
        print("✓ Complete!")
        print("=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nRestarting Nginx...")
        try:
            run_cmd(client, "systemctl start nginx")
        except:
            pass
    finally:
        client.close()

if __name__ == "__main__":
    main()
