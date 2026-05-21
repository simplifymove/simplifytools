# Phase 8: Flaky Test Reduction Guide

**Objective**: Reduce flaky test rate from baseline to <5%, ultimately targeting <2%

## Current Status

**Baseline Flakiness**: TBD (to be measured)
**Target**: <5% flaky test rate
**Stretch Goal**: <2% flaky test rate

---

## 1. Flaky Test Patterns & Causes

### Pattern #1: Arbitrary Waits
**Issue**: Tests use fixed `await page.waitForTimeout(n)` delays

**Symptom**: 
- Tests sometimes fail if page is slow
- Tests sometimes fail if server is busy
- Pass rate: 85-95%

**Root Cause**:
```typescript
// ❌ Arbitrary wait - page might not be ready
await page.click('button');
await page.waitForTimeout(2000); // What if page takes 3 seconds?
await page.evaluate(() => doSomething());
```

**Solution**:
```typescript
// ✅ Wait for actual condition
await page.click('button');
await page.waitForNavigation(); // Wait for page to load
await page.waitForFunction(() => {
  return (window as any).ready === true;
}); // Wait for app state
```

---

### Pattern #2: Unstable CSS Selectors
**Issue**: Selectors rely on brittle implementation details

**Symptom**:
- Tests fail after layout changes
- Tests fail on different screen sizes
- Pass rate: 60-80%

**Root Cause**:
```typescript
// ❌ Index-based selector (unstable)
const buttons = await page.$$('button');
await buttons[2].click(); // Which button is this really?

// ❌ Attribute-based but too specific
await page.click('button[class="btn btn-primary btn-md btn-rounded"]');

// ❌ Deep DOM traversal
await page.click('div.container > div.row > div.col > button');
```

**Solution**:
```typescript
// ✅ Use test identifiers
await page.click('[data-testid="submit-button"]');

// ✅ Use descriptive role selectors
await page.click('button:has-text("Submit")');

// ✅ Use label associations
await page.click('text=Next Step');
```

---

### Pattern #3: Race Conditions
**Issue**: Tests assume execution order but events are async

**Symptom**:
- Tests fail intermittently
- Failures increase under load
- Pass rate: 70-90%

**Root Cause**:
```typescript
// ❌ No wait for async operation
await page.fill('input#email', 'test@example.com');
const validation = await page.textContent('.error');
// ^^ Error message might not appear yet!
```

**Solution**:
```typescript
// ✅ Wait for condition
await page.fill('input#email', 'test@example.com');
await page.waitForSelector('.error'); // Wait for error to appear
const validation = await page.textContent('.error');
```

---

### Pattern #4: Slow Page Editors
**Issue**: Rich text editors or media players take >2 seconds to initialize

**Symptom**:
- Tests fail when editor doesn't load in time
- Retry helps occasionally
- Pass rate: 60-75%

**Root Cause**:
```typescript
// ❌ Assumes editor is ready
await page.click('[data-testid="editor"]');
await page.keyboard.type('Hello');
// ^^ Editor might not be focused yet!
```

**Solution**:
```typescript
// ✅ Wait for editor to be ready
await page.click('[data-testid="editor"]');
await page.waitForFunction(() => {
  return (window as any).editor?.isReady === true;
}, { timeout: 5000 }); // Increase timeout
await page.keyboard.type('Hello');
```

---

### Pattern #5: Network Issues
**Issue**: Transient network errors cause test failures

**Symptom**:
- Random 502/503 errors
- Pass rate fluctuates: 70-100%
- More failures during high load

**Root Cause**:
```typescript
// ❌ No retry for transient failures
const response = await page.goto('https://api.example.com/test');
if (!response?.ok) {
  throw new Error('Network error');
}
```

