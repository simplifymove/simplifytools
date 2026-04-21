# TinyTools App - VPS Deployment Documentation
**Created:** April 21, 2026  
**VPS IP:** 75.119.155.15  
**Domains:** simplifyconvert.com, www.simplifyconvert.com

---

## DEPLOYMENT OVERVIEW

### Architecture
```
Internet Users
      ↓
  HTTPS (443)
      ↓
Nginx (Reverse Proxy)
      ↓
  HTTP (127.0.0.1:3001)
      ↓
PM2 → Node.js/Next.js App
      ↓
/var/www/tinytools-app
```

### Core Infrastructure

| Component | Details |
|-----------|---------|
| **Application** | Next.js 16.2.4 (Node.js React Framework) |
| **App Location** | `/var/www/tinytools-app/` |
| **Port** | 3001 (internal, localhost only) |
| **Process Manager** | PM2 v5+ |
| **Web Server** | Nginx 1.24.0 |
| **SSL** | Let's Encrypt (TLSv1.2/1.3) |
| **SSL Expiry** | July 19, 2026 |
| **Domains** | simplifyconvert.com, www.simplifyconvert.com |

---

## CRITICAL FILES

### 1. Nginx Configuration (PRIMARY - SINGLE FILE)
**File:** `/etc/nginx/sites-available/simplifyconvert.com`  
**Symlink:** `/etc/nginx/sites-enabled/simplifyconvert.com`  

**What it does:**
- Listen on port 80 (HTTP) → Redirect to 443 (HTTPS)
- Listen on port 443 (HTTPS) with SSL/TLS certificates
- Proxy all requests to http://127.0.0.1:3001
- Handle both simplifyconvert.com and www.simplifyconvert.com

**Key Configuration:**
```
proxy_pass http://127.0.0.1:3001;
ssl_certificate /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem;
```

### 2. Application Directory
**Location:** `/var/www/tinytools-app/`

**Key subdirectories:**
- `app/` - Next.js application code
- `app/page.tsx` - Main page with tool grid
- `app/data/tools.ts` - Tool definitions (100+ tools)
- `app/components/` - React components
- `.next/` - Production build output (created by `npm run build`)
- `node_modules/` - Dependencies (510 packages)
- `package.json` - Dependencies and scripts

**Important:** `.next/` and `node_modules/` are built, not committed

### 3. PM2 Configuration
**Process Name:** `tinytools-app`  
**Command:** `npm start -- -p 3001`  
**Working Directory:** `/var/www/tinytools-app`  
**Logs:** `/root/.pm2/logs/tinytools-app-out.log`  
**Logs:** `/root/.pm2/logs/tinytools-app-error.log`

### 4. SSL Certificates
**Certificate Location:** `/etc/letsencrypt/live/www.simplifyconvert.com/`

**Files:**
- `fullchain.pem` - Full certificate chain (used by nginx)
- `privkey.pem` - Private key (used by nginx)
- `cert.pem` - Certificate only
- `chain.pem` - Intermediate certificates

**Expiry:** July 19, 2026 (auto-renewal via certbot)

### 5. Log Files

| Log File | Purpose |
|----------|---------|
| `/var/log/nginx/tinytools-access.log` | HTTP requests (200, 404, 500 etc) |
| `/var/log/nginx/tinytools-error.log` | Nginx errors (upstream issues, config) |
| `/var/log/nginx/error.log` | All nginx errors (catch-all) |
| `/root/.pm2/logs/tinytools-app-out.log` | App stdout (console.log) |
| `/root/.pm2/logs/tinytools-app-error.log` | App stderr (errors, exceptions) |

---

## COMMON OPERATIONS

### View Application Status
```bash
# SSH into server
ssh root@75.119.155.15

# Check if app is running
pm2 status

# View live logs
pm2 logs tinytools-app

# View last 50 lines
pm2 logs tinytools-app --lines 50
```

### Restart Application
```bash
# Gentle restart (waits for connections to close)
pm2 restart tinytools-app

# Force kill and restart
pm2 kill && sleep 2 && cd /var/www/tinytools-app && pm2 start 'npm start -- -p 3001' --name tinytools-app

# Restart nginx
systemctl restart nginx
```

