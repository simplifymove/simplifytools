# Phase 6: Production Hardening & CI/CD Integration - Implementation Plan

**Date:** May 20, 2026  
**Scope:** Transform audit dashboard into production-grade system  
**Approach:** Extend existing architecture without breaking current functionality

---

## Architecture Overview

```
┌─────────────────┐
│  Admin UI/API   │  POST /api/admin/audit/run → returns jobId immediately
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Job Queue (BullMQ + Redis/SQLite) │  Stores jobs, tracks status
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Worker 1│ │Worker N│  Concurrent test execution
└────────┘ └────────┘
    │
    └──────┐
           ▼
      ┌─────────────────────┐
      │ Database (Prisma)   │  Persist results
      │ + Artifact Storage  │
      └─────────────────────┘

┌──────────────────────┐
│  Notifications       │  Email/Slack/Discord
└──────────────────────┘

┌──────────────────────┐
│  GitHub Actions      │  CI/CD workflow
└──────────────────────┘
```

---

## Implementation Phases

### Phase 6A: Job Queue System (This session)
- [ ] Install BullMQ + Redis (or SQLite adapter)
- [ ] Create job queue service
- [ ] Refactor API to use queue
- [ ] Create worker process
- [ ] Add job status tracking
- [ ] Implement retry/recovery

### Phase 6B: VPS Production Stability
- [ ] Playwright dependency installation guide
- [ ] Headless configuration
- [ ] Process monitoring/cleanup
- [ ] Recovery mechanisms

### Phase 6C: Dashboard Enhancements
- [ ] Add charts (Chart.js integration)
- [ ] Historical analytics
- [ ] Severity levels in schema
- [ ] Flaky test detection

### Phase 6D: CI/CD & Notifications
- [ ] GitHub Actions workflows
- [ ] Email notifications
- [ ] Slack/Discord webhooks
- [ ] Artifact organization

### Phase 6E: Production Deployment
- [ ] Docker setup
- [ ] Environment configuration
- [ ] Monitoring setup
- [ ] Backup/recovery procedures

---

## Dependencies to Add

```json
{
  "bullmq": "^4.x",
  "redis": "^4.x",
  "chart.js": "^4.x",
  "react-chartjs-2": "^5.x",
  "nodemailer": "^6.x",
  "slack-sdk": "^3.x"
}
```

---

## Database Schema Additions

```prisma
enum AuditSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  RETRYING
  CANCELLED
}

model AuditJob {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  categories String[]
  status JobStatus
  severity AuditSeverity?
  
  startedAt DateTime?
  completedAt DateTime?
  durationMs Int?
  
  retryCount Int @default(0)
  maxRetries Int @default(3)
  lastError String?
  
  auditRun AuditRun?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model NotificationLog {
  id String @id @default(cuid())
  auditJobId String
  auditJob AuditJob @relation(fields: [auditJobId], references: [id], onDelete: Cascade)
  
  type String // "email", "slack", "discord"
  recipient String
  status String // "sent", "failed"
  message String?
  
  createdAt DateTime @default(now())
  
  @@index([auditJobId])
}
```

---

## File Structure

```
project/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── audit/
│   │   │       ├── run/route.ts           [MODIFIED] Return jobId immediately
│   │   │       ├── jobs/[id]/route.ts     [NEW] Get job status
│   │   │       └── retry/[id]/route.ts    [NEW] Retry failed job
│   │   └── queue/
│   │       ├── health/route.ts            [NEW] Queue health check
│   │       └── stats/route.ts             [NEW] Queue statistics
│   │
│   ├── components/
│   │   ├── AuditChart.tsx                [NEW] Chart components
│   │   ├── TrendChart.tsx                [NEW] Trend visualization
│   │   └── SeverityBadge.tsx             [NEW] Severity display
│   │
│   └── admin/
│       └── audit-testing/
│           └── page.tsx                  [MODIFIED] Add charts/analytics
│
├── lib/
│   ├── queue/
│   │   ├── client.ts                     [NEW] BullMQ setup
│   │   ├── worker.ts                     [NEW] Worker process
│   │   └── handlers.ts                   [NEW] Job handlers
│   │
│   ├── services/
│   │   ├── notification.ts               [NEW] Email/Slack/Discord
│   │   ├── artifacts.ts                  [NEW] Artifact storage
│   │   └── analytics.ts                  [NEW] Historical analytics
│   │
│   └── vps/
│       ├── setup.sh                      [NEW] VPS setup guide
│       └── recovery.ts                   [NEW] Recovery mechanisms
│
├── worker.ts                             [NEW] Worker entry point
│
├── prisma/
│   ├── schema.prisma                     [MODIFIED] Add Job/Notification models
│   └── migrations/
│       └── add_job_queue_models/         [NEW] Schema migration
│
├── .github/
│   └── workflows/
│       ├── audit-ci.yml                  [NEW] CI workflow
│       ├── audit-nightly.yml             [NEW] Nightly audit
│       └── audit-deploy-check.yml        [NEW] Deployment checks
│
└── docs/
    ├── PRODUCTION_DEPLOYMENT.md          [NEW] Deployment guide
    ├── VPS_SETUP_GUIDE.md                [NEW] VPS configuration
    ├── QUEUE_MONITORING.md               [NEW] Monitoring guide
    ├── RECOVERY_PROCEDURES.md            [NEW] Disaster recovery
    └── PHASE_6_ARCHITECTURE.md           [NEW] Technical design
```

