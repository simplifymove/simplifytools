#!/usr/bin/env python3
import paramiko
import sys

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Fix 1: Update nginx config to point to correct location
    print("\n[*] Fixing nginx configuration...")
    fix_nginx_cmd = """
    sudo sed -i 's|alias /root/simplifytools/.next/static/;|alias /var/www/simplifytools/.next/static/;|g' /etc/nginx/sites-available/www.simplifyconvert.com
    echo "[+] Updated nginx config path"
    """
    stdin, stdout, stderr = client.exec_command(fix_nginx_cmd)
    print(stdout.read().decode())
    
    # Fix 2: Check and fix directory permissions
    print("\n[*] Checking directory permissions...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/static/ | head -5')
    print(stdout.read().decode())
    
    # Fix 3: Ensure nginx user (www-data) can read the files
    print("\n[*] Fixing permissions for nginx access...")
    chmod_cmd = """
    sudo chown -R www-data:www-data /var/www/simplifytools/.next/static/
    sudo chmod -R 755 /var/www/simplifytools/.next/static/
    echo "[+] Updated permissions"
    """
    stdin, stdout, stderr = client.exec_command(chmod_cmd)
    print(stdout.read().decode())
    
    # Fix 4: Test nginx config
    print("\n[*] Testing nginx configuration...")
    stdin, stdout, stderr = client.exec_command('sudo nginx -t')
    test_output = stdout.read().decode() + stderr.read().decode()
    print(test_output)
    
    # Fix 5: Reload nginx
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('sudo systemctl reload nginx')
    reload_output = stdout.read().decode()
    print(reload_output if reload_output else "[+] Nginx reloaded successfully")
    
    # Verify the fix
    print("\n[*] Verifying fix...")
    stdin, stdout, stderr = client.exec_command('curl -I https://www.simplifyconvert.com/_next/static/chunks/0eb90d5d6985e755.css 2>/dev/null | grep -i "content-type\|http"')
    verify = stdout.read().decode()
    print(verify)
    
    client.close()
    print("\n✅ Fix applied successfully!")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
    sys.exit(1)
