#!/usr/bin/env python3
"""
SimplifyConvert VPS Deployment Script
Automatically deploys the latest code to Contabo VPS via SSH
Uses Python Paramiko for cross-platform SSH support
"""

import subprocess
import sys
import os
import json
from pathlib import Path

# Try to import paramiko for SSH
try:
    import paramiko
    PARAMIKO_AVAILABLE = True
except ImportError:
    PARAMIKO_AVAILABLE = False

# Configuration
VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"
PM2_APP_NAME = "simplifytools"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_status(message, status="info"):
    """Print colored status messages"""
    if status == "success":
        print(f"{Colors.GREEN}✓ {message}{Colors.END}")
    elif status == "error":
        print(f"{Colors.RED}✗ {message}{Colors.END}")
    elif status == "warning":
        print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")
    else:
        print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def run_command(cmd, description=""):
    """Run a local shell command"""
    if description:
        print_status(description, "info")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            return True, result.stdout.strip()
        else:
            return False, result.stderr.strip()
    except Exception as e:
        return False, str(e)

def ssh_command_paramiko(cmd):
    """Execute SSH command using Paramiko"""
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
        output = stdout.read().decode('utf-8').strip()
        error = stderr.read().decode('utf-8').strip()
        
        client.close()
        
        return output, error
    except Exception as e:
        return "", str(e)

def test_vps_connection():
    """Test SSH connection to VPS"""
    print_status("Testing VPS connection...", "info")
    
    output, error = ssh_command_paramiko("echo 'Connection successful'")
    if output and "Connection" in output:
        print_status("VPS connected!", "success")
        return True
    else:
        print_status(f"Connection failed: {error}", "error")
        return False

def detect_pm2_app():
    """Auto-detect PM2 app name"""
    global PM2_APP_NAME
    print_status("Auto-detecting PM2 apps...", "info")
    
    output, error = ssh_command_paramiko("pm2 list --format json 2>/dev/null")
    if output:
        try:
            pm2_list = json.loads(output)
            if isinstance(pm2_list, list) and len(pm2_list) > 0:
                app_name = pm2_list[0].get('name', 'simplifytools')
                PM2_APP_NAME = app_name
                print_status(f"Found PM2 app: {app_name}", "success")
                return True
        except:
            pass
    
    print_status(f"Using default: {PM2_APP_NAME}", "warning")
    return True

def detect_app_path():
    """Auto-detect app path"""
    global APP_PATH
    print_status("Auto-detecting app path...", "info")
    
    paths = ["/var/www/simplifytools", "/home/simplify/app", "/opt/simplifytools", "/root/simplifytools"]
    
    for path in paths:
        output, error = ssh_command_paramiko(f"test -d {path} && echo 'EXISTS'")
        if "EXISTS" in output:
            APP_PATH = path
            print_status(f"Found: {path}", "success")
            return True
    
    print_status(f"Using default: {APP_PATH}", "warning")
    return True

def check_local_git():
    """Check local git status"""
    print_status("Checking git status...", "info")
    success, output = run_command("git status --porcelain")
    if output:
        print_status("Uncommitted changes found!", "warning")
        resp = input("Continue? (y/n): ").lower()
        return resp == 'y'
    return True

def push_to_github():
    """Push to GitHub"""
    print_status("Pushing to GitHub...", "info")
    success, output = run_command("git rev-list --count @{u}..HEAD")
    
    if output and int(output) > 0:
        success, output = run_command("git push origin main")
        if not success:
            print_status(f"Push failed: {output}", "error")
            return False
        print_status("Pushed to GitHub!", "success")
    else:
        print_status("Already up to date", "info")
    
    return True

def deploy_to_vps():
    """Deploy to VPS"""
    print_status("Deploying... (may take 2-3 minutes)", "info")
    
    cmd = f"cd {APP_PATH} && git pull origin main && npm install && npm run build && pm2 restart {PM2_APP_NAME} && pm2 status"
    
    output, error = ssh_command_paramiko(cmd)
    
    if output:
        print_status("Deployment complete!", "success")
        print("\n" + "="*60)
        print(output)
        print("="*60)
        return True
    else:
        print_status(f"Error: {error}", "error")
        return False

def main():
    """Main workflow"""
    print("\n" + "="*60)
    print(f"{Colors.BLUE}SimplifyConvert Deployment{Colors.END}")
    print("="*60 + "\n")
    
    # Check paramiko
    if not PARAMIKO_AVAILABLE:
        print_status("Installing paramiko...", "info")
        run_command("pip install paramiko")
        print()
    
    # Connect and detect
    print_status(f"VPS: {VPS_IP}", "info")
    if not test_vps_connection():
        sys.exit(1)
    
    detect_app_path()
    detect_pm2_app()
    print_status(f"App: {APP_PATH}", "info")
    print_status(f"PM2: {PM2_APP_NAME}", "info")
    print()
    
    # Deployment steps
    if not check_local_git():
        sys.exit(0)
    if not push_to_github():
        sys.exit(1)
    if not deploy_to_vps():
        sys.exit(1)
    
    print("\n" + "="*60)
    print_status("✓ DEPLOYMENT SUCCESS!", "success")
    print("="*60)
    print(f"URL: https://www.simplifyconvert.com\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_status("\nCancelled", "warning")
        sys.exit(0)
    except Exception as e:
        print_status(f"Error: {e}", "error")
        sys.exit(1)
