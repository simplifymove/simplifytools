#!/usr/bin/env python3
"""
Simple Manual Deployment - Deploy specific Python files to VPS via SSH
"""
import subprocess
import os

# VPS Configuration
VPS_HOST = "75.119.155.15"
VPS_USER = "root"
VPS_APP_DIR = "/root/tinytools-app"

def deploy_file(local_path, remote_path):
    """Deploy a single file using scp"""
    try:
        print(f"[SCP] Uploading {local_path} to {VPS_USER}@{VPS_HOST}:{remote_path}")
        
        # Use scp to copy file
        cmd = f"scp {local_path} {VPS_USER}@{VPS_HOST}:{remote_path}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print(f"✓ {local_path} uploaded successfully")
            return True
        else:
            print(f"✗ Upload failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def restart_gunicorn():
    """Restart Gunicorn on VPS"""
    try:
        print("[SSH] Restarting Gunicorn service...")
        cmd = f"ssh {VPS_USER}@{VPS_HOST} 'systemctl restart gunicorn'"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✓ Gunicorn restarted successfully")
            return True
        else:
            print(f"✗ Restart failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("MANUAL PYTHON FILES DEPLOYMENT")
    print("=" * 60)
    
    # Files to deploy
    files = [
        ("python/engines/document.py", f"{VPS_APP_DIR}/python/engines/document.py"),
    ]
    
    print(f"\nTarget VPS: {VPS_HOST} (root)")
    print(f"App Directory: {VPS_APP_DIR}\n")
    
    success_count = 0
    for local, remote in files:
        if os.path.exists(local):
            if deploy_file(local, remote):
                success_count += 1
        else:
            print(f"✗ File not found: {local}")
    
    print(f"\n[Summary] {success_count}/{len(files)} files deployed")
    
    if success_count == len(files):
        print("\n[Action] Restarting Gunicorn...")
        restart_gunicorn()
        print("\n✓ Deployment completed!")
    else:
        print("\n✗ Deployment incomplete - some files failed")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