### Rebuild Application (after code changes)
```bash
cd /var/www/tinytools-app
npm run build
pm2 restart tinytools-app
```

### Check Port 3001
```bash
# Is something listening on 3001?
ss -tulpn | grep 3001

# Test connection to app
curl -v http://127.0.0.1:3001

# Check for port conflicts
lsof -i :3001
```

### Verify Nginx Configuration
```bash
# Syntax check (must show "test successful")
nginx -t

# Reload after config changes
systemctl reload nginx

# Check active config
nginx -T | grep proxy_pass
```

### Monitor Logs in Real-Time
```bash
# Application logs
tail -f /root/.pm2/logs/tinytools-app-out.log

# Nginx errors
tail -f /var/log/nginx/error.log

# Combined monitoring (new terminal)
watch -n 1 'pm2 status && echo "---" && ss -tulpn | grep 3001'
```

---

## TROUBLESHOOTING GUIDE

### Symptom: Website returns 502 Bad Gateway
**Root Cause Checklist:**
1. Is PM2 process running? → `pm2 status` should show `online`
2. Is app listening on 3001? → `ss -tulpn | grep 3001` should show listening socket
3. Is nginx config pointing to 3001? → `grep -r proxy_pass /etc/nginx/sites-enabled/`
4. Are there duplicate config files? → `ls -la /etc/nginx/sites-available/`

**Fix Steps:**
```bash
# 1. Check app logs
tail -50 /root/.pm2/logs/tinytools-app-error.log

# 2. Check nginx logs
tail -50 /var/log/nginx/error.log

# 3. Verify port
ss -tulpn | grep 3001

# 4. Restart app
pm2 restart tinytools-app

# 5. Check nginx config
nginx -t

# 6. Reload nginx
systemctl reload nginx
```

### Symptom: Only base domain works, www doesn't
**Root Cause:** Duplicate/mismatched nginx config files  

**Fix:**
```bash
# Check for duplicate configs
ls -la /etc/nginx/sites-available/ | grep simplifyconvert

# Should ONLY see: simplifyconvert.com
# Should NOT see: www.simplifyconvert.com or simplifyconvert.com.old

# If you see old files, remove them
rm -f /etc/nginx/sites-available/www.simplifyconvert.com
rm -f /etc/nginx/sites-enabled/www.simplifyconvert.com

# Remove stale symlinks
unlink /etc/nginx/sites-enabled/www.simplifyconvert.com 2>/dev/null || true

# Verify fix
nginx -t && systemctl reload nginx
```

### Symptom: Application won't start / Port 3001 EADDRINUSE
**Root Cause:** Another process using port 3001 or IPv6 dual-stack conflict  

**Fix:**
```bash
# Kill all PM2 processes
pm2 kill

# Check if port is free
ss -tulpn | grep 3001

# If still in use, force kill
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Start fresh
cd /var/www/tinytools-app
pm2 start 'npm start -- -p 3001' --name tinytools-app

# Verify
sleep 2 && curl -v http://127.0.0.1:3001 | head -20
```

### Symptom: SSL certificate errors / HTTPS not working
**Root Cause:** Certificate expired, missing, or nginx config incorrect  

**Check Certificate:**
```bash
# View certificate info
openssl x509 -in /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem -text -noout

# Check expiry
openssl x509 -in /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem -noout -dates

# Verify cert is valid
openssl s_client -connect simplifyconvert.com:443
```

**Renew Certificate (if needed):**
```bash
# Certbot auto-renews, but you can force it
certbot renew --force-renewal

# Verify nginx has correct cert path
grep ssl_certificate /etc/nginx/sites-enabled/simplifyconvert.com
```

### Symptom: High CPU / Memory usage
**Check Process:**
```bash
# View detailed PM2 info
pm2 monit

# View memory usage
pm2 status

# Check system resources
free -h
top -b -n 1 | head -15
```

