#!/usr/bin/env python3
"""
Diagnose SSL certificate and Nginx configuration issue
"""

import paramiko
import subprocess

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_cmd(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("DIAGNOSING SSL CERTIFICATE ISSUE")
        print("=" * 70)
        
        print("\n[1] Connecting...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[2] Checking SSL certificate details...")
        output = run_cmd(client, "openssl x509 -in /etc/letsencrypt/live/www.simplifyconvert.com/cert.pem -text -noout | grep -E 'Subject:|DNS:'")
        print(output)
        
        print("\n[3] Checking Nginx configuration...")
        output = run_cmd(client, "cat /etc/nginx/sites-available/www.simplifyconvert.com | grep -A 5 'server_name'")
        print(output)
        
        print("\n[4] Testing HTTPS connection to non-www domain...")
        output = run_cmd(client, "curl -v https://simplifyconvert.com 2>&1 | head -20")
        print(output)
        
        print("\n[5] Checking if site redirects to www...")
        output = run_cmd(client, "curl -I https://simplifyconvert.com 2>&1 | head -10")
        print(output)
        
        print("\n[6] Checking SSL labs test...")
        print("Visit: https://www.ssllabs.com/ssltest/analyze.html?d=simplifyconvert.com")
        
        print("\n[7] Verifying certificate serves both domains...")
        output = run_cmd(client, "echo | openssl s_client -servername simplifyconvert.com -connect simplifyconvert.com:443 2>/dev/null | grep -E 'subject=|CN ='")
        print(output)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
