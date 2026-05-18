#!/usr/bin/env node

/**
 * SEO Indexability Validation Script
 * 
 * Checks all URLs in sitemap.xml for indexability issues including:
 * - HTTP status codes (must be 200 for indexable pages)
 * - Canonical tags (must point to same domain and non-www)
 * - Meta robots (must not have noindex)
 * - Title tags (must exist)
 * - Meta descriptions (must exist with 120-160 characters)
 * - H1 tags (must exist and be unique)
 * - Static assets (must not be in sitemap)
 * - www/non-www mismatches
 * 
 * Usage:
 * node scripts/seo-indexability-check.js [--domain https://simplifyconvert.com]
 */

const http = require('http');
const https = require('https');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE_DOMAIN = process.argv[2] || 'https://simplifyconvert.com';
const SITEMAP_PATH = 'public/sitemap.xml';
const CANONICAL_DOMAIN = 'simplifyconvert.com'; // Non-www preferred domain
const REQUEST_TIMEOUT = 10000; // 10 second timeout per URL

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✓ ${message}`, 'green');
const logError = (message) => log(`✗ ${message}`, 'red');
const logWarning = (message) => log(`⚠ ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ ${message}`, 'cyan');

/**
 * Fetch a URL and return HTML content + status code
 */
async function fetchUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { timeout: REQUEST_TIMEOUT }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          url,
          statusCode: response.statusCode,
          html: data,
          headers: response.headers,
        });
      });
    });

    request.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        error: error.message,
        html: null,
        headers: {},
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        url,
        statusCode: 0,
        error: 'TIMEOUT',
        html: null,
        headers: {},
      });
    });
  });
}

/**
 * Parse HTML and extract SEO metadata
 */
function parseSeoMetadata(html, headers = {}) {
  if (!html) return null;
  
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    const getMetaContent = (name) => {
      const attr = doc.querySelector(`meta[${name}]`)?.getAttribute('content');
      return attr || null;
    };
    
    const title = doc.querySelector('title')?.textContent || null;
    const h1 = doc.querySelector('h1')?.textContent || null;
    const description = getMetaContent('name="description"') || 
                       getMetaContent('property="og:description"');
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
    const robotsMeta = getMetaContent('name="robots"') || null;
    
    // Check both meta tag and HTTP header for noindex directives
    const xRobotsTag = headers['x-robots-tag'] || '';
    const hasNoindexMeta = robotsMeta && robotsMeta.toLowerCase().includes('noindex');
    const hasNoindexHeader = xRobotsTag.toLowerCase().includes('noindex');
    
    return {
      title,
      h1,
      description,
      canonical,
      robotsMeta: robotsMeta || 'index, follow',
      xRobotsTag,
      hasNoindex: hasNoindexMeta || hasNoindexHeader,
      hasNoindexMeta,
      hasNoindexHeader,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validate SEO metadata
 */
function validateMetadata(seo) {
  const issues = [];
  
  if (!seo) {
    return ['Failed to parse HTML'];
  }
  
  // Check title
  if (!seo.title) {
    issues.push('Missing title tag');
  } else if (seo.title.length < 30 || seo.title.length > 60) {
    issues.push(`Title length ${seo.title.length} (should be 30-60 chars): "${seo.title}"`);
  }
  
  // Check meta description
  if (!seo.description) {
    issues.push('Missing meta description');
  } else if (seo.description.length < 120 || seo.description.length > 160) {
    issues.push(`Description length ${seo.description.length} (should be 120-160 chars): "${seo.description}"`);
  }
  
  // Check H1
  if (!seo.h1) {
    issues.push('Missing H1 tag');
  }
  
  // Check for noindex (both meta tag and header)
  if (seo.hasNoindex) {
    if (seo.hasNoindexMeta) {
      issues.push('Critical: Page has noindex meta tag');
    }
    if (seo.hasNoindexHeader) {
      issues.push('Critical: X-Robots-Tag header contains noindex');
    }
  }
  
  // Warn if robots metadata is suspicious
  if (seo.robotsMeta && !seo.robotsMeta.toLowerCase().includes('index')) {
    issues.push(`Robots meta may block indexing: "${seo.robotsMeta}"`);
  }
  
  // Check canonical
  if (!seo.canonical) {
    issues.push('Missing canonical URL');
  } else if (!seo.canonical.includes(CANONICAL_DOMAIN)) {
    issues.push(`Canonical points to wrong domain: ${seo.canonical}`);
  } else if (seo.canonical.includes('www.')) {
    issues.push(`Canonical uses www (should be non-www): ${seo.canonical}`);
  }
  
  return issues;
}

/**
 * Read and parse sitemap
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
 * Check for static asset URLs in sitemap
 */
function validateSitemapUrls(urls) {
  const issues = [];
  const staticAssetPatterns = [
    '/_next/static',
    '/favicon.ico',
    '.woff2',
    '.woff',
    '.ttf',
    '.css?',
    '.js?',
  ];
  
  const staticAssets = urls.filter(url => 
    staticAssetPatterns.some(pattern => url.includes(pattern))
  );
  
  if (staticAssets.length > 0) {
    issues.push({
      type: 'STATIC_ASSETS_IN_SITEMAP',
      count: staticAssets.length,
      examples: staticAssets.slice(0, 3),
    });
  }
  
  return { staticAssets, issues };
}

/**
 * Main validation function
 */
async function validateIndexability() {
  log('\n╔════════════════════════════════════════════════════════╗', 'bright');
  log('║       SEO INDEXABILITY VALIDATION CHECKER                ║', 'bright');
  log('╚════════════════════════════════════════════════════════╝\n', 'bright');

  try {
    // 1. Read sitemap
    logInfo('Reading sitemap from: ' + SITEMAP_PATH);
    const urls = await parseSitemap();
    logSuccess(`Found ${urls.length} URLs in sitemap\n`);

    // 2. Check for static assets in sitemap
    logInfo('Checking for static assets in sitemap...');
    const { staticAssets, issues: sitemapIssues } = validateSitemapUrls(urls);
    if (staticAssets.length === 0) {
      logSuccess('No static assets found in sitemap\n');
    } else {
      logError(`${staticAssets.length} static asset URLs found in sitemap\n`);
      staticAssets.slice(0, 5).forEach(url => {
        logError(`  - ${url}`);
      });
      log('');
    }

    // 3. Validate each URL for indexability
    logInfo('Validating URLs for indexability...\n');

    const results = {
      ok: [],
      warnings: [],
      critical: [],
    };

    const batchSize = 3;
    for (let i = 0; i < Math.min(urls.length, 50); i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(fetchUrl));

      batchResults.forEach((result) => {
        const url = result.url;
        const issues = [];
        
        // Check status code
        if (result.statusCode !== 200) {
          issues.push(`Status: ${result.statusCode}`);
        }
        
        // Parse SEO metadata
        const seo = parseSeoMetadata(result.html, result.headers);
        const metaIssues = validateMetadata(seo);
        issues.push(...metaIssues);
        
        // Check for www/non-www mismatch
        if (url.includes('www.') && !CANONICAL_DOMAIN.includes('www')) {
          issues.push(`URL uses www but canonical should be non-www`);
        }
        
        // Categorize results
        if (issues.length === 0) {
          results.ok.push(url);
        } else if (issues.some(i => i.includes('Status') || i.includes('noindex'))) {
          results.critical.push({ url, issues });
        } else {
          results.warnings.push({ url, issues });
        }
        
        // Log result
        if (issues.length === 0) {
          logSuccess(url);
        } else if (issues.some(i => i.includes('Status') || i.includes('noindex'))) {
          logError(`${url}`);
          issues.forEach(issue => logError(`    └─ ${issue}`));
        } else {
          logWarning(`${url}`);
          issues.forEach(issue => logWarning(`    └─ ${issue}`));
        }
      });

      // Show progress
      const progress = Math.min(i + batchSize, Math.min(urls.length, 50));
      log(`\nProgress: ${progress}/${Math.min(urls.length, 50)}\n`, 'gray');
    }

    // 4. Summary report
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║              VALIDATION SUMMARY REPORT                  ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝\n', 'bright');

    logSuccess(`${results.ok.length} URLs passed all checks`);
    logWarning(`${results.warnings.length} URLs have minor issues`);
    logError(`${results.critical.length} URLs have critical issues`);
    
    if (staticAssets.length > 0) {
      logError(`${staticAssets.length} static asset URLs in sitemap`);
    }

    // 5. Critical issues detail
    if (results.critical.length > 0) {
      log('\n🚨 CRITICAL ISSUES:\n', 'red');
      results.critical.slice(0, 10).forEach(({ url, issues }) => {
        logError(url);
        issues.forEach(issue => logError(`  └─ ${issue}`));
      });
    }

    // 5a. AI Tool Pages Indexability Check
    const aiToolPages = [
      '/all-tools/ai-tools/summarizer',
      '/all-tools/ai-tools/email-writer',
      '/all-tools/ai-tools/blog-generator',
      '/all-tools/ai-tools/social-media-writer',
    ];
    
    const aiToolResults = results.critical.filter(r => 
      aiToolPages.some(path => r.url.includes(path))
    );
    
    if (aiToolResults.length > 0) {
      log('\n⚠️  AI WRITING TOOLS INDEXABILITY ISSUES:\n', 'red');
      log('These pages must be indexable for Google visibility.\n', 'red');
      aiToolResults.forEach(({ url, issues }) => {
        logError(url);
        issues.forEach(issue => logError(`  └─ ${issue}`));
      });
    } else if (results.ok.length > 0) {
      const aiToolsOk = results.ok.filter(url => 
        aiToolPages.some(path => url.includes(path))
      );
      if (aiToolsOk.length > 0) {
        log('\n✓ AI Writing Tools - All pages properly indexed:\n', 'green');
        aiToolsOk.forEach(url => logSuccess(url));
      }
    }

    // 6. Warning issues detail
    if (results.warnings.length > 0 && results.warnings.length <= 5) {
      log('\n⚠️  WARNING ISSUES:\n', 'yellow');
      results.warnings.forEach(({ url, issues }) => {
        logWarning(url);
        issues.forEach(issue => logWarning(`  └─ ${issue}`));
      });
    }

    // 7. Final status
    const hasFailures = results.critical.length > 0 || staticAssets.length > 0;
    const message = hasFailures
      ? '❌ INDEXABILITY ISSUES FOUND - See above for details'
      : '✅ SITEMAP IS INDEXABILITY-READY - All checked URLs passed';
    
    const messageColor = hasFailures ? 'red' : 'green';
    log(`\n${message}\n`, messageColor);

    // Recommendations
    if (results.critical.length > 0 || results.warnings.length > 0 || staticAssets.length > 0) {
      log('\n📋 RECOMMENDATIONS:\n', 'cyan');
      if (staticAssets.length > 0) {
        logInfo('1. Remove static assets from sitemap generation');
      }
      if (results.critical.length > 0) {
        logInfo(`${staticAssets.length > 0 ? '2' : '1'}. Fix pages returning non-200 status codes`);
      }
      if (results.warnings.length > 0) {
        logInfo(`${staticAssets.length > 0 ? '3' : '2'}. Add missing meta descriptions, H1 tags, or fix canonical URLs`);
      }
    }

    log('');
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    logError(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

// Run validation
validateIndexability();
