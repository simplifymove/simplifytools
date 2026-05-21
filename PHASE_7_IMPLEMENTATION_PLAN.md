# Phase 7: Observability & Monitoring - Implementation Plan

**Date:** May 20, 2026  
**Phase:** 7 - Observability, Monitoring, and Reliability Layer  
**Status:** Planning & Implementation  

---

## Implementation Sequence

### Phase 7A: Foundation (Today)
- [ ] Database schema updates
- [ ] Reliability tracking models
- [ ] Failure classification system
- [ ] Health scoring models

### Phase 7B: Services (Today)
- [ ] Reliability calculator service
- [ ] Flaky test detector
- [ ] Failure classifier
- [ ] Health score calculator
- [ ] Performance analyzer

### Phase 7C: APIs (Today)
- [ ] Monitoring data endpoints
- [ ] Reliability endpoints
- [ ] Health score endpoints
- [ ] Performance analytics endpoints

### Phase 7D: Dashboard (Today)
- [ ] Monitoring dashboard component
- [ ] Queue status display
- [ ] Worker health widget
- [ ] Reliability scorecard

### Phase 7E: Logging (Today)
- [ ] Structured logging setup
- [ ] Pino configuration
- [ ] Log levels and formatting
- [ ] Worker log integration
- [ ] API log integration

### Phase 7F: Alerting (Today)
- [ ] Alerting service
- [ ] Threshold evaluation
- [ ] Email alerts
- [ ] Slack alerts
- [ ] Discord alerts

### Phase 7G: Artifacts & Recovery (Today)
- [ ] Artifact storage service
- [ ] Auto-recovery system
- [ ] Stale job detection
- [ ] Orphaned process cleanup

### Phase 7H: CI/CD Integration (Today)
- [ ] GitHub Actions workflow
- [ ] Artifact upload
- [ ] PR comments
- [ ] Reliability reporting

### Phase 7I: Documentation (Today)
- [ ] Monitoring guide
- [ ] Alerting guide
- [ ] VPS production guide
- [ ] Troubleshooting guide

---

## Database Schema Changes

```prisma
// New models for Phase 7

model ToolReliability {
  id String @id
  toolName String
  categoryId String
  
  totalRuns Int
  successfulRuns Int
  failedRuns Int
  
  reliability24h Float
  reliability7d Float
  reliability30d Float
  
  status String // "Stable" | "Flaky" | "Critical"
  
  lastRunAt DateTime?
  updatedAt DateTime
}

model FailureRecord {
  id String @id
  auditJobId String
  auditRunId String
  
  toolName String
  category String
  
  failureType String // See enum
  failureReason String
  stackTrace String?
  
  isFlaky Boolean
  occurrenceCount Int
  
  createdAt DateTime
  @@index([toolName])
  @@index([failureType])
  @@index([createdAt])
}

model PlatformHealthScore {
  id String @id
  timestamp DateTime
  
  overallScore Float
  
  categoryScores {
    pdf Float
    image Float
    video Float
    ai Float
    document Float
    converter Float
  }
  
  metrics {
    totalRuns Int
    successfulRuns Int
    failedRuns Int
    avgExecutionTime Float
    avgQueueWaitTime Float
  }
}

model AlertingRule {
  id String @id
  name String
  enabled Boolean
  
  ruleType String // "reliability" | "critical" | "backlog" | "connection" | "offline"
  threshold Float
  window Int // minutes
  
  actions String[] // ["email", "slack", "discord"]
  recipients String[]
  
  lastTriggeredAt DateTime?
  lastNotifiedAt DateTime?
}

model AlertLog {
  id String @id
  ruleId String
  alertingRule AlertingRule @relation(fields: [ruleId], references: [id])
  
  triggered Boolean
  message String
  severity String // "info" | "warning" | "critical"
  
  notificationChannels String[]
  
  createdAt DateTime
}

model PlaywrightArtifact {
  id String @id
  auditRunId String
  
  toolName String
  category String
  
  type String // "screenshot" | "video" | "trace" | "log" | "network"
  path String
  size Int
  mimeType String
  
  storagePath String
  downloadUrl String
  
  createdAt DateTime
}
```

---

## Service Architecture

