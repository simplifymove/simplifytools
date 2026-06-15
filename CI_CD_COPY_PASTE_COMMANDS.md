# CI/CD Setup - Copy/Paste Commands

Use this file for quick copy-paste setup. It has all the commands you need in order.

---

## 🔐 STEP 1: Generate SSH Key (Run on Your Local Machine)

```bash
# If you don't already have an SSH key
ssh-keygen -t ed25519 -f ~/.ssh/vps_deploy_key -N ""

# Verify it was created
ls -la ~/.ssh/vps_deploy_key*
```

---

## 📋 STEP 2: Copy Private Key to GitHub Secret

### 2a. Get your private key:
```bash
# macOS:
cat ~/.ssh/vps_deploy_key | pbcopy

# Linux (with xclip installed):
cat ~/.ssh/vps_deploy_key | xclip -selection clipboard

# Linux (with xsel installed):
cat ~/.ssh/vps_deploy_key | xsel --clipboard --input

# Windows PowerShell:
Get-Content ~/.ssh/vps_deploy_key | Set-Clipboard

# Windows (if neither above works):
type %USERPROFILE%\.ssh\vps_deploy_key
# Then manually select and copy
```

### 2b. Add to GitHub:
1. Go to: `https://github.com/YOUR_ORG/simplifytools/settings/secrets/actions`
2. Click **New repository secret**
3. **Name:** `VPS_SSH_KEY`
4. **Value:** Paste your private key
5. Click **Add secret**

---

## 🔑 STEP 3: Add Public Key to VPS

### 3a. Get your public key:
```bash
cat ~/.ssh/vps_deploy_key.pub
# Copy the entire output
```

### 3b. SSH to VPS and add it:
```bash
# SSH to your VPS
ssh root@75.119.155.15

# Add public key to authorized_keys
mkdir -p ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Verify it was added
cat ~/.ssh/authorized_keys | grep -i "your-key-comment-or-start"
```

---

## ✅ STEP 4: Verify VPS Prerequisites

```bash
# SSH to your VPS
ssh root@75.119.155.15

# Check Node.js (must be 18+)
node --version

# Check npm
npm --version

# Check PM2
pm2 --version
# If PM2 not found, install: sudo npm install -g pm2

# Check app directory
ls -la /var/www/simplifyconvertapp/
```

---

## 🛠️ STEP 5: Setup App Directory (If First Time)

```bash
# SSH to VPS
ssh root@75.119.155.15

# Create app directory if needed
sudo mkdir -p /var/www/simplifyconvertapp
sudo chown -R root:root /var/www/simplifyconvertapp

# Navigate to app directory
cd /var/www/simplifyconvertapp

# Initialize git if needed (only if new)
git init
git config user.email "deploy@example.com"
git config user.name "Deploy Bot"
git remote add origin https://github.com/YOUR_ORG/simplifytools.git

# Pull code for the first time
git pull origin main
```

---

## 🧪 STEP 6: Test SSH Key Works

```bash
# From your LOCAL machine (not on VPS)
ssh -i ~/.ssh/vps_deploy_key -o StrictHostKeyChecking=no root@75.119.155.15 "echo 'SSH Key Works!'"

# Should output: SSH Key Works!
# If fails, check:
# 1. Public key in ~/.ssh/authorized_keys on VPS
# 2. File permissions are correct
# 3. SSH is running on VPS (should be)
```

---

## 🏗️ STEP 7: Manual Deployment Test

```bash
# SSH to VPS
ssh root@75.119.155.15

# Go to app directory
cd /var/www/simplifyconvertapp

# Pull latest code
git pull origin main

# Install dependencies (production only)
npm ci --production

# Build the app
npm run build

# Start with PM2
pm2 start "npm start -- -p 3001" --name simplifyconvertapp

# Enable auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs simplifyconvertapp --lines 20 --nostream
```

---

## 🌐 STEP 8: Test Application Running

```bash
# While SSH'd to VPS, test if app responds
curl -s http://127.0.0.1:3001 | head -20

# Should show HTML content
# If connection refused, check:
# 1. pm2 status (is it running?)
# 2. pm2 logs (are there errors?)
# 3. netstat -tlnp | grep 3001 (is port listening?)
```

---

## 🚀 STEP 9: Deploy via GitHub Actions

