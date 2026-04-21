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
    
    # Create mime-types.conf file
    print("[*] Creating nginx MIME types configuration...")
    mime_config = """types {
    text/css css;
    text/javascript js;
    application/javascript js;
    application/wasm wasm;
}
"""
    
    stdin, stdout, stderr = client.exec_command("cat > /etc/nginx/conf.d/mime-types.conf << 'EOF'\n" + mime_config + "EOF")
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if error:
        print(f"[!] Error creating config: {error}")
    else:
        print("[+] MIME types configuration created")
    
    # Verify nginx configuration
    print("[*] Testing nginx configuration...")
    stdin, stdout, stderr = client.exec_command("nginx -t")
    test_output = stdout.read().decode()
    test_error = stderr.read().decode()
    
    if "successful" in test_output or "successful" in test_error:
        print("[+] Nginx configuration test passed")
        
        # Reload nginx
        print("[*] Reloading nginx...")
        stdin, stdout, stderr = client.exec_command("systemctl reload nginx")
        reload_output = stdout.read().decode()
        reload_error = stderr.read().decode()
        
        print("[+] Nginx reloaded successfully")
        
        # Verify CSS MIME type
        print("[*] Verifying MIME type configuration...")
        stdin, stdout, stderr = client.exec_command("curl -I https://www.simplifyconvert.com/_next/static/chunks/0eb90d5d6985e755.css 2>/dev/null | grep -i content-type")
        verify_output = stdout.read().decode()
        
        if verify_output:
            print(f"[+] CSS MIME type: {verify_output.strip()}")
        else:
            print("[*] Could not verify immediately - check in browser")
        
    else:
        print(f"[!] Nginx configuration test failed")
        print(f"Output: {test_output}")
        print(f"Error: {test_error}")
    
    client.close()
    print("\n[✓] MIME types fix applied successfully!")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
