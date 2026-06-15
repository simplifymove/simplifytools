# CI/CD Pipeline Setup Guide

## Overview

Your GitHub Actions CI/CD pipeline is now configured for automated deployment to your VPS. This guide explains what you need to do to make it work.

---

## 🔐 Step 1: Setup GitHub Secrets

The workflow needs your VPS SSH key to authenticate. Follow these steps:

### A. On Your Local Machine

1. **Generate SSH key pair** (if you don't have one):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/vps_deploy_key -N ""
```

2. **Copy the private key**:
```bash
cat ~/.ssh/vps_deploy_key | pbcopy  # macOS
cat ~/.ssh/vps_deploy_key | xclip    # Linux
type %USERPROFILE%\.ssh\vps_deploy_key | clip  # Windows PowerShell
```

### B. In GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and Variables** → **Actions**
3. Click **New repository secret**
4. Name: `VPS_SSH_KEY`
5. Paste the **private key** you copied above
6. Click **Add secret**

### C. On Your VPS

Add the public key to authorized_keys:

```bash
# On your VPS (SSH as root)
mkdir -p ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Get your public key:
```bash
cat ~/.ssh/vps_deploy_key.pub  # From your local machine
```

---

## ✅ Step 2: Verify VPS Prerequisites

The workflow assumes the following on your VPS:

### Requirements Checklist

```bash
# SSH into your VPS
ssh root@75.119.155.15

# 1. Check Node.js version (should be 18+)
node --version

# 2. Check npm version
npm --version

# 3. Check PM2 is installed
pm2 --version

# 4. Check app directory exists
ls -la /var/www/simplifyconvertapp/

# 5. Check git is configured
git --version

# 6. Verify PM2 can start the app
cd /var/www/simplifyconvertapp
pm2 list
```

### If Any Are Missing

```bash
# Install Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory if it doesn't exist
sudo mkdir -p /var/www/simplifyconvertapp
sudo chown -R root:root /var/www/simplifyconvertapp

# Initialize git repository if needed
cd /var/www/simplifyconvertapp
git init
git remote add origin https://github.com/YOUR_USERNAME/simplifytools.git
```

---

## 🚀 Step 3: Initial Manual Deployment

Before relying on CI/CD, do one manual deployment to ensure everything works:

```bash
# SSH to VPS
ssh root@75.119.155.15

# Navigate to app directory
cd /var/www/simplifyconvertapp

# Clone repository (first time only)
git clone https://github.com/YOUR_USERNAME/simplifytools.git .

# Install dependencies
npm ci --production

# Build
npm run build

# Start with PM2
pm2 start "npm start -- -p 3001" --name simplifyconvertapp
pm2 startup
pm2 save

# Test the app
curl -s http://127.0.0.1:3001 | head -20

# Check PM2 logs
pm2 logs simplifyconvertapp --lines 20
```

---

## 📋 Step 4: Configure Deployment Repository

Ensure your repository is set up correctly:

### A. Repository Structure
```
your-repo/
├── .github/
│   └── workflows/
│       ├── deploy-vps.yml      ✅ Deployment workflow
│       └── test.yml             ✅ Testing workflow
├── app/
├── package.json
├── next.config.js
└── tsconfig.json
```

### B. Git Configuration
```bash
# Ensure .next and node_modules are in .gitignore
git config core.ignorecase false

# Add to .gitignore if not present
cat >> .gitignore << EOF
.next/
node_modules/
.env
.env.local
.DS_Store
EOF
```

---

## 🔄 Step 5: How the CI/CD Pipeline Works

### On Every Push to `main`:

1. **Build Job** (runs locally in GitHub)
   - Checks out code
   - Installs dependencies
   - Runs linter
   - Builds application
   - Verifies `.next` directory exists

2. **Deploy Job** (only if Build succeeds)
   - SSHes to your VPS
   - Pulls latest code from GitHub
   - Installs production dependencies
   - Builds the Next.js app
   - Restarts application with PM2
   - Performs health check (tries 30 times)
   - Verifies Nginx proxy is working

### Manual Trigger:
Go to **Actions** → **Deploy to VPS** → **Run workflow**

---

## 🐛 Troubleshooting

### Issue: "SSH connection failed"

**Check:**
```bash
# SSH key permissions
ls -la ~/.ssh/
# Should show: -rw------- (600)

# Test SSH manually
ssh -i ~/.ssh/vps_deploy_key root@75.119.155.15 "echo OK"
```

### Issue: "Build failed"

**Check logs:**
- Go to GitHub Actions in your repository
- Click the failed deployment
- Expand the "Build application" step
- Look for specific error messages

**Common causes:**
- Missing dependencies: `npm ci` failed
- TypeScript errors: Run `npm run lint` locally
- Disk space full on VPS: `df -h` on VPS

### Issue: "Health check failed"

**Check VPS:**
```bash
# SSH to VPS
ssh root@75.119.155.15

# Check if app is running
pm2 list

# Check logs
pm2 logs simplifyconvertapp --lines 50

# Verify port
netstat -tlnp | grep 3001

# Test manually
curl -s http://127.0.0.1:3001 | head -20
```

### Issue: "PM2 restart failed"

**On VPS:**
```bash
# Start fresh
pm2 kill
pm2 start "npm start -- -p 3001" --name simplifyconvertapp --cwd /var/www/simplifyconvertapp

# Verify
pm2 logs simplifyconvertapp
```

---

## 📊 Monitoring Deployment

### View Logs:
1. Go to **GitHub** → Your Repository → **Actions**
2. Click latest deployment
3. View step outputs in real-time

### Check VPS Status:
```bash
ssh root@75.119.155.15

# Application status
pm2 status

# View live logs
pm2 logs simplifyconvertapp

# System resources
top
df -h
free -h
```

---

## 🔒 Security Best Practices

1. **SSH Key Security**
   - Never commit private keys to repository
   - Use dedicated deploy keys (not personal keys)
   - Rotate keys periodically

2. **Secrets Management**
   - Store SSH key as GitHub Secret only
   - Don't hardcode credentials in workflows
   - Use environment variables for sensitive data

3. **Access Control**
   - Limit SSH key permissions to necessary IP ranges
   - Use firewall rules on VPS
   - Monitor GitHub Actions logs for suspicious activity

---

## 🎯 Next Steps

1. ✅ Add `VPS_SSH_KEY` secret to GitHub
2. ✅ Verify VPS prerequisites
3. ✅ Do initial manual deployment
4. ✅ Push a test commit to `main` branch
5. ✅ Monitor first automated deployment in GitHub Actions

---

## 📞 Support

If deployment fails:

1. Check the **GitHub Actions logs** (most detailed)
2. Check **VPS logs** with `pm2 logs simplifyconvertapp`
3. Verify **SSH access** works manually
4. Ensure **all secrets are configured** correctly

---

**Last Updated:** April 23, 2026
**Workflow Version:** 2.0
**VPS Configuration:** Ubuntu, Nginx, PM2, Node.js 20+