**Solution**:
```typescript
// ✅ Retry transient failures
async function navigateWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      if (response?.ok) return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## 2. Detecting Flaky Tests

### Method 1: Test Run History Analysis
**From Database**:
```sql
-- PostgreSQL: Find tests with <90% success rate in last 7 days
SELECT 
  tool_id,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
  (SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as success_rate
FROM audit_test_result
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY tool_id
HAVING (SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END)::float / COUNT(*)) < 0.90
ORDER BY success_rate ASC;
```

### Method 2: Flaky Detection Service
**Using Phase 7 flaky detection**:
```typescript
const { getFlakyTests } = require('@/lib/services/flaky-detection');
const flakyTests = await getFlakyTests();
// Returns: [
//   { toolId: 'pdf-rotate', failureRate: 0.15, pattern: 'timeout' },
//   { toolId: 'image-resize', failureRate: 0.08, pattern: 'selector-drift' }
// ]
```

### Method 3: Visual Test Output Inspection
```bash
# Run test with UI mode to see failures
npx playwright test tests/pdf-tools.spec.ts --ui

# Generate HTML report with failures
npx playwright show-report
```

---

## 3. Common Flaky Test Fixes

### Fix #1: Replace Arbitrary Waits

**File**: `tests/pdf-tools.spec.ts`
**Issue**: Tests use fixed 2-second waits

```typescript
// ❌ Before
test('Rotate PDF', async ({ page }) => {
  await page.goto('/tools/pdf-rotate');
  await page.waitForTimeout(2000);
  await page.click('input[type="file"]');
  await page.waitForTimeout(1000);
  const result = await page.textContent('.result');
});

// ✅ After
test('Rotate PDF', async ({ page }) => {
  await page.goto('/tools/pdf-rotate', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="file-input"]');
  await page.click('[data-testid="file-input"]');
  await page.waitForSelector('[data-testid="result"]', { timeout: 10000 });
  const result = await page.textContent('[data-testid="result"]');
});
```

---

### Fix #2: Stabilize CSS Selectors

**Issue**: Selectors are fragile

```typescript
// ❌ Before (fragile)
await page.click('button.btn.btn-primary'); // Assumes CSS classes
await page.click('div.container > button'); // Deep DOM traversal

// ✅ After (stable)
// First, add data-testid to HTML templates:
// <button data-testid="submit-button" class="btn btn-primary">Submit</button>

// Then in tests:
await page.click('[data-testid="submit-button"]');
```

---

### Fix #3: Handle Race Conditions

**Issue**: Async operations not awaited

```typescript
// ❌ Before (race condition)
await page.fill('input#email', 'user@example.com');
const error = await page.textContent('.error');
// ^^ Error might not be visible yet

// ✅ After (deterministic)
await page.fill('input#email', 'user@example.com');
await page.waitForSelector('.error'); // Wait for error to appear
await page.waitForTimeout(500); // Allow animation
const error = await page.textContent('.error');
```

---

### Fix #4: Increase Timeouts for Slow Resources

**Issue**: Editors take >2 seconds to load

```typescript
// ❌ Before (default 30s timeout)
await page.waitForSelector('[data-testid="rich-editor"]');

// ✅ After (increased timeout)
await page.waitForSelector('[data-testid="rich-editor"]', { timeout: 10000 });

// Or wait for specific state:
await page.waitForFunction(() => {
  return (window as any).richeditor?.isReady === true;
}, { timeout: 10000 });
```

---

### Fix #5: Add Retry Logic

**Issue**: Network timeouts cause failures

```typescript
// ❌ Before (no retry)
const response = await page.goto(url);
expect(response?.ok).toBe(true);

// ✅ After (with retry)
async function navigationWithRetry(page: Page, url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      if (response?.ok) return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000 * (i + 1));
    }
  }
}

// Usage:
await navigationWithRetry(page, '/tools/pdf-rotate', 3);
```

---

## 4. Test Stability Checklist

For each flaky test, verify:

- [ ] No arbitrary `waitForTimeout()` calls (replace with `waitForNavigation()`, `waitForSelector()`, etc.)
- [ ] All CSS selectors use `data-testid` or role selectors
- [ ] All async operations are awaited
- [ ] Timeouts are sufficient for slow resources (≥5s for editors)
- [ ] Network errors handled with retry logic
- [ ] Page navigation waits for `networkidle2`
- [ ] File uploads wait for processing to complete
- [ ] No hard-coded coordinates (use selectors)
- [ ] No element visibility assumptions
- [ ] Tests work reliably when run 10x in a row

---

## 5. Flaky Test Fixes by Category

### PDF Tools Flakiness
**Common Issues**:
- File upload timeout
- PDF processing delay
- Missing file validation message

**Fixes**:
```typescript
// 1. Wait for file to be uploaded
await page.setInputFiles('input[type="file"]', filePath);
await page.waitForSelector('[data-testid="file-preview"]');

