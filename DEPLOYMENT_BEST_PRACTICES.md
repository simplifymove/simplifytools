# Deployment Best Practices Guide
**Last Updated:** April 20, 2026  
**Created for:** TinyTools App (Next.js 16.1.6 + Python Backend)

---

## 🚀 GOLDEN RULE
> **NEVER push to VPS without testing locally first**

Never skip local validation. Ever. No exceptions.

---

## ✅ Pre-Deployment Checklist

Use this checklist **EVERY TIME** before pushing code:

### Step 1: Local Code Quality
```bash
# Check for TypeScript errors
npm run lint

# Fix any errors before proceeding
```

### Step 2: Local Build Test
```bash
# Test the build locally
npm run build

# Expected output:
# ✓ Compiled successfully in X.Xs
# (No errors or warnings)
```

### Step 3: Local Runtime Test
```bash
# Start the app locally
npm start

# Open browser and test:
# http://localhost:3000

# Verify:
# ✅ Page loads without errors
# ✅ No 404 errors in console
# ✅ No CSS missing
# ✅ Images load correctly
# ✅ Search functionality works
```

### Step 4: Commit & Push
```bash
# Only after all above pass:
git add .
git commit -m "Your message"
git push origin main
```

### Step 5: VPS Rebuild & Verify
```bash
# On VPS, rebuild the application
npm run build
pm2 stop all
pm2 start all

# Wait 10 seconds for startup
sleep 10

# Verify it's responding
curl http://localhost:3000

# Expected: Valid HTML with <!DOCTYPE
```

### Step 6: Production Test
```bash
# Test the live domain
curl https://simplifytools.com

# Verify:
# ✅ Page loads
# ✅ No 502 Bad Gateway
# ✅ No 404 errors
# ✅ HTTPS working
```

---

## 🔧 Configuration Best Practices

### next.config.ts - REQUIRED SETTINGS

```typescript
// ❌ NEVER USE
experimental: {
  optimizeCss: true,  // Causes phantom CSS hashes
}

// ✅ ALWAYS USE
experimental: {
  optimizeCss: false,  // Safe mode
  turbo: {
    // Turbopack settings
  }
}
```

### Build Commands - USE CORRECT ONE

```bash
# ✅ For development
npm run dev

# ✅ For production build (LOCAL TEST FIRST)
npm run build

# ✅ For starting after build
npm start

# ❌ Never use:
npm install  # Use npm ci instead for production
```

### Deployment Build - RECOMMENDED

```bash
# On VPS production deployment:
npm ci --prefer-offline     # Consistent deps, offline fallback
NODE_ENV=production npm run build   # Production build
pm2 restart all             # Restart with new build
```

---

## 🛡️ Common Failures & Prevention

### Failure 1: TypeScript Errors Slip Through

**Problem:** File compiles locally but fails on VPS

**Prevention:**
```bash
# Before pushing, always run:
npm run lint

# Fix any errors:
npm run lint --fix

# Then verify build:
npm run build
```

### Failure 2: CSS Files Return 404

**Problem:** Old phantom CSS hashes in HTML

**Prevention:**
```bash
# In next.config.ts, ensure:
optimizeCss: false

# If issue persists, nuclear rebuild:
rm -rf .next node_modules/.cache .turbo .swc
npm ci --prefer-offline
NODE_ENV=production npm run build
npm start

# Verify HTML has ONLY valid CSS hashes
curl http://localhost:3000 | grep ".css"
```

### Failure 3: 502 Bad Gateway

**Problem:** Site returns 502 for all requests

**Prevention:**
```bash
# BEFORE any deployment:
npm run build    # Ensure build succeeds locally
npm start        # Ensure it starts and responds

# AFTER VPS deployment:
curl http://localhost:3000  # Don't rely on PM2 status alone

# If 502 persists on VPS:
# 1. Check .next directory exists: ls -la .next/
# 2. Check PM2 logs: pm2 logs
# 3. Rebuild: NODE_ENV=production npm run build
# 4. Restart: pm2 stop all && pm2 start all
```

