#!/bin/bash

# SimplifyConvert Post-Cleanup Verification Script
# Purpose: Comprehensive verification of cleanup results
# Version: 1.0
# Date: April 2026

echo "=========================================="
echo "SimplifyConvert Cleanup Verification"
echo "=========================================="
echo ""

PASS=0
FAIL=0
WARN=0

check() {
    if eval "$1" > /dev/null 2>&1; then
        echo "   ✓ $2"
        ((PASS++))
    else
        echo "   ✗ $2"
        ((FAIL++))
    fi
}

warn() {
    echo "   ⚠ $1"
    ((WARN++))
}

# 1. Nginx Configuration Checks
echo "[1] Nginx Configuration Checks"
check "nginx -t" "Nginx syntax is valid"
check "test -f /etc/nginx/sites-available/simplifyconvert.com" "Main config file exists"
check "test -L /etc/nginx/sites-enabled/simplifyconvert.com" "Main config is symlinked"
check "! test -L /etc/nginx/sites-enabled/www.simplifyconvert.com" "WWW config is not symlinked"
check "grep -q 'simplifyconvert.com' /etc/nginx/sites-available/simplifyconvert.com" "Main config contains domain name"
check "grep -q 'proxy_pass http://127.0.0.1:3001' /etc/nginx/sites-available/simplifyconvert.com" "Proxy configured for port 3001"
echo ""

# 2. Application Runtime Checks
echo "[2] Application Runtime Checks"
check "pm2 status | grep -q 'tinytools-app.*online'" "PM2 tinytools-app is online"
check "ss -tulpn | grep -q ':3001'" "Port 3001 is listening"
check "curl -s http://127.0.0.1:3001 | grep -q 'SimplifyConvert'" "Application responds on port 3001"
echo ""

# 3. SSL Certificate Checks
echo "[3] SSL Certificate Checks"
check "test -f /etc/letsencrypt/live/www.simplifyconvert.com/fullchain.pem" "SSL fullchain certificate exists"
check "test -f /etc/letsencrypt/live/www.simplifyconvert.com/privkey.pem" "SSL private key exists"
check "! echo | openssl s_client -connect 127.0.0.1:443 2>/dev/null | grep -q 'error'" "SSL handshake successful"
echo ""

# 4. Domain Response Checks
echo "[4] Domain Response Checks"
check "curl -s -I https://simplifyconvert.com 2>/dev/null | grep -q '200'" "simplifyconvert.com returns 200"
check "curl -s -I https://www.simplifyconvert.com 2>/dev/null | grep -q '200'" "www.simplifyconvert.com returns 200"
check "curl -s https://simplifyconvert.com 2>/dev/null | grep -q 'SimplifyConvert'" "simplifyconvert.com content is valid"
check "curl -s https://www.simplifyconvert.com 2>/dev/null | grep -q 'SimplifyConvert'" "www.simplifyconvert.com content is valid"
echo ""

# 5. Configuration Consistency Checks
echo "[5] Configuration Consistency Checks"
check "! grep -r ':3000' /etc/nginx/sites-available/" "No port 3000 references in nginx"
check "grep -r ':3001' /etc/nginx/sites-available/ | grep -q 'proxy_pass'" "Port 3001 is used for proxy"
check "! grep -r 'listen \[::\]' /etc/nginx/sites-available/simplifyconvert.com" "No IPv6-only listeners"
echo ""

# 6. Log Checks
echo "[6] Log Checks"
if tail -20 /var/log/nginx/error.log 2>/dev/null | grep -q "error"; then
    warn "Recent nginx errors detected (check /var/log/nginx/error.log)"
else
    check "! tail -20 /var/log/nginx/error.log 2>/dev/null | grep -q 'error'" "No recent nginx errors"
fi

if pm2 logs tinytools-app --err 2>/dev/null | head -5 | grep -q "error"; then
    warn "PM2 app logs contain errors (check with: pm2 logs tinytools-app)"
else
    echo "   ✓ No recent PM2 app errors"
    ((PASS++))
fi
echo ""

# 7. System Checks
echo "[7] System Checks"
check "systemctl is-active --quiet nginx" "Nginx service is active"
check "systemctl is-active --quiet pm2-init.service || pm2 status | grep -q 'online'" "PM2 service is active"
check "curl -s http://127.0.0.1:3001 | wc -c | grep -qv '^0$'" "Application is serving content"
echo ""

# 8. Backup Verification
echo "[8] Backup Verification"
LATEST_BACKUP=$(ls -td /var/backups/tinytools-cleanup-* 2>/dev/null | head -1)
if [ -d "$LATEST_BACKUP" ]; then
    check "test -f $LATEST_BACKUP/sites-available.backup/simplifyconvert.com" "Backup contains sites-available"
    check "test -d $LATEST_BACKUP/sites-enabled.backup" "Backup contains sites-enabled"
    echo "   ✓ Backup location: $LATEST_BACKUP"
    ((PASS++))
else
    warn "No recent backup found"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo "  ✓ Passed: $PASS"
echo "  ✗ Failed: $FAIL"
echo "  ⚠ Warnings: $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✓ All critical checks passed!"
    echo ""
    exit 0
else
    echo "✗ Some checks failed. Review above for details."
    echo ""
    exit 1
fi
