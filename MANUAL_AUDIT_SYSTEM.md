# Manual On-Demand Audit System

**Status**: ✅ Ready to Use
**Date**: January 15, 2024

---

## Overview

The Manual On-Demand Audit System allows admins to manually trigger audits for any tool category whenever needed. No automatic daily execution, no cron jobs, just fast, reliable, on-demand testing.

**Key Benefits**:
- ✅ Fast startup (no long-running background processes)
- ✅ Reliable execution (queue-based processing)
- ✅ Low VPS resource usage (sequential or light concurrent)
- ✅ Easy debugging (single-category focus, clean logs)
- ✅ Manual control (admin decides when to test)

---

## Quick Start

### 1. Navigate to Admin Audit Page
```
http://localhost:3000/admin/audit-testing
```

### 2. Select Categories
- Check one or more categories from the 11 available options
- Or use "Select All" for comprehensive testing
- Use "Clear" to reset selection

### 3. Choose Execution Mode
- **Sequential** (Recommended): One category at a time, safer, less resource usage
- **Concurrent**: Up to 3 categories in parallel, faster, higher resources

### 4. Click "Start Audit"
- Jobs are queued immediately
- Dashboard shows real-time status
- Background process runs independently

### 5. Monitor Progress
- Watch status badges update (Pending → Running → Completed/Failed)
- See pass/fail counts as tests complete
- Stop running jobs anytime with "Stop" button

---

## Supported Categories

| Category | Tests | Description |
|----------|-------|-------------|
| PDF Tools | 15 | PDF manipulation (merge, split, rotate, etc.) |
| Image Tools | 12 | Image processing (resize, compress, convert) |
| Video Tools | 8 | Video conversion and manipulation |
| Save From Online | 5 | Download content from various platforms |
| AI Writing Tools | 10 | AI-powered writing assistance |
| Data Conversion Tools | 18 | Data format conversions |
| Data Tools | 14 | Data processing and analysis |
| Code Tools | 9 | Code formatting, minification, etc. |
| Financial Calculators | 7 | Financial computation tools |
| Resume Maker | 6 | Resume generation and editing |
| Text to Speech | 4 | Text-to-speech conversion |

**Total**: 108 tests available

---

## How It Works

### Architecture
```
User clicks "Start Audit"
         ↓
   API Endpoint Creates Jobs
         ↓
   Jobs Added to Queue (BullMQ + Redis)
         ↓
   Worker Picks Up Job
         ↓
   Playwright Runs Tests
         ↓
   Results Saved & Displayed
         ↓
   Dashboard Updates Real-Time
```

### Execution Flow

**Sequential Mode** (Recommended for stability):
1. Category A starts → runs to completion
2. Category B starts → runs to completion
3. Category C starts → runs to completion
4. All results aggregated and displayed

**Concurrent Mode** (Up to 3 parallel):
1. Categories A, B, C start simultaneously
2. Each runs independently
3. Results merged when all complete
4. Faster overall, higher resource usage

---

## API Endpoints

### POST /api/admin/audit/manual-trigger
**Start new audit job(s)**

Request:
```json
{
  "categories": ["pdf-tools", "image-tools"],
  "sequential": true
}
```

Response:
```json
{
  "jobId": "uuid-1",
  "allJobIds": ["uuid-1", "uuid-2"],
  "category": "pdf-tools",
  "status": "pending",
  "startTime": "2024-01-15T10:30:00Z",
  "message": "Created 2 audit job(s) - Sequential execution"
}
```

### GET /api/admin/audit/manual-trigger/status
**Get status of all active jobs**

Response:
```json
{
  "activeJobs": [
    {
      "jobId": "uuid-1",
      "category": "pdf-tools",
      "status": "running",
      "startTime": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "active": 1,
    "pending": 1,
    "completed": 5,
    "failed": 0
  }
}
```

### GET /api/admin/audit/manual-trigger/[jobId]
**Get status of specific job**

