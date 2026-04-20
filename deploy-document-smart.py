#!/usr/bin/env python3
"""
Smart Deployment - Deploy files to VPS with directory creation
"""
import subprocess
import os

# VPS Configuration
VPS_HOST = "75.119.155.15"
VPS_USER = "root"
VPS_APP_DIR = "/root/tinytools-app"
VPS_PASSWORD = "aaSSddffgghhjj11226699"

def run_ssh_command(cmd):
    """Execute SSH command on VPS"""
    try:
        print(f"[SSH] Executing: {cmd}")
        ssh_cmd = f"echo '{VPS_PASSWORD}' | sshpass -p '{VPS_PASSWORD}' ssh {VPS_USER}@{VPS_HOST} '{cmd}'"
        result = subprocess.run(ssh_cmd, shell=True, capture_output=True, text=True, timeout=30)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def deploy_file(local_path, remote_path):
    """Deploy a single file using scp"""
    try:
        print(f"[SCP] Uploading {local_path} to {VPS_USER}@{VPS_HOST}:{remote_path}")
        
        # Use sshpass + scp to copy file
        scp_cmd = f"echo '{VPS_PASSWORD}' | sshpass -p '{VPS_PASSWORD}' scp {local_path} {VPS_USER}@{VPS_HOST}:{remote_path}"
        result = subprocess.run(scp_cmd, shell=True, capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0:
            print(f"✓ {local_path} uploaded successfully")
            return True
        else:
            print(f"✗ Upload failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def ensure_directory(remote_dir):
    """Ensure directory exists on VPS"""
    try:
        print(f"[SSH] Ensuring directory exists: {remote_dir}")
        success, stdout, stderr = run_ssh_command(f"mkdir -p {remote_dir}")
        if success:
            print(f"✓ Directory ready: {remote_dir}")
            return True
        else:
            print(f"✗ Failed to create directory: {stderr}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def restart_gunicorn():
    """Restart Gunicorn on VPS"""
    try:
        print("[SSH] Restarting Gunicorn service...")
        success, stdout, stderr = run_ssh_command("systemctl restart gunicorn")
        
        if success:
            print("✓ Gunicorn restarted successfully")
            return True
        else:
            print(f"✗ Restart may have issues: {stderr}")
            return True  # Continue anyway
    except Exception as e:
        print(f"✗ Error: {e}")
        return True

def main():
    print("=" * 60)
    print("SMART PYTHON FILES DEPLOYMENT")
    print("=" * 60)
    
    # Files to deploy with their target directories
    files = [
        ("python/engines/document.py", f"{VPS_APP_DIR}/python/engines/document.py", f"{VPS_APP_DIR}/python/engines"),
    ]
    
    print(f"\nTarget VPS: {VPS_HOST} (root)")
    print(f"App Directory: {VPS_APP_DIR}\n")
    
    # Step 1: Ensure all directories exist
    print("\n[Step 1] Creating required directories...")
    for local, remote, remote_dir in files:
        if not ensure_directory(remote_dir):
            print("✗ Failed to create directories")
            return 1
    
    # Step 2: Deploy files
    print("\n[Step 2] Uploading files...")
    success_count = 0
    for local, remote, remote_dir in files:
        if os.path.exists(local):
            if deploy_file(local, remote):
                success_count += 1
        else:
            print(f"✗ File not found: {local}")
    
    print(f"\n[Summary] {success_count}/{len(files)} files deployed")
    
    if success_count == len(files):
        print("\n[Step 3] Restarting services...")
        restart_gunicorn()
        print("\n✓ Deployment completed successfully!")
        return 0
    else:
        print("\n✗ Deployment incomplete - some files failed")
        return 1

if __name__ == "__main__":
    exit(main())
