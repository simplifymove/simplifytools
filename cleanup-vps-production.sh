#!/bin/bash

# SimplifyConvert VPS Cleanup Script
# Purpose: Automate cleanup of redundant nginx configs and verify unified setup
# Version: 1.0
# Date: April 2026

set -e

BACKUP_DIR="/var/backups/tinytools-cleanup-$(date +%Y%m%d-%H%M%S)"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
MAIN_CONFIG="$NGINX_SITES_AVAILABLE/simplifyconvert.com"
WWW_CONFIG="$NGINX_SITES_AVAILABLE/www.simplifyconvert.com"

echo "=========================================="
echo "SimplifyConvert VPS Cleanup"
echo "=========================================="
echo ""

# Step 1: Create backup
echo "[1/7] Creating backup of current configuration..."
mkdir -p "$BACKUP_DIR"
cp -r "$NGINX_SITES_AVAILABLE" "$BACKUP_DIR/sites-available.backup" 2>/dev/null || true
cp -r "$NGINX_SITES_ENABLED" "$BACKUP_DIR/sites-enabled.backup" 2>/dev/null || true
cp /etc/nginx/nginx.conf "$BACKUP_DIR/nginx.conf.backup" 2>/dev/null || true
pm2 save > "$BACKUP_DIR/pm2-conf.backup" 2>/dev/null || true
echo "   ✓ Backup created at: $BACKUP_DIR"
echo ""

# Step 2: Audit current state
echo "[2/7] Auditing current state..."
echo "   Checking nginx configs..."
echo "   Main config ($MAIN_CONFIG):"
if [ -f "$MAIN_CONFIG" ]; then
    echo "      ✓ Exists"
    grep -E "listen|proxy_pass|server_name" "$MAIN_CONFIG" | head -5 || true
else
    echo "      ✗ Not found"
fi

echo "   WWW config ($WWW_CONFIG):"
if [ -f "$WWW_CONFIG" ]; then
    echo "      ✓ Exists"
    grep -E "listen|proxy_pass|server_name" "$WWW_CONFIG" | head -5 || true
else
    echo "      ✗ Not found"
fi

echo "   Checking nginx symlinks..."
ls -la "$NGINX_SITES_ENABLED"/ | grep -E "simplifyconvert|www.simplifyconvert" || echo "      (None found)"
echo ""

# Step 3: Disable redundant www config
echo "[3/7] Disabling redundant www.simplifyconvert.com config..."
if [ -L "$NGINX_SITES_ENABLED/www.simplifyconvert.com" ]; then
    rm "$NGINX_SITES_ENABLED/www.simplifyconvert.com"
    echo "   ✓ Symlink removed"
elif [ -f "$NGINX_SITES_ENABLED/www.simplifyconvert.com" ]; then
    mv "$NGINX_SITES_ENABLED/www.simplifyconvert.com" "$NGINX_SITES_ENABLED/www.simplifyconvert.com.old"
    echo "   ✓ Config disabled (moved to .old)"
else
    echo "   ✓ Already disabled"
fi
echo ""

# Step 4: Ensure main config is properly symlinked
echo "[4/7] Ensuring main config is symlinked..."
if [ ! -L "$NGINX_SITES_ENABLED/simplifyconvert.com" ]; then
    rm -f "$NGINX_SITES_ENABLED/simplifyconvert.com"
    ln -s "$NGINX_SITES_AVAILABLE/simplifyconvert.com" "$NGINX_SITES_ENABLED/simplifyconvert.com"
    echo "   ✓ Symlink created"
else
    echo "   ✓ Symlink already exists"
fi
echo ""

# Step 5: Validate nginx syntax
echo "[5/7] Validating nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✓ Nginx configuration is valid"
else
    echo "   ⚠ Nginx validation output:"
    nginx -t 2>&1 || true
fi
echo ""

# Step 6: Reload nginx
echo "[6/7] Reloading nginx..."
systemctl reload nginx
sleep 2
if systemctl is-active --quiet nginx; then
    echo "   ✓ Nginx reloaded successfully"
else
    echo "   ✗ Nginx failed to reload!"
    exit 1
fi
echo ""

# Step 7: Verify both domains
echo "[7/7] Verifying domain responses..."
echo "   Checking simplifyconvert.com..."
if curl -s -I https://simplifyconvert.com | head -1 | grep -q "200\|301"; then
    echo "   ✓ simplifyconvert.com is responding"
else
    echo "   ⚠ Unexpected response from simplifyconvert.com"
fi

echo "   Checking www.simplifyconvert.com..."
if curl -s -I https://www.simplifyconvert.com | head -1 | grep -q "200\|301"; then
    echo "   ✓ www.simplifyconvert.com is responding"
else
    echo "   ⚠ Unexpected response from www.simplifyconvert.com"
fi
echo ""

echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • Backup location: $BACKUP_DIR"
echo "  • Main config: $MAIN_CONFIG"
echo "  • Symlink: $NGINX_SITES_ENABLED/simplifyconvert.com"
echo "  • WWW config: Disabled"
echo ""
echo "Next: Run verify-cleanup.sh to perform detailed checks"
echo ""
