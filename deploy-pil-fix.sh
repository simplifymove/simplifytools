#!/bin/bash
# Deploy PIL fix to VPS

VPS_HOST="root@75.119.155.15"
VPS_PATH="/var/www/simplifytools"

echo "=== PIL Import Fix Deployment ==="
echo "Target: $VPS_HOST:$VPS_PATH"
echo ""

# Build locally first
echo "[1/4] Building Next.js application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

echo "[2/4] Syncing .next build to VPS..."
rsync -avz --delete .next "$VPS_HOST:$VPS_PATH/"

echo "[3/4] Syncing Python routers to VPS..."
rsync -avz python/ "$VPS_HOST:$VPS_PATH/python/"

echo "[4/4] Syncing package.json and dependencies check..."
rsync -avz package.json package-lock.json "$VPS_HOST:$VPS_PATH/"

echo ""
echo "=== Deployment Complete ==="
echo "Changes deployed:"
echo "  - Next.js app with enhanced spawn environment variables"
echo "  - Python routers with aggressive site-packages discovery"
echo ""
echo "To restart the application:"
echo "  ssh $VPS_HOST 'cd $VPS_PATH && pm2 restart app'"
echo ""
echo "To test the PDF API:"
echo "  curl -X POST http://75.119.155.15/api/pdf -F 'tool=split-pdf' -F 'file=@test.pdf'"
