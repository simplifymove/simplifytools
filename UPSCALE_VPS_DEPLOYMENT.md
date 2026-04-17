# Image Upscale Feature - VPS Deployment Guide

## Overview
This guide covers deploying the industry-standard image upscaling feature to your live VPS with all required dependencies, Python packages, and system configurations.

## What's Included
- **Frontend**: React UI component with real-time upscaling preview
- **Backend**: Node.js API endpoint (`/api/upscale`) spawning Python subprocess
- **Python Engine**: `upscale_engine.py` with Real-ESRGAN (optional) and OpenCV Advanced fallback
- **Supported Formats**: PNG, JPEG, WebP input/output
- **Scale Factors**: 2x, 3x, 4x magnification
- **Modes**: Auto-detect, Photo, Anime with optional face enhancement

---

## Step 1: VPS Environment Setup

### 1.1 Python Virtual Environment

```bash
# SSH into your VPS
ssh your_user@your_vps_ip

# Navigate to your app directory
cd /path/to/tinytools-app

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 1.2 System Dependencies (Ubuntu/Debian)

```bash
# Update package manager
sudo apt-get update

# Install required system libraries for image processing
sudo apt-get install -y \
    python3-dev \
    build-essential \
    libopencv-dev \
    python3-opencv \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    gcc \
    g++ \
    make
```

### 1.3 Node.js (if not already installed)

```bash
# Install Node.js 18+ (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

---

## Step 2: Install Python Dependencies

### 2.1 Required Packages

```bash
# Activate virtual environment first
source venv/bin/activate

# Install Python packages from requirements.txt
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.2 Package Details

```
Pillow==10.1.0              # Image processing
opencv-python==4.8.1.78     # Computer vision (ALWAYS required)
numpy==1.24.3               # Numerical computing (ALWAYS required)
torch==2.0.0                # Deep learning (OPTIONAL - Real-ESRGAN)
realesrgan==0.3.0           # Super-resolution AI (OPTIONAL)
```

### 2.3 Verify Installation

```bash
python3 -c "
import cv2
import numpy
from PIL import Image
print('✓ Core packages installed correctly')
print(f'  OpenCV: {cv2.__version__}')
print(f'  NumPy: {numpy.__version__}')
"
```

---

## Step 3: Install Node.js & NPM Dependencies

```bash
# Navigate to app directory
cd /path/to/tinytools-app

# Install Node dependencies
npm ci  # or npm install (use npm ci for production)

# Build Next.js application
npm run build

# Verify build
ls -la .next/
```

---

## Step 4: Verify File Structure

Ensure these files are in place on your VPS:

```
tinytools-app/
├── app/
│   ├── all-tools/upscale-image/
│   │   ├── page.tsx              # React UI component
│   │   └── layout.tsx
│   └── api/upscale/
│       └── route.ts              # API endpoint
├── python/
│   ├── upscale_engine.py         # Core upscaling logic
│   ├── batch_upscale.py          # Batch processing (optional)
│   └── media_router.py           # Request routing
├── requirements.txt              # Python dependencies
├── package.json                  # Node dependencies
└── next.config.ts               # Next.js config
```

---

## Step 5: Environment Configuration

### 5.1 Create .env.production

```bash
# Create environment file
cat > /path/to/tinytools-app/.env.production << 'EOF'
# Image Upscale Settings
UPSCALE_TEMP_DIR=/tmp/tinytools-upscale
UPSCALE_TIMEOUT=120000

# Optional: Real-ESRGAN settings
REALESRGAN_DEVICE=cpu  # or 'cuda' if GPU available
REALESRGAN_TILE=400    # Tile size for large images

EOF
```

### 5.2 Create temp directory

```bash
# Create temporary directory for upscale operations
mkdir -p /tmp/tinytools-upscale
chmod 755 /tmp/tinytools-upscale

# Enable cleanup (optional - recommended)
# Add to crontab to clean old temp files
crontab -e
# Add: 0 2 * * * find /tmp/tinytools-upscale -mtime +1 -delete
```

---

## Step 6: Systemd Service Setup (Production)

### 6.1 Create systemd service file

```bash
# Create service file
sudo tee /etc/systemd/system/tinytools.service > /dev/null << 'EOF'
[Unit]
Description=TinyTools App (Image Upscale Feature)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tinytools-app
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

# Security options
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
```

### 6.2 Enable and start service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable tinytools

# Start service
sudo systemctl start tinytools

# Check status
sudo systemctl status tinytools

# View logs
sudo journalctl -u tinytools -f
```

---

## Step 7: Nginx Configuration (Production)

