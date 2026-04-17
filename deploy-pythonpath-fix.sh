#!/bin/bash
# Deploy the PYTHONPATH fix to VPS
# This script deploys the latest code changes that fix the PIL import error

set -e

VPS_IP="75.119.155.15"
VPS_USER="root"
APP_PATH="/var/www/simplifytools"
BUILD_PATH=".next"

echo "🚀 Deploying PIL import fix to VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Build locally
echo "📦 Step 1: Building application locally..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Step 2: Deploy .next build
echo ""
echo "📤 Step 2: Deploying .next build directory..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $APP_PATH/.next"
scp -r "$BUILD_PATH" "$VPS_USER@$VPS_IP:$APP_PATH/"
echo "✅ .next deployed"

# Step 3: Deploy Python routers
echo ""
echo "📤 Step 3: Deploying Python routers..."
scp -r "python" "$VPS_USER@$VPS_IP:$APP_PATH/"
echo "✅ Python routers deployed"

# Step 4: Verify deployment
echo ""
echo "🔍 Step 4: Verifying deployment..."
ssh "$VPS_USER@$VPS_IP" "ls -la $APP_PATH/.next && ls -la $APP_PATH/python/pdf_router.py"
echo "✅ Files verified"

# Step 5: Restart application
echo ""
echo "🔄 Step 5: Restarting application..."
ssh "$VPS_USER@$VPS_IP" "cd $APP_PATH && pm2 restart app"
sleep 3

# Step 6: Check status
echo ""
echo "📊 Step 6: Checking application status..."
ssh "$VPS_USER@$VPS_IP" "pm2 status"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo ""
echo "🧪 To test:"
echo "   curl -X POST https://www.simplifyconvert.com/api/pdf \\"
echo "     -F 'tool=split-pdf' \\"
echo "     -F 'file=@sample.pdf'"
echo ""
echo "📋 Check logs with:"
echo "   ssh root@75.119.155.15 'pm2 logs app | head -50'"