**Troubleshoot:**
```bash
# Check for memory leaks (restart app if memory grows)
pm2 restart tinytools-app

# Monitor for 5 minutes
pm2 logs tinytools-app --lines 100

# If issue persists, check nginx config for misconfigurations
nginx -T | grep -A 10 location
```

---

## DEPLOYMENT CHECKLIST (DAILY)

**Every morning, verify:**
- [ ] Both domains responding: `curl -I https://simplifyconvert.com && curl -I https://www.simplifyconvert.com`
- [ ] PM2 process online: `pm2 status` (should show `online`)
- [ ] No error logs: `tail -5 /var/log/nginx/error.log`
- [ ] Port 3001 listening: `ss -tulpn | grep 3001`
- [ ] Memory usage healthy: `free -h`

**Weekly maintenance:**
- [ ] Review application logs: `pm2 logs tinytools-app --lines 500`
- [ ] Check disk space: `df -h`
- [ ] Verify SSL certificate: `openssl x509 -noout -dates -in /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem`
- [ ] Check for updates: `npm outdated` (from app directory)

**Monthly tasks:**
- [ ] Backup configuration files to local machine
- [ ] Review SSL certificate expiry (should be Jul 19, 2026)
- [ ] Update dependencies if needed: `npm update`
- [ ] Clean up old PM2 logs: `pm2 flush`

---

## BACKUP & RESTORE

### Backup Current Setup
```bash
# SSH to server and backup
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p /var/backups/tinytools-$BACKUP_DATE

# Backup nginx configs
cp -r /etc/nginx/sites-available /var/backups/tinytools-$BACKUP_DATE/
cp -r /etc/nginx/sites-enabled /var/backups/tinytools-$BACKUP_DATE/

# Backup SSL certificates
cp -r /etc/letsencrypt/live/www.simplifyconvert.com /var/backups/tinytools-$BACKUP_DATE/

# Backup app directory (optional, large)
tar czf /var/backups/tinytools-$BACKUP_DATE/app.tar.gz /var/www/tinytools-app/

# List backups
ls -lh /var/backups/tinytools-$BACKUP_DATE/
```

### Restore from Backup
```bash
# Restore nginx configs
cp /var/backups/tinytools-DATE/sites-available/* /etc/nginx/sites-available/
cp /var/backups/tinytools-DATE/sites-enabled/* /etc/nginx/sites-enabled/

# Validate and reload
nginx -t
systemctl reload nginx

# Restart app
pm2 restart tinytools-app
```

---

## IMPORTANT REMINDERS

### ⚠️ DO NOT
- Delete `/etc/nginx/sites-available/simplifyconvert.com` (main config)
- Create duplicate config files for same domain
- Mix port numbers (must be 3001 everywhere)
- Stop PM2 without knowing how to restart it
- Modify nginx config without testing (`nginx -t`)

### ✓ DO
- Keep single nginx config per domain
- Test before deploying (`nginx -t`)
- Monitor logs regularly
- Keep backups in multiple locations
- Document any manual changes
- Review logs after any changes

---

## QUICK REFERENCE

```bash
# Status Check (one command)
pm2 status && echo "---" && ss -tulpn | grep 3001 && echo "---" && curl -I https://simplifyconvert.com

# Full Restart
pm2 kill && sleep 2 && cd /var/www/tinytools-app && npm install && npm run build && pm2 start 'npm start -- -p 3001' --name tinytools-app

# Emergency Reset (use only if stuck)
pm2 kill
systemctl stop nginx
systemctl start nginx
cd /var/www/tinytools-app
pm2 start 'npm start -- -p 3001' --name tinytools-app

# Verify All
curl -Is https://simplifyconvert.com | head -1 && curl -Is https://www.simplifyconvert.com | head -1
```

---

## SUPPORT CONTACTS

- **SSL Expiry:** Jul 19, 2026 (monitored by certbot)
- **Domain Registrar:** Check your domain provider
- **VPS Provider:** 75.119.155.15 provider support
- **Application:** Next.js v16+ docs at https://nextjs.org/docs

---

**Last Updated:** April 21, 2026  
**Next Review:** May 21, 2026