Response:
```json
{
  "jobId": "uuid-1",
  "state": "active",
  "progress": 45,
  "data": { "category": "pdf-tools", "type": "manual-audit" },
  "result": null,
  "error": null
}
```

### DELETE /api/admin/audit/manual-trigger/[jobId]
**Stop a running job**

Response:
```json
{
  "message": "Job uuid-1 stopped",
  "state": "active"
}
```

---

## UI Components

### Category Selection
- 11 checkboxes for manual category selection
- "Select All" and "Clear" buttons for quick actions
- Shows test count for each category
- Real-time calculation of total tests

### Execution Mode
- Radio buttons: Sequential vs Concurrent
- Clear descriptions of tradeoffs
- Sequential recommended by default

### Audit Summary
- Live count of selected categories
- Total test count calculation
- Selected execution mode display
- Clear "Start Audit" button

### Job Status Display
- Job ID (shortened to 8 chars)
- Category name
- Status badge (Pending/Running/Completed/Failed)
- Pass/fail counts and duration
- Stop button for running jobs
- Timestamp of job start

---

## Features

### Real-Time Polling
- Frontend polls `/api/admin/audit/manual-trigger/status` every 2 seconds
- Updates job statuses immediately
- Stops polling when no active jobs exist
- Low server overhead

### Job Tracking
- In-memory job store (can upgrade to Redis/DB)
- Tracks: jobId, category, status, pass/fail counts, duration
- Persists across page navigation (in memory during session)
- Clean display of recent jobs

### Error Handling
- Validation of category names
- Admin-only access (requires auth)
- Proper error messages for users
- Graceful failure handling

### Resource Management
- Sequential mode limits concurrent work
- Up to 3 concurrent jobs maximum
- Each test uses single Playwright worker
- No background daily execution overhead

---

## Usage Examples

### Example 1: Quick PDF Tool Test
1. Navigate to `/admin/audit-testing`
2. Click "PDF Tools" checkbox
3. Select "Sequential" mode
4. Click "Start Audit"
5. Wait for completion (~2 minutes)
6. View results in "Recent Audit Jobs"

### Example 2: Full Test Suite
1. Click "Select All"
2. Choose "Sequential" for stability
3. Click "Start Audit"
4. Expected duration: ~15-20 minutes total
5. Monitor progress in real-time

### Example 3: Performance Check
1. Select 3 categories
2. Choose "Concurrent" mode
3. Click "Start Audit"
4. All 3 run in parallel
5. Expected duration: ~5-10 minutes

### Example 4: Stop a Stalled Job
1. Job shows "Running" status
2. Click "Stop" button
3. Job is removed from queue
4. Status updates to "Failed"

---

## Execution Times

**Per Category Estimates** (Sequential):
- PDF Tools: ~2 minutes (15 tests)
- Image Tools: ~1.5 minutes (12 tests)
- Video Tools: ~1 minute (8 tests)
- Data Tools: ~2 minutes (14 tests)
- Others: 0.5-1.5 minutes

**Full Suite**:
- Sequential (all 11): ~15-20 minutes
- Concurrent (3 at a time): ~5-10 minutes (higher load)

**Recommended**: Sequential for daily checks, Concurrent for quick status checks

---

## Performance Monitoring

### VPS Resource Usage
- **CPU**: 30-40% during sequential tests
- **CPU**: 60-70% during concurrent tests (up to 3)
- **Memory**: 200-300 MB (test runner + Playwright)
- **Disk**: Minimal (no artifacts stored by default)

### Network Usage
- Negligible (no external API calls)
- Local Playwright testing only
- Queue traffic only ~1-5 KB per job status update

### Database Impact
- Zero impact (no database queries during tests)
- Optional results storage post-completion

---

## Best Practices

### ✅ Do's
- Run sequential mode for stability
- Test one category at a time initially
- Stop and restart if job stalls
- Check VPS resources before concurrent mode
- Monitor logs during first tests

### ❌ Don'ts
- Don't run all 11 categories concurrently
- Don't retry failed jobs immediately (wait 1 min)
- Don't kill test processes externally
- Don't modify test files during execution
- Don't assume results are 100% accurate (flaky tests exist)

