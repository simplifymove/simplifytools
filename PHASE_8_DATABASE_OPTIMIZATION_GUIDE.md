# Phase 8: Database Query Optimization Guide

**Objective**: Reduce query latency and improve dashboard response times

## Current Status

**Baseline Metrics** (to be collected):
- Average query time: TBD
- P95 query time: TBD
- P99 query time: TBD
- Slow query count: TBD
- Most common slow queries: TBD

**Target Metrics** (Post-optimization):
- Average query time: < 50ms
- P95 query time: < 200ms
- P99 query time: < 500ms
- Dashboard response time: < 500ms (P95)

---

## 1. Identified Query Performance Issues

### Issue #1: N+1 Queries in Reliability Dashboard
**File**: [lib/components/monitoring/DashboardWidgets.tsx](lib/components/monitoring/DashboardWidgets.tsx)
**Problem**: For each tool, we fetch reliability data separately

**Current Code**:
```typescript
// ❌ N+1 Query Pattern
const tools = await prisma.toolReliability.findMany();
for (const tool of tools) {
  const failures = await prisma.failureRecord.findMany({
    where: { toolId: tool.id }
  });
  // Process failures
}
```

**Optimized Code**:
```typescript
// ✅ Single Query with Aggregation
const toolsWithFailures = await prisma.toolReliability.findMany({
  include: {
    failureRecords: {
      select: { id: true, type: true, createdAt: true }
    }
  }
});
```

---

### Issue #2: Missing Database Indexes
**Problem**: Frequently filtered columns lack indexes

**Slow Queries**:
1. Filter by `status` in AuditJob (sequential scan)
2. Filter by `toolId` in FailureRecord (sequential scan)
3. Filter by `createdAt` in AuditRun (sequential scan)
4. Filter by `toolId` and `status` in ToolReliability (sequential scan)

**Add These Indexes**:
```sql
-- In prisma/migrations/add_phase8_indexes/migration.sql
CREATE INDEX idx_audit_job_status ON "AuditJob"("status");
CREATE INDEX idx_audit_job_created_at ON "AuditJob"("createdAt");
CREATE INDEX idx_audit_run_status ON "AuditRun"("status");
CREATE INDEX idx_audit_run_created_at ON "AuditRun"("createdAt");
CREATE INDEX idx_failure_record_tool_id ON "FailureRecord"("toolId");
CREATE INDEX idx_failure_record_type ON "FailureRecord"("type");
CREATE INDEX idx_failure_record_created_at ON "FailureRecord"("createdAt");
CREATE INDEX idx_tool_reliability_tool_id ON "ToolReliability"("toolId");
CREATE INDEX idx_tool_reliability_status ON "ToolReliability"("status");
CREATE INDEX idx_alert_log_severity ON "AlertLog"("severity");
CREATE INDEX idx_alert_log_created_at ON "AlertLog"("createdAt");
```

**Apply Indexes**:
```bash
npx prisma migrate dev --name "add_phase8_indexes"
```

---

### Issue #3: Aggregation Queries Without Grouping
**Problem**: Calculating health scores fetches all records, then aggregates in application

**Slow Query**:
```typescript
// ❌ Fetch all, aggregate in app
const allResults = await prisma.auditTestResult.findMany();
const passed = allResults.filter(r => r.status === 'PASSED').length;
const total = allResults.length;
```

**Optimized Query**:
```typescript
// ✅ Aggregate in database
const stats = await prisma.auditTestResult.aggregate({
  _count: {
    _all: true,
  },
  where: {
    status: 'PASSED'
  }
});

const stats_total = await prisma.auditTestResult.aggregate({
  _count: { _all: true }
});

const successRate = (stats._count._all / stats_total._count._all) * 100;
```

---

### Issue #4: Filtering Large Date Ranges
**Problem**: Monitoring queries don't restrict date range

**Slow Query**:
```typescript
// ❌ No date filter
const failures = await prisma.failureRecord.findMany();
```

**Optimized Query**:
```typescript
// ✅ Restrict to last 24-30 days
const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
const failures = await prisma.failureRecord.findMany({
  where: {
    createdAt: { gte: last24h }
  }
});
```

---

### Issue #5: Redundant Data Fetches
**Problem**: Same data fetched multiple times in single request

**Slow Pattern**:
```typescript
// ❌ Dashboard fetches health score 3 times
async function getHealthMetrics() {
  const health1 = await prisma.platformHealthScore.findFirst();
  const categoryHealths = await prisma.platformHealthScore.findMany(); // Same table
  const health2 = await prisma.platformHealthScore.findFirst({ where: { id: '...' } });
}
```

**Optimized Pattern**:
```typescript
// ✅ Single fetch, reuse data
async function getHealthMetrics() {
  const latestHealth = await prisma.platformHealthScore.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  // Derive all metrics from single record
}
```

---

## 2. Query Optimization Checklist

### For Each Slow Query (P95 > 200ms):

