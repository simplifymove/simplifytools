# Phase 7: Integration Guide for Existing Workers

**Purpose:** Connect the new observability services to the existing audit worker pipeline.

---

## Quick Reference: What Was Created

### Services (All Production-Ready)
1. **logger.ts** - Structured logging with Pino
2. **reliability.ts** - Calculate tool reliability scores
3. **failure-classifier.ts** - Auto-classify failures (8 types)
4. **health-score.ts** - Platform health calculation
5. **flaky-detection.ts** - Detect intermittent failures
6. **alerting.ts** - Evaluate alert rules
7. **auto-recovery.ts** - Recover from crashes
8. **artifact.ts** - Store test artifacts

### APIs (All Working)
- GET /api/admin/audit/monitoring/queue - Queue status
- GET /api/admin/audit/monitoring/health - Platform health
- GET /api/admin/audit/monitoring/reliability - Tool reliability
- GET /api/admin/audit/monitoring/failures - Failure analysis
- GET /api/admin/audit/monitoring/flaky - Flaky tests

---

## Integration Points in Worker

### 1. Worker Initialization
**File:** `lib/worker.ts` or `lib/queue/worker.ts`

Add at top:
```typescript
import { recordFailure } from '@/lib/services/failure-classifier';
import { getToolReliability, updateAllReliabilityScores } from '@/lib/services/reliability';
import { runFullRecoveryCycle } from '@/lib/services/auto-recovery';
import { generateHealthReport } from '@/lib/services/health-score';
import { evaluateAllAlertingRules } from '@/lib/services/alerting';
import { workerLogger } from '@/lib/logging/logger';
```

### 2. Test Result Handler
**When test completes (success or failure):**

```typescript
// After test completion, in success handler:
async function onTestSuccess(jobData, result) {
  // Record success
  await prisma.testResult.create({
    data: {
      auditRunId: jobData.auditRunId,
      toolName: jobData.toolName,
      category: jobData.category,
      passed: true,
      executionTimeMs: result.duration,
    },
  });

  // Update reliability
  await updateToolReliability(jobData.toolName);
}

// After test completion, in error handler:
async function onTestFailure(jobData, error, output) {
  // Record test result
  const testResult = await prisma.testResult.create({
    data: {
      auditRunId: jobData.auditRunId,
      toolName: jobData.toolName,
      category: jobData.category,
      passed: false,
      error: error.message,
    },
  });

  // Classify failure
  const failureType = await recordFailure(
    jobData.auditJobId,
    jobData.auditRunId,
    jobData.toolName,
    error.message,
    output
  );

  workerLogger.warn(
    { toolName: jobData.toolName, failureType },
    'Test failed'
  );

  // Update reliability
  await updateToolReliability(jobData.toolName);
}
```

### 3. Periodic Health Updates
**In scheduler or background task:**

```typescript
// Run every hour
async function periodicHealthCheck() {
  workerLogger.info('Running periodic health check...');
  
  // Update all tool reliabilities
  await updateAllReliabilityScores();
  
  // Generate health report
  const report = await generateHealthReport();
  workerLogger.info({ report }, 'Health report generated');
  
  // Evaluate alerting rules
  await evaluateAllAlertingRules();
}

// Set up interval
setInterval(periodicHealthCheck, 60 * 60 * 1000);
```

### 4. Crash Recovery
**In startup or monitoring process:**

```typescript
// Run on worker startup
async function workerStartup() {
  workerLogger.info('Starting recovery cycle...');
  
  // Recover from any crashes
  await runFullRecoveryCycle();
  
  // Start main worker loop
  await startWorkerLoop();
}

// Also run periodically
setInterval(async () => {
  await runFullRecoveryCycle();
}, 5 * 60 * 1000); // Every 5 minutes
```

### 5. Artifact Recording
**When capturing screenshots/videos:**

```typescript
import { storeArtifact } from '@/lib/services/artifact';

async function onScreenshotCapture(auditRunId, toolName, filePath) {
  const artifactId = await storeArtifact(
    auditRunId,
    toolName,
    'image', // or your category
    'screenshot',
    filePath
  );
  
  if (!artifactId) {
    workerLogger.warn({ toolName }, 'Failed to store screenshot');
  } else {
    workerLogger.debug({ artifactId }, 'Screenshot stored');
  }
}
```

