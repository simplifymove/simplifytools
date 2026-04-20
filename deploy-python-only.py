#!/usr/bin/env python3
"""
Quick Python backend deployment - only sync python directory and restart
"""

import paramiko
import time
import os
import sys

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

uploaded_count = 0
skipped_count = 0

def upload_directory(sftp, local_path, remote_path, depth=0, max_files=1000):
    """Recursively upload directory with tracking"""
    global uploaded_count, skipped_count
    
    # Safety check: don't go too deep
    if depth > 20:
        return
    
    # Safety check: don't upload too many files at once
    if uploaded_count >= max_files:
        return
    
    try:
        items = os.listdir(local_path)
    except (OSError, PermissionError):
        return
    
    for item in items:
        # Skip common ignore patterns
        if item.startswith('.') or item in ['__pycache__']:
            skipped_count += 1
            continue
        
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}".replace('\\', '/')
        
        try:
            if os.path.isfile(local_item):
                uploaded_count += 1
                if uploaded_count % 5 == 0:
                    print(f"  [{uploaded_count}] Uploading {item}...")
                sftp.put(local_item, remote_item)
            elif os.path.isdir(local_item):
                try:
                    sftp.mkdir(remote_item)
                except:
                    pass
                upload_directory(sftp, local_item, remote_item, depth+1, max_files)
        except Exception as e:
            print(f"  Error uploading {item}: {e}")

def run_cmd(client, cmd, timeout=60):
    """Run command with timeout"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdout_data = stdout.read().decode('utf-8', errors='ignore')
    stderr_data = stderr.read().decode('utf-8', errors='ignore')
    return stdout_data + stderr_data

def main():
    global uploaded_count, skipped_count
    
    print("=" * 70)
    print("PYTHON BACKEND DEPLOYMENT - SYNC AND RESTART")
    print("=" * 70)
    
    client = None
    sftp = None
    
    try:
        # Step 1: Connect
        print("\n[1/5] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected to VPS")
        
        # Step 2: Upload python directory
        print("\n[2/5] Uploading python backend...")
        uploaded_count = 0
        skipped_count = 0
        python_local = r'i:\Raghava\Copilot-works\tinytools-app\python'
        upload_directory(sftp, python_local, '/var/www/simplifytools/python', max_files=1000)
        print(f"✓ Uploaded {uploaded_count} files (skipped {skipped_count})")
        
        # Step 3: Close SFTP
        print("\n[3/5] Closing connection...")
        sftp.close()
        time.sleep(1)
        
        # Step 4: Restart application
        print("[4/5] Restarting application...")
        run_cmd(client, "pm2 restart simplifytools 2>&1", timeout=30)
        time.sleep(5)
        
        # Step 5: Verify
        print("[5/5] Verifying...")
        status = run_cmd(client, "pm2 status", timeout=10)
        print(status)
        
        # Test connectivity
        print("\nTesting connectivity...")
        for i in range(3):
            try:
                result = run_cmd(client, "curl -s -I https://www.simplifyconvert.com/ 2>&1 | head -1", timeout=10)
                print(f"  Attempt {i+1}: {result.strip()}")
                if 'HTTP' in result and '200' in result:
                    print("✓ Website responding")
                    break
            except:
                print(f"  Attempt {i+1}: Connection timeout")
            time.sleep(2)
        
        print("\n" + "=" * 70)
        print("✓ PYTHON BACKEND DEPLOYMENT COMPLETE")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n✗ Deployment error: {e}")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        if client:
            try:
                client.close()
            except:
                pass
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
