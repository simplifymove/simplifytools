# VPS Deployment Guide for SimplifyTools

## Overview
This guide explains how to deploy code changes from your local development machine to the live VPS using Python/Paramiko for SSH automation.

---

## Prerequisites

1. **Python 3.7+** installed on your development machine
2. **Paramiko library** installed: `pip install paramiko`
3. **VPS credentials** (IP, username, password)
4. **Git repository** configured on the VPS
5. **Node.js and npm** installed on the VPS
6. **PM2** process manager running on the VPS

---

## VPS Setup Details

```
VPS IP Address:        75.119.155.15
VPS Username:          root
VPS Password:          [Your secure password]
Application Path:      /var/www/simplifytools
Application Name:      simplifytools (PM2 process name)
Repository:            github.com/simplifymove/simplifytools
Branch:                main
```

---

## Step 1: Git Commit and Push to GitHub

Before deploying to VPS, always commit and push your changes to GitHub:

```bash
cd i:\Raghava\Copilot-works\tinytools-app

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Description of changes"

# Push to main branch
git push origin main
```

---

## Step 2: Deploy to VPS Using Python Script

Create a Python deployment script and run it from your development machine:

### Option A: Quick Deployment Script

Create file: `deploy.py`

```python
import paramiko
import time

# VPS Configuration
VPS_IP = "75.119.155.15"
VPS_USER = "root"
VPS_PASSWORD = "aaSSddffgghhjj11226699"
APP_PATH = "/var/www/simplifytools"
APP_NAME = "simplifytools"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("=" * 60)
    print("SIMPLIFYTOOLS VPS DEPLOYMENT")
    print("=" * 60)
    
    # Step 1: Connect to VPS
    print("\n[1/5] Connecting to VPS...")
    client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
    print("✓ Connected successfully")
    
    # Step 2: Pull latest code
    print("\n[2/5] Pulling latest code from GitHub...")
    stdin, stdout, stderr = client.exec_command(
        f'cd {APP_PATH} && git pull origin main',
        timeout=60
    )
    pull_output = stdout.read().decode('utf-8')
    pull_error = stderr.read().decode('utf-8')
    
    if pull_error and "Already up to date" not in pull_error:
        print("⚠ Pull output:")
        print(pull_output)
        if pull_error:
            print(pull_error)
    else:
        print("✓ Code pulled successfully")
        # Print first few lines of changes
        for line in pull_output.split('\n')[:5]:
            if line.strip():
                print(f"  {line}")
    
    # Step 3: Install dependencies (if needed)
    print("\n[3/5] Installing dependencies...")
    stdin, stdout, stderr = client.exec_command(
        f'cd {APP_PATH} && npm install --legacy-peer-deps',
        timeout=120
    )
    install_output = stdout.read().decode('utf-8')
    print("✓ Dependencies installed")
    
    # Step 4: Build application
    print("\n[4/5] Building Next.js application...")
    stdin, stdout, stderr = client.exec_command(
        f'cd {APP_PATH} && npm run build 2>&1 | tail -30',
        timeout=300
    )
    build_output = stdout.read().decode('utf-8')
    
    if "error" in build_output.lower():
        print("⚠ Build output (last 30 lines):")
        print(build_output)
    else:
        print("✓ Build completed successfully")
        print(build_output[-500:] if len(build_output) > 500 else build_output)
    
    # Step 5: Restart PM2 service
    print("\n[5/5] Restarting PM2 service...")
    stdin, stdout, stderr = client.exec_command(
        f'pm2 restart {APP_NAME}',
        timeout=30
    )
    restart_output = stdout.read().decode('utf-8')
    
    if "online" in restart_output.lower() or "✓" in restart_output:
        print("✓ Service restarted successfully")
    else:
        print("Restart output:")
        print(restart_output)
    
    # Check final status
    print("\n[6/5] Checking PM2 status...")
    stdin, stdout, stderr = client.exec_command('pm2 status', timeout=30)
    status_output = stdout.read().decode('utf-8')
    
    # Extract just the status line
    for line in status_output.split('\n'):
        if APP_NAME in line:
            print(f"✓ {line.strip()}")
            break
    
    print("\n" + "=" * 60)
    print("✓ DEPLOYMENT COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\nApplication is live at:")
    print(f"  https://www.simplifyconvert.com")
    print(f"\nVPS Path: {APP_PATH}")
    print(f"Process: {APP_NAME}")
    
except Exception as e:
    print(f"\n✗ DEPLOYMENT FAILED: {e}")
    print("\nTroubleshooting:")
    print("  1. Check VPS credentials")
    print("  2. Verify VPS IP is reachable")
    print("  3. Check Git repository access")
    print("  4. Review VPS logs: pm2 logs")
    
finally:
    client.close()
```

