# Audit System Debug Guide

## Complete Audit Flow Tracing

This guide helps you trace the entire PDF Tools audit execution from start to finish with detailed logging at every stage.

### 1. Frontend Trigger (Browser Console)

**When you click "Run Selected Audits":**

```
[AUDIT] POST /api/admin/audit/manual-trigger - Trigger received
```

**What to check:**
- Open Browser DevTools → Network tab
- Look for POST request to `/api/admin/audit/manual-trigger`
- Status should be **200** (not 404)
- Response body should contain:
  ```json
  {
    "auditRunId": "clx...",
    "categories": ["pdf-tools"],
    "status": "PENDING",
    "startedAt": "2026-06-03T...",
    "message": "Created audit run for 1 category(ies)..."
  }
  ```

**If you see 404:**
- The API route is not being found
- Check: Is the route file at `/app/api/admin/audit/manual-trigger/route.ts`?
- Check: Are you authenticated as `raghavaboyidi@gmail.com`?

---

### 2. API Server Logs (Node.js Console / Terminal)

**When request hits the server:**

```
[AUDIT] POST /api/admin/audit/manual-trigger - Trigger received
[AUDIT] Auth check: raghavaboyidi@gmail.com
[AUDIT] Request body: {
  categories: [ 'pdf-tools' ],
  sequential: true,
  userId: 'user-id'
}
[AUDIT] Validating categories: ['pdf-tools']
[AUDIT] ✅ Categories valid
[AUDIT] Cleaning up stale jobs...
[AUDIT] Cleaned up 0 stale jobs
[AUDIT] Checking for conflicts with RUNNING jobs...
[AUDIT] Creating AuditRun in database...
[AUDIT] ✅ AuditRun created: clx...
[AUDIT] Creating AuditJob records...
[AUDIT] ✅ AuditJobs created: [job-id]
[AUDIT] Getting audit queue...
[AUDIT] Adding job to queue with data: { auditRunId: 'clx...', categories: ['pdf-tools'] }
[AUDIT] ✅ Job added to queue: bullmq-job-id
[AUDIT] ✅ Returning response: {...}
```

**What to check:**
- All log messages should appear in order
- No ❌ (error) messages
- If logs stop at a particular stage, that's where the error is

**Common Issues:**
- `❌ Unauthorized` → Email doesn't match
- `❌ No categories provided` → Frontend not sending categories array
- `❌ Invalid category: X` → Category name mismatch

---

### 3. Queue Logs (API Server / Worker Process)

**When job is added to queue:**

```
[QUEUE] Connecting to Redis: { host: 'localhost', port: 6379 }
[QUEUE] ✅ Redis connected
[QUEUE] Creating audit queue...
[QUEUE] ✅ Audit queue created
[QUEUE] Enqueuing audit job: { auditRunId: 'clx...', categories: ['pdf-tools'] }
[QUEUE] ✅ Job enqueued: job-id
```

**What to check:**
- Redis connection should succeed
- Job should be enqueued with correct ID
- If Redis connection fails, check:
  - Is Redis running? (`redis-cli ping`)
  - Correct host/port in `.env`?

---

### 4. Worker Startup Logs (Worker Process Terminal)

**When worker process starts:**

```
Starting Audit Queue Worker
{
  concurrency: 2,
  redis: 'localhost'
}
```

**Then worker creation:**

```
[WORKER] Creating worker with concurrency: 2
[WORKER] Redis client created for worker
[WORKER] BullMQ Worker created for queue "audit-tests"
[WORKER] Running recovery for stale jobs...
[WORKER] ✅ Worker started with concurrency: 2
```

**What to check:**
- Worker must be running (separate `npm run worker` terminal)
- Concurrency is set correctly
- No connection errors to Redis

**If worker doesn't show these logs:**
- Worker process isn't running
- Need to start: `npm run worker`

---

### 5. Job Pickup Logs (Worker Process)

**When worker picks up job from queue:**

```
[WORKER] ▶ Processing audit job: {
  jobId: 'job-id',
  auditRunId: 'clx...',
  auditJobId: 'audit-job-id',
  userId: '...',
  categories: ['pdf-tools']
}
```

**What to check:**
- This appears shortly after queuing (within 1-2 seconds)
- If this doesn't appear:
  - Worker isn't running
  - Job wasn't added to queue successfully
  - Redis connection issue

---

### 6. Job Execution Logs (Worker Process)

**While running tests:**

```
[WORKER] Updating AuditRun status to RUNNING...
[WORKER] ✅ AuditRun status updated to RUNNING
[WORKER] Updating AuditJob status to PROCESSING...
[WORKER] ✅ AuditJob status updated to PROCESSING
[WORKER] Starting category loop with 1 categories
[WORKER] Processing category: pdf-tools
[WORKER] Running test command for: pdf-tools
```

**Then npm script execution:**

```
[Test] Running: npm run test:pdf-tools
```

**Test output:**

```
[Test] Executing test command in: /path/to/project
```

**What to check:**
- npm script should start executing
- If it doesn't:
  - npm script missing: check `package.json` for `test:pdf-tools`
  - Playwright not installed
  - Spec file missing: `tests/pdf-tools.spec.ts`