### Failure 4: Missing Dependencies

**Problem:** App works locally but fails on VPS

**Prevention:**
```bash
# Use npm ci (consistent install) not npm install
npm ci --prefer-offline

# Update package-lock.json after changing packages
npm install --package-lock-only

# Commit package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
```

---

## 📋 Daily Workflow

### Starting Work
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if package.json changed)
npm ci

# 3. Start dev server
npm run dev

# App runs at: http://localhost:3000
```

### Making Changes
```bash
# 1. Edit files as needed
# 2. Test in browser (hot reload works)
# 3. Check console for errors
```

### Before Committing
```bash
# 1. Run linter
npm run lint

# 2. Build production version
npm run build

# 3. Start production server
npm start

# 4. Test at http://localhost:3000
# 5. Stop server (Ctrl+C)
```

### Pushing to VPS
```bash
# 1. Commit changes
git add .
git commit -m "Clear description of changes"

# 2. Push to GitHub
git push origin main

# 3. SSH to VPS
ssh root@75.119.155.15

# 4. Pull on VPS
cd /var/www/simplifytools
git pull origin main

# 5. Rebuild and restart
npm ci --prefer-offline
NODE_ENV=production npm run build
pm2 stop all
pm2 start all

# 6. Verify (wait 10 seconds)
sleep 10
curl http://localhost:3000
```

---

## 🚀 SAFE TERMINAL DEPLOYMENT (Recommended)

This is the best way to deploy - using terminal commands avoids file corruption and keeps configurations safe.

### Why Terminal Deployments Are Safe

- ✅ **Only code changes** - No config files touched
- ✅ **SSL certificates untouched** - /etc/letsencrypt/ never affected
- ✅ **Nginx config safe** - Only used if you manually edit
- ✅ **PM2 settings preserved** - Process manager stays configured
- ✅ **No file timeouts** - Large files don't break during upload
- ✅ **Full control** - See exactly what's happening

### Standard Deployment Command (Fastest)

```bash
# SSH to VPS
ssh root@75.119.155.15

# Navigate to app folder
cd /var/www/tinytools-app

# Deploy in one command (2 minutes)
git pull origin main && npm ci --prefer-offline && NODE_ENV=production npm run build && pm2 restart all

# Done! App is live with new code
```

✅ **What happens:**
- Latest code from GitHub downloaded
- Dependencies installed (only if package-lock.json changed)
- Production build created (fresh .next/ folder)
- PM2 restarts app with new code
- Nginx still works (not touched)
- SSL still works (not touched)

---

### When to Test `127.0.0.1:3001`?

**Test ONLY if something seems broken:**

```bash
# After deployment, if you want to verify (optional)
curl http://127.0.0.1:3001

# Expected: HTML page starting with <!DOCTYPE
```

**When to skip testing:**
- ✅ Build succeeded locally
- ✅ No errors in git pull
- ✅ You trust the deployment

**When you SHOULD test:**
- ❌ PM2 shows "online" but domains not responding
- ❌ You see 502 Bad Gateway on domain
- ❌ CSS or JavaScript not loading

---

### Testing Explained

| Test | What It Checks | When to Use |
|------|---|---|
| `curl http://127.0.0.1:3001` | Is app actually running? | Only troubleshooting |
| `curl https://simplifyconvert.com` | Is Nginx proxying? | If domain not working |
| `pm2 status` | What does PM2 think? | Quick status check |

**Note:** `127.0.0.1:3001` only works **on VPS**, not on your Windows machine.

---

### Ultra-Quick Deployment (3 lines)

For experienced users who know everything works:

```bash
ssh root@75.119.155.15 "cd /var/www/tinytools-app && git pull && npm ci && NODE_ENV=production npm run build && pm2 restart all && echo '✅ Deployed!'"
```

One command from your local machine, done in 2 minutes.

---

### Deployment Checklist

Before running the deployment command:

