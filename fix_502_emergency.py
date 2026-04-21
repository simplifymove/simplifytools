#!/usr/bin/env python3
"""
Emergency fix for 502 Bad Gateway on SimplifyTools VPS
Direct diagnosis and repair without terminal interaction
"""

import paramiko
import time
import sys

def run_ssh_command(client, command, timeout=30):
    """Run SSH command and return output"""
    try:
        stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
        stdout_data = stdout.read().decode('utf-8', errors='ignore')
        stderr_data = stderr.read().decode('utf-8', errors='ignore')
        return stdout_data, stderr_data
    except Exception as e:
        return f"Error: {str(e)}", ""

def diagnose_and_fix():
    """Diagnose 502 error and apply fixes"""
    
    print("="*70)
    print("SIMPLIFYTOOLS 502 EMERGENCY FIX")
    print("="*70)
    
    try:
        # Connect to VPS
        print("\n[1/8] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect('75.119.155.15', username='root', password='aaSSddffgghhjj11226699', timeout=10)
        print("✅ Connected")
        
        # Check PM2 status
        print("\n[2/8] Checking PM2 status...")
        out, err = run_ssh_command(client, 'pm2 status')
        if 'online' in out:
            print("✅ App showing as online")
        else:
            print("⚠️  App status:", out.split('\n')[0] if out else "Unknown")
        
        # Check if port 3000 is listening
        print("\n[3/8] Checking if port 3000 is listening...")
        out, err = run_ssh_command(client, 'netstat -tuln 2>/dev/null | grep 3000 || lsof -i :3000 2>/dev/null || echo "NOT_LISTENING"')
        if 'NOT_LISTENING' in out or not out.strip():
            print("❌ App NOT listening on port 3000 - PROBLEM FOUND")
            
            # Try to restart
            print("\n[4/8] Attempting to restart app...")
            run_ssh_command(client, 'pm2 stop simplifytools', timeout=10)
            time.sleep(2)
            run_ssh_command(client, 'pm2 start simplifytools', timeout=10)
            time.sleep(5)
            
            # Check again
            out, err = run_ssh_command(client, 'netstat -tuln 2>/dev/null | grep 3000 || echo "STILL_NOT_LISTENING"')
            if 'STILL_NOT_LISTENING' in out:
                print("❌ Still not listening - rebuilding app")
                
                print("\n[5/8] Stopping app completely...")
                run_ssh_command(client, 'pm2 kill', timeout=10)
                time.sleep(2)
                
                print("\n[6/8] Cleaning and rebuilding...")
                run_ssh_command(client, 'cd /var/www/simplifytools && rm -rf .next node_modules/.cache', timeout=10)
                print("   - Cleaned cache")
                
                out, err = run_ssh_command(client, 'cd /var/www/simplifytools && npm run build', timeout=180)
                if 'error' in out.lower() and 'success' not in out.lower():
                    print("❌ Build failed")
                    print(out[-500:])
                else:
                    print("✅ Build completed")
                
                print("\n[7/8] Starting fresh...")
                run_ssh_command(client, 'cd /var/www/simplifytools && pm2 start npm --name simplifytools -- start', timeout=10)
                time.sleep(5)
            else:
                print("✅ Port 3000 now listening")
        else:
            print("✅ Port 3000 listening - app is running")
        
        # Final check
        print("\n[8/8] Final status check...")
        out, err = run_ssh_command(client, 'pm2 status')
        if 'online' in out:
            print("✅ APP IS BACK ONLINE")
            print("\n" + "="*70)
            print("SUCCESS! Site should be working now.")
            print("="*70)
            print("\nTest: https://www.simplifyconvert.com")
        else:
            print("⚠️  App status unclear:")
            print(out[:300])
            
            # Try one more restart
            print("\nTrying final restart...")
            run_ssh_command(client, 'pm2 restart simplifytools', timeout=10)
            time.sleep(3)
            
            out, err = run_ssh_command(client, 'pm2 status')
            print(out[:300])
        
        # Get app logs for reference
        print("\n[LOGS] Last 10 app lines:")
        out, err = run_ssh_command(client, 'pm2 logs simplifytools --lines 10 --nostream 2>&1')
        print(out[-500:] if out else "No logs available")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    diagnose_and_fix()