---

## Implementation Sequence

1. **Install dependencies**
   ```bash
   npm install bullmq redis nodemailer slack-sdk chart.js react-chartjs-2
   ```

2. **Update Prisma schema** → Add Job/Notification models

3. **Create queue infrastructure**
   ```
   lib/queue/client.ts      → BullMQ queue setup
   lib/queue/worker.ts      → Worker process
   worker.ts                → Worker entry point
   ```

4. **Refactor API**
   ```
   app/api/admin/audit/run/route.ts  → Return jobId, enqueue job
   app/api/admin/audit/jobs/[id]/route.ts → New: get job status
   ```

5. **Dashboard enhancements**
   ```
   app/components/AuditChart.tsx    → Chart components
   app/admin/audit-testing/page.tsx → Add chart display
   ```

6. **Notifications system**
   ```
   lib/services/notification.ts → Email/Slack/Discord integration
   ```

7. **CI/CD workflows**
   ```
   .github/workflows/audit-ci.yml      → Run tests on push
   .github/workflows/audit-nightly.yml → Nightly full audit
   ```

8. **Documentation**
   ```
   docs/PRODUCTION_DEPLOYMENT.md → Complete guide
   docs/VPS_SETUP_GUIDE.md       → Linux setup
   docs/QUEUE_MONITORING.md      → Monitoring procedures
   ```

---

## Safety Measures

✅ **Backward Compatibility**
- Existing dashboard continues to work
- API still returns consistent responses
- Database migration handles existing data

✅ **Gradual Migration**
- Can run queue and sync in parallel initially
- Feature flags to toggle job queue on/off
- Rollback plan if issues occur

✅ **Data Protection**
- No breaking schema changes
- Artifacts stored separately
- Audit logs maintained

---

## Testing Strategy

1. **Unit Tests**
   - Queue job creation
   - Worker job processing
   - Notification sending

2. **Integration Tests**
   - API to queue flow
   - Job completion
   - Database persistence

3. **End-to-End Tests**
   - Full test run from dashboard
   - Notifications triggered
   - Artifacts stored

4. **Load Tests**
   - Multiple concurrent jobs
   - Queue performance
   - Worker scaling

---

## Success Criteria

✅ Jobs enqueue immediately (API response < 100ms)  
✅ Workers process jobs reliably  
✅ Failed jobs retry automatically  
✅ Dashboard shows historical data  
✅ Notifications sent on completion  
✅ VPS/Linux compatibility verified  
✅ CI/CD runs automatically  
✅ Zero data loss on failure  
✅ Production deployment guide complete  

---

## Estimated Effort

| Component | Time |
|-----------|------|
| Job Queue Setup | 2-3 hours |
| API Refactoring | 1-2 hours |
| Dashboard Charts | 2-3 hours |
| Notifications | 1-2 hours |
| CI/CD Workflows | 1-2 hours |
| VPS Setup Guide | 1-2 hours |
| Testing | 2-3 hours |
| Documentation | 2-3 hours |
| **Total** | **13-20 hours** |

---

## Next Steps

1. Review and approve architecture
2. Start with job queue installation and setup
3. Proceed sequentially through implementation phases
4. Test each component before moving to next
5. Final integration testing
6. Production deployment

---

**Status:** Ready to begin implementation ✅  
**Risk Level:** LOW (extends, doesn't break existing system)  
**Rollback Plan:** Revert to Phase 5 if needed
