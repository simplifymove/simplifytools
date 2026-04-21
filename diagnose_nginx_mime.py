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
    
    # Read current nginx.conf
    print("[*] Reading current nginx.conf...")
    stdin, stdout, stderr = client.exec_command("cat /etc/nginx/nginx.conf")
    nginx_conf = stdout.read().decode()
    
    print("[*] Current nginx.conf content (first 50 lines):")
    lines = nginx_conf.split('\n')
    for i, line in enumerate(lines[:50], 1):
        print(f"{i:3d}: {line}")
    
    # Look for mime.types inclusion
    if "include" in nginx_conf and "mime.types" in nginx_conf:
        print("\n[+] mime.types is already included")
    else:
        print("\n[!] mime.types might not be included")
    
    # Look for default_type
    if "default_type" in nginx_conf:
        print("[+] default_type is configured")
    else:
        print("[!] default_type might not be configured")
    
    # Check if there's an issue with charset or nosniff
    if "nosniff" in nginx_conf:
        print("\n[!] Found 'nosniff' - this might be forcing text/plain")
        stdin, stdout, stderr = client.exec_command("grep -n 'nosniff' /etc/nginx/nginx.conf")
        nosniff_lines = stdout.read().decode()
        print(f"Lines with nosniff:\n{nosniff_lines}")
    
    # Check for location blocks that might override mime types
    print("\n[*] Checking location blocks...")
    stdin, stdout, stderr = client.exec_command("grep -n 'location' /etc/nginx/nginx.conf | head -20")
    location_lines = stdout.read().decode()
    print(f"Location blocks:\n{location_lines}")
    
    # Check all included files
    print("\n[*] Checking included config files...")
    stdin, stdout, stderr = client.exec_command("find /etc/nginx -name '*.conf' -type f | head -20")
    conf_files = stdout.read().decode()
    print(f"Config files:\n{conf_files}")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
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
    
    # Check nginx mime types configuration
    print("\n[*] Checking nginx MIME types configuration...")
    stdin, stdout, stderr = client.exec_command('cat /etc/nginx/mime.types | grep -A2 "text/css"')
    mime_output = stdout.read().decode()
    print("Current MIME types for CSS:")
    print(mime_output if mime_output.strip() else "No CSS MIME type found!")
    
    # Check nginx config
    print("\n[*] Checking main nginx configuration...")
    stdin, stdout, stderr = client.exec_command('cat /etc/nginx/nginx.conf | grep -A5 "mime.types"')
    nginx_config = stdout.read().decode()
    print("Nginx mime.types reference:")
    print(nginx_config if nginx_config.strip() else "Not found")
    
    # Check if default_type is set
    print("\n[*] Checking default_type setting...")
    stdin, stdout, stderr = client.exec_command('cat /etc/nginx/nginx.conf | grep "default_type"')
    default_type = stdout.read().decode()
    print("Default type setting:")
    print(default_type if default_type.strip() else "default_type text/html;")
    
    # Check site-specific config
    print("\n[*] Checking site-specific nginx config...")
    stdin, stdout, stderr = client.exec_command('ls -la /etc/nginx/sites-enabled/')
    sites = stdout.read().decode()
    print("Enabled sites:")
    print(sites)
    
    # Check for simplifyconvert config
    print("\n[*] Looking for simplifyconvert configuration...")
    stdin, stdout, stderr = client.exec_command('find /etc/nginx -name "*simplify*" 2>/dev/null')
    simplify_config = stdout.read().decode()
    print("Simplifyconvert configs found:")
    print(simplify_config if simplify_config.strip() else "None found")
    
    client.close()
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