// 2. Wait for processing
await page.click('[data-testid="process-button"]');
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="result"]') !== null;
}, { timeout: 10000 });

// 3. Verify result is ready
await page.waitForSelector('[data-testid="download-button"]:not([disabled])');
```

---

### Image Tools Flakiness
**Common Issues**:
- Canvas rendering delay
- WebGL initialization
- Image cropping selector drift

**Fixes**:
```typescript
// 1. Wait for canvas to be ready
await page.waitForFunction(() => {
  return (window as any).canvasContext !== undefined;
}, { timeout: 5000 });

// 2. Use stable selectors for crop areas
await page.click('[data-testid="crop-area-nw"]'); // Named regions instead of coordinates

// 3. Wait for preview update
await page.waitForSelector('[data-testid="preview"]', { state: 'attached' });
```

---

### Video Tools Flakiness
**Common Issues**:
- FFmpeg timeout
- Video codec detection delay
- Progress bar update

**Fixes**:
```typescript
// 1. Increase video processing timeout
await page.click('[data-testid="compress-button"]');
await page.waitForFunction(() => {
  return (window as any).processingComplete === true;
}, { timeout: 30000 }); // 30 seconds for video

// 2. Wait for progress update
await page.waitForSelector('[data-testid="progress"]:has-text("100%")');
```

---

## 6. Monitoring Flaky Tests

### Automated Detection
```typescript
// Track flakiness in database
async function trackTestFlakiness(toolId: string, status: 'passed' | 'failed') {
  const recentTests = await prisma.auditTestResult.findMany({
    where: { toolId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const passCount = recentTests.filter(t => t.status === 'PASSED').length;
  const failRate = (20 - passCount) / 20;

  if (failRate > 0.15) { // 15% failure rate
    logger.warn(`Flaky test detected: ${toolId}`, { failureRate: failRate * 100 });
    // Trigger alert
  }
}
```

### Dashboard Integration
```typescript
// Show flaky tests in /admin/audit-monitoring
interface FlakyTestWidget {
  toolId: string;
  failureRate: number;  // %
  trend: 'improving' | 'stable' | 'degrading';
  commonErrors: string[];
  suggestions: string[];
}
```

---

## 7. Success Criteria

✅ **Phase 8 Target**: <5% flaky test rate
✅ **Verification Method**:
```bash
# Run each test category 10 times
for i in {1..10}; do
  npm run test:pdf-tools
  npm run test:image-tools
  npm run test:video-tools
done

# Calculate success rate - should be >95%
```

---

## 8. Implementation Timeline

| Task | Duration | Tests Fixed |
|------|----------|------------|
| Identify flaky tests | 2 hours | N/A |
| Fix arbitrary waits | 3 hours | 8-10 tests |
| Stabilize selectors | 3 hours | 5-8 tests |
| Handle race conditions | 2 hours | 3-5 tests |
| Increase timeouts | 1 hour | 2-3 tests |
| Add retry logic | 2 hours | 2-4 tests |
| Verification runs | 4 hours | All tests |

**Total**: ~17 hours (2 days)

---

## 9. Testing & Verification

### Run Stability Tests
```bash
# Run each test suite 5 times
npx playwright test tests/pdf-tools.spec.ts --repeat=5
npx playwright test tests/image-tools.spec.ts --repeat=5
npx playwright test tests/video-tools.spec.ts --repeat=5

# Expected: All tests pass all 5 times
```

### Generate Flakiness Report
```bash
npm run phase8:daily-audits
# Analyze output for failure patterns
```

---

**Status**: READY FOR IMPLEMENTATION
**Next Step**: Identify flaky tests (`npm run phase8:daily-audits`)
