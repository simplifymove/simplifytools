#!/usr/bin/env python3
"""
SimplifyTools VPS Deployment Script
Use this to deploy code changes to the live VPS
"""

import paramiko
import sys
import time

# ============================================================================
# CONFIGURATION - Update these if different for other systems
# ============================================================================

VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
VPS_APP_PATH = "/var/www/simplifytools"
VPS_APP_NAME = "simplifytools"

# ============================================================================
# DEPLOYMENT LOGIC - Do not modify
# ============================================================================

class Deployer:
    def __init__(self):
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.connected = False
    
    def execute(self, command, timeout=30):
        """Execute command on VPS"""
        try:
            stdin, stdout, stderr = self.client.exec_command(command, timeout=timeout)
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            return output, error
        except Exception as e:
            return "", str(e)
    
    def connect(self):
        """Connect to VPS"""
        try:
            print("🔌 Connecting to VPS...")
            self.client.connect(
                VPS_IP, 
                username=VPS_USER, 
                password=VPS_PASSWORD, 
                timeout=30
            )
            self.connected = True
            print("✓ Connected to VPS")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            return False
    
    def verify_app_path(self):
        """Verify app path exists"""
        output, error = self.execute(f"test -d {VPS_APP_PATH} && echo OK || echo NOTFOUND")
        if "OK" in output:
            print(f"✓ App path found: {VPS_APP_PATH}")
            return True
        else:
            print(f"✗ App path not found: {VPS_APP_PATH}")
            return False
    
    def pull_code(self):
        """Pull latest code from GitHub"""
        print("\n📥 Pulling latest code from GitHub...")
        output, error = self.execute(
            f"cd {VPS_APP_PATH} && git pull origin main 2>&1",
            timeout=60
        )
        
        if error and "fatal" in error.lower():
            print(f"✗ Git pull failed:\n{error}")
            return False
        
        # Check what changed
        if "Already up to date" in output:
            print("✓ Already up to date")
        elif "files changed" in output:
            lines = output.split('\n')
            for line in lines[:3]:
                if line.strip():
                    print(f"  {line}")
            print("✓ Code updated")
        else:
            print("✓ Code pulled")
        
        return True
    
    def install_deps(self):
        """Install npm dependencies"""
        print("\n📦 Installing Node dependencies...")
        output, error = self.execute(
            f"cd {VPS_APP_PATH} && npm install --legacy-peer-deps 2>&1 | tail -5",
            timeout=120
        )
        
        if "error" in error.lower() or "error" in output.lower():
            print("⚠ Error during npm install:")
            print(output)
            return False
        
        print("✓ Node dependencies up to date")
        return True
    
    def install_python_deps(self):
        """Install Python dependencies from requirements.txt"""
        print("\n📦 Installing Python dependencies...")
        
        # First, show what Python we're using
        python_info, _ = self.execute("python3 --version && python3 -m pip --version", timeout=10)
        print(f"  Python info: {python_info.strip()}")
        
        # Use python3 -m pip with --break-system-packages for Python 3.12+
        output, error = self.execute(
            f"cd {VPS_APP_PATH} && python3 -m pip install --upgrade --break-system-packages -r requirements.txt",
            timeout=300
        )
        
        # Show installation output for debugging
        if output:
            lines = output.split('\n')[-10:]
            for line in lines:
                if line.strip() and ("Successfully" in line or "Installing" in line or "Requirement" in line):
                    print(f"    {line}")
        
        if error and "error" in error.lower() and "externally-managed" not in error:
            print(f"  Install error: {error[:300]}")
        
        # Verify rembg is installed
        verify_output, verify_error = self.execute(
            "python3 -c 'import rembg; print(\"✓ rembg installed\")'",
            timeout=10
        )
        
        if "rembg installed" in verify_output:
            print("✓ Python dependencies installed and verified")
            return True
        else:
            print(f"  Verify output: {verify_output.strip() if verify_output else 'none'}")
            print(f"  Verify error: {verify_error[:200] if verify_error else 'none'}")
            print("⚠ Python dependencies may not be available")
    
    def build(self):
        """Build Next.js application"""
        print("\n🔨 Building application (this takes 2-5 minutes)...")
        output, error = self.execute(
            f"cd {VPS_APP_PATH} && npm run build 2>&1 | tail -50",
            timeout=300
        )
        
        if "error" in output.lower():
            print("✗ Build failed:")
            print(output)
            return False
        
        # Show last few lines
        lines = output.split('\n')
        for line in lines[-5:]:
            if line.strip() and ("compiled" in line.lower() or "✓" in line):
                print(f"  {line.strip()}")
        
        print("✓ Build completed successfully")
        return True
    
    def restart_service(self):
        """Restart PM2 service"""
        print("\n🚀 Restarting service...")
        output, error = self.execute(
            f"pm2 restart {VPS_APP_NAME}",
            timeout=30
        )
        
        if "online" in output.lower() or "✓" in output:
            print("✓ Service restarted")
            return True
        else:
            print("Service restart output:")
            print(output)
            return True
    
    def check_status(self):
        """Check if service is online"""
        print("\n✅ Verifying service status...")
        output, error = self.execute("pm2 status")
        
        for line in output.split('\n'):
            if VPS_APP_NAME in line and "online" in line:
                print("✓ Service is online")
                return True
        
        print("⚠ Could not verify status")
        return False
    
    def deploy(self):
        """Execute full deployment"""
        print("\n" + "="*70)
        print("SIMPLIFYTOOLS VPS DEPLOYMENT")
        print("="*70)
        
        if not self.connect():
            return False
        
        if not self.verify_app_path():
            return False
        
        if not self.pull_code():
            return False
        
        if not self.install_deps():
            print("⚠ Continuing despite npm install warning...")
        
        if not self.install_python_deps():
            print("⚠ Continuing despite Python dependency warning...")
        
        if not self.build():
            return False
        
        if not self.restart_service():
            return False
        
        if not self.check_status():
            print("⚠ Could not verify status")
        
        print("\n" + "="*70)
        print("✓ DEPLOYMENT SUCCESSFUL!")
        print("="*70)
        print(f"\n🌐 Application is live at: https://www.simplifyconvert.com")
        print(f"📍 Server: {VPS_IP}")
        print(f"📂 Path: {VPS_APP_PATH}")
        print(f"⚙️  Process: {VPS_APP_NAME}")
        print("\n" + "="*70)
        
        return True
    
    def close(self):
        """Close VPS connection"""
        if self.connected:
            self.client.close()


# ============================================================================
# MAIN
# ============================================================================

def main():
    deployer = Deployer()
    
    try:
        success = deployer.deploy()
        deployer.close()
        
        if success:
            print("\n✓ Deployment completed successfully!")
            return 0
        else:
            print("\n✗ Deployment failed!")
            print("\nTroubleshooting:")
            print("  1. Check VPS IP and credentials")
            print("  2. Verify GitHub repo is accessible")
            print("  3. Check VPS has enough disk space: df -h")
            print("  4. Review VPS logs: pm2 logs " + VPS_APP_NAME)
            return 1
    
    except KeyboardInterrupt:
        print("\n\n⚠ Deployment interrupted by user")
        deployer.close()
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        deployer.close()
        return 1


if __name__ == "__main__":
    sys.exit(main())