- [ ] Committed code locally
- [ ] Pushed to GitHub
- [ ] No uncommitted changes (`git status` is clean)
- [ ] Build passed locally (`npm run build` worked)

After deployment:

- [ ] SSH to VPS successful
- [ ] `git pull` completed without errors
- [ ] `npm ci` completed (shows "up to date" or "added X packages")
- [ ] `npm run build` completed successfully
- [ ] `pm2 restart all` shows processes as "online"
- [ ] (Optional) `curl https://simplifyconvert.com` returns HTML

---

### If Deployment Fails

**Build failed?**
```bash
# Check what went wrong
npm run build

# If TypeScript error, fix locally then retry
npm run lint
```

**Git pull failed?**
```bash
# Check git status
git status

# If conflicts, resolve them locally first
```

**PM2 not starting?**
```bash
# Check PM2 logs
pm2 logs

# Restart PM2
pm2 kill
cd /var/www/tinytools-app
pm2 start "npm start -- -p 3001" --name tinytools-app
```

---

### Configuration Safety Reference

| Component | Touched? | Safe? | Notes |
|-----------|----------|-------|-------|
| Code in app/ | ✅ Yes | ✅ Safe | This is what we want |
| .next/ build folder | ✅ Yes | ✅ Safe | Regenerated fresh |
| SSL certificates | ❌ No | ✅ 100% Safe | /etc/letsencrypt untouched |
| Nginx config | ❌ No | ✅ 100% Safe | /etc/nginx untouched |
| PM2 config | ❌ No | ✅ 100% Safe | Process settings stay same |
| Environment vars | ❌ No | ✅ 100% Safe | .env.local untouched |
| System settings | ❌ No | ✅ 100% Safe | OS completely safe |

---

### Pro Tip: Schedule Future Deployments

Save these commands for quick reference:

```bash
# Bookmark this for your next deployment:
ssh root@75.119.155.15 "cd /var/www/tinytools-app && git pull && npm ci && NODE_ENV=production npm run build && pm2 restart all"

# Or create a local script: deploy.sh
#!/bin/bash
ssh root@75.119.155.15 "cd /var/www/tinytools-app && git pull && npm ci && NODE_ENV=production npm run build && pm2 restart all && echo '✅ Deployed!'"

# Run with: bash deploy.sh
```

---

## 🔍 Debugging Commands

### Check Build Status
```bash
# See last 50 lines of PM2 logs
pm2 logs --lines 50

# See logs for specific app
pm2 logs simplifytools

# Real-time monitoring
pm2 monit
```

### Check App Response
```bash
# Test if app is responding
curl http://localhost:3000

# Get HTTP status code only
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Expected: 200 (not 502)
```

### Check Nginx Status
```bash
# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### Check Node Process
```bash
# See all Node processes
ps aux | grep node

# See PM2 status
pm2 status

# See PM2 startup config
pm2 startup

# See PM2 save status
pm2 save
```

### Check Disk Space
```bash
# Ensure enough space for build
df -h

# Clean npm cache if needed
npm cache clean --force
```

---

## 📊 Health Check Procedure

Run this **AFTER every deployment**:

```bash
#!/bin/bash
# Save as: health-check.sh

echo "1. Checking app response..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "✅ App responding with 200"
else
  echo "❌ App responding with $STATUS"
  exit 1
fi

echo "2. Checking CSS files..."
curl -s http://localhost:3000 | grep -o '[a-f0-9]*\.css' | head -5
echo "✅ CSS files present"

echo "3. Checking PM2 status..."
pm2 status

echo "✅ Health check passed!"
```

Run with:
```bash
bash health-check.sh
```

---

## 🚨 Emergency Recovery

### If App Crashes After Deployment

```bash
# 1. Stop everything
pm2 stop all
pkill -9 node

# 2. Check what went wrong
npm run build  # See if build fails

# 3. If build fails, check last commit
git log --oneline -5
git diff HEAD~1  # See what changed