### 1. Reliability Service
```typescript
// lib/services/reliability.ts
- calculateToolReliability(toolName, days)
- getReliabilityStatus(score) -> "Stable" | "Flaky" | "Critical"
- updateReliabilityScores() // Daily job
- getTopFailing() // Tools with < 90%
```

### 2. Flaky Detection Service
```typescript
// lib/services/flaky-detection.ts
- analyzeFlakyPatterns(toolName, window)
- isFlakyTool(toolName) -> boolean
- getFlakiness(toolName) -> percentage
- getFlakyTests() // List all flaky tests
```

### 3. Failure Classification Service
```typescript
// lib/services/failure-classifier.ts
- classifyFailure(error, output) -> FailureType
- parsePlaywrightError(error)
- categorizeByPattern(message)
- recordFailure(auditRunId, toolName, failureType)
```

### 4. Health Score Service
```typescript
// lib/services/health-score.ts
- calculateCategoryHealth(category) -> Float (0-100)
- calculateOverallHealth() -> Float (0-100)
- getCategoryBreakdown()
- generateHealthReport()
```

### 5. Alerting Service
```typescript
// lib/services/alerting.ts
- evaluateAlertingRules()
- checkReliabilityThresholds()
- checkCriticalFailures()
- checkQueueBacklog()
- checkConnectionStatus()
- sendAlert(rule, message)
```

### 6. Artifact Service
```typescript
// lib/services/artifact.ts
- storeArtifact(auditRunId, type, file)
- getArtifacts(auditRunId)
- generateDownloadUrl(artifactId)
- cleanupOldArtifacts(days)
```

### 7. Auto-Recovery Service
```typescript
// lib/services/auto-recovery.ts
- detectStalledJobs()
- detectOrphanedProcesses()
- requeue SafelyJob(jobId)
- cleanupAfterCrash()
```

---

## API Endpoints

### Monitoring Endpoints
- `GET /api/admin/audit/monitoring/queue` - Queue status
- `GET /api/admin/audit/monitoring/workers` - Worker health
- `GET /api/admin/audit/monitoring/health` - Platform health
- `GET /api/admin/audit/monitoring/reliability` - Reliability scores
- `GET /api/admin/audit/monitoring/failures` - Recent failures
- `GET /api/admin/audit/monitoring/flaky` - Flaky tests

### Analytics Endpoints
- `GET /api/admin/audit/analytics/performance` - Performance data
- `GET /api/admin/audit/analytics/trends` - Historical trends
- `GET /api/admin/audit/analytics/category/[name]` - Category specific

### Artifact Endpoints
- `GET /api/admin/audit/artifacts/[jobId]` - List artifacts
- `GET /api/admin/audit/artifacts/[jobId]/[type]` - Get specific artifact
- `POST /api/admin/audit/artifacts/upload` - Upload artifact

---

## Dashboard Components

### Monitoring Dashboard (`/admin/audit-monitoring`)
- Active jobs widget
- Queued jobs widget
- Failed jobs widget
- Worker health status
- Redis connection status
- Queue wait time chart
- Execution time chart
- Reliability scorecard
- Flaky tests section
- Failure breakdown
- Alert history

### Health Score Card
- Overall platform score
- Category breakdowns (PDF, Image, Video, AI, Document, Converter)
- Status indicators (Stable, Flaky, Critical)
- Trend arrows

### Failure Analyzer
- Failure type breakdown (pie chart)
- Most common failures
- Failure timeline
- Tool-specific failure rates

---

## Logging Setup

### Pino Configuration
```typescript
// lib/logging/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
})

export default logger
```

### Log Types
- Worker logs (job lifecycle)
- API logs (request/response)
- Queue logs (job enqueue/dequeue)
- Test execution logs
- Failure logs
- Alert logs
- Recovery logs

---

## Alerting Rules Examples

