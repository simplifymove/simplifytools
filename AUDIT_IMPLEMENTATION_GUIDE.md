# Audit System Implementation & Verification Guide

## Final Verification Checklist

Before running audits, verify each component is working correctly.

---

## Phase 1: Setup Verification (5 mins)

### 1.1 Database

```bash
# Check database migration
npm run prisma:migrate:dev

# Verify tables exist
npm run prisma:studio
# Navigate to: AuditRun, AuditJob, AuditTestResult tables
# They should be empty or have test records
```

### 1.2 Redis

```bash
# Check Redis is running
redis-cli ping
# Expected: PONG

# If not installed on Windows:
# Download: https://github.com/tporadowski/redis/releases
# Or use Docker: docker run -d -p 6379:6379 redis
```

### 1.3 Dependencies

```bash
# Verify key packages installed
npm list @playwright/test bullmq redis prisma next-auth

# All should show version numbers, not "missing"
```

### 1.4 Build & Rebuild

```bash
# Clear cache
rm -rf .next node_modules/.cache

# Rebuild
npm run build

# Check for build errors
# Should see: ✓ Compiled successfully
```

---

## Phase 2: Component Verification (10 mins)

### 2.1 API Route Exists

```bash
# Verify file exists
ls app/api/admin/audit/manual-trigger/route.ts

# Should print file path, not "file not found"
```

### 2.2 Test Script Exists

```bash
# Verify npm script
npm run test:pdf-tools -- --list

# Should list Playwright tests, not "command not found"
```

### 2.3 Playwright Spec Exists

```bash
# Verify test file
ls tests/pdf-tools.spec.ts

# Should print file path
```

### 2.4 Admin Page Accessible

```bash
# Start dev server
npm run dev

# In browser: http://localhost:3000/admin/audit-testing
# Should load page with categories and "Run Selected Audits" button
```

---

## Phase 3: Individual Component Tests (15 mins)

### 3.1 Test Direct API Call

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger \
  -H "Content-Type: application/json" \
  -d '{"categories":["pdf-tools"],"sequential":true}' \
  -v

# Expected response (200):
# {"auditRunId":"clx...","status":"PENDING",...}

# If 401:
# {"error":"Unauthorized"} - Email not raghavaboyidi@gmail.com
# 
# If 404:
# Cannot POST /api/admin/audit/manual-trigger - Route doesn't exist
```

### 3.2 Test npm Script

```bash
# Run test script directly
npm run test:pdf-tools

# Expected: Playwright test output showing test names and results
# Example:
# ✓ Should compress PDF
# ✓ Should rotate PDF
# ...

# If error:
# "command not found" - Check package.json scripts
# Playwright error - Check tests/pdf-tools.spec.ts exists
```

### 3.3 Test Queue Connection

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Node console
node

# In Node REPL:
const { getQueueStats } = require('./lib/queue/client');
await getQueueStats();

# Expected: { active: 0, completed: 0, failed: 0, ... }

# If Redis error:
# "Error: connect ECONNREFUSED" - Redis not running
```

### 3.4 Test Database Directly

```bash
# Verify AuditRun table
npm run prisma:studio

# Navigate to AuditRun table
# Create a test record to verify write permissions
```

---

## Phase 4: End-to-End Test (10 mins)

### 4.1 Setup Test Environment

**Terminal 1: Start dev server**
```bash
npm run dev
# Watch for [AUDIT] logs
```

**Terminal 2: Start worker**
```bash
npm run worker
# Watch for [WORKER] logs
```

**Terminal 3: Keep for verification**
```bash
# Reserve for database checks
```

### 4.2 Trigger Audit