# 4. If needed, revert changes
git revert HEAD
git pull origin main

# 5. Rebuild and restart
npm ci --prefer-offline
NODE_ENV=production npm run build
pm2 start all

# 6. Verify
curl http://localhost:3000
```

---

## 📝 Commit Message Best Practices

```bash
# ✅ GOOD
git commit -m "Fix CSS optimization issue in next.config.ts"
git commit -m "Add validation to AI tools page"
git commit -m "Update dependencies to latest versions"

# ❌ BAD
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

---

## 🔐 Environment Variables

### Local (.env.local)
```bash
# For development/testing
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...
```

### VPS (/var/www/simplifytools/.env.local)
```bash
# For production
NEXT_PUBLIC_API_URL=https://api.simplifytools.com
DATABASE_URL=postgresql://...
NODE_ENV=production
```

**⚠️ IMPORTANT:** Never commit `.env.local` to Git

---

## 📞 Troubleshooting Quick Reference

| Problem | Command to Run |
|---------|---|
| App returns 502 | `curl http://localhost:3000` |
| CSS 404 errors | Check `next.config.ts` for `optimizeCss: true` |
| Build fails | `npm run lint` then `npm run build` |
| PM2 shows online but app not responding | `pm2 logs` to see real errors |
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` |
| Turbopack cache issues | `rm -rf .turbo .swc .next` then rebuild |
| Node modules corrupted | `rm -rf node_modules && npm ci` |

---

## ✨ Quick Command Reference

```bash
# Development
npm run dev          # Start dev server

# Production locally
npm run build        # Build for production
npm start            # Start production server

# Code quality
npm run lint         # Check for errors
npm run lint --fix   # Auto-fix errors

# Dependency management
npm ci               # Install exact versions from lock file
npm install          # Install with latest compatible versions

# VPS deployment
git push origin main                    # Push to GitHub
git pull origin main                    # Pull on VPS
npm ci --prefer-offline                 # Install dependencies
NODE_ENV=production npm run build       # Build
pm2 stop all && pm2 start all           # Restart services

# Verification
curl http://localhost:3000              # Test app response
pm2 status                              # Check PM2 status
pm2 logs                                # View logs
```

---

## 📚 File Locations (VPS)

```
/var/www/simplifytools/          # App root
├── .next/                        # Build output (auto-generated)
├── app/                          # Next.js app folder
├── public/                       # Static files
├── node_modules/                 # Dependencies
├── package.json                  # Dependencies list
├── package-lock.json            # Lock file (COMMIT THIS)
├── next.config.ts               # Next.js config
├── .env.local                    # Environment variables
└── DEPLOYMENT_BEST_PRACTICES.md  # This file!
```

---

## 🎯 Key Takeaways

1. **Test locally FIRST** → Build → Start → Verify browser
2. **Never skip validation** → Lint before committing
3. **Use `npm ci`** → Not `npm install` on VPS
4. **Check real response** → Use `curl`, not just PM2 status
5. **Keep this file open** → Reference during development

---

## 📞 Support Checklist

If something goes wrong, follow this order:

- [ ] Run `npm run build` locally - does it pass?
- [ ] Run `npm start` locally - does it respond?
- [ ] Check VPS build logs - `pm2 logs`
- [ ] Check VPS app response - `curl http://localhost:3000`
- [ ] Check disk space - `df -h`
- [ ] Check Node process - `ps aux | grep node`
- [ ] Look for TypeScript errors - `npm run lint`
- [ ] Check next.config.ts for bad config
- [ ] Nuclear rebuild - `rm -rf .next .turbo && npm ci && npm run build`

---

**Remember:** A few minutes of local testing saves hours of production firefighting.

---

# 🔄 FOLDER RENAME GUIDE: tinytools-app → simplifyconvertapp

This guide will help you rename the project folder from "tinytools-app" to "simplifyconvertapp" on both your local machine and VPS.

## ⚠️ IMPORTANT BEFORE STARTING

