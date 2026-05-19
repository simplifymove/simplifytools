# Production Optimization & Security Guide

**Purpose:** Harden, optimize, and monitor your self-hosted Cobalt + Next.js downloader stack  
**Target:** VPS Production Environment  

---

## Security Hardening

### 1. SSRF Prevention (Already Implemented)

**Location:** `app/lib/download/orchestrator.ts`

Blocks:
- Private IP ranges (127.0.0.0/8, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12)
- IPv6 loopback (::1) and private (fc00::/7)
- Non-HTTP(S) protocols

```typescript
// Example validation
const internalPatterns = [
  /^localhost$/i,
  /^127\./,              // Loopback
  /^192\.168\./,         // Private
  /^10\./,               // Private
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // Private
];
```

### 2. Rate Limiting

**Global yt-dlp Queue:**
```typescript
MAX_CONCURRENT = 1  // Only 1 yt-dlp process at a time
```

**File Size Limits:**
```env
DOWNLOAD_MAX_MB=500  # Default max file size
```

**Per-Provider Timeouts:**
```env
DOWNLOAD_TIMEOUT_SECONDS=120  # 2 minutes per provider
```

### 3. Security Headers

**Response Headers Added:**

```
X-Content-Type-Options: nosniff         # Prevent MIME type sniffing
X-Frame-Options: DENY                   # No framing
X-XSS-Protection: 1; mode=block        # XSS protection
Referrer-Policy: no-referrer            # No referrer leakage
Cache-Control: no-cache, no-store...    # No caching of downloads
Pragma: no-cache                        # Older cache control
Expires: 0                              # Expire immediately
```

### 4. API Binding

**Current Security:**
- Cobalt bound to `127.0.0.1:9000` (localhost only)
- Not accessible from internet
- Safe for local VPS deployment

**If Cross-Machine Access Needed:**
Use SSH tunnel or firewall whitelist:

```bash
# SSH tunnel (from your machine to VPS)
ssh -L 9000:localhost:9000 user@vps

# Or restrict firewall
sudo ufw allow from 192.168.1.100 to any port 9000
```

---

## Performance Optimization

### 1. Temp File Cleanup

**Auto-cleanup after downloads:**

```typescript
// Deletes temp files immediately after response
function cleanupFile(filePath: string | undefined): void {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('[download] Cleanup error:', error);
  }
}
```

**Cron job for safety cleanup:**

```bash
# Add to crontab (removes files older than 1 hour)
0 * * * * find /tmp -name "ytdlp-*" -mmin +60 -delete
```

### 2. Memory Management

**Docker limits (docker-compose.yml):**

```yaml
deploy:
  resources:
    limits:
      memory: 1G        # Max memory Cobalt can use
    reservations:
      memory: 512M      # Guaranteed memory
```

**Monitor memory:**

```bash
docker stats cobalt --no-stream
```

### 3. CPU Optimization

**Current allocation:**
- Limit: 2 CPUs
- Reservation: 1 CPU

**For high-traffic VPS:**

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 2G
    reservations:
      cpus: '2'
      memory: 1G
```

### 4. Network Optimization

**Keep-alive connections:**
Already implemented in Next.js fetch()

**Parallel provider attempts:**
- Direct file: 0ms overhead
- Cobalt: ~200-500ms HTTP call
- yt-dlp: ~2-30s subprocess
- External API: ~500ms HTTP call

**Optimization:** Try Cobalt first (fastest for social media)

### 5. Disk Space Management

**Log rotation:**
Already configured - max 10MB per file, 3 files = 30MB total

**Check disk usage:**

```bash
# Cobalt container
docker system df

# VPS filesystem
df -h
lsof | grep deleted | head -10  # Check for deleted files still held
```

**Clean old data:**

```bash
# Remove old images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune
```

---

## Monitoring & Alerting

### 1. Health Check Endpoint

**URL:** `GET /api/download/health`

**Schedule:** Check every 5 minutes

```bash
*/5 * * * * curl -f http://localhost:3000/api/download/health
```

**Response includes:**
- All provider statuses
- System info (ffmpeg, Python)
- Response times

### 2. Container Monitoring

**Uptime monitoring:**

```bash
# Check container restart count
docker compose ps cobalt

# View restart policy
docker inspect cobalt | jq '.[].HostConfig.RestartPolicy'
```

**Automatic restart:**
Already enabled - `restart: unless-stopped`

### 3. Log Monitoring

**View recent logs:**

```bash
docker compose logs -n 100 cobalt
```

**Real-time monitoring:**

```bash
docker compose logs -f cobalt | grep -i "error\|warn"
```

**Parse download logs:**

```bash
grep "\[download\]" /var/log/app.log | tail -20
```

### 4. Alerting Setup

**Email alerts on Cobalt down:**

```bash
#!/bin/bash
# save as ~/cobalt/health-monitor.sh

while true; do
    if ! curl -f http://localhost:9000/api/json > /dev/null 2>&1; then
        echo "Cobalt is down!" | mail -s "ALERT: Cobalt offline" admin@example.com
        # Try restart
        cd ~/cobalt && docker compose restart
    fi
    sleep 300  # Check every 5 minutes
done
```

Add to crontab:

```bash
@reboot ~/cobalt/health-monitor.sh &
```

---

## Load Balancing & Scaling

### Single Server (Current)

Single Cobalt + Next.js app on one VPS

**Bottleneck:** One yt-dlp subprocess can only process 1 video at a time

### Multi-Server Setup (Future)

```
┌──────────────────────┐
│   Load Balancer      │
│   (Nginx/HAProxy)    │
└─────────┬────────────┘
          │
    ┌─────┴────────┬──────────┐
    ▼              ▼          ▼