---

### 7. Test Results Logs (Worker Process)

**After Playwright tests complete:**

```
[WORKER] Test command completed with result: {
  totalTests: 15,
  passedTests: 14,
  failedTests: 1,
  errorTests: 0,
  error: null
}
[WORKER] Aggregated totals: {
  totalTests: 15,
  passedTests: 14,
  failedTests: 1,
  errorTests: 0,
  skippedTests: 0
}
[WORKER] Persisting 15 test results to database
[WORKER] ✅ Persisted 15 test results
```

**What to check:**
- Test counts should match what Playwright ran
- If `totalTests: 0`:
  - Playwright didn't run any tests
  - npm script failed
  - Report parsing failed

---

### 8. Database Update Logs (Worker Process)

**Writing results to database:**

```
[WORKER] Updating AuditRun with final statistics: {
  totalTests: 15,
  passedTests: 14,
  failedTests: 1,
  errorTests: 0,
  skippedTests: 0
}
[WORKER] ✅ AuditRun updated: clx...
[WORKER] ✅ AuditJob status updated to COMPLETED
[WORKER] ✅ Job completed successfully
```

**What to check:**
- AuditRun and AuditJob should be marked COMPLETED
- Statistics should be persisted correctly

---

### 9. Frontend Polling Logs (Browser Console)

**Frontend polls for status every 2 seconds:**

```
GET /api/admin/audit/manual-trigger
Status: 200
Response: {
  runningRuns: [],
  recentRuns: [{
    auditRunId: "clx...",
    status: "RUNNING|COMPLETED|FAILED",
    totalTests: 15,
    passedTests: 14,
    ...
  }]
}
```

**What to see:**
- Initially: `status: "RUNNING"`, tests incrementing
- Finally: `status: "COMPLETED"`, final counts

---

## Quick Diagnosis Checklist

### Issue: 404 Error on API Call

**1. Check:** Is the route file there?
```bash
ls app/api/admin/audit/manual-trigger/route.ts
```

**2. Check:** Is authorization correct?
- Email must be: `raghavaboyidi@gmail.com`
- Check session in browser DevTools

**3. Check:** Is JSON valid?
```javascript
// Browser console - try:
fetch('/api/admin/audit/manual-trigger', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    categories: ['pdf-tools'],
    sequential: true
  })
}).then(r => r.json()).then(console.log)
```

---

### Issue: Database Records Not Created

**1. Check:** Can you connect to database?
```bash
# In terminal
npm run prisma:studio
# Try to view AuditRun table
```

**2. Check:** Are migrations applied?
```bash
npm run prisma:migrate:dev
```

**3. Check:** Check logs for error:
```
[AUDIT] ❌ Error: [Prisma error message]
```

---

### Issue: Worker Not Picking Up Jobs

**1. Check:** Is worker running?
```bash
npm run worker
# Should see: [WORKER] ✅ Worker started with concurrency: 2
```

**2. Check:** Redis connection?
```bash
redis-cli ping
# Should return: PONG
```

**3. Check:** Queue has jobs?
```bash
# In Node REPL:
const { getQueueStats } = require('./lib/queue/client');
await getQueueStats()
# Should show waiting/active jobs
```

---

### Issue: Tests Not Running (0 tests)

**1. Check:** npm script exists?
```bash
npm run test:pdf-tools
# Should output Playwright test results
```

**2. Check:** Spec file exists?
```bash
ls tests/pdf-tools.spec.ts
```

**3. Check:** Playwright installed?
```bash
npm list @playwright/test
```

**4. Check:** Test command output in logs?
```
[WORKER] Running test command for: pdf-tools
[Test] Running: npm run test:pdf-tools
```

---

## Environment Variables

Add to `.env.local` for debugging:

```env
# Worker settings
WORKER_CONCURRENCY=2

# Redis settings
REDIS_HOST=localhost
REDIS_PORT=6379

# Debug mode
DEBUG=*:queue,*:audit

# Auth
NEXTAUTH_SECRET=your-secret
```

---

## Commands to Debug Each Stage

### 1. Test API Route Directly
```bash
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger \
  -H "Content-Type: application/json" \
  -d '{"categories":["pdf-tools"],"sequential":true}'
```

### 2. Check Database
```bash
npm run prisma:studio
# Navigate to AuditRun table
```

### 3. Check Queue
```bash
npm run node
> const { getQueueStats } = require('./lib/queue/client');
> await getQueueStats();
```

### 4. Test npm Script
```bash
npm run test:pdf-tools
```

### 5. Start Worker
```bash
npm run worker
```

---

## Log File Locations

- **API Logs:** Terminal running `npm run dev`
- **Worker Logs:** Terminal running `npm run worker`
- **Browser Console:** DevTools → Console tab
- **Network Requests:** DevTools → Network tab

---

## Success Indicators

✅ All steps should show:
1. ✅ API receives POST
2. ✅ AuditRun created in DB
3. ✅ Job added to queue
4. ✅ Worker picks up job
5. ✅ Tests run successfully
6. ✅ Results persisted to DB
7. ✅ Frontend shows results

If any step shows ❌, that's where the problem is.
