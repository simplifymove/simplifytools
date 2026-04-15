# VPS Deployment - Quick Reference Card

## One-Time Setup (First Time Only)

### 1. Install Paramiko library
```bash
pip install paramiko
```

### 2. Clone/update repository
```bash
git clone https://github.com/simplifymove/simplifytools.git
# OR update existing:
git pull origin main
```

### 3. Copy deployment scripts
```bash
# Copy these files to your project root:
- simple-deploy.py
- VPS_DEPLOYMENT_GUIDE.md
```

---

## Standard Workflow (Every Deployment)

### Step 1: Make Code Changes
```bash
# Work on your features locally
# Test with: npm run dev
```

### Step 2: Commit & Push to GitHub
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Step 3: Deploy to VPS
```bash
python simple-deploy.py
```

That's it! The script handles:
- ✅ Connecting to VPS
- ✅ Pulling latest code from GitHub
- ✅ Installing dependencies
- ✅ Building the application
- ✅ Restarting the service
- ✅ Verifying it's online

---

## Common Commands

```bash
# Check deployment status during build
python simple-deploy.py

# For other development systems - same steps work everywhere!
# Just ensure paramiko is installed: pip install paramiko
```

---

## VPS Access (If Needed)

### SSH into VPS directly
```bash
ssh root@75.119.155.15
```

### Check application status
```bash
pm2 status
pm2 logs simplifytools
pm2 restart simplifytools
```

### Check system health
```bash
df -h                  # Disk space
free -h                # Memory
top                    # Running processes
```

---

## What the Script Does (Behind the Scenes)

```
Step 1: 🔌 Connect to VPS via SSH
        ↓
Step 2: 📥 Pull latest code from GitHub
        ↓
Step 3: 📦 Install npm dependencies
        ↓
Step 4: 🔨 Build Next.js application (2-5 min)
        ↓
Step 5: 🚀 Restart PM2 service
        ↓
Step 6: ✅ Verify service is online
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Connection refused" | Check VPS credentials, network, firewall |
| "git pull failed" | Verify GitHub repo access from VPS |
| "npm install error" | Check disk space: `df -h` |
| "Build failed" | Check Node/npm versions, try `npm clean-install` |
| "Service won't restart" | Check logs: `pm2 logs simplifytools` |

---

## Files in This Repository

```
tinytools-app/
├── simple-deploy.py              ← Use this to deploy
├── VPS_DEPLOYMENT_GUIDE.md       ← Full documentation
├── app/
├── package.json
├── tsconfig.json
└── ... (app files)
```

---

## Production URLs

- **Main site**: https://www.simplifyconvert.com
- **All tools**: https://www.simplifyconvert.com/all-tools
- **Specific tool**: https://www.simplifyconvert.com/all-tools/[tool-name]

---

## For Multiple Development Systems

Send this folder + files to another developer:
1. `simple-deploy.py` - Deployment script
2. `VPS_DEPLOYMENT_GUIDE.md` - Full docs
3. This file - Quick reference

They use the exact same VPS credentials and process.

---

## Timeline

- **Local testing**: 5-10 minutes
- **Code commit**: 1 minute  
- **Deployment**: 5-10 minutes total
  - Connect: 1-2 seconds
  - Git pull: 5-10 seconds
  - Dependencies: 10-20 seconds
  - Build: 2-5 minutes ⏱️
  - Restart: 10-30 seconds

---

## Getting Help

If something goes wrong:
1. Read the error message from `simple-deploy.py`
2. Check VPS logs: `pm2 logs simplifytools`
3. Verify code was pushed: `git log` or check GitHub
4. Check system resources: `df -h` (disk) and `free -h` (memory)

---

**Last Updated**: April 15, 2026
**Framework**: Next.js 16.1.6 with Turbopack
**Hosting**: Contabo VPS (75.119.155.15)
