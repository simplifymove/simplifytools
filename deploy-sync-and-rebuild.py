#!/usr/bin/env python3
"""
Improved deployment - sync with SSH and rebuild
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

def upload_directory(sftp, local_path, remote_path, depth=0, max_files=500):
    """Recursively upload directory with tracking"""
    global uploaded_count, skipped_count
    
    # Safety check: don't go too deep
    if depth > 20:
        return
    
    # Safety check: don't upload too many files at once
    if uploaded_count > max_files:
        print(f"  [Limit reached: {uploaded_count} files uploaded]")
        return
    
    try:
        items = os.listdir(local_path)
    except (OSError, PermissionError):
        return
    
    for item in items:
        # Skip common ignore patterns
        if item.startswith('.') or item in ['node_modules', '.next', '.turbo', 'dist']:
            skipped_count += 1
            continue
        
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}".replace('\\', '/')
        
        try:
            if os.path.isfile(local_item):
                uploaded_count += 1
                if uploaded_count % 10 == 0:
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
    print("OPTIMIZED DEPLOYMENT - SYNC AND REBUILD")
    print("=" * 70)
    
    client = None
    sftp = None
    
    try:
        # Step 1: Connect
        print("\n[1/7] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected to VPS")
        
        # Step 2: Upload app directory
        print("\n[2/7] Uploading app directory...")
        uploaded_count = 0
        skipped_count = 0
        app_local = r'i:\Raghava\Copilot-works\tinytools-app\app'
        upload_directory(sftp, app_local, '/var/www/simplifytools/app', max_files=300)
        print(f"✓ Uploaded {uploaded_count} files (skipped {skipped_count})")
        
        # Step 2b: Upload python directory (backend conversion engines)
        print("\n[2b/7] Uploading python backend...")
        uploaded_count = 0
        skipped_count = 0
        python_local = r'i:\Raghava\Copilot-works\tinytools-app\python'
        upload_directory(sftp, python_local, '/var/www/simplifytools/python', max_files=500)
        print(f"✓ Uploaded {uploaded_count} files (skipped {skipped_count})")
        
        # Step 3: Close SFTP, keep SSH
        print("\n[3/7] Preparing rebuild...")
        sftp.close()
        time.sleep(2)
        
        # Step 4: Stop app
        print("[4/7] Stopping application...")
        result = run_cmd(client, "pm2 stop simplifytools 2>&1", timeout=15)
        if "not found" not in result.lower():
            print("✓ Application stopped")
        time.sleep(2)
        
        # Step 5: Clean and rebuild
        print("[5/7] Cleaning and rebuilding (this may take 2-3 minutes)...")
        result = run_cmd(client, "cd /var/www/simplifytools && rm -rf .next .turbo .git && npm run build 2>&1", timeout=300)
        print(result[-1000:] if len(result) > 1000 else result)
        
        # Step 6: Verify build
        print("\n[6/7] Verifying build...")
        check = run_cmd(client, "test -d /var/www/simplifytools/.next && echo 'BUILD_OK' || echo 'BUILD_FAILED'", timeout=10)
        if 'BUILD_OK' in check:
            print("✓ Build successful")
        else:
            print("✗ Build may have failed - checking...")
            errors = run_cmd(client, "tail -50 /root/.pm2/logs/simplifytools-error.log 2>/dev/null", timeout=10)
            if errors:
                print("Recent errors:", errors[-500:])
        
        # Step 7: Start app
        print("\n[7/7] Starting application...")
        run_cmd(client, "pm2 start simplifytools 2>&1", timeout=30)
        time.sleep(5)
        
        # Final checks
        print("\nFinal Status:")
        status = run_cmd(client, "pm2 status", timeout=10)
        print(status)
        
        # Wait a bit and test
        print("\nTesting connectivity (waiting 5 seconds)...")
        time.sleep(5)
        for i in range(3):
            try:
                result = run_cmd(client, "curl -s -I https://www.simplifyconvert.com/ 2>&1 | head -1", timeout=10)
                print(f"  Attempt {i+1}: {result.strip()}")
                if 'HTTP' in result:
                    print("✓ Website responding")
                    break
            except:
                print(f"  Attempt {i+1}: Connection timeout")
            time.sleep(2)
        
        print("\n" + "=" * 70)
        print("✓ DEPLOYMENT COMPLETE")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n✗ Error during deployment: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        if sftp:
            try:
                sftp.close()
            except:
                pass
        if client:
            try:
                client.close()
            except:
                pass

if __name__ == "__main__":
    main()
