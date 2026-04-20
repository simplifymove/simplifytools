#!/usr/bin/env python3
import paramiko
import time

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

print("=" * 70)
print("KILLING PORT 3000 AND RESTARTING")
print("=" * 70)

def run_cmd(cmd, timeout=10):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='ignore')

print("\n[1] Finding process on port 3000...")
output = run_cmd("lsof -i :3000 2>/dev/null || netstat -tulpn 2>/dev/null | grep 3000", timeout=10)
print(output)

print("\n[2] Killing all node processes...")
run_cmd("pkill -9 -f 'node|next' || true", timeout=5)
print("✓ Killed")

print("\n[3] Waiting for port to release...")
time.sleep(2)

print("\n[4] Starting fresh...")
run_cmd("cd /var/www/simplifytools && npm start > /tmp/app.log 2>&1 &", timeout=5)
print("✓ Started")

time.sleep(5)

print("\n[5] Testing CSS references...")
output = run_cmd("curl -s http://localhost:3000/ 2>/dev/null | grep -o '_next/static/chunks/[a-z0-9]*\\.css' | sort -u", timeout=10)

print("\nCSS references in HTML:")
found_old = False
for line in output.strip().split('\n'):
    if line:
        if "98af741df7eb1c44" in line:
            print(f"  ⚠️ OLD: {line}")
            found_old = True
        else:
            print(f"  ✓ {line}")

print("\n" + "=" * 70)
if found_old:
    print("Old hash persists - checking Nginx...")
    
    # Check Nginx config
    print("\n[6] Checking Nginx configuration...")
    nginx_conf = run_cmd("cat /etc/nginx/sites-available/www.simplifyconvert.com 2>/dev/null | grep -A 5 -B 5 'proxy_pass'", timeout=10)
    print(nginx_conf)
    
else:
    print("✅ SUCCESS! Old CSS hash is gone!")

client.close()