---

## Database Migration

Before integrating services, apply the schema:

```bash
# Option 1: Using migrate dev (creates migration history)
npx prisma migrate dev --name "add_phase_7_observability"

# Option 2: Direct sync to database
npx prisma db push

# Verify schema
npx prisma studio  # Opens visual database explorer
```

---

## Configuration

### Environment Variables
```env
# Logging
LOG_LEVEL=info  # or debug for verbose

# Alerting Email
ALERT_EMAIL_FROM=alerts@example.com
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com

# Alerting Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_CHANNEL=#alerts

# Artifact Storage
ARTIFACTS_RETENTION_DAYS=30
ARTIFACTS_DIR=./public/artifacts
```

### Create Default Alerting Rules
```typescript
// Run once after migration
async function createDefaultRules() {
  const rules = [
    {
      name: 'Low Tool Reliability',
      ruleType: 'reliability',
      threshold: 90.0,
      timeWindowMinutes: 60,
      emailRecipients: ['admin@example.com'],
    },
    {
      name: 'Queue Backlog Critical',
      ruleType: 'backlog',
      threshold: 100,
      timeWindowMinutes: 5,
      emailRecipients: ['admin@example.com'],
    },
    {
      name: 'Redis Connection Lost',
      ruleType: 'connection',
      threshold: 0,
      timeWindowMinutes: 1,
      emailRecipients: ['admin@example.com'],
    },
  ];

  for (const rule of rules) {
    await prisma.alertingRule.upsert({
      where: { name: rule.name },
      update: rule,
      create: rule,
    });
  }
}
```

---

## Testing the Integration

### 1. Test Failure Classification
```bash
# Run a test, trigger failure, check database
npx prisma studio
# Navigate to: FailureRecord table
# Should see classified failures
```

### 2. Test Health Score
```bash
curl http://localhost:3000/api/admin/audit/monitoring/health
# Should return: { overallScore, categoryScores, metrics }
```

### 3. Test Alerting
```bash
# Manually trigger alert rule
curl -X POST http://localhost:3000/api/admin/audit/monitoring/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "rule-id",
    "message": "Test alert"
  }'
```

### 4. Test Auto-Recovery
```bash
# Manually test recovery
curl -X POST http://localhost:3000/api/admin/audit/monitoring/recovery \
  -H "Content-Type: application/json" \
  -d '{ "action": "runRecoveryCycle" }'
```

---

## Implementation Timeline

| Task | Time | Files |
|------|------|-------|
| Apply Prisma schema | 5 min | prisma/schema.prisma |
| Update worker failure handling | 30 min | lib/worker.ts |
| Add periodic health checks | 20 min | lib/scheduler.ts |
| Add crash recovery handler | 15 min | lib/queue/worker.ts |
| Add artifact storage | 15 min | test files |
| Set up alerting rules | 10 min | database seeds |
| **Total** | **~95 min** | **4-5** |

---

## Monitoring Checklist

After integration, verify:
- [ ] Failed tests are classified (check FailureRecord table)
- [ ] Reliability scores update (check ToolReliability table)
- [ ] Health scores calculated (check PlatformHealthScore table)
- [ ] Flaky tests detected (check analysis in API)
- [ ] Alerts trigger when thresholds hit (check AlertLog table)
- [ ] Crashed jobs are recovered (check RETRYING jobs)
- [ ] Artifacts are stored (check PlaywrightArtifact table)

---

## Common Issues & Fixes

### Issue: "FailureRecord table not found"
**Solution:** Run `npx prisma db push` to apply schema

### Issue: "Services import fails"
**Solution:** Ensure all service files are in `lib/services/` directory

### Issue: "Alerts not sending"
**Solution:** Check email configuration in env vars and AlertingRule in database

### Issue: "Recovery doesn't work"
**Solution:** Ensure BullMQ queue client is properly initialized

---

## Next Steps

1. ✅ Services created and tested
2. ⏳ Apply Prisma migration
3. ⏳ Update worker to call services
4. ⏳ Build monitoring dashboard
5. ⏳ Create remaining API endpoints
6. ⏳ Set up alerting notifications
7. ⏳ Document for production

---

**Start with:** `npx prisma db push`