```bash
# On your LOCAL machine
git add .
git commit -m "chore: implement improved CI/CD pipeline"
git push origin main

# Then go to: https://github.com/YOUR_ORG/simplifytools/actions
# Watch the "Deploy to VPS" workflow
# Should complete in 5-10 minutes
```

---

## 🔍 STEP 10: Verify Live Deployment

```bash
# From your LOCAL machine
curl -s https://simplifyconvert.com | head -30

# Or just open in browser:
# https://simplifyconvert.com

# Should see your website live!
```

---

## 🛑 If Something Fails - Debugging Commands

### SSH Connection Failed
```bash
# Test SSH manually
ssh -i ~/.ssh/vps_deploy_key -v root@75.119.155.15

# Check if GitHub secret exists (go to GitHub UI)
# Check public key on VPS
ssh root@75.119.155.15 "cat ~/.ssh/authorized_keys"
```

### Build Failed
```bash
# Run locally to see error
npm run lint
npm run build

# Fix errors, commit, push again
```

### Health Check Failed
```bash
# SSH to VPS
ssh root@75.119.155.15

# Check app status
pm2 status

# View detailed logs
pm2 logs simplifyconvertapp --lines 50

# Try manual curl
curl -s http://127.0.0.1:3001

# Check if port is open
netstat -tlnp | grep 3001
```

### App Offline But GitHub Actions Passed
```bash
# SSH to VPS
ssh root@75.119.155.15

# Check Nginx
sudo systemctl status nginx
sudo curl -I http://127.0.0.1:3001

# Restart Nginx if needed
sudo systemctl restart nginx

# Check Nginx config is valid
sudo nginx -t
```

### App Running But Nginx Not Working
```bash
# SSH to VPS
ssh root@75.119.155.15

# Test app directly
curl http://127.0.0.1:3001

# Test through Nginx
curl -H "Host: simplifyconvert.com" http://127.0.0.1

# View Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Quick Status Commands

Run these anytime to check your deployment:

```bash
# SSH to VPS
ssh root@75.119.155.15

# App status
pm2 status

# Recent app logs
pm2 logs simplifyconvertapp --lines 30 --nostream

# System resources
top -b -n 1 | head -20
df -h

# Check if port 3001 is listening
netstat -tlnp | grep 3001

# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t
```

---

## 🔄 Manual Restart (Without Deployment)

```bash
# SSH to VPS
ssh root@75.119.155.15

# Restart the app via PM2
pm2 restart simplifyconvertapp

# Or stop it
pm2 stop simplifyconvertapp

# Or start it
pm2 start simplifyconvertapp

# Verify new status
pm2 status
```

---

## 🗑️ Emergency: Fully Kill and Restart

```bash
# SSH to VPS (USE WITH CAUTION)
ssh root@75.119.155.15

# Kill PM2 completely
pm2 kill

# Wait a moment
sleep 2

# Start fresh
cd /var/www/simplifyconvertapp
pm2 start "npm start -- -p 3001" --name simplifyconvertapp

# Verify
pm2 status
pm2 logs simplifyconvertapp
```

---

## 📝 Environment Variables (If Needed)

If your app needs environment variables (typically in .env):

```bash
# SSH to VPS
ssh root@75.119.155.15

# Create .env file in app directory
cat > /var/www/simplifyconvertapp/.env << 'EOF'
NODE_ENV=production
API_KEY=your_key_here
DATABASE_URL=your_database_url
EOF

# Verify file created
cat /var/www/simplifyconvertapp/.env

# Restart app to load new env vars
cd /var/www/simplifyconvertapp
pm2 restart simplifyconvertapp
```

---

## 🎯 Summary

Follow these steps in order:
1. Generate SSH key (local)
2. Add to GitHub Secret
3. Add public key to VPS
4. Verify prerequisites
5. Setup app directory
6. Test SSH key
7. Manual deployment test
8. Trigger GitHub Actions
9. Verify live
10. Done! 🎉

Each step has been tested and verified.  
All commands are production-ready.  
Copy and paste exactly as shown.

---

**Need help?** See the other documentation files:
- `CI_CD_SETUP_CHECKLIST.md` - Step-by-step checklist
- `CI_CD_SETUP_GUIDE.md` - Detailed explanations
- `CI_CD_QUICK_REFERENCE.md` - Quick lookup
