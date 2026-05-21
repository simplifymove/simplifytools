# Dashboard Migration Guide: Sync → Async Job Queue

**Migration Status:** In Progress (Phase 6)  
**Dashboard File:** `app/admin/audit-testing/page.tsx`  
**API Change:** `/api/admin/audit/run` → `/api/admin/audit/enqueue`  

---

## Overview of Changes

### Phase 5 (Current - Synchronous)
```typescript
// Dashboard calls API
POST /api/admin/audit/run
  ├── Response waits 10+ minutes
  ├── Test results returned directly
  └── No polling needed
```

### Phase 6 (Target - Asynchronous)
```typescript
// Dashboard calls API
POST /api/admin/audit/enqueue
  ├── Response returns immediately (202 Accepted)
  ├── Job queued in background
  └── Dashboard polls for status
```

---

## API Response Format Changes

### OLD Response (POST /api/admin/audit/run)

```json
{
  "success": true,
  "auditRunId": "run_123",
  "testCategories": ["pdf", "image"],
  "totalTests": 50,
  "passedTests": 45,
  "failedTests": 3,
  "errorTests": 2,
  "skippedTests": 0,
  "successPercentage": 90,
  "startTime": "2024-05-20T10:00:00Z",
  "endTime": "2024-05-20T10:05:00Z",
  "duration": 300000,
  "status": "COMPLETED"
}
```

### NEW Response (POST /api/admin/audit/enqueue)

```json
{
  "jobId": "job_456",
  "queueId": "bullmq_789",
  "status": "enqueued",
  "message": "Audit test job enqueued successfully"
}
```

---

## Job Status Polling

### NEW Status Endpoint (GET /api/admin/audit/jobs/[id])

```json
{
  "id": "job_456",
  "userId": "user_123",
  "categories": ["pdf", "image"],
  "status": "COMPLETED",
  "severity": "LOW",
  "retryCount": 0,
  "maxRetries": 3,
  "lastError": null,
  "startedAt": "2024-05-20T10:00:15Z",
  "completedAt": "2024-05-20T10:05:15Z",
  "durationMs": 300000,
  "createdAt": "2024-05-20T10:00:00Z",
  "updatedAt": "2024-05-20T10:05:15Z",
  "queueStatus": {
    "progress": 100,
    "state": "completed",
    "data": { ... }
  },
  "auditRun": {
    "id": "run_123",
    "totalTests": 50,
    "passedTests": 45,
    "failedTests": 3,
    "errorTests": 2,
    "skippedTests": 0,
    "successPercentage": 90,
    "startedAt": "2024-05-20T10:00:15Z",
    "completedAt": "2024-05-20T10:05:15Z"
  }
}
```

---

## Migration Steps for Dashboard

### Step 1: Update useAuditAPI Hook

**File:** `app/hooks/useAuditAPI.ts` (or similar)

```typescript
// OLD VERSION
const startAudit = async (categories: string[]) => {
  const response = await fetch('/api/admin/audit/run', {
    method: 'POST',
    body: JSON.stringify({ categories }),
  });
  const data = await response.json();
  // Data contains immediate results
  setResults(data);
  return data;
};

// NEW VERSION
const startAudit = async (categories: string[]) => {
  const response = await fetch('/api/admin/audit/enqueue', {
    method: 'POST',
    body: JSON.stringify({ categories }),
  });
  if (response.status !== 202) {
    throw new Error('Failed to enqueue job');
  }
  const data = await response.json();
  // Data contains jobId only
  return data.jobId; // Return jobId for polling
};
```

### Step 2: Add Job Status Polling

```typescript
// NEW: Poll for job status
const pollJobStatus = async (jobId: string, interval = 2000) => {
  const poll = async (): Promise<any> => {
    const response = await fetch(`/api/admin/audit/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch job status');
    
    const job = await response.json();
    
    // Update UI with status
    setJobStatus(job.status);
    setProgress(calculateProgress(job)); // You define this
    
    // If still processing, poll again
    if (['PENDING', 'PROCESSING', 'RETRYING'].includes(job.status)) {
      await new Promise(resolve => setTimeout(resolve, interval));
      return poll();
    }
    
    // Job completed or failed
    if (job.status === 'COMPLETED' && job.auditRun) {
      setResults(job.auditRun);
    } else if (job.status === 'FAILED') {
      setError(job.lastError || 'Job failed');
    }
    
    return job;
  };
  
  return poll();
};
```

### Step 3: Update Run Button Handler

```typescript
// OLD VERSION
const handleRunTests = async () => {
  setRunning(true);
  try {
    const results = await startAudit(selectedCategories);
    setResults(results);
  } catch (error) {
    setError(error.message);
  } finally {
    setRunning(false);
  }
};