- **Backup your work** - Commit any uncommitted changes to Git
- **Stop the app** - Close any running dev servers or PM2 processes
- **Read through completely** - This is a 3-step process (Local → Git → VPS)

---

## STEP 1: Rename Locally (Your Computer)

### 1.1 - Commit Any Pending Changes

```bash
# Check if you have uncommitted changes
git status

# If yes, commit them first
git add .
git commit -m "Work in progress before folder rename"

# Push to GitHub
git push origin main
```

### 1.2 - Stop Local Development Server

```bash
# If you have npm run dev or npm start running, press Ctrl+C to stop it
```

### 1.3 - Rename the Folder

**On Windows (using File Explorer):**
1. Open File Explorer
2. Navigate to: `C:\Users\PC\Raghava\Copilot-works\`
3. Right-click on `tinytools-app` folder
4. Select "Rename"
5. Change to: `simplifyconvertapp`
6. Press Enter

**Or using PowerShell:**
```powershell
# Navigate to parent directory
cd i:\Raghava\Copilot-works

# Rename the folder
Rename-Item -Path "tinytools-app" -NewName "simplifyconvertapp"

# Verify it worked
ls | grep simplifyconvertapp
```

### 1.4 - Navigate to New Folder

```powershell
# Go into the renamed folder
cd i:\Raghava\Copilot-works\simplifyconvertapp

# Verify Git still works
git status
```

Expected output:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

### 1.5 - Test Everything Still Works

```bash
# Install dependencies
npm ci

# Build locally
npm run build

# Start development server
npm start

# Open browser to http://localhost:3000
# Verify the app loads correctly

# If it works, press Ctrl+C to stop the server
```

✅ **Local rename complete!**

---

## STEP 2: Update Git (Push to GitHub)

Even though the folder is renamed locally, Git doesn't track folder names directly. We need to commit to make Git aware of the change.

### 2.1 - Check Git Status

```bash
# Git might show a lot of "deleted" and "added" files
git status

# This is normal - Git is tracking the rename
```

### 2.2 - Commit the Rename

```bash
# Stage all changes (the rename)
git add -A

# Commit with a clear message
git commit -m "chore: rename project folder from tinytools-app to simplifyconvertapp"

# Push to GitHub
git push origin main
```

Expected output after push:
```
To https://github.com/simplifymove/simplifytools.git
   abc1234..def5678  main -> main
```

✅ **Git update complete!**

---

## STEP 3: Update VPS (Production Server)

This is the most important step. You need to update the VPS to use the new folder name.

### 3.1 - Connect to VPS

```bash
ssh root@75.119.155.15
```

### 3.2 - Create New Folder with New Name

```bash
# Create the new folder
mkdir -p /var/www/simplifyconvertapp