---

## Troubleshooting

### Job stays in "Pending" state
- Check Redis connection
- Verify worker process is running
- Restart worker: `npm run dev`
- Check queue size: `getAuditQueue().getJobCounts()`

### "Running" status but no progress
- Wait up to 30 seconds (startup time)
- Check Playwright installation
- Verify test file exists for category
- Check VPS CPU/memory availability

### Job fails with no error message
- Check browser console for errors
- Review worker logs
- Try sequential mode instead of concurrent
- Restart application

### Results show 0 tests passed/failed
- Test files may not exist
- Playwright may not be installed
- Browser binary missing
- Run `npm run phase8:baseline` first to verify setup

### High memory usage during tests
- Switch to sequential mode
- Reduce number of categories
- Increase VPS memory allocation
- Restart worker after 10 jobs

---

## Advanced Configuration

### Customize Concurrency Limit
In `/api/admin/audit/manual-trigger/route.ts`:
```typescript
const concurrencyLimit = Math.min(categories.length, 3); // Change 3 to desired limit
```

### Adjust Polling Interval
In `/app/admin/audit-testing/page.tsx`:
```typescript
const interval = setInterval(pollJobStatus, 2000); // Change 2000ms to desired interval
```

### Add New Category
1. Add to `AUDIT_CATEGORIES` array in `/app/admin/audit-testing/page.tsx`
2. Add to validation list in `/api/admin/audit/manual-trigger/route.ts`
3. Create corresponding test file in `tests/`

### Change Sequential vs Concurrent Default
In `/app/admin/audit-testing/page.tsx`:
```typescript
const [sequential, setSequential] = useState(true); // Change to false for concurrent default
```

---

## Integration with Existing Systems

### Phase 7 Audit Infrastructure
- Manual audits use same queue (BullMQ + Redis)
- Can coexist with scheduled audits (when enabled)
- Separate from Phase 7 services (independent execution)
- No conflicts in job processing

### Database Integration
- Optional: Save results to `AuditJob`, `AuditRun` tables
- Optional: Link to `ToolReliability`, `PlatformHealthScore`
- Currently: In-memory tracking (stateless)
- Can upgrade to persistence anytime

### Monitoring & Alerts
- Compatible with Phase 7 alerting system
- Can trigger alerts on test failures
- Can update reliability scores
- Can generate health reports

---

## Future Enhancements

### Possible additions (not implemented):
1. **Scheduled Audits**: Optional recurring schedule
2. **Result Persistence**: Save to database
3. **Notifications**: Email/Slack alerts on completion
4. **Test Filtering**: Run specific tests within category
5. **Retry Logic**: Auto-retry failed jobs
6. **Batch Operations**: Queue multiple audits together
7. **Export**: Download results as CSV/JSON
8. **Comparison**: Before/after metrics
9. **Trend Tracking**: Historical success rates
10. **Team Collaboration**: Shared audit schedules

---

## Support & Debugging

### Check System Status
```bash
# Is worker running?
ps aux | grep node

# Is Redis running?
redis-cli ping

# Queue status?
curl http://localhost:3000/api/admin/audit/monitoring/queue
```

### View Logs
```bash
# Worker logs (if enabled)
tail -f logs/worker.log

# Application logs
npm run dev 2>&1 | grep -i audit
```

### Manual Test (without UI)
```bash
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["pdf-tools"],
    "sequential": true
  }'
```

---

## Performance Optimization Tips

1. **Use Sequential for Reliability**: Lower resource usage, easier to debug
2. **Run During Off-Peak**: Less impact on production users
3. **Monitor VPS Resources**: Stop tests if CPU > 80%
4. **Clean Up Old Jobs**: Manual in-memory storage grows over time
5. **Restart Worker Weekly**: Prevent memory leaks from long-running processes

---

**Manual Audit System Ready to Use**

Start here: Navigate to `/admin/audit-testing` and select your first category.