// NEW VERSION
const handleRunTests = async () => {
  setRunning(true);
  setRunProgress(0);
  try {
    const jobId = await startAudit(selectedCategories);
    // Poll for results
    const job = await pollJobStatus(jobId);
    // Results are set in pollJobStatus
  } catch (error) {
    setError(error.message);
  } finally {
    setRunning(false);
  }
};
```

### Step 4: Add Retry Functionality

```typescript
// NEW: Retry failed job
const retryJob = async (jobId: string) => {
  const response = await fetch(`/api/admin/audit/jobs/${jobId}/retry`, {
    method: 'POST',
  });
  
  if (response.status !== 202) {
    throw new Error('Failed to retry job');
  }
  
  const data = await response.json();
  
  // Start polling again
  return pollJobStatus(jobId);
};

// In UI, add retry button for failed jobs
{status === 'FAILED' && (
  <button onClick={() => retryJob(jobId)}>
    Retry
  </button>
)}
```

---

## Dashboard UI Updates Needed

### Status Badge Updates

```typescript
// Add RETRYING status
const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'PROCESSING': 'bg-blue-100 text-blue-800',
  'RETRYING': 'bg-orange-100 text-orange-800', // NEW
  'COMPLETED': 'bg-green-100 text-green-800',
  'FAILED': 'bg-red-100 text-red-800',
  'CANCELLED': 'bg-gray-100 text-gray-800',
};

// Update badge render
<Badge className={statusColors[jobStatus]}>
  {jobStatus}
</Badge>
```

### Progress Indicator

```typescript
// Add progress bar for running jobs
{['PENDING', 'PROCESSING', 'RETRYING'].includes(jobStatus) && (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>
)}
```

### Retry Button

```typescript
// Add retry button in actions
{jobStatus === 'FAILED' && retryCount < maxRetries && (
  <button 
    onClick={() => retryJob(jobId)}
    disabled={isRetrying}
    className="px-4 py-2 bg-yellow-500 text-white rounded"
  >
    {isRetrying ? 'Retrying...' : 'Retry'}
  </button>
)}
```

---

## State Management Updates

### Replace runProgress State

```typescript
// OLD: Progress based on elapsed time
const [runProgress, setRunProgress] = useState(0);

// NEW: Progress from queue job
const [jobProgress, setJobProgress] = useState({
  status: 'PENDING',
  percentage: 0,
  remainingTime: null,
});

// Calculate percentage based on job status
const calculateProgress = (job: any) => {
  switch (job.status) {
    case 'PENDING': return 10;
    case 'PROCESSING': return 50;
    case 'RETRYING': return 40;
    case 'COMPLETED': return 100;
    case 'FAILED': return job.retryCount < job.maxRetries ? 45 : 100;
    default: return 0;
  }
};
```

### Replace activeRunId with jobId

```typescript
// OLD
const [activeRunId, setActiveRunId] = useState<string | null>(null);

// NEW
const [activeJobId, setActiveJobId] = useState<string | null>(null);
const [jobStatus, setJobStatus] = useState<string | null>(null);
const [retryCount, setRetryCount] = useState(0);
const [maxRetries, setMaxRetries] = useState(3);
```

---

## Error Handling Updates

### Job-Specific Errors

```typescript
// Handle different failure scenarios
const handleJobError = (job: any) => {
  switch (job.status) {
    case 'FAILED':
      if (job.lastError.includes('Playwright')) {
        setError('Test runner not available. Please install Playwright.');
      } else if (job.lastError.includes('ECONNREFUSED')) {
        setError('Database connection failed.');
      } else {
        setError(`Tests failed: ${job.lastError}`);
      }
      break;
    
    case 'CANCELLED':
      setError('Job was cancelled.');
      break;
    
    default:
      setError('Unknown error');
  }
};
```

---

## Rollback Strategy

### If You Need to Revert to Sync API

```typescript
// Keep OLD startAudit logic available
const startAuditSync = async (categories: string[]) => {
  // Calls old /api/admin/audit/run endpoint
  // Use only if needed for backward compatibility
};

// Add feature flag
const ASYNC_MODE = process.env.NEXT_PUBLIC_ASYNC_AUDIT === 'true';