# Verify it was created
ls -la /var/www | grep simplifyconvertapp
```

### 3.3 - Copy Everything to New Folder

```bash
# Copy all files from old folder to new folder
cp -r /var/www/tinytools-app/* /var/www/simplifyconvertapp/

# Verify copy was successful
ls -la /var/www/simplifyconvertapp | head -20
```

Expected to see: app/, public/, package.json, etc.

### 3.4 - Update Git on VPS

```bash
# Go to the new folder
cd /var/www/simplifyconvertapp

# Pull the latest changes (includes the folder rename)
git pull origin main

# Verify the pull succeeded
git status
```

Expected:
```
On branch main
Your branch is up to date with 'origin/main'.
```

### 3.5 - Update PM2 Process

**Option A: Using PM2 Save/Restore**

```bash
# Delete old PM2 process
pm2 delete tinytools-app

# Stop all processes temporarily
pm2 stop all

# Go to new folder
cd /var/www/simplifyconvertapp

# Install dependencies
npm ci --prefer-offline

# Start new process with same name
pm2 start "npm start -- -p 3001" --name "tinytools-app"

# Save PM2 state
pm2 save

# Restart all
pm2 start all

# Verify it's running
pm2 status
```

Expected: See `tinytools-app` as "online"

**Option B: Manual Process Update**

```bash
# Show current PM2 processes
pm2 status

# Edit ecosystem file (if you have one)
pm2 restart tinytools-app

# Verify
pm2 logs
```

### 3.6 - Update Nginx (If Needed)

The Nginx config should NOT need changes since it points to a port (3001), not a folder. But verify it's still working:

```bash
# Check if Nginx config is still correct
cat /etc/nginx/sites-available/simplifyconvert.com | grep proxy_pass

# Should show: proxy_pass http://127.0.0.1:3001;

# Reload Nginx just to be safe
nginx -t
systemctl reload nginx
```

### 3.7 - Verify App is Running

```bash
# Test local app response
curl http://127.0.0.1:3001

# Expected: HTML starting with <!DOCTYPE

# Test from domain
curl -s https://simplifyconvert.com | head -20

# Expected: Full page HTML, no 502 error
```

### 3.8 - Clean Up Old Folder (OPTIONAL)

```bash
# Only do this AFTER verifying new folder works!

# Backup old folder just in case
mv /var/www/tinytools-app /var/www/tinytools-app.backup

# Or remove entirely (CAREFUL!)
rm -rf /var/www/tinytools-app
```

✅ **VPS update complete!**

---

## 🎯 Verification Checklist

After completing all 3 steps, verify everything works:

**Local Machine:**
- [ ] Folder is renamed to `simplifyconvertapp`
- [ ] `git status` shows clean
- [ ] `npm run build` succeeds
- [ ] `npm start` runs without errors
- [ ] Browser at localhost:3000 loads page

**GitHub:**
- [ ] Latest commit mentions "folder rename"
- [ ] Repository shows updated code

**VPS (Production):**
- [ ] `curl http://127.0.0.1:3001` returns 200
- [ ] `curl https://simplifyconvert.com` returns 200
- [ ] PM2 status shows process as "online"
- [ ] No 502 Bad Gateway errors
- [ ] Page loads with all CSS/images

**All Checks Passed:** ✅ Rename is complete and verified!

---

## 🆘 If Something Goes Wrong

### Problem: Git push failed after rename

**Solution:**
```bash
# Go back to renamed folder
cd i:\Raghava\Copilot-works\simplifyconvertapp

# Check what Git sees
git status

# Try adding and committing again
git add -A
git commit -m "chore: retry folder rename commit"
git push origin main
```

### Problem: App not running on VPS after rename

**Solution:**
```bash
# SSH to VPS
ssh root@75.119.155.15

# Check PM2 status
pm2 status

# Check logs
pm2 logs

# If not running, rebuild
cd /var/www/simplifyconvertapp
npm ci --prefer-offline
NODE_ENV=production npm run build
pm2 restart all

# Verify
curl http://127.0.0.1:3001
```

### Problem: Get 502 Bad Gateway on domain

**Solution:**
```bash
# SSH to VPS
ssh root@75.119.155.15

# Check if app is listening on port 3001
ss -tulpn | grep 3001

# Check Nginx error logs
tail -20 /var/log/nginx/error.log

# Verify Nginx points to correct port
cat /etc/nginx/sites-available/simplifyconvert.com | grep proxy_pass

# Should show: proxy_pass http://127.0.0.1:3001;
```

### Problem: "Old folder still exists"

**Solution:**
```bash
# On VPS, check what folders exist
ls -la /var/www/

# If both exist, verify new one is working
curl http://127.0.0.1:3001  # Should work

# Then safely delete old one
rm -rf /var/www/tinytools-app
```

---

## 📝 Summary

| Step | What to Do | Takes |
|------|-----------|-------|
| 1 | Rename local folder | 5 min |
| 2 | Commit & push to GitHub | 2 min |
| 3 | Update VPS folder & config | 10 min |
| 4 | Verify everything | 5 min |
| **Total** | **Complete project rename** | **~22 min** |

---

Good luck! 🚀
