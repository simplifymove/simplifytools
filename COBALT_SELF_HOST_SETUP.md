# Self-Hosted Cobalt Setup Guide

**Status:** Production-Ready  
**Date:** December 2024  
**Architecture:** Docker container on VPS  
**Integration:** Next.js 16 Multi-Provider Downloader

---

## Overview

This guide sets up a self-hosted Cobalt instance on your VPS to serve as the primary media download provider for your Next.js application. Cobalt is a free, open-source media downloader API that supports YouTube, Instagram, TikTok, Twitter/X, Vimeo, Reddit, SoundCloud, and more.

### Why Self-Hosted?

- **No Rate Limiting:** Unlimited requests on your own server
- **Privacy:** Your VPS, your data
- **Reliability:** Independent from public API services
- **Control:** Update/manage versions yourself
- **Cost:** Free (just server resources)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App (Port 3000)              │
│        ProviderOrchestrator with Fallback Chains        │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
     ┌────────┐  ┌────────┐  ┌──────────┐
     │ Cobalt │  │ yt-dlp │  │External  │
     │(Docker)│  │(Local) │  │API(Paid) │
     └────────┘  └────────┘  └──────────┘
     Port 9000   Subprocess  RapidAPI
```

---

## Prerequisites

- Ubuntu/Debian VPS (or compatible)
- Root or sudo access
- ~5GB free disk space
- ~1GB available RAM

---

## Installation Steps

### Step 1: Download Deployment Files

Copy the `cobalt-deployment/` directory to your VPS:

```bash
# From your local machine
scp -r cobalt-deployment/ user@your-vps:/home/user/

# Or clone from git if already pushed
ssh user@your-vps
cd ~
git clone <your-repo>
cd simplifyconvertapp/cobalt-deployment
```

### Step 2: Run Installation Script

```bash
cd ~/cobalt-deployment
chmod +x install.sh
sudo ./install.sh
```

The script will:
- ✓ Check for Docker installation
- ✓ Install Docker and Docker Compose if needed
- ✓ Create `/home/user/cobalt/` directory
- ✓ Copy `docker-compose.yml`
- ✓ Create `.env` configuration
- ✓ Verify installation

### Step 3: Start Cobalt Container

```bash
cd ~/cobalt-deployment
chmod +x start.sh
./start.sh
```

Expected output:
```
Starting Cobalt container...
Waiting for container to be healthy...

CONTAINER ID   IMAGE                          STATUS
abc123def456   ghcr.io/imputnet/cobalt:latest Up 5s (healthy)

Testing API endpoint...
{"ok":true,"url":"..."}

✓ Cobalt should be accessible at http://localhost:9000
```

### Step 4: Verify Running Container

```bash
cd ~/cobalt
docker compose ps
```

Should show Cobalt running and healthy.

---

## Configuration

### Environment Variables

**File:** `~/cobalt/.env`

```env
# Cobalt Port (internal to container)
PORT=9000

