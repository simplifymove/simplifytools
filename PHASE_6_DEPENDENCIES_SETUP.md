# Phase 6: Dependencies Installation Guide

## New Dependencies Required

```bash
# Job Queue (BullMQ + Redis)
npm install bullmq redis

# Notifications (Email, Slack, Discord)
npm install nodemailer

# Charts (Frontend visualization)
npm install chart.js react-chartjs-2

# Type definitions
npm install --save-dev @types/nodemailer

# Development - Worker process management (optional but recommended)
npm install --save-dev node-ts-plugin ts-node
```

## Complete Installation

```bash
npm install bullmq redis nodemailer chart.js react-chartjs-2 @types/nodemailer
```

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| bullmq | ^4.x | Job queue system |
| redis | ^4.x | Queue storage and communication |
| nodemailer | ^6.x | Email notifications |
| chart.js | ^4.x | Charting library |
| react-chartjs-2 | ^5.x | React wrapper for Chart.js |
| @types/nodemailer | Latest | TypeScript types |

## Redis Setup

### Local Development (Option 1: Local Redis)

```bash
# Windows: Install WSL2 or use Docker
docker run -d -p 6379:6379 redis:7-alpine

# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Docker Setup (Option 2: Recommended for Production)

```bash
docker run -d \
  --name redis-audit \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

### Cloud Redis (Option 3: Managed Redis)

```
# Examples:
# - Redis Cloud: https://redis.com/cloud/
# - AWS ElastiCache
# - Azure Cache for Redis
# - Heroku Redis

# Set in .env:
REDIS_HOST=<cloud-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<if-required>
```

## Environment Variables

Add to `.env.local`:

```bash
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@simplifyconvert.com

# Slack Webhook (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL

# Worker Configuration
WORKER_CONCURRENCY=2

# Base URL for notifications
NEXTAUTH_URL=http://localhost:3000
```

## Gmail Setup for Notifications

1. Enable 2-Factor Authentication
2. Create App Password
3. Use in SMTP_PASSWORD

## Slack Webhook Setup

1. Create Slack App: https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add New Webhook to Workspace
4. Copy URL to SLACK_WEBHOOK_URL

## Discord Webhook Setup

1. Right-click channel → Edit Channel
2. Integrations → Webhooks
3. Create Webhook
4. Copy URL to DISCORD_WEBHOOK_URL

## Package.json Scripts Addition

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "worker": "node -r ts-node/register worker.ts",
    "worker:prod": "node dist/worker.js",
    "queue:health": "node -r ts-node/register -e \"import { checkQueueHealth } from './lib/queue/client'; checkQueueHealth().then(h => console.log(h)).catch(e => console.error(e))\"",
    "queue:cleanup": "node -r ts-node/register -e \"import { cleanupOldJobs } from './lib/queue/client'; cleanupOldJobs().then(() => console.log('Cleaned up old jobs')).catch(e => console.error(e))\""
  }
}
```

## Running the Complete System

### Development

Terminal 1: Start Next.js dev server
```bash
npm run dev
```

Terminal 2: Start Redis
```bash
docker run -p 6379:6379 redis:7-alpine
# OR
redis-server
```

Terminal 3: Start Worker
```bash
npm run worker
```

### Production

```bash
# Build
npm run build

# Start API server
npm start

# Start worker (separate process/container)
npm run worker:prod

# Optional: Health check
npm run queue:health

# Optional: Daily cleanup (via cron job)
npm run queue:cleanup
```

## Verification

Check setup is working:

```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Check queue health
npm run queue:health

# Check databases
npx prisma db execute --stdin <<< "SELECT version();"
```

## Troubleshooting

### Redis Connection Refused
```bash
# Windows: Check Docker is running
docker ps

# macOS/Linux: Check Redis service
ps aux | grep redis-server

# Verify port
netstat -an | grep 6379 (Windows)
lsof -i :6379 (macOS/Linux)
```

### Job Queue Not Processing
1. Verify Redis is running
2. Check worker is started: `npm run worker`
3. Check database connection: `npx prisma db execute`
4. Check job status: Visit `/admin/audit-testing`

### Email Notifications Not Sending
1. Verify SMTP credentials in .env
2. Check Gmail App Password (if using Gmail)
3. Test email: `npm run test:email` (if test script exists)
4. Check NotificationLog table for errors

### Worker Process Crashing
1. Check Node.js version (should be 18+)
2. Check memory usage
3. Check logs for error messages
4. Verify DATABASE_URL is accessible

## Next Steps

1. Install all dependencies
2. Set up Redis (local or cloud)
3. Configure environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Start dev server and worker
6. Test via admin dashboard

---

**Phase 6 Setup Complete!** ✅

Your system is now ready for:
- ✅ Async job processing
- ✅ Background test execution
- ✅ Email/Slack/Discord notifications
- ✅ Historical job tracking
- ✅ Retry mechanisms
- ✅ Production scalability
