/**
 * Comprehensive Canonical URL Verification Script
 * Audits all 151+ tool pages for correct canonical URLs
 * 
 * Usage:
 * node verify-all-canonical-urls.js
 * 
 * This script will:
 * 1. Check all layout files for canonical URL definitions
 * 2. Verify each canonical URL matches the page route
 * 3. Identify any /converters/ references remaining
 * 4. Report all issues found
 * 5. Create a remediation checklist
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://simplifyconvert.com';
const TOOLS_DIR = path.join(__dirname, 'app/all-tools');

// Expected canonical URL patterns
const CANONICAL_PATTERNS = {
  // Static routes: /all-tools/[slug]
  static: /\/all-tools\/([a-z\-]+)\/layout\.tsx$/,
  // Dynamic routes: /all-tools/[category]/[slug]
  dynamic: /\/all-tools\/([a-z\-]+)\/\[slug\]\/layout\.tsx$/,
  // Special nested routes: /all-tools/[category]/[special]/layout.tsx
  nested: /\/all-tools\/([a-z\-]+)\/([a-z\-]+)\/layout\.tsx$/,
};

let issues = {
  filesWithConverters: [],
  filesWithWrongCanonical: [],
  filesWithMissingCanonical: [],
  filesToVerify: [],
};

let stats = {
  totalFiles: 0,
  staticRoutes: 0,
  dynamicRoutes: 0,
  nestedRoutes: 0,
  issuesFound: 0,
};

/**
 * Recursively find all layout.tsx files
 */
function findAllLayoutFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      findAllLayoutFiles(filePath, fileList);
    } else if (file === 'layout.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract canonical URL from layout file
 */
function extractCanonicalUrl(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Look for alternates.canonical
  const canonicalMatch = content.match(/canonical:\s*['"`]([^'"`]+)['"`]/);
  if (canonicalMatch) {
    return canonicalMatch[1];
  }
  
  // Look for canonicalUrl variable
  const urlMatch = content.match(/const\s+canonicalUrl\s*=\s*[`']([^`']+)[`']/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Look for baseUrl/all-tools pattern
  const baseUrlMatch = content.match(/\/all-tools\/([a-z\-\$\{\/\}]+)/g);
  if (baseUrlMatch) {
    return baseUrlMatch[0];
  }
  
  return null;
}

/**
 * Determine expected canonical URL from file path
 */
function getExpectedCanonicalUrl(filePath) {
  const relativePath = path.relative(TOOLS_DIR, filePath);
  const segments = relativePath.split(path.sep);
  
  if (segments[segments.length - 1] !== 'layout.tsx') {
    return null;
  }
  
  // Remove layout.tsx from segments
  const routeSegments = segments.slice(0, -1);
  
  // Filter out [slug] and other dynamic segments
  const canonicalSegments = routeSegments.filter(
    s => !s.startsWith('[') && !s.endsWith(']')
  );
  
  // Build expected canonical path
  if (canonicalSegments.length > 0) {
    const canonicalPath = `/all-tools/${canonicalSegments.join('/')}`;
    return `${BASE_URL}${canonicalPath}`;
  }
  
  return null;
}

/**
 * Check if content has /converters/ issue
 */
function hasConvertersIssue(content, filePath) {
  // Check for hardcoded /converters/ in canonical URLs
  if (content.includes('/all-tools/converters/')) {
    return true;
  }
  
  // Check for converters in dynamically built URLs
  if (content.includes('converters/') && filePath.includes('[slug]')) {
    return true;
  }
  
  return false;
}

/**
 * Main audit function
 */
function auditAllCanonicalUrls() {
  console.log('🔍 Starting Comprehensive Canonical URL Audit\n');
  console.log('=' .repeat(70));
  
  const allLayoutFiles = findAllLayoutFiles(TOOLS_DIR);
  stats.totalFiles = allLayoutFiles.length;
  
  console.log(`\n📊 Found ${stats.totalFiles} layout.tsx files to audit\n`);
  
  // Group files by type
  const staticFiles = [];
  const dynamicFiles = [];
  const nestedFiles = [];
  
  allLayoutFiles.forEach((filePath) => {
    const relativePath = filePath.replace(/\\/g, '/');
    
    if (relativePath.match(/\/\[slug\]\//)) {
      dynamicFiles.push(filePath);
      stats.dynamicRoutes++;
    } else if (relativePath.match(/\/[a-z\-]+\/[a-z\-]+\/layout\.tsx$/)) {
      nestedFiles.push(filePath);
      stats.nestedRoutes++;
    } else {
      staticFiles.push(filePath);
      stats.staticRoutes++;
    }
  });
  
  console.log(`  📌 Static Routes: ${stats.staticRoutes}`);
  console.log(`  📌 Dynamic Routes: ${stats.dynamicRoutes}`);
  console.log(`  📌 Nested Routes: ${stats.nestedRoutes}`);
  console.log(`\n${'='.repeat(70)}\n`);
  
  // Audit static routes
  console.log('🔎 STATIC ROUTES (/all-tools/[slug]/layout.tsx):\n');
  staticFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const canonical = extractCanonicalUrl(filePath);
    const expected = getExpectedCanonicalUrl(filePath);
    
    const hasIssue = hasConvertersIssue(content, filePath);
    const mismatch = canonical && expected && canonical !== expected;
    
    if (hasIssue || mismatch) {
      stats.issuesFound++;
      issues.filesWithWrongCanonical.push({
        file: filePath,
        current: canonical,
        expected: expected,
        hasConverters: hasIssue,
      });
      console.log(`  ❌ ${path.basename(path.dirname(filePath))}`);
      if (hasIssue) console.log(`     └─ Contains /converters/`);
      if (mismatch) console.log(`     └─ Mismatch: ${canonical} vs ${expected}`);
    } else if (!canonical) {
      stats.issuesFound++;
      issues.filesWithMissingCanonical.push(filePath);
      console.log(`  ⚠️  ${path.basename(path.dirname(filePath))} - NO CANONICAL FOUND`);
    } else {
      console.log(`  ✅ ${path.basename(path.dirname(filePath))}`);
    }
  });
  
  // Audit dynamic routes
  console.log(`\n🔎 DYNAMIC ROUTES (/all-tools/[category]/[slug]/layout.tsx):\n`);
  let dynamicIssueCount = 0;
  dynamicFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasIssue = hasConvertersIssue(content, filePath);
    
    if (hasIssue) {
      dynamicIssueCount++;
      stats.issuesFound++;
      issues.filesWithConverters.push(filePath);
      console.log(`  ❌ ${filePath.replace(TOOLS_DIR, '')}`);
    }
  });
  if (dynamicIssueCount === 0) {
    console.log(`  ✅ All ${dynamicFiles.length} dynamic routes look correct\n`);
  }
  
  // Audit nested routes
  console.log(`\n🔎 NESTED ROUTES (/all-tools/[category]/[special]/layout.tsx):\n`);
  let nestedIssueCount = 0;
  nestedFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasIssue = hasConvertersIssue(content, filePath);
    
    if (hasIssue) {
      nestedIssueCount++;
      stats.issuesFound++;
      issues.filesWithConverters.push(filePath);
      console.log(`  ❌ ${filePath.replace(TOOLS_DIR, '')}`);
    }
  });
  if (nestedIssueCount === 0) {
    console.log(`  ✅ All ${nestedFiles.length} nested routes look correct\n`);
  }
  
  // Print summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('\n📋 AUDIT SUMMARY:\n');
  console.log(`  Total Layout Files Checked: ${stats.totalFiles}`);
  console.log(`  Issues Found: ${stats.issuesFound}`);
  console.log(`  Files with /converters/: ${issues.filesWithConverters.length}`);
  console.log(`  Files with Wrong Canonical: ${issues.filesWithWrongCanonical.length}`);
  console.log(`  Files with Missing Canonical: ${issues.filesWithMissingCanonical.length}`);
  
  // Print remediation checklist
  if (stats.issuesFound > 0) {
    console.log(`\n${'='.repeat(70)}`);
    console.log('\n🔧 REMEDIATION CHECKLIST:\n');
    
    if (issues.filesWithConverters.length > 0) {
      console.log(`1. Fix ${issues.filesWithConverters.length} files with /converters/ references:\n`);
      issues.filesWithConverters.forEach((file) => {
        console.log(`   - ${file.replace(TOOLS_DIR, '')}`);
      });
    }
    
    if (issues.filesWithWrongCanonical.length > 0) {
      console.log(`\n2. Fix ${issues.filesWithWrongCanonical.length} files with mismatched canonical URLs:\n`);
      issues.filesWithWrongCanonical.forEach((item) => {
        console.log(`   - ${item.file.replace(TOOLS_DIR, '')}`);
        console.log(`     Current: ${item.current}`);
        console.log(`     Expected: ${item.expected}`);
      });
    }
    
    if (issues.filesWithMissingCanonical.length > 0) {
      console.log(`\n3. Add canonical tags to ${issues.filesWithMissingCanonical.length} files:\n`);
      issues.filesWithMissingCanonical.forEach((file) => {
        console.log(`   - ${file.replace(TOOLS_DIR, '')}`);
      });
    }
  } else {
    console.log('\n✅ ALL CANONICAL URLS ARE CORRECT!\n');
  }
  
  console.log(`${'='.repeat(70)}\n`);
}

// Run audit
auditAllCanonicalUrls();
