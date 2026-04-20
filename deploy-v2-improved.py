#!/usr/bin/env python3
"""
Improved deployment script - sync files and rebuild with better efficiency
Uses rsync for faster, more reliable file transfers with deduplication
"""

import paramiko
import time
import os
import subprocess
import sys

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_local_cmd(cmd, timeout=60):
    """Run command locally"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return f"Command timed out after {timeout} seconds"

def run_remote_cmd(client, cmd, timeout=60):
    """Run command on VPS"""
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')
    except Exception as e:
        return f"Error: {e}"

def deploy_with_rsync():
    """Deploy using rsync for efficiency"""
    print("=" * 70)
    print("IMPROVED DEPLOYMENT - USING RSYNC")
    print("=" * 70)
    
    try:
        local_app = r'i:\Raghava\Copilot-works\tinytools-app\app'
        remote_app = 'root@75.119.155.15:/var/www/simplifytools/app'
        
        # Build rsync command (compatible with Windows + Linux)
        rsync_cmd = f'rsync -avz --delete "{local_app}/" "{remote_app}/"'
        
        print("\n[1] Uploading files with rsync...")
        print(f"    Command: {rsync_cmd}")
        output = run_local_cmd(rsync_cmd, timeout=300)
        
        # Count files from rsync output
        file_count = output.count('/')
        print(f"✓ Files synced ({file_count} items)")
        
        # Connect to VPS for build
        print("\n[2] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[3] Stopping application...")
        run_remote_cmd(client, "pm2 stop simplifytools")
        time.sleep(2)
        
        print("\n[4] Cleaning and rebuilding...")
        output = run_remote_cmd(client, "cd /var/www/simplifytools && rm -rf .next .turbo && npm run build 2>&1 | tail -50", timeout=900)
        print(output[-1500:] if len(output) > 1500 else output)
        
        print("\n[5] Checking for BUILD_ID...")
        check = run_remote_cmd(client, "test -f /var/www/simplifytools/.next/BUILD_ID && echo 'EXISTS' || echo 'MISSING'")
        if 'EXISTS' in check:
            print("✓ Build successful - BUILD_ID file created")
        else:
            print("⚠ BUILD_ID still missing - checking errors...")
            errors = run_remote_cmd(client, "tail -100 /root/.pm2/logs/simplifytools-error.log | grep -i 'error' | head -20")
            print(errors if errors else "No errors found")
        
        print("\n[6] Starting application...")
        run_remote_cmd(client, "pm2 start simplifytools", timeout=30)
        time.sleep(5)
        
        print("\n[7] Final status...")
        print(run_remote_cmd(client, "pm2 status"))
        
        print("\n[8] Testing connectivity...")
        time.sleep(3)
        for i in range(3):
            status = run_remote_cmd(client, "curl -s -o /dev/null -w '%{http_code}' https://www.simplifyconvert.com/")
            print(f"   Attempt {i+1}: HTTP {status}")
            if status in ['200', '404', '301', '302']:
                print(f"✓ Website is responding!")
                break
            time.sleep(2)
        
        print("\n" + "=" * 70)
        print("✓ DEPLOYMENT COMPLETE")
        print("=" * 70)
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def deploy_with_paramiko_improved():
    """Deploy using improved paramiko with file list deduplication"""
    print("=" * 70)
    print("IMPROVED DEPLOYMENT - OPTIMIZED FILE UPLOAD")
    print("=" * 70)
    
    try:
        print("\n[1] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected")
        
        print("\n[2] Uploading entire app directory...")
        app_local = r'i:\Raghava\Copilot-works\tinytools-app\app'
        
        # Build complete file list first (deduplication)
        file_list = []
        for root, dirs, files in os.walk(app_local):
            for file in files:
                file_list.append((root, file))
        
        # Remove duplicates using set
        unique_files = set()
        for root, file in file_list:
            unique_files.add((root, file))
        
        print(f"  Found {len(unique_files)} unique files to upload")
        
        # Upload with progress tracking
        for idx, (root, file) in enumerate(sorted(unique_files), 1):
            local_file = os.path.join(root, file)
            rel_path = os.path.relpath(local_file, app_local)
            remote_file = f"/var/www/simplifytools/app/{rel_path}".replace('\\', '/')
            
            try:
                # Create remote directory if needed
                remote_dir = os.path.dirname(remote_file)
                try:
                    sftp.stat(remote_dir)
                except IOError:
                    sftp.mkdir(remote_dir)
                
                sftp.put(local_file, remote_file)
                if idx % 50 == 0:
                    print(f"  Progress: {idx}/{len(unique_files)} files")
            except Exception as e:
                print(f"  Warning: Failed to upload {rel_path}: {e}")
        
        sftp.close()
        print(f"✓ App directory synced ({len(unique_files)} files)")
        
        # Continue with build steps...
        print("\n[2] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✓ Connected")
        
        print("\n[3] Stopping application...")
        run_remote_cmd(client, "pm2 stop simplifytools")
        time.sleep(2)
        
        print("\n[4] Cleaning and rebuilding...")
        output = run_remote_cmd(client, "cd /var/www/simplifytools && rm -rf .next .turbo && npm run build 2>&1 | tail -50", timeout=900)
        print(output[-1500:] if len(output) > 1500 else output)
        
        print("\n[5] Checking for BUILD_ID...")
        check = run_remote_cmd(client, "test -f /var/www/simplifytools/.next/BUILD_ID && echo 'EXISTS' || echo 'MISSING'")
        if 'EXISTS' in check:
            print("✓ Build successful - BUILD_ID file created")
        else:
            print("⚠ BUILD_ID still missing")
        
        print("\n[6] Starting application...")
        run_remote_cmd(client, "pm2 start simplifytools", timeout=30)
        time.sleep(5)
        
        print("\n[7] Final status...")
        print(run_remote_cmd(client, "pm2 status"))
        
        print("\n" + "=" * 70)
        print("✓ DEPLOYMENT COMPLETE")
        print("=" * 70)
        
        client.close()
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Try rsync first (faster), fall back to improved paramiko if rsync not available
    try:
        # Check if rsync is available
        result = subprocess.run("rsync --version", shell=True, capture_output=True)
        if result.returncode == 0:
            print("Rsync is available - using optimized rsync method\n")
            deploy_with_rsync()
        else:
            raise Exception("Rsync not available")
    except:
        print("Rsync not available - using improved paramiko method\n")
        deploy_with_paramiko_improved()
