#!/usr/bin/env python3
"""
Simple Deployment - Deploy document.py to VPS using SSH/SFTP
"""

import paramiko
import os
import sys

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def deploy_file(sftp, local_path, remote_path):
    """Deploy a single file via SFTP"""
    try:
        print(f"[SFTP] Uploading {local_path}")
        print(f"       to {VPS_USER}@{VPS_IP}:{remote_path}")
        
        # Ensure remote directory exists
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except IOError:
            print(f"[SFTP] Creating directory: {remote_dir}")
            sftp.mkdir(remote_dir)
        
        # Upload file
        sftp.put(local_path, remote_path)
        print(f"✓ Successfully uploaded {local_path}")
        return True
        
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        return False

def restart_service(client, service_name):
    """Restart a service on VPS"""
    try:
        print(f"[SSH] Restarting {service_name}...")
        stdin, stdout, stderr = client.exec_command(f"systemctl restart {service_name}")
        result = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        
        if error and "error" in error.lower():
            print(f"✗ Error restarting {service_name}: {error}")
            return False
        print(f"✓ {service_name} restarted")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("SIMPLE PYTHON FILES DEPLOYMENT")
    print("=" * 60)
    print(f"\nTarget VPS: {VPS_IP}")
    print(f"Target Dir: {VPS_APP_DIR}")
    
    client = None
    sftp = None
    
    try:
        # Connect to VPS
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected to VPS")
        
        # Deploy document.py
        print("\n[2/3] Deploying document.py...")
        local_file = "python/engines/document.py"
        remote_file = f"{VPS_APP_DIR}/python/engines/document.py"
        
        if not os.path.exists(local_file):
            print(f"✗ Local file not found: {local_file}")
            return 1
        
        if deploy_file(sftp, local_file, remote_file):
            print("✓ File deployed successfully")
        else:
            print("✗ File deployment failed")
            return 1
        
        # Restart services
        print("\n[3/3] Restarting services...")
        restart_service(client, "gunicorn")
        
        print("\n✓ Deployment completed successfully!")
        return 0
        
    except Exception as e:
        print(f"\n✗ Deployment failed: {e}")
        return 1
        
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
    exit(main())
