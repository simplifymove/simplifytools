#!/usr/bin/env python3
"""
Check SSL certificate and Nginx configuration
"""

import paramiko

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("SSL & NGINX CHECK")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Check Nginx config location...")
        output = run_cmd(client, "find /etc/nginx -name '*.conf' | grep -E 'simplify|default|site' | head -10")
        print(output)
        
        print("\n[3] Check Nginx sites-enabled...")
        output = run_cmd(client, "ls -la /etc/nginx/sites-enabled/")
        print(output)
        
        print("\n[4] Check active Nginx config...")
        output = run_cmd(client, "cat /etc/nginx/sites-enabled/* 2>/dev/null | head -100")
        print(output[:2000])
        
        print("\n[5] Check SSL certificates...")
        output = run_cmd(client, "ls -la /etc/letsencrypt/live/ 2>/dev/null || echo 'Certs not in /etc/letsencrypt'")
        print(output)
        
        print("\n[6] Check for SSL in Nginx...")
        output = run_cmd(client, "grep -r 'ssl_certificate' /etc/nginx/ 2>/dev/null")
        print(output)
        
        print("\n[7] Test SSL on www domain...")
        output = run_cmd(client, "openssl s_client -connect www.simplifyconvert.com:443 -servername www.simplifyconvert.com </dev/null 2>/dev/null | grep -A 5 'subject='")
        print(output)
        
        print("\n[8] Test Nginx connectivity...")
        output = run_cmd(client, "curl -I http://localhost:3000 2>/dev/null | head -5")
        print(output)
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
