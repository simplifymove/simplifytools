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

Good luck! 🚀