- [ ] Add `EXPLAIN` analysis
- [ ] Identify missing indexes
- [ ] Check for N+1 patterns
- [ ] Verify date range filtering
- [ ] Use aggregation for counts
- [ ] Use `select()` to fetch only needed fields
- [ ] Use pagination for large result sets
- [ ] Add query-level caching (60s default)

---

## 3. Optimization Implementation Plan

### Phase 8.1: Index Optimization (Day 1-2)
1. Create migration: `npx prisma migrate dev --name "add_phase8_indexes"`
2. Add all recommended indexes (see above)
3. Measure query improvements
4. Expected: -30% query time

### Phase 8.2: N+1 Query Fixes (Day 3-4)
1. Update reliability dashboard widget
2. Update failure breakdown widget
3. Update flaky tools widget
4. Update alerts widget
5. Expected: -40% query time

### Phase 8.3: Aggregation Optimization (Day 5)
1. Update health score calculation service
2. Update reliability score calculation
3. Update failure analysis service
4. Expected: -50% query time for aggregations

### Phase 8.4: Caching Layer (Day 6-7)
1. Implement Redis caching for frequently accessed queries
2. 60-second default TTL for dashboard metrics
3. 5-minute TTL for reliability scores
4. Expected: -80% repeat query time

---

## 4. Query Optimization Code Examples

### Example 1: Convert N+1 to Include

**Before** (Slow):
```typescript
const tools = await prisma.toolReliability.findMany();
const toolsWithIssues = await Promise.all(
  tools.map(async (tool) => {
    const failures = await prisma.failureRecord.findMany({
      where: { toolId: tool.id }
    });
    return { ...tool, failures };
  })
);
```

**After** (Fast):
```typescript
const toolsWithIssues = await prisma.toolReliability.findMany({
  include: {
    _count: {
      select: {
        failureRecords: {
          where: { createdAt: { gte: last24h } }
        }
      }
    }
  }
});
```

---

### Example 2: Add Pagination

**Before** (Slow):
```typescript
const allFailures = await prisma.failureRecord.findMany({
  orderBy: { createdAt: 'desc' }
});
```

**After** (Fast):
```typescript
const failures = await prisma.failureRecord.findMany({
  where: { createdAt: { gte: last24h } },
  orderBy: { createdAt: 'desc' },
  take: 50, // Paginate
  skip: (page - 1) * 50
});
```

---

### Example 3: Use Aggregation

**Before** (Slow):
```typescript
const results = await prisma.auditTestResult.findMany();
const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;
```

**After** (Fast):
```typescript
const stats = await prisma.auditTestResult.groupBy({
  by: ['status'],
  _count: true,
  where: { createdAt: { gte: last24h } }
});

const passed = stats.find(s => s.status === 'PASSED')?._count || 0;
const failed = stats.find(s => s.status === 'FAILED')?._count || 0;
```

---

### Example 4: Selective Field Selection

**Before** (Slow):
```typescript
const tools = await prisma.toolReliability.findMany();
// Fetches: id, toolId, score24h, score7d, score30d, status, lastUpdated, ... (all fields)
```

**After** (Fast):
```typescript
const tools = await prisma.toolReliability.findMany({
  select: {
    toolId: true,
    score24h: true,
    status: true
  }
});
// Fetches only: toolId, score24h, status
```

---

## 5. Performance Monitoring Queries

### Find Slow Queries
```sql
-- PostgreSQL: Find queries taking >100ms
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;
```

### Find Missing Indexes
```sql
-- PostgreSQL: Identify sequential scans
SELECT schemaname, tablename, idx_scan, seq_scan
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC;
```

### Monitor Query Cache Hit Rate
```sql
-- PostgreSQL: Check cache effectiveness
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

---

## 6. Success Criteria

✅ **Achieved When**:
- Average query time: < 50ms (vs. baseline)
- P95 query time: < 200ms (vs. baseline)
- Dashboard response time: < 500ms (P95)
- Slow query count: < 5 (vs. baseline)

**Measurement**:
```bash
# Before optimization
npm run phase8:baseline
# Apply optimizations
npm run phase8:daily-audits
# After optimization
npm run phase8:baseline
# Compare results
```

---

## 7. Implementation Timeline

| Task | Duration | Impact |
|------|----------|--------|
| Index creation | 1 hour | -30% query time |
| N+1 fixes | 4 hours | -40% query time |
| Aggregation optimization | 3 hours | -50% aggregation time |
| Caching layer | 4 hours | -80% repeat queries |
| Testing & validation | 2 hours | Verify improvements |

**Total**: ~14 hours (1.75 days)

---

## 8. Rollback Plan

If optimization causes issues:
```bash
# Remove indexes
npx prisma migrate resolve --rolled-back
# Revert to optimized queries
git checkout HEAD -- lib/services/
```

---

**Status**: READY FOR IMPLEMENTATION
**Next Step**: Run baseline measurement (`npm run phase8:baseline`)
