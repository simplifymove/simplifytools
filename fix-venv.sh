#!/bin/bash
set -e

cd /var/www/simplifytools

echo "Installing PIL and dependencies in venv..."
./.venv/bin/pip install --upgrade pip setuptools wheel -q
./.venv/bin/pip install pillow rembg opencv-python scikit-image pillow-heif pdf2image -q

echo "Testing PIL import..."
./.venv/bin/python -c "from PIL import Image; print('SUCCESS: PIL is now available')"

echo "Restarting PM2..."
pm2 restart simplifytools
sleep 2

echo "Checking status..."
pm2 list

echo "Done! Waiting for server to stabilize..."
sleep 3

echo "Checking logs for errors..."
pm2 logs simplifytools --lines 20 --nostream