**In browser (http://localhost:3000/admin/audit-testing):**
1. Select "PDF Tools" checkbox
2. Click "Run Selected Audits"
3. Watch for response

**Check Terminal 1 (dev server):**
```
[AUDIT] POST /api/admin/audit/manual-trigger - Trigger received
[AUDIT] Auth check: raghavaboyidi@gmail.com
[AUDIT] Validating categories: ['pdf-tools']
[AUDIT] ✅ Categories valid
[AUDIT] Creating AuditRun in database...
[AUDIT] ✅ AuditRun created: clx...
[AUDIT] Creating AuditJob records...
[AUDIT] ✅ AuditJobs created: [job-id]
[AUDIT] Getting audit queue...
[AUDIT] Adding job to queue...
[AUDIT] ✅ Job added to queue: job-id
[AUDIT] ✅ Returning response: {...}
```

**Check Terminal 2 (worker):**
```
Within 1-2 seconds, should see:
[WORKER] ▶ Processing audit job: {...}
[WORKER] Updating AuditRun status to RUNNING...
[WORKER] ✅ AuditRun status updated to RUNNING
[WORKER] Processing category: pdf-tools
[WORKER] Running test command for: pdf-tools
```

### 4.3 Monitor Execution

**In browser:**
- Refresh the audit page every 5 seconds
- Should see status change from QUEUED → RUNNING
- Tests count should increment
- Results should appear as tests complete

**In Terminal 2 (worker):**
- Watch test command execute
- Watch test results persist
- Eventually: `[WORKER] ✅ Job completed successfully`

### 4.4 Verify Results

**In Terminal 3:**
```bash
npm run prisma:studio

# Navigate to AuditRun table
# Filter: status = 'COMPLETED'
# Should see new record with test counts
```

**In browser:**
- Completed test should show in "Audit History Table"
- Status: COMPLETED
- Test count: Should match total tests run
- Pass rate: Should show percentage

---

## Phase 5: Troubleshooting (20 mins)

### Issue: API returns 404

**Debug:**
```bash
# 1. Check route exists
ls app/api/admin/audit/manual-trigger/route.ts

# 2. Check Next.js build
npm run build

# 3. Check middleware isn't blocking
cat middleware.ts | grep -i admin

# 4. Test with curl
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger ...

# 5. Check browser network tab
# DevTools → Network tab → POST request
# What's the actual response?
```

### Issue: Worker never picks up job

**Debug:**
```bash
# 1. Check worker is running
# Should see in Terminal 2: [WORKER] ✅ Worker started with concurrency: 2

# 2. Check Redis connection
redis-cli ping

# 3. Check queue has jobs
node
> const { getQueueStats } = require('./lib/queue/client');
> await getQueueStats();
# Should show waiting/active jobs

# 4. Check worker logs
# Look for: [WORKER] ▶ Processing audit job

# 5. Restart worker
# Ctrl+C in Terminal 2, then npm run worker
```

### Issue: Tests not running (0 tests)

**Debug:**
```bash
# 1. Check npm script exists
npm run test:pdf-tools

# 2. Check test file exists
ls tests/pdf-tools.spec.ts

# 3. Check Playwright installed
npm list @playwright/test

# 4. Check for test command errors
# Look in Terminal 2 for:
# [Test] Running: npm run test:pdf-tools
# [Test] Test process exited with code: ...
```

### Issue: Tests run but results not shown

**Debug:**
```bash
# 1. Check database connection
npm run prisma:studio

# 2. Check AuditTestResult table
# Should have records after tests complete

# 3. Check for database errors in Terminal 2
# Look for: Prisma error

# 4. Check database permissions
# User should have write access to AuditRun, AuditJob, AuditTestResult tables
```

---

## Common Misconfigurations

### 1. Wrong Email

**Error:** 401 Unauthorized

**Fix:**
- Login with: `raghavaboyidi@gmail.com`
- Check in browser DevTools → Application → Cookies
- Look for session cookie

### 2. Category Mismatch

**Error:** Invalid category: pdf-tools

**Fix:**
- Check VALID_CATEGORIES in route.ts
- Check checkbox value in frontend
- Must match exactly (case-sensitive)

### 3. Missing npm Script

**Error:** npm ERR! No matching script in package.json

**Fix:**
- Verify in package.json:
  ```json
  "scripts": {
    "test:pdf-tools": "playwright test tests/pdf-tools.spec.ts"
  }
  ```

### 4. Redis Not Connected

**Error:** Error: connect ECONNREFUSED

**Fix:**
- Start Redis: `redis-server` or Docker
- Check HOST/PORT in .env
- Default: localhost:6379

### 5. Playwright Not Installed

**Error:** Can't find Playwright in node_modules

**Fix:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

---

## Performance Expectations

### Timing

- API response: < 500ms
- Queue pickup: 1-2 seconds
- Test execution: 30-60 seconds (depending on test complexity)
- Database write: < 1 second per 100 tests
- Total: ~1-2 minutes for full audit

### Resource Usage

- Node process: 100-300 MB
- Playwright process: 200-500 MB (per test)
- Redis: 10-50 MB
- Database queries: 100-200 per audit

---

## Monitoring & Health Checks

### Real-time Monitoring

```bash
# Watch API logs
npm run dev 2>&1 | grep "\[AUDIT\]"

# Watch worker logs
npm run worker 2>&1 | grep "\[WORKER\]"

# Monitor Redis
redis-cli MONITOR
```

### Health Check Script

Create `check-audit-health.sh`:
```bash
#!/bin/bash

echo "✓ Checking Audit System Health"

# 1. Database
echo -n "Database: "
npm run prisma:studio &>/dev/null && echo "✅" || echo "❌"

# 2. Redis
echo -n "Redis: "
redis-cli ping | grep PONG &>/dev/null && echo "✅" || echo "❌"

# 3. API Route
echo -n "API Route: "
[ -f "app/api/admin/audit/manual-trigger/route.ts" ] && echo "✅" || echo "❌"

# 4. Test Script
echo -n "Test Script: "
grep -q "test:pdf-tools" package.json && echo "✅" || echo "❌"

# 5. Test File
echo -n "Test File: "
[ -f "tests/pdf-tools.spec.ts" ] && echo "✅" || echo "❌"
```

---

## Success Criteria

✅ All components verified:
- [ ] Database connected and migrated
- [ ] Redis running
- [ ] Dependencies installed
- [ ] Build successful
- [ ] API route responds
- [ ] npm test script works
- [ ] Playwright spec exists
- [ ] Worker starts successfully
- [ ] Queue picks up jobs
- [ ] Results persist to database
- [ ] Frontend displays results

✅ End-to-end test succeeds:
- [ ] Click "Run Selected Audits"
- [ ] See logs in Terminal 1 & 2
- [ ] Status changes to RUNNING
- [ ] Tests execute
- [ ] Results appear
- [ ] Final status is COMPLETED
- [ ] Test count > 0
- [ ] Can view results in history

Once all checks pass, system is ready for production use.
