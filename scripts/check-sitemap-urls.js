#!/usr/bin/env node

/**
 * Sitemap URL Validation Script
 * 
 * Purpose:
 * - Reads sitemap.xml
 * - Validates all URLs
 * - Reports HTTP status codes
 * - Identifies broken links and redirects
 * - SEO-safe validation (checks for 200, 301, 302 responses)
 * 
 * Usage:
 * node scripts/check-sitemap-urls.js [--domain https://simplifyconvert.com]
 */

const http = require('http');
const https = require('https');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const BASE_DOMAIN = process.argv[2] || 'https://simplifyconvert.com';
const SITEMAP_PATH = 'public/sitemap.xml';

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const getStatusColor = (status) => {
  if (status === 200) return 'green';
  if (status === 301 || status === 302) return 'yellow';
  if (status === 404) return 'red';
  return 'cyan';
};

/**
 * Fetch a URL and return the HTTP status code
 */
async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { timeout: 5000 }, (response) => {
      resolve({
        url,
        status: response.statusCode,
        headers: response.headers,
      });
    });

    request.on('error', (error) => {
      resolve({
        url,
        status: 0,
        error: error.message,
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        status: 0,
        error: 'TIMEOUT',
      });
    });
  });
}

/**
 * Read and parse sitemap.xml
 */
async function parseSitemap() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(SITEMAP_PATH)) {
      reject(new Error(`Sitemap not found at ${SITEMAP_PATH}`));
    }

    const parser = new xml2js.Parser();
    fs.readFile(SITEMAP_PATH, (error, data) => {
      if (error) {
        reject(error);
      } else {
        parser.parseString(data, (parseError, result) => {
          if (parseError) {
            reject(parseError);
          } else {
            const urls = result.urlset.url.map((item) => item.loc[0]);
            resolve(urls);
          }
        });
      }
    });
  });
}

/**
 * Main validation function
 */
async function validateSitemap() {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║         SITEMAP URL VALIDATION CHECKER                  ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝\n', 'bright');

  try {
    // 1. Read sitemap
    log('📋 Reading sitemap from:', 'cyan');
    log(`   ${SITEMAP_PATH}\n`, 'cyan');

    const urls = await parseSitemap();
    log(`✓ Found ${urls.length} URLs in sitemap\n`, 'green');

    // 2. Validate each URL
    log('🔍 Validating URLs...\n', 'cyan');

    const results = {
      ok: [],
      redirect: [],
      error: [],
      broken: [],
    };

    // Batch validation with progress
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(checkUrl));

      batchResults.forEach((result) => {
        if (result.status === 200) {
          results.ok.push(result);
        } else if (result.status === 301 || result.status === 302) {
          results.redirect.push(result);
        } else if (result.status === 404) {
          results.broken.push(result);
        } else {
          results.error.push(result);
        }

        // Show progress
        const status = result.status || '✗';
        const color = getStatusColor(result.status);
        log(`  [${status}] ${result.url}`, color);
      });

      // Show batch progress
      const progress = Math.min(i + batchSize, urls.length);
      log(`\n  Progress: ${progress}/${urls.length}\n`, 'yellow');
    }

    // 3. Summary report
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║              VALIDATION SUMMARY REPORT                  ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝\n', 'bright');

    log(`✓ OK (200)           : ${results.ok.length} URLs`, 'green');
    log(`⚠ Redirects (301/302): ${results.redirect.length} URLs`, 'yellow');
    log(`✗ Broken (404)       : ${results.broken.length} URLs`, 'red');
    log(`⚠ Errors/Timeouts    : ${results.error.length} URLs\n`, 'yellow');

    // 4. Detail broken URLs
    if (results.broken.length > 0) {
      log('\n🚨 BROKEN URLS (404 Not Found):\n', 'red');
      results.broken.forEach((result) => {
        log(`   ${result.status} - ${result.url}`, 'red');
      });
    }

    // 5. Detail redirects
    if (results.redirect.length > 0) {
      log('\n⚠️  REDIRECT URLs (301/302):\n', 'yellow');
      results.redirect.forEach((result) => {
        log(`   ${result.status} - ${result.url}`, 'yellow');
        if (result.headers.location) {
          log(`       → ${result.headers.location}`, 'yellow');
        }
      });
    }

    // 6. Detail errors
    if (results.error.length > 0) {
      log('\n⚠️  ERROR/TIMEOUT URLs:\n', 'yellow');
      results.error.forEach((result) => {
        log(`   FAILED - ${result.url}`, 'yellow');
        if (result.error) {
          log(`         Error: ${result.error}`, 'yellow');
        }
      });
    }

    // 7. Final status
    const isHealthy = results.broken.length === 0 && results.error.length === 0;
    const message = isHealthy
      ? '✅ SITEMAP IS HEALTHY - All URLs are valid!'
      : '❌ SITEMAP HAS ISSUES - See above for details';
    
    const messageColor = isHealthy ? 'green' : 'red';
    log(`\n${message}\n`, messageColor);

    // Exit code
    process.exit(isHealthy ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, 'red');
    process.exit(1);
  }
}

// Run validation
validateSitemap();
