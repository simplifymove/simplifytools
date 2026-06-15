# CI/CD Quick Reference

## 🔴 What Was Wrong

| Issue | Impact | Fix |
|-------|--------|-----|
| App running on port 3000 | Health check failed, Nginx couldn't proxy | Now runs on 3001 |
| No PM2 process manager | App crashed on restart | Uses `pm2 restart` |
| Wrong health check port | Deployment falsely reported success | Checks 3001 correctly |
| 3-second wait time | App still starting when health check runs | Now retries 30x over 60s |
| No build validation | Bad builds deployed | Builds locally first |
| Unsafe process kill | Could lose data, corrupt state | Uses PM2 graceful restart |

---

## ✅ What's Now Fixed

### Workflow Files (`.github/workflows/`)

1. **deploy-vps.yml** ⭐
   - Build locally with full validation
   - Deploy only if build succeeds
   - Uses PM2 for process management
   - Health checks with retries (30 attempts)
   - Proper error handling and logs

2. **test.yml** 🆕
   - Runs on all branches
   - Lints code
   - Builds and type-checks
   - Monitors build size

3. **rollback.yml** 🆕
   - Manual emergency controls
   - Restart/stop/status app without new deployment
   - Useful for quick fixes

---

## 📋 What You Need To Do (5 Minutes)

### Step 1: GitHub Secrets (2 minutes)
```
Go to GitHub → Settings → Secrets and Variables → Actions
Create new secret named: VPS_SSH_KEY
Paste your SSH private key (without passphrase recommended)
```

If you don't have an SSH key:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/vps_deploy_key -N ""
cat ~/.ssh/vps_deploy_key  # Copy this to GitHub Secret
```

### Step 2: VPS Verification (2 minutes)
SSH to your VPS and verify:
```bash
ssh root@75.119.155.15

# Check these exist:
node --version        # Should be 18+
npm --version
pm2 --version

# If PM2 missing, install:
sudo npm install -g pm2
```

### Step 3: Manual Test Deploy (1 minute)
```bash
# SSH to VPS
cd /var/www/simplifyconvertapp
npm ci --production
npm run build

# Start with PM2
pm2 start "npm start -- -p 3001" --name simplifyconvertapp
pm2 logs simplifyconvertapp  # Should see app running
```

### Step 4: Push to Main
```bash
git add .
git commit -m "chore: update CI/CD pipeline"
git push origin main
```

Then go to GitHub → Actions and watch it deploy! 🚀

---

## 🆘 If Deployment Still Fails

### 1. Check GitHub Actions Logs
Go to **Actions** → **Deploy to VPS** → Latest run
Look for red ❌ steps and error messages

### 2. Check VPS
```bash
ssh root@75.119.155.15

# Is app running?
pm2 status

# View logs
pm2 logs simplifyconvertapp --lines 50

# Check port
netstat -tlnp | grep 3001

# Try manual curl
curl -s http://127.0.0.1:3001 | head -20
```

### 3. Common Issues

| Error | Fix |
|-------|-----|
| `SSH connection failed` | Check SSH key in GitHub Secrets |
| `Build failed` | Run `npm run build` locally to find error |
| `Health check failed` | SSH to VPS, check `pm2 logs` |
| `Git pull failed` | Verify git repo is initialized: `git clone <repo> .` |
| `npm ci failed` | Check Node version `node --version` |

---

## 📊 Deployment Flow

```
Push to main
    ↓
✅ Build Job (GitHub)
    ├─ Checkout code
    ├─ Install dependencies
    ├─ Run linter
    ├─ Build app
    └─ Verify .next exists
    ↓
✅ Deploy Job (VPS)
    ├─ SSH to 75.119.155.15
    ├─ Pull latest code
    ├─ npm ci --production
    ├─ npm run build
    ├─ PM2 restart
    ├─ Health check (30 retries)
    └─ Report status
    ↓
✅ Running on https://simplifyconvert.com
```

---

## 🎮 Manual Controls

### In GitHub Actions UI:

1. **Restart without deployment**
   - Go to **Actions** → **Emergency Rollback**
   - Run workflow with `restart`
   - App restarts in ~5 seconds

2. **Stop app**
   - Go to **Actions** → **Emergency Rollback**
   - Run workflow with `stop`
   - Access Nginx but app offline

3. **Check status**
   - Go to **Actions** → **Emergency Rollback**
   - Run workflow with `status`
   - View live PM2 logs

---

## 📞 Files to Reference

- **CI_CD_SETUP_GUIDE.md** - Detailed setup with troubleshooting
- **.github/workflows/deploy-vps.yml** - Main deployment workflow
- **.github/workflows/test.yml** - Validation workflow
- **.github/workflows/rollback.yml** - Emergency controls

---

## ✨ You're All Set!

Your CI/CD is now:
- ✅ Automated (runs on every push to main)
- ✅ Validated (builds locally first)
- ✅ Safe (PM2 process management)
- ✅ Reliable (health checks with retries)
- ✅ Controllable (manual rollback)

Just add the SSH key secret and deploy! 🚀
