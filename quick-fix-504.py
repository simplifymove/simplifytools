#!/usr/bin/env python3
"""
Quick VPS Fix - Restart crashed application and check logs
"""

import paramiko

# VPS Configuration
VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"
APP_NAME = "simplifytools"

def run_command(client, command):
    """Execute command and return output"""
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out + err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("VPS FIX - RESTART APPLICATION")
        print("=" * 70)
        
        # Connect
        print("\n[1] Connecting to VPS...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        # Check PM2 status
        print("\n[2] Checking PM2 Status...")
        output = run_command(client, f'pm2 status {APP_NAME}')
        print(output)
        
        # Get log errors
        print("\n[3] Last 30 lines from logs:")
        print("-" * 70)
        output = run_command(client, f'pm2 logs {APP_NAME} --lines 30 --nostream 2>/dev/null || echo "No logs available"')
        print(output)
        print("-" * 70)
        
        # Restart application
        print("\n[4] Restarting application...")
        output = run_command(client, f'pm2 restart {APP_NAME}')
        print(output)
        
        # Wait a moment
        import time
        time.sleep(3)
        
        # Check status after restart
        print("\n[5] Checking status after restart...")
        output = run_command(client, f'pm2 status {APP_NAME}')
        print(output)
        
        # Check if it's online
        if "online" in output.lower():
            print("\n✓ SUCCESS! Application is now ONLINE")
        else:
            print("\n⚠ Application still having issues. Checking why...")
            print("\nChecking application directory:")
            output = run_command(client, f'ls -la {APP_PATH}/.next 2>/dev/null | head -20 || echo ".next folder not found"')
            print(output)
            
            print("\nTrying to view recent errors:")
            output = run_command(client, f'tail -50 /root/.pm2/logs/simplifytools-error-*.log 2>/dev/null || echo "Error log not found"')
            print(output)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()
        print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