const startAudit = ASYNC_MODE ? startAuditAsync : startAuditSync;
```

---

## Testing the Migration

### Manual Testing Checklist

- [ ] Click "Run Tests" button
- [ ] Get immediate 202 response (not blocked)
- [ ] Dashboard shows "PENDING" status
- [ ] Progress bar appears
- [ ] Status changes to "PROCESSING"
- [ ] Spinner/animation continues
- [ ] Status eventually shows "COMPLETED"
- [ ] Results display correctly
- [ ] Failed job shows retry button
- [ ] Click retry works
- [ ] Retry count increments
- [ ] Results refresh after retry
- [ ] Refresh page, old results still show
- [ ] Multiple concurrent runs possible

### Automated Testing

```typescript
// Example test with Playwright
test('audit job queuing flow', async ({ page }) => {
  await page.goto('/admin/audit-testing');
  
  // Click run button
  await page.click('button:has-text("Run Tests")');
  
  // Should see PENDING status immediately
  await expect(page.locator('text=PENDING')).toBeVisible();
  
  // Wait for COMPLETED status (polling)
  await page.waitForSelector('text=COMPLETED', { timeout: 60000 });
  
  // Results should be visible
  await expect(page.locator('text=Passed:')).toBeVisible();
});
```

---

## Performance Monitoring

### Polling Optimization

```typescript
// Too frequent = too many DB queries
// Too infrequent = stale data

// Recommended: Adaptive polling
const adaptiveInterval = (status: string) => {
  switch (status) {
    case 'PENDING': return 5000;      // Check every 5s (job queued but not started)
    case 'PROCESSING': return 2000;   // Check every 2s (job actively running)
    case 'RETRYING': return 3000;     // Check every 3s (intermediate state)
    case 'COMPLETED': return 0;       // Stop polling
    case 'FAILED': return 0;          // Stop polling
    default: return 2000;
  }
};
```

### Backoff Strategy

```typescript
// If job takes longer than expected, increase poll interval
let pollCount = 0;
const maxPollsAtInterval = {
  5000: 20,  // Poll 5s interval up to 100s
  10000: 30, // Then 10s interval up to 400s
};

const calculateInterval = () => {
  if (pollCount < 20) return 5000;
  if (pollCount < 50) return 10000;
  return 30000; // Final fallback: check every 30s
};
```

---

## Database Migration Queries

### Find old AuditRun records (no associated AuditJob)

```sql
SELECT id, startedAt, completedAt FROM "AuditRun" 
WHERE id NOT IN (SELECT "auditRunId" FROM "AuditJob");
```

### Check job processing time

```sql
SELECT 
  COUNT(*) as total_jobs,
  AVG(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as avg_duration_seconds,
  MAX(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as max_duration_seconds
FROM "AuditJob" 
WHERE status = 'COMPLETED';
```

---

## Deployment Sequence

1. ✅ Create new API endpoints
2. ✅ Create database schema
3. ⏳ Deploy code with both old and new endpoints
4. ⏳ Test new endpoints in production
5. ⏳ Update dashboard to use new endpoints
6. ⏳ Monitor for errors
7. ⏳ Deprecate old /api/admin/audit/run endpoint
8. ⏳ Remove old endpoint (Phase 7)

---

## Quick Reference: API Summary

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| /api/admin/audit/enqueue | POST | Start async job | 202 Accepted |
| /api/admin/audit/jobs/[id] | GET | Get job status | 200 OK |
| /api/admin/audit/jobs/[id]/retry | POST | Retry failed job | 202 Accepted |
| /api/admin/audit/run | POST | OLD - synchronous | ⚠️ Deprecated Phase 6 |

---

## Common Issues & Solutions

### Issue: Job ID Not Returned
```
Symptom: Response doesn't have jobId
Solution: Check POST response is 202 (not 200 or 400)
```

### Issue: Polling Gets Stuck on PROCESSING
```
Symptom: Status never updates from PROCESSING
Solution: Check worker is running: `npm run worker`
          Check Redis: `redis-cli info`
```

### Issue: Results Not Displaying
```
Symptom: Status shows COMPLETED but no results
Solution: Check `auditRun` in response is not null
          Check AuditRun was created in database
```

### Issue: Retry Button Doesn't Show
```
Symptom: Failed job has no retry button
Solution: Check retryCount < maxRetries
          Check status === 'FAILED'
```

---

## Next Steps

1. Read [PHASE_6_IMPLEMENTATION_SUMMARY.md](PHASE_6_IMPLEMENTATION_SUMMARY.md)
2. Install dependencies: `npm install bullmq redis nodemailer`
3. Review new API endpoints
4. Implement dashboard changes from this guide
5. Test locally with dev server + worker
6. Deploy to production
7. Monitor job queue health

---

**Status:** Migration Guide Ready for Implementation

Follow this guide step-by-step to safely migrate the dashboard from sync to async API.
