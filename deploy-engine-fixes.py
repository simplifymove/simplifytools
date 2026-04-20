#!/usr/bin/env python3
"""
Deploy fixed engines to VPS
"""

import paramiko
import os

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_DIR = "/var/www/simplifytools"

def deploy_file(sftp, local_path, remote_path):
    """Deploy a single file via SFTP"""
    try:
        print(f"[SFTP] Uploading {local_path}")
        
        # Ensure remote directory exists
        remote_dir = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir)
        except IOError:
            print(f"       Creating directory: {remote_dir}")
            sftp.mkdir(remote_dir)
        
        # Upload file
        sftp.put(local_path, remote_path)
        print(f"✓ {os.path.basename(local_path)} deployed")
        return True
        
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        return False

def main():
    print("=" * 70)
    print("DEPLOY FIXED CONVERSION ENGINES")
    print("=" * 70)
    
    files = [
        ("python/engines/document.py", f"{VPS_APP_DIR}/python/engines/document.py"),
        ("python/engines/vector_trace.py", f"{VPS_APP_DIR}/python/engines/vector_trace.py"),
    ]
    
    client = None
    sftp = None
    
    try:
        print("\n[1/3] Connecting to VPS...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        sftp = client.open_sftp()
        print("✓ Connected")
        
        print("\n[2/3] Deploying files...")
        success_count = 0
        for local, remote in files:
            if os.path.exists(local):
                if deploy_file(sftp, local, remote):
                    success_count += 1
            else:
                print(f"✗ File not found: {local}")
        
        print(f"\n[Summary] {success_count}/{len(files)} files deployed")
        
        if success_count == len(files):
            print("\n[3/3] Restarting Gunicorn...")
            stdin, stdout, stderr = client.exec_command("systemctl restart gunicorn")
            stdout.read()
            print("✓ Gunicorn restarted")
            
            print("\n✓ Deployment completed successfully!")
            print("\nFix applied:")
            print("  • Fixed log_execution() calls with correct parameters")
            print("  • document.py: Updated all 3 log_execution calls")
            print("  • vector_trace.py: Updated 1 log_execution call")
            return 0
        else:
            print("\n✗ Some files failed to deploy")
            return 1
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
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
