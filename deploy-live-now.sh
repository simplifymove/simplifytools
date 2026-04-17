#!/bin/bash
# One-click VPS deployment script for TinyTools Upscale
# Run this once on your VPS to set up automatic deployments

set -e

APP_DIR="/var/www/tinytools-app"
SERVICE_NAME="tinytools"
VENV_DIR="$APP_DIR/venv"

echo "🚀 TinyTools VPS Deployment Script"
echo "===================================="

# Verify we're on the VPS (check if app directory exists)
if [ ! -d "$APP_DIR" ]; then
    echo "❌ App directory not found at $APP_DIR"
    echo "Please clone the repo first:"
    echo "  sudo git clone https://github.com/simplifymove/simplifytools.git $APP_DIR"
    exit 1
fi

echo "📦 Step 1: Pull latest code from GitHub..."
cd "$APP_DIR"
sudo git pull origin main

echo "📦 Step 2: Install Node dependencies..."
sudo npm ci

echo "🏗️ Step 3: Build Next.js application..."
# Temporarily remove venv to prevent Turbopack symlink resolution issues
sudo rm -rf "$VENV_DIR" 2>/dev/null || true
npm run build

echo "📦 Step 4: Install Python dependencies..."
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
else
    python3 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
fi
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Step 5: Restart application..."
sudo systemctl daemon-reload
sudo systemctl restart "$SERVICE_NAME"

echo "⏳ Waiting for service to start..."
sleep 2

echo "✅ Step 6: Verify deployment..."
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Service is running!"
    echo ""
    echo "✅ Deployment Complete!"
    echo ""
    echo "Your app is now live. Access it at:"
    echo "  https://your-domain.com"
    echo ""
    echo "Upscale feature: https://your-domain.com/all-tools/upscale-image"
else
    echo "❌ Service failed to start!"
    echo "Check logs with: sudo journalctl -u $SERVICE_NAME -f"
    exit 1
fi