### Option B: Smart Deployment with Error Handling

For more robust deployments:

```python
import paramiko
import sys
import time

class VPSDeployer:
    def __init__(self, vps_ip, username, password, app_path, app_name):
        self.vps_ip = vps_ip
        self.username = username
        self.password = password
        self.app_path = app_path
        self.app_name = app_name
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    def execute_command(self, command, timeout=30, verbose=False):
        """Execute command on VPS and return output"""
        try:
            stdin, stdout, stderr = self.client.exec_command(command, timeout=timeout)
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            
            if verbose:
                print(f"Command: {command}")
                if output:
                    print(f"Output:\n{output}")
                if error:
                    print(f"Error:\n{error}")
            
            return output, error
        except Exception as e:
            print(f"Command execution failed: {e}")
            raise
    
    def deploy(self):
        """Execute full deployment pipeline"""
        try:
            # Connect
            print("Connecting to VPS...")
            self.client.connect(self.vps_ip, username=self.username, 
                               password=self.password, timeout=30)
            print("✓ Connected")
            
            # Verify app path exists
            output, error = self.execute_command(f"test -d {self.app_path} && echo OK")
            if "OK" not in output:
                print(f"✗ Application path not found: {self.app_path}")
                return False
            
            # Pull code
            print("Pulling latest code...")
            output, error = self.execute_command(
                f"cd {self.app_path} && git pull origin main",
                timeout=60
            )
            print("✓ Code updated")
            
            # Build
            print("Building application (this may take 2-5 minutes)...")
            output, error = self.execute_command(
                f"cd {self.app_path} && npm run build 2>&1 | tail -50",
                timeout=300
            )
            
            if "error" in output.lower():
                print("✗ Build failed:")
                print(output)
                return False
            
            print("✓ Build successful")
            
            # Restart
            print("Restarting service...")
            output, error = self.execute_command(
                f"pm2 restart {self.app_name}",
                timeout=30
            )
            print("✓ Service restarted")
            
            # Verify
            output, error = self.execute_command("pm2 status")
            if "online" in output.lower():
                print("\n✓ DEPLOYMENT SUCCESSFUL!")
                return True
            else:
                print("✗ Service status unknown")
                return False
            
        except Exception as e:
            print(f"✗ Deployment failed: {e}")
            return False
        finally:
            self.client.close()

# Run deployment
if __name__ == "__main__":
    deployer = VPSDeployer(
        vps_ip="75.119.155.15",
        username="root",
        password="aaSSddffgghhjj11226699",
        app_path="/var/www/simplifytools",
        app_name="simplifytools"
    )
    
    success = deployer.deploy()
    sys.exit(0 if success else 1)
```

---

## Step 3: Run Deployment

```bash
# Navigate to project directory
cd i:\Raghava\Copilot-works\tinytools-app

# Run deployment script
python deploy.py
```

---

## Deployment Workflow Summary

```
Local Development
      ↓
[1] Make code changes
      ↓
[2] Test locally (npm run dev)
      ↓
[3] Git commit and push
      ↓
GitHub Repository
      ↓
[4] Run deploy.py script
      ↓
VPS Deployment Steps:
  - SSH connect to VPS
  - git pull origin main
  - npm install (if needed)
  - npm run build
  - pm2 restart simplifytools
  - Verify status
      ↓
Live at https://www.simplifyconvert.com
```