```typescript
[
  {
    name: 'Low Reliability Alert',
    threshold: 90,
    window: 60,
    condition: 'reliability < threshold',
    actions: ['email', 'slack']
  },
  {
    name: 'Critical Tool Down',
    threshold: 3,
    window: 30,
    condition: 'consecutive_failures >= threshold',
    actions: ['email', 'slack', 'discord']
  },
  {
    name: 'Queue Backlog Alert',
    threshold: 50,
    window: 5,
    condition: 'pending_jobs > threshold',
    actions: ['slack']
  },
  {
    name: 'Worker Offline',
    threshold: 1,
    window: 5,
    condition: 'active_workers < threshold',
    actions: ['email', 'slack']
  },
  {
    name: 'Redis Disconnected',
    threshold: 0,
    window: 1,
    condition: 'redis_connected === false',
    actions: ['email']
  }
]
```

---

## File Structure

```
New Files (Phase 7):
├── lib/services/
│   ├── reliability.ts          - Reliability calculation
│   ├── flaky-detection.ts      - Flaky test detection
│   ├── failure-classifier.ts   - Failure categorization
│   ├── health-score.ts         - Health score calculation
│   ├── alerting.ts             - Alert evaluation
│   ├── artifact.ts             - Artifact storage
│   └── auto-recovery.ts        - Crash recovery
│
├── lib/logging/
│   └── logger.ts               - Pino setup
│
├── app/admin/
│   └── audit-monitoring/
│       ├── page.tsx            - Monitoring dashboard
│       ├── components/
│       │   ├── QueueStatus.tsx
│       │   ├── WorkerHealth.tsx
│       │   ├── HealthScore.tsx
│       │   ├── ReliabilityCard.tsx
│       │   ├── FailureAnalyzer.tsx
│       │   └── AlertHistory.tsx
│       └── hooks/
│           └── useMonitoringAPI.ts
│
├── app/api/admin/audit/
│   ├── monitoring/
│   │   ├── queue/route.ts
│   │   ├── workers/route.ts
│   │   ├── health/route.ts
│   │   ├── reliability/route.ts
│   │   ├── failures/route.ts
│   │   └── flaky/route.ts
│   │
│   ├── analytics/
│   │   ├── performance/route.ts
│   │   ├── trends/route.ts
│   │   └── category/[name]/route.ts
│   │
│   └── artifacts/
│       ├── [jobId]/route.ts
│       ├── [jobId]/[type]/route.ts
│       └── upload/route.ts
│
├── .github/workflows/
│   └── audit-ci.yml            - CI/CD with observability
│
└── docs/
    ├── PHASE_7_MONITORING.md   - Monitoring guide
    ├── PHASE_7_ALERTING.md     - Alerting guide
    ├── PHASE_7_VPS_GUIDE.md    - VPS production setup
    └── PHASE_7_TROUBLESHOOTING.md
```

---

## Implementation Priority

### Must Have (Today)
1. Database schema
2. Reliability service
3. Health score service
4. Failure classifier
5. Monitoring APIs
6. Monitoring dashboard (basic)
7. Logging setup

### Should Have (Today)
1. Flaky detection
2. Alerting system
3. Auto-recovery
4. Artifact viewer
5. Performance analytics

### Nice to Have (Future)
1. Advanced charts
2. ML-based anomaly detection
3. Predictive alerts
4. Custom dashboards
5. API webhooks

---

## Success Criteria

- [x] Observable queue status in real-time
- [x] Reliability tracking per tool
- [x] Flaky test detection
- [x] Automatic failure classification
- [x] Platform health score
- [x] Alerting system with thresholds
- [x] Structured logging
- [x] Auto-recovery on crashes
- [x] Artifact storage and retrieval
- [x] GitHub Actions integration

---

## Time Estimates

| Component | Time |
|-----------|------|
| Database schema | 30 min |
| Services (7 total) | 2 hours |
| API endpoints (9 total) | 1.5 hours |
| Dashboard component | 1 hour |
| Logging setup | 30 min |
| Alerting system | 1 hour |
| CI/CD workflow | 30 min |
| Documentation | 1 hour |
| **Total** | **~8 hours** |

---

## Next Steps

1. Create database schema updates
2. Implement services one by one
3. Create API endpoints
4. Build monitoring dashboard
5. Set up logging
6. Implement alerting
7. Add GitHub Actions workflow
8. Write documentation

Let's begin with Phase 7A: Database schema updates.

---

**Status: Ready to implement Phase 7** ✅

This plan outlines a comprehensive observability layer that extends Phase 6 without replacing any existing functionality.
