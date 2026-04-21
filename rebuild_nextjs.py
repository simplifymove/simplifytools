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
    
    # Navigate to project and rebuild
    print("\n[*] Pulling latest code...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && git pull origin main')
    print(stdout.read().decode()[:500])
    
    # Remove node_modules and reinstall (fresh install)
    print("\n[*] Installing dependencies...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm ci')
    output = stdout.read().decode()
    print("Installation started... (this may take 2-3 minutes)")
    
    # Build Next.js
    print("\n[*] Building Next.js...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm run build')
    build_output = stdout.read().decode()
    print(build_output[-1000:] if len(build_output) > 1000 else build_output)
    
    # Check if build succeeded
    print("\n[*] Checking new CSS files...")
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/simplifytools/.next/static/chunks/*.css | head -5')
    print(stdout.read().decode())
    
    # Restart the application (if using PM2 or systemd)
    print("\n[*] Stopping application...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm stop || pkill -f "next start"')
    print(stdout.read().decode()[:300])
    
    time.sleep(2)
    
    print("\n[*] Starting application...")
    stdin, stdout, stderr = client.exec_command('cd /var/www/simplifytools && npm start > /tmp/app.log 2>&1 &')
    print("[+] Application started in background")
    
    # Clear nginx cache (optional)
    print("\n[*] Reloading nginx...")
    stdin, stdout, stderr = client.exec_command('sudo systemctl reload nginx')
    print("[+] Nginx reloaded")
    
    client.close()
    print("\n✅ Rebuild complete! The page should refresh automatically or clear browser cache.")
    
except Exception as e:
    print(f'[ERROR] {str(e)}')