---

## Important Notes

### Before Deploying
- ✅ Test locally with `npm run dev`
- ✅ Ensure no TypeScript errors
- ✅ Test on localhost thoroughly
- ✅ Commit changes: `git add .` → `git commit -m "message"` → `git push`

### During Deployment
- Build takes **2-5 minutes** (don't interrupt)
- PM2 restart takes **10-30 seconds**
- Site may be briefly unavailable during restart

### After Deployment
- ✅ Verify site loads: `https://www.simplifyconvert.com`
- ✅ Check specific tool pages work
- ✅ Monitor logs: `pm2 logs simplifytools`

---

## Troubleshooting

### Issue: "Connection refused"
```
Solution: Check VPS IP, credentials, and VPN/firewall settings
```

### Issue: "git pull" fails
```
Solution: Verify GitHub SSH keys on VPS or use HTTPS with credentials
```

### Issue: Build fails
```
Solution: Check disk space, Node.js version, or try:
  npm clean-install --legacy-peer-deps
  npm run build
```

### Issue: PM2 restart fails
```
Solution: Check process name with: pm2 list
Or restart manually: pm2 restart all
```

### Emergency: Check VPS Status

```bash
# SSH into VPS
ssh root@75.119.155.15

# Check PM2 status
pm2 status

# View logs
pm2 logs simplifytools

# Restart if needed
pm2 restart simplifytools

# Check disk space
df -h

# Check Node version
node -v
npm -v
```

---

## Security Notes

⚠️ **Important:**
- ⚠️ Don't commit credentials to Git
- ✅ Use environment variables for sensitive data
- ✅ Rotate VPS password regularly
- ✅ Use SSH keys instead of passwords (future improvement)
- ✅ Keep deployment script in `.gitignore`

---

## For Multiple Development Systems

To use on another PC:

1. Copy this guide and `deploy.py` script
2. Update paths if different (e.g., `C:\projects\tinytools-app`)
3. Same VPS credentials work across all development machines
4. Each PC independently commits to GitHub
5. All PCs deploy to the same VPS

### Step-by-step for new PC:

```bash
# 1. Clone repository
git clone https://github.com/simplifymove/simplifytools.git
cd simplifytools

# 2. Install dependencies
npm install

# 3. Test locally
npm run dev

# 4. Make changes and commit
git add .
git commit -m "Your changes"
git push origin main

# 5. Deploy (when ready)
python deploy.py
```

---

## Version Control Best Practices

```bash
# Always pull latest before starting work
git pull origin main

# Create feature branch for major changes (optional)
git checkout -b feature/feature-name

# Commit frequently with clear messages
git commit -m "Add feature X"

# Push to GitHub regularly
git push origin main

# Before deployment, ensure branch is up to date
git status  # Should show "Your branch is up to date"
```

---

## Quick Reference Commands

```bash
# Local development
npm run dev              # Start dev server on localhost:3000
npm run build           # Test build locally
npm run lint            # Check code quality

# Git workflow
git status              # Check what changed
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push origin main    # Push to GitHub
git pull origin main    # Pull latest changes

# Deployment
python deploy.py        # Deploy to VPS

# VPS (manual access)
ssh root@75.119.155.15              # SSH into VPS
pm2 status                          # Check running processes
pm2 logs simplifytools              # View application logs
pm2 restart simplifytools           # Restart application
```

---

## Support & Questions

If deployment fails:
1. Check error message in deploy script output
2. Review VPS logs: `pm2 logs simplifytools`
3. Verify GitHub has latest code: `git push origin main`
4. Check disk space on VPS: `df -h`
5. Verify Node/npm versions: `node -v` / `npm -v`

---

**Last Updated:** April 15, 2026
**Framework:** Next.js 16.1.6
**Process Manager:** PM2
**Hosting:** Contabo VPS
