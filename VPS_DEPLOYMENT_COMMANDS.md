# VPS DEPLOYMENT GUIDE - Complete Steps & Commands

## Prerequisites
- VPS with Node.js 18+ installed
- PM2 or similar process manager
- Nginx (for reverse proxy)
- Git access to your repository
- SSH access to VPS

---

## STEP 1: SSH into VPS

```bash
ssh root@your_vps_ip_address
# or if you have a user
ssh username@your_vps_ip_address
```

---

## STEP 2: Install Required Dependencies (One-time setup)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js & npm (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally (for process management)
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Verify installations
node --version
npm --version
pm2 --version
nginx -v
```

---

## STEP 3: Clone or Pull Repository

### First Deployment (Clone):
```bash
# Navigate to web root directory
cd /var/www

# Clone your repository
git clone https://github.com/your-username/simplifyconvertapp.git
cd simplifyconvertapp
```

### Subsequent Deployments (Pull Latest):
```bash
cd /var/www/simplifyconvertapp
git pull origin main
```

---

## STEP 4: Set Environment Variables

```bash
# Create .env.local file with production settings
nano .env.local
```

**Add these variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://simplifyconvert.com
DATABASE_URL=your_database_url_here
# Add any other environment variables your app needs
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## STEP 5: Install Dependencies & Build

```bash
# Install npm packages
npm install

# Build the Next.js app
npm run build

# Verify build succeeded (should see "Route (app)" output)
echo "Build complete!"
```

---

## STEP 6: Start Application with PM2

```bash
# Start the app with PM2
pm2 start npm --name "simplifyconvert" -- start

# Make PM2 start on system reboot
pm2 startup
pm2 save

# Check if it's running
pm2 status
pm2 logs simplifyconvert

# View real-time logs
pm2 logs
```

---

## STEP 7: Configure Nginx as Reverse Proxy

```bash
# Create Nginx config file
sudo nano /etc/nginx/sites-available/simplifyconvert
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name simplifyconvert.com www.simplifyconvert.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name simplifyconvert.com www.simplifyconvert.com;

    # SSL certificates (will add after Let's Encrypt setup)
    ssl_certificate /etc/letsencrypt/live/simplifyconvert.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/simplifyconvert.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Caching for static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/simplifyconvert /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## STEP 8: Set Up SSL with Let's Encrypt (FREE)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d simplifyconvert.com -d www.simplifyconvert.com

# Follow prompts and provide your email

# Auto-renew SSL (runs daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal setup
sudo systemctl status certbot.timer
```

---

## STEP 9: Verify Everything Works

```bash
# Check PM2 process
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if app is accessible
curl http://localhost:3000

# Check logs
pm2 logs simplifyconvert

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## STEP 10: Deploy Future Updates

Whenever you push new changes to GitHub:

```bash
cd /var/www/simplifyconvertapp

# Pull latest code
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Restart the app
pm2 restart simplifyconvert

# Check logs
pm2 logs simplifyconvert
```

---

## Useful Commands Reference

### PM2 Commands
```bash
pm2 start npm --name "app" -- start        # Start app
pm2 stop simplifyconvert                   # Stop app
pm2 restart simplifyconvert                # Restart app
pm2 delete simplifyconvert                 # Delete app from PM2
pm2 status                                 # Show all processes
pm2 logs simplifyconvert                   # View app logs
pm2 logs simplifyconvert --lines 100       # View last 100 lines
pm2 save                                   # Save PM2 config
pm2 startup                                # Auto-start on reboot
```

### Nginx Commands
```bash
sudo systemctl start nginx                 # Start Nginx
sudo systemctl stop nginx                  # Stop Nginx
sudo systemctl restart nginx               # Restart Nginx
sudo systemctl status nginx                # Check status
sudo nginx -t                              # Test config
sudo tail -f /var/log/nginx/access.log    # View access logs
sudo tail -f /var/log/nginx/error.log     # View error logs
```

### Git Commands
```bash
cd /var/www/simplifyconvertapp
git status                                 # Check git status
git log --oneline -5                       # View recent commits
git pull origin main                       # Pull latest changes
git branch -a                              # List all branches
```

---

## Troubleshooting

### App not running
```bash
pm2 logs simplifyconvert
# Check for errors and fix accordingly
```

### Nginx not working
```bash
sudo nginx -t
# Check for config syntax errors
sudo systemctl restart nginx
```

### Port 3000 already in use
```bash
lsof -i :3000
# Kill the process and restart
pm2 restart simplifyconvert
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

### Out of disk space
```bash
df -h
# Clean up logs or old builds
npm run build  # Rebuilds .next/ directory
```

---

## Final Verification

After deployment, verify:

1. **Website loads**: Visit https://simplifyconvert.com
2. **Sitemap accessible**: Visit https://simplifyconvert.com/sitemap.xml
3. **Check URL count**: 
   ```bash
   curl https://simplifyconvert.com/sitemap.xml | grep -c '<loc>'
   # Should show ~518 URLs (or your expected count)
   ```
4. **Check logs for errors**:
   ```bash
   pm2 logs simplifyconvert
   ```

---

## One-Command Quick Deployment (After first setup)

```bash
cd /var/www/simplifyconvertapp && git pull origin main && npm install && npm run build && pm2 restart simplifyconvert && echo "Deployment complete!"
```

---

## Notes

- Replace `simplifyconvert.com` with your actual domain
- Replace `your_vps_ip_address` with your VPS IP
- Ensure your VPS has at least 2GB RAM for Node.js
- Keep `.env.local` safe (add to `.gitignore`)
- Monitor PM2 regularly: `pm2 monit`
- Set up automated backups of your database