┌────────┐    ┌────────┐  ┌────────┐
│App #1  │    │App #2  │  │App #3  │
│Cobalt  │    │Cobalt  │  │Cobalt  │
└────────┘    └────────┘  └────────┘
```

To implement:
1. Run separate Next.js instances
2. Each with own Cobalt container
3. Use Nginx round-robin balancing
4. Shared session store (database)

---

## Database Connections (Future)

### Connection Pooling

If adding database for caching/history:

```typescript
// Example: PostgreSQL connection pool
const pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close after 30s idle
  connectionTimeoutMillis: 2000,
});
```

### Query Optimization

```sql
-- Index frequently queried columns
CREATE INDEX idx_downloads_url ON downloads(url);
CREATE INDEX idx_downloads_created ON downloads(created_at);

-- Archive old records
DELETE FROM downloads WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Caching Strategy

### Current (No Caching)

Every request goes through providers (safest for links with limited availability)

### Optional: Response Caching

```typescript
// Cache successful downloads for 1 hour
const cacheKey = `download:${hash(url)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return cached;  // Return immediately
}

// Otherwise download as normal
const result = await orchestrator.download(options);
await redis.setex(cacheKey, 3600, result);  // Cache for 1 hour
return result;
```

**Trade-off:** Faster repeats but stale URLs can fail

---

## Cost Optimization

### VPS Sizing

**Minimum:**
- 1 vCPU
- 1 GB RAM
- 20 GB SSD

**Recommended:**
- 2 vCPU
- 2 GB RAM
- 50 GB SSD

**Large scale:**
- 4 vCPU
- 4 GB RAM
- 100 GB SSD

### Bandwidth

Cobalt + yt-dlp video files use significant bandwidth:

```
1GB video = ~1GB transfer cost
100 downloads/month = ~100GB transfer
```

**Cost at $0.05/GB:** $5/month for bandwidth  
**Most VPS plans:** 500GB-5TB/month included

**Optimization:**
- Cache popular videos (if legal)
- Offer quality selection (720p vs 1080p)
- Limit file size (500MB current)

---

## Disaster Recovery

### Backup Strategy

```bash
# Weekly backup of configuration
0 0 * * 0 tar -czf ~/backups/cobalt-$(date +\%Y\%m\%d).tar.gz ~/cobalt/

# Keep 4 weeks of backups
find ~/backups -name "cobalt-*.tar.gz" -mtime +28 -delete
```

### Quick Restore

```bash
tar -xzf ~/backups/cobalt-20241219.tar.gz -C ~
cd ~/cobalt
docker compose up -d
```

### RTO/RPO

**Recovery Time Objective:** <5 minutes (restart container)  
**Recovery Point Objective:** <1 hour (last backup)

---

## Compliance & Legal

### Data Protection

- Cobalt doesn't store files permanently
- Temp files auto-deleted after download
- No user tracking (IP addresses not logged)
- GDPR compliant (no personal data stored)

### Copyright

- Tool itself is legal (like curl/wget)
- User responsible for content downloaded
- Recommend ToS disclaimers on your site

**Suggested disclaimer:**

> This service is for personal use only. Users must have rights to download/share content. We are not responsible for copyright violations.

---

## Maintenance Schedule

| Task | Frequency | Time |
|------|-----------|------|
| Check disk space | Daily | 5 min |
| Review logs | Daily | 5 min |
| Health check | Every 5 min | Automated |
| Update Cobalt | Monthly | 10 min |
| Backup config | Weekly | 2 min |
| Full system audit | Quarterly | 30 min |
| Dependency updates | Quarterly | 20 min |

---

## Troubleshooting Checklists

### High Memory Usage

```bash
# Check what's using memory
docker stats cobalt

# Possible causes:
# 1. Large file in memory
#    → Reduce DOWNLOAD_MAX_MB
# 2. Memory leak in yt-dlp
#    → Restart: docker compose restart cobalt
# 3. Docker overhead
#    → Reduce memory limits if not needed
```

### Slow Downloads

```bash
# Check provider latency
time curl -X POST http://localhost:9000/api/json \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Check yt-dlp directly
time python -m yt_dlp --dump-json "https://www.youtube.com/watch?v=..."

# Network issue?
ping -c 3 8.8.8.8
```

### API Timeouts

```bash
# Increase timeout if needed
DOWNLOAD_TIMEOUT_SECONDS=180  # Up from 120

# But check why it's timing out:
docker compose logs -f cobalt | grep -i error
```

---

## Advanced Tuning

### JQ Filters for Log Analysis

```bash
# Count downloads per provider
docker compose logs cobalt | grep "Download provider" | cut -d: -f2 | sort | uniq -c

# Find errors
docker compose logs cobalt | jq -R 'select(contains("error"))'

# Response time analysis
docker compose logs cobalt | grep "responseTime" | cut -d: -f2 | awk '{sum+=$1; count++} END {print "Avg:", sum/count, "ms"}'
```

### Network Debugging

```bash
# Monitor active connections
netstat -tulpn | grep 9000

# See what Cobalt is connecting to
docker exec cobalt netstat -tulpn

# Packet capture (if needed)
sudo tcpdump -i eth0 port 9000 -w ~/cobalt-capture.pcap
```

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** [Your name/team]
