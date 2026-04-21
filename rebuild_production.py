#!/usr/bin/env python3
import paramiko
import time

host = '75.119.155.15'
username = 'root'
password = 'aaSSddffgghhjj11226699'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("[*] Connecting to VPS...")
    client.connect(host, username=username, password=password, timeout=10)
    
    # Kill existing process
    print("\n[*] Stopping existing Next.js process...")
    stdin, stdout, stderr = client.exec_command('pkill -9 -f "next-server|next start"')
    time.sleep(2)
    
    # Set production environment
    print("\n[*] Setting production environment...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && export NODE_ENV=production')
    
    # Clean build artifacts
    print("\n[*] Cleaning previous build...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && rm -rf .next')
    print(stdout.read().decode()[:300])
    
    # Force production build
    print("\n[*] Building with NODE_ENV=production...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && NODE_ENV=production npm run build')
    build_log = stdout.read().decode()
    print(build_log[-1500:] if len(build_log) > 1500 else build_log)
    
    # Check build output
    print("\n[*] Checking production build...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/static/chunks/*.css 2>/dev/null | head -5')
    css_list = stdout.read().decode()
    print(css_list if css_list else "Checking .next structure...")
    
    # List .next contents
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/')
    print(stdout.read().decode())
    
  # Start in production mode
    print("\n[*] Starting application in production mode...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && NODE_ENV=production npm start > /tmp/app.log 2>&1 &')
    time.sleep(3)
    
    # Verify it's running
    stdin, stdout, stderr = client.exec_command('ps aux | grep "next-server" | grep -v grep')
    print(stdout.read().decode())
    
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('sudo systemctl reload nginx')
    
    client.close()
    print("\n✅ Production build deployed! File will load on next page refresh.")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