### 7.1 Configure Nginx reverse proxy

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/tinytools > /dev/null << 'EOF'
upstream tinytools_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Increase upload size for large images
    client_max_body_size 100M;

    location / {
        proxy_pass http://tinytools_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout for upscaling operations (2+ minutes)
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }

    # API endpoint - allow larger uploads
    location /api/upscale {
        proxy_pass http://tinytools_app;
        client_max_body_size 100M;
        proxy_read_timeout 300;
    }
}
EOF
```

### 7.2 Enable Nginx configuration

```bash
# Test configuration
sudo nginx -t

# Create symlink
sudo ln -s /etc/nginx/sites-available/tinytools /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 8: SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (Certbot handles this automatically)
sudo systemctl enable certbot.timer
```

---

## Step 9: Performance Tuning

### 9.1 Python Optimization

```bash
# Update upscale_engine.py for production
# Set environment variables in systemd service:

# In /etc/systemd/system/tinytools.service, add:
Environment="OMP_NUM_THREADS=4"           # Adjust based on CPU cores
Environment="OPENCV_ENABLE_NEON=1"        # For ARM processors
Environment="PYTHONUNBUFFERED=1"          # Real-time logging
```

### 9.2 Process Manager (PM2 - Alternative)

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 config file
cat > /path/to/tinytools-app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tinytools',
    script: 'npm',
    args: 'run start',
    instances: 2,           # Number of worker processes
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    max_memory_restart: '1G',
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Step 10: Monitoring & Logs

### 10.1 Monitor upscale operations

```bash
# Watch real-time logs
tail -f /var/log/tinytools-app.log

# Check Python subprocess logs
tail -f /tmp/tinytools-upscale/upscale_*.log

# Monitor CPU/Memory
htop  # or 'top'
```

### 10.2 Check API endpoint health

```bash
# Test upscale endpoint
curl -X POST http://localhost:3000/api/upscale \
  -F "file=@test-image.jpg" \
  -F "scale=2" \
  -F "mode=auto" \
  -F "format=png" \
  -o upscaled.png
```

---

## Deployment Checklist

- [ ] Python 3.8+ installed on VPS
- [ ] Python virtual environment created and activated
- [ ] System dependencies installed (libsm6, libxext6, etc.)
- [ ] `requirements.txt` packages installed (`pip install -r requirements.txt`)
- [ ] Node.js 18+ installed
- [ ] NPM dependencies installed (`npm ci`)
- [ ] Application built (`npm run build`)
- [ ] Environment variables configured (`.env.production`)
- [ ] Temp directory created (`/tmp/tinytools-upscale`)
- [ ] Systemd service configured and enabled
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall rules updated (allow ports 80, 443)
- [ ] Monitoring configured (logs, PM2, systemd)
- [ ] Load testing completed (concurrent upscale requests)

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'cv2'"

```bash
# Install OpenCV
source venv/bin/activate
pip install opencv-python==4.8.1.78
```

### Issue: "Failed to load native TensorFlow library"

```bash
# PyTorch/Real-ESRGAN is optional. The app falls back to OpenCV Advanced
# To use Real-ESRGAN, install:
pip install torch torchvision
pip install realesrgan
```

### Issue: "Address already in use (port 3000)"

```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Issue: "Timeout on large images"

```bash
# Increase Nginx timeout (Step 7.1)
proxy_read_timeout 300;  # 5 minutes

# Increase API timeout in next.config.ts
export const config = {
  api: {
    responseLimit: '100mb',
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};
```

### Issue: Python subprocess fails in production

```bash
# Verify Python path in API route:
which python3
# Update route.ts with absolute path:
const pythonPath = '/path/to/venv/bin/python3';
```

---

## Security Best Practices

1. **Input Validation**: API validates image format before processing
2. **File Size Limits**: Set max upload size (100MB in Nginx config)
3. **Temp Cleanup**: Remove old temp files (cron job in Step 5.2)
4. **User Permissions**: Run Node/Python under restricted user (`www-data`)
5. **SSL/TLS**: Enforce HTTPS with Let's Encrypt
6. **Rate Limiting**: Consider adding rate limiting for `/api/upscale`
7. **CORS**: Configure CORS headers in next.config.ts

---

## Performance Benchmarks

- **Small image (1MB)**: ~2-3 seconds (2x upscale)
- **Medium image (10MB)**: ~5-10 seconds (4x upscale)
- **Large image (50MB)**: ~30-45 seconds (4x upscale)
- **Concurrent requests**: 2-4 users (depends on CPU cores)

---

## Updating/Rollback

```bash
# Pull latest code
git pull origin main

# Reinstall dependencies
npm ci
pip install -r requirements.txt

# Rebuild
npm run build

# Restart service
sudo systemctl restart tinytools

# Check status
sudo systemctl status tinytools
```

---

## Support & Documentation

- **Real-ESRGAN Docs**: https://github.com/xinntao/Real-ESRGAN
- **OpenCV Docs**: https://docs.opencv.org/
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Nginx Docs**: http://nginx.org/en/docs/

---

**Last Updated**: April 17, 2026  
**Version**: 1.0.0
