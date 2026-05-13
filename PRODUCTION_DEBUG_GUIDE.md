# Production Debug Guide - Trim Video Issue

## Issue Summary
- **URL**: `https://simplifyconvert.com/all-tools/video/trim-video`
- **Error**: "Processing Failed - Network connection error"
- **Local**: Works fine
- **Production**: Fails silently
- **Email**: No error email received

## Root Causes to Check

### 1. FFmpeg Installation (CRITICAL)
```bash
which ffmpeg
ffmpeg -version
which ffprobe
ffprobe -version
```

**If missing:**
```bash
sudo apt update
sudo apt install -y ffmpeg
```

### 2. SMTP Configuration (CRITICAL)
```bash
printenv | grep SMTP
```

Required variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_SECURE`
- `SMTP_FROM_EMAIL`

If missing, add to `.env.production`:
```
SMTP_HOST=your-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@simplifyconvert.com
```

### 3. Check Application Logs
```bash
# If using PM2:
pm2 logs simplifyconvert --lines 100

# If using systemd:
journalctl -u simplifyconvert -n 100 -f

# Or check Next.js output directly:
tail -f /var/www/simplifyconvert/.next/logs
```

### 4. Check Nginx Upload Limit
```bash
cat /etc/nginx/nginx.conf | grep client_max_body_size
```

Should be at least 500M:
```nginx
client_max_body_size 500M;
```

If not set, add to `/etc/nginx/nginx.conf` in http block:
```
http {
    client_max_body_size 500M;
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Check Python Environment
```bash
which python3
python3 --version
/var/www/simplifyconvert/venv/bin/python --version
/var/www/simplifyconvert/venv/bin/python -c "import sys; print(sys.path)"
```

### 6. Test Video File Exists
```bash
ls -la /tmp/ | grep -E "^-.*\.(mp4|mov|avi|mkv)"
```

### 7. Check Disk Space
```bash
df -h
du -sh /var/www/simplifyconvert/tmp/
```

### 8. Run Test Command
```bash
cd /var/www/simplifyconvert
/var/www/simplifyconvert/venv/bin/python python/media_router.py edit trim-video /tmp/test_video.mp4 '{"startTime":"00:00","endTime":"00:05"}'
```

## Expected vs Actual

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| FFmpeg installed | Yes | ? | [ ] |
| FFprobe installed | Yes | ? | [ ] |
| SMTP_HOST | Configured | ? | [ ] |
| SMTP_PORT | 587 or 465 | ? | [ ] |
| SMTP_USER | Configured | ? | [ ] |
| SMTP_PASSWORD | Configured | ? | [ ] |
| SMTP_SECURE | true/false | ? | [ ] |
| client_max_body_size | 500M | ? | [ ] |
| Python venv | Working | ? | [ ] |
| Disk space | >1GB free | ? | [ ] |

## Quick Diagnostic Script

Run this all-in-one:
```bash
#!/bin/bash
echo "=== FFmpeg Check ==="
which ffmpeg && ffmpeg -version | head -1 || echo "MISSING: FFmpeg"
which ffprobe && ffprobe -version | head -1 || echo "MISSING: FFprobe"

echo -e "\n=== SMTP Environment Check ==="
printenv | grep SMTP || echo "MISSING: SMTP environment variables"

echo -e "\n=== Nginx Upload Limit ==="
grep -r "client_max_body_size" /etc/nginx/ 2>/dev/null || echo "Not configured"

echo -e "\n=== Python ==="
python3 --version
/var/www/simplifyconvert/venv/bin/python --version 2>/dev/null || echo "Venv issue"

echo -e "\n=== Disk Space ==="
df -h / | tail -1
du -sh /var/www/simplifyconvert/tmp 2>/dev/null || echo "Tmp dir issue"

echo -e "\n=== Process Check ==="
ps aux | grep -E "(node|next)" | grep -v grep || echo "App not running"
```

## What to Report Back

After running these checks, provide:

1. **FFmpeg**: Installed? Version?
2. **FFprobe**: Installed? Version?
3. **SMTP Variables**: All present? Values?
4. **Nginx**: Upload limit set? What value?
5. **Python**: Venv working? Module imports ok?
6. **Logs**: Any error messages? Which line?
7. **Disk**: Free space available?

## Next Steps

Once data is collected, we will:
1. Fix environment variables if missing
2. Deploy code improvements for better error logging
3. Test end-to-end
4. Verify email reporting works
