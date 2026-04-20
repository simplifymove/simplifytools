#!/usr/bin/env python3
"""
VPS Diagnostic Script for 504 Gateway Timeout
Checks PM2 status, logs, system resources, and application health
"""

import paramiko
import time

# VPS Configuration
VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"
APP_NAME = "simplifytools"

def run_command(client, command, timeout=30):
    """Execute command and return output"""
    try:
        stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        return output, error
    except Exception as e:
        return "", str(e)

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("=" * 70)
        print("VPS DIAGNOSTIC REPORT - 504 GATEWAY TIMEOUT")
        print("=" * 70)
        
        # Step 1: Connect to VPS
        print("\n[1/8] Connecting to VPS (75.119.155.15)...")
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected successfully")
        
        # Step 2: Check PM2 Status
        print("\n[2/8] Checking PM2 Process Status...")
        output, error = run_command(client, f'pm2 status {APP_NAME}')
        print(output if output else error)
        
        # Step 3: Check PM2 Logs (Last 50 lines)
        print("\n[3/8] Application Logs (Last 50 lines)...")
        print("-" * 70)
        output, error = run_command(client, f'pm2 logs {APP_NAME} --lines 50 --nostream', timeout=60)
        print(output if output else error)
        print("-" * 70)
        
        # Step 4: Check for Recent Errors
        print("\n[4/8] Checking for Recent Errors...")
        output, error = run_command(client, f'pm2 logs {APP_NAME} --err --lines 30 --nostream')
        if output.strip():
            print(output)
        else:
            print("No errors found in last 30 lines")
        
        # Step 5: Check System Resources
        print("\n[5/8] System Resources...")
        print("-" * 70)
        
        # Disk space
        print("📊 Disk Space:")
        output, _ = run_command(client, 'df -h | grep -E "^/dev|^Filesystem"')
        print(output)
        
        # Memory
        print("\n📊 Memory Usage:")
        output, _ = run_command(client, 'free -h')
        print(output)
        
        # CPU
        print("\n📊 CPU Load:")
        output, _ = run_command(client, 'uptime')
        print(output)
        print("-" * 70)
        
        # Step 6: Check Node Process Memory
        print("\n[6/8] Node.js Process Memory Usage...")
        output, _ = run_command(client, 'ps aux | grep node | grep -v grep')
        print(output if output.strip() else "No node process found")
        
        # Step 7: Test Application Build
        print("\n[7/8] Testing Application Build...")
        output, error = run_command(client, f'cd {APP_PATH} && timeout 60 npm run build 2>&1 | tail -30', timeout=90)
        if "error" in output.lower() or error:
            print("⚠ BUILD ERRORS DETECTED:")
            print(output[-1000:] if len(output) > 1000 else output)
            if error:
                print("STDERR:", error)
        else:
            print("✓ Build successful")
            print(output[-500:] if len(output) > 500 else output)
        
        # Step 8: Check Nginx Status
        print("\n[8/8] Checking Nginx/Reverse Proxy...")
        output, _ = run_command(client, 'systemctl status nginx 2>/dev/null | head -20')
        if output.strip():
            print(output)
        else:
            output, _ = run_command(client, 'ps aux | grep nginx | grep -v grep')
            print(output if output.strip() else "Nginx not found")
        
        # Summary
        print("\n" + "=" * 70)
        print("DIAGNOSTIC SUMMARY")
        print("=" * 70)
        
        # Check PM2 status
        status_output, _ = run_command(client, f'pm2 status {APP_NAME} --json')
        if "online" in status_output.lower():
            print("✓ Application is ONLINE")
        elif "stopped" in status_output.lower():
            print("❌ Application is STOPPED - Need to restart")
        elif "errored" in status_output.lower():
            print("❌ Application has ERRORED - Check logs above")
        else:
            print("⚠ Application status unclear")
        
        print("\n🔧 Next Steps:")
        print("1. If process is stopped: pm2 restart simplifytools")
        print("2. If logs show errors: Check error messages above")
        print("3. If disk is full: Delete old files or expand storage")
        print("4. If memory is low: Increase VPS RAM or optimize code")
        print("5. If build failed: Check npm dependencies or Node version")
        
    except paramiko.AuthenticationException:
        print("❌ Authentication failed - Check credentials")
    except paramiko.SSHException as e:
        print(f"❌ SSH Error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()
        print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
