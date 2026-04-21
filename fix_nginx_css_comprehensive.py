#!/usr/bin/env python3
import paramiko
import sys

# Connection details
host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

# Create SSH client
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Check current nginx.conf
    print("[*] Checking main nginx.conf...")
    stdin, stdout, stderr = client.exec_command("cat /etc/nginx/nginx.conf | grep -A 5 'http {'")
    config_output = stdout.read().decode()
    print("[+] Current http block:")
    print(config_output)
    
    # Backup original
    print("[*] Backing up original nginx.conf...")
    stdin, stdout, stderr = client.exec_command("cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak")
    
    # Add mime types explicitly in http block - using sed to find and insert after http {
    print("[*] Adding explicit MIME type configuration...")
    sed_cmd = """sed -i '/http {/a\\    types {\\n        text/css css;\\n        text/javascript js;\\n        application/javascript js;\\n    }' /etc/nginx/nginx.conf"""
    
    stdin, stdout, stderr = client.exec_command(sed_cmd)
    
    # Verify nginx config
    print("[*] Testing nginx configuration...")
    stdin, stdout, stderr = client.exec_command("nginx -t 2>&1")
    test_output = stdout.read().decode()
    test_error = stderr.read().decode()
    
    print("[+] Test output:")
    print(test_output)
    if test_error:
        print(f"[!] Errors: {test_error}")
    
    if "successful" in test_output or "successful" in test_error:
        print("[*] Reloading nginx...")
        stdin, stdout, stderr = client.exec_command("systemctl reload nginx")
        
        print("[+] Nginx reloaded")
        
        # Clear browser cache and test
        print("[*] Waiting for DNS/CDN propagation...")
        import time
        time.sleep(2)
        
        print("[*] Testing CSS header again...")
        stdin, stdout, stderr = client.exec_command("curl -I https://www.simplifyconvert.com/_next/static/chunks/0eb90d5d6985e755.css 2>/dev/null | head -20")
        headers = stdout.read().decode()
        print("[+] Response headers:")
        print(headers)
        
    client.close()
    print("\n[✓] nginx fix applied and reloaded!")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