# Logging
LOG_LEVEL=info
```

### docker-compose.yml

Key settings:

- **Image:** `ghcr.io/imputnet/cobalt:latest` (auto-updates)
- **Port Binding:** `127.0.0.1:9000:9000` (localhost only for security)
- **Restart Policy:** `unless-stopped` (auto-restart on reboot)
- **Resources:** 
  - CPU limit: 2 cores
  - Memory limit: 1GB
- **Health Check:** Every 30 seconds
- **Log Rotation:** Max 10MB per file, 3 files (prevents disk filling)

---

## Integrating with Next.js App

### Environment Configuration

Update `/.env.local` in your Next.js project:

```env
# Self-Hosted Cobalt Configuration
COBALT_ENABLED=true
COBALT_API_URL=http://localhost:9000/api/json
COBALT_API_KEY=
(Self-hosted doesn't need API key)

# Local yt-dlp as fallback
YTDLP_ENABLED=true

# Keep others disabled for now
GALLERY_DL_ENABLED=false
DOWNLOADER_API_ENABLED=false
```

### Provider Chain

With self-hosted Cobalt enabled:

1. **YouTube:** Cobalt → yt-dlp → External API
2. **Instagram:** Cobalt → yt-dlp → External API
3. **TikTok:** Cobalt → yt-dlp → External API
4. **Vimeo:** yt-dlp → Cobalt → External API
5. **Direct Files:** Direct downloader only

---

## Health Checks

### Check Cobalt Status

```bash
cd ~/cobalt
docker compose ps
docker compose logs -n 20
```

### Health Check Endpoint

```bash
curl http://localhost:3000/api/download/health
```

Response example:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T10:30:00Z",
  "providers": {
    "cobalt": {
      "status": "healthy",
      "responseTime": 150
    },
    "ytdlp": {
      "status": "healthy",
      "message": "yt-dlp 2026.03.17"
    },
    "direct": {
      "status": "healthy",
      "message": "Direct file downloads available"
    },
    "externalApi": {
      "status": "unhealthy",
      "message": "Disabled"
    }
  }
}
```

### Quick API Test

```bash
curl -X POST http://localhost:9000/api/json \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "vQuality": "720"
  }'
```

---

## Management Commands

### Start Cobalt

```bash
cd ~/cobalt-deployment
./start.sh
```

### Stop Cobalt

```bash
cd ~/cobalt-deployment
./stop.sh
```

### View Logs

```bash
cd ~/cobalt-deployment
./logs.sh
# Or real-time:
cd ~/cobalt && docker compose logs -f
```

### Update to Latest Version

```bash
cd ~/cobalt-deployment
./update.sh
```

### Full Restart

```bash
cd ~/cobalt
docker compose down
docker compose up -d
```

### Test API Directly

```bash
cd ~/cobalt-deployment
./test-api.sh
```

---

## Security Hardening

### Network Security

**Current:** API bound to `127.0.0.1:9000` (localhost only)

This prevents:
- Public access from internet
- Direct attacks on Cobalt API
- Unauthorized usage

**If serving from same machine:** ✓ Safe as-is  
**If accessing from other machine:** Use SSH tunnel:

```bash
ssh -L 9000:localhost:9000 user@your-vps
# Now localhost:9000 on your machine connects to remote VPS
```

### Nginx Reverse Proxy (Optional)

If you need to expose Cobalt through Nginx:

```nginx
upstream cobalt {
    server localhost:9000;
}

server {
    listen 8080;
    server_name _;
    
    location /api/ {
        # Only allow from your app IP
        allow 127.0.0.1;
        allow 192.168.1.100;  # Your app server
        deny all;
        
        proxy_pass http://cobalt;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Rate limiting
        limit_req zone=api_limit burst=10 nodelay;
    }
}
```

### Rate Limiting

Implemented at application level via `ProviderOrchestrator`:
- yt-dlp: 1 concurrent process max
- File size: 500MB limit (configurable)
- Timeout: 120 seconds per provider
- SSRF Protection: Blocks private IPs

### Firewall Configuration

```bash
# Allow only SSH and app port
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # App (if exposed)
sudo ufw enable
```

---

## Troubleshooting

### Cobalt Container Won't Start

```bash
# Check logs
docker compose logs cobalt

# Common issues:
# 1. Port already in use
sudo netstat -tulpn | grep 9000

# 2. Insufficient disk space
df -h

# 3. Docker daemon not running
sudo systemctl restart docker
```

### API Returns 400 Error

Instagram/TikTok might return 400 - this is normal, fallback to yt-dlp is triggered.

```bash
# Check exact error
curl -v -X POST http://localhost:9000/api/json \
  -H "Content-Type: application/json" \
  -d '{"url":"...","vQuality":"720"}'
```

### Container Using Too Much Memory

```bash
# Check memory usage
docker stats cobalt

# Adjust in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 512M  # Reduce from 1G
```

### High Disk Usage

Container logs are rotated automatically, but check:

```bash
# Check Docker disk usage
docker system df

# Clean up old images
docker image prune

# Clean unused containers/volumes
docker system prune
```

---

## Performance Tuning

### Response Time Optimization

Current settings are conservative. For production:

```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '4'        # Increase from 2
      memory: 2G       # Increase from 1G
    reservations:
      cpus: '2'        # Increase from 1
      memory: 1G       # Increase from 512M
```

### Restart After Changes

```bash
cd ~/cobalt
docker compose down
docker compose up -d
```

---

## Monitoring

### Create Cron Job for Health Checks

```bash
# Edit crontab
crontab -e

# Add this line (checks every 5 minutes)
*/5 * * * * curl -f http://localhost:9000/api/json > /dev/null || echo "Cobalt down" | mail -s "Alert" admin@example.com
```

### Log Rotation

Already configured in docker-compose.yml:
- Max file size: 10MB
- Max files: 3
- Automatic rotation

---

## Updating Cobalt

### Check for Updates

```bash
docker pull ghcr.io/imputnet/cobalt:latest
```

### Apply Update

```bash
cd ~/cobalt-deployment
./update.sh
```

Or manually:

```bash
cd ~/cobalt
docker compose down
docker compose pull
docker compose up -d
```

---

## Testing

### Test All Providers

From Next.js app directory:

```bash
# YouTube (Cobalt)
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Instagram (Cobalt → yt-dlp fallback)
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DWYP1byDQ-R/"}'

# Direct File (Direct provider)
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200/300.jpg"}'

# Health Check
curl http://localhost:3000/api/download/health
```

---

## Build and Deploy

After configuration, build Next.js app:

```bash
npm run build
npm start
```

Monitor both Cobalt and app:

```bash
# Terminal 1: App
cd ~/app
npm start

# Terminal 2: Cobalt logs
cd ~/cobalt
docker compose logs -f

# Terminal 3: Health monitoring
watch -n 5 'curl -s http://localhost:3000/api/download/health | jq .'
```

---

## Backup & Restore

### Backup Cobalt Configuration

```bash
cd ~
tar -czf cobalt-backup-$(date +%Y%m%d).tar.gz cobalt/
ls -lh cobalt-backup-*.tar.gz
```

### Restore from Backup

```bash
tar -xzf cobalt-backup-20241219.tar.gz
cd ~/cobalt
docker compose up -d
```

---

## Maintenance Checklist

- [ ] Cobalt container starts on system reboot
- [ ] API responds within 1 second
- [ ] All test URLs download successfully
- [ ] No disk space warnings
- [ ] Log rotation working (3 files, 10MB each)
- [ ] Health check endpoint responding
- [ ] SSRF protection active
- [ ] File size limits enforced
- [ ] No exposed API endpoints without auth
- [ ] Build passes without errors

---

## Production Deployment Checklist

- [ ] Docker installed and running
- [ ] Cobalt container healthy
- [ ] Next.js app environment configured
- [ ] Health endpoint operational
- [ ] Download API tested with 5+ URLs
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Logs rotated automatically
- [ ] SSRF validation working
- [ ] npm run build passes

---

## Support & Resources

**Cobalt Docs:** https://github.com/imputnet/cobalt  
**Docker Docs:** https://docs.docker.com/  
**Next.js Docs:** https://nextjs.org/docs  

---

**Last Updated:** December 2024  
**Maintenance:** Regular updates recommended quarterly  
**Support Contact:** [Your contact info]
