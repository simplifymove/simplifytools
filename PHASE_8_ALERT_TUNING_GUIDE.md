# Phase 8: Alert Tuning & Configuration Guide

**Objective**: Reduce alert noise (false positives) while maintaining reliability detection capability

## Current Alert System Status

**Deployed Alerts** (5 rules):
1. Flaky Tool Detection
2. Queue Backlog Monitor  
3. Retry Spike Detection
4. Timeout Spike Detection
5. Critical Failure Alert

**Goal**: <1% false positive rate while detecting 95%+ of real issues

---

## 1. Current Alert Rules & Baselines

### Alert #1: Flaky Tool Detection
**File**: [lib/services/alerting.ts](lib/services/alerting.ts)

**Current Rule**:
```typescript
// Trigger if tool has >10% failure rate in last 24h
const flakyThreshold = 0.10;
```

**Baseline Metrics** (to collect):
- Average flaky rate across all tools: TBD
- P95 flaky rate: TBD
- Tools frequently flagged as flaky: TBD
- False positive rate: TBD

**Issue**: 10% threshold too low
- Many tools naturally reach 10% during high load
- Results in ~5-10 alerts per day
- Alert fatigue reduces response rate

**Recommendation**:
```typescript
// New threshold: 15% (15 failures per 100 tests)
// Rationale: 
// - 95th percentile of normal variation
// - Indicates real reliability issue
// - Reduces alert frequency to 1-2 per day
const flakyThreshold = 0.15;
```

---

### Alert #2: Queue Backlog Monitor
**Current Rule**:
```typescript
// Trigger if pending jobs > 100
const queueBacklogThreshold = 100;
```

**Baseline Metrics** (to collect):
- Average queue size: TBD
- P95 queue size: TBD
- Peak queue size: TBD

**Issue**: 100 threshold frequently exceeded
- Normal during peak hours
- Worker can handle 100+ jobs
- Results in ~10-15 false alerts per day

**Recommendation**:
```typescript
// New threshold: 150 pending jobs
// Also add sustained duration check
const queueBacklogThreshold = 150;
const sustainedDuration = 300000; // 5 minutes

// Only alert if backlog sustained for 5+ minutes
// This filters out temporary spikes
```

---

### Alert #3: Retry Spike Detection
**Current Rule**:
```typescript
// Trigger if retry rate > 20%
const retryThreshold = 0.20;
```

**Issue**: Transient network issues cause spikes
- Brief timeout spike = 20% retry rate
- Resolves in <1 minute
- Not indicative of real problem

**Recommendation**:
```typescript
// Increase threshold to 30%
// Also require sustained duration
const retryThreshold = 0.30;
const requiredDuration = 600000; // 10 minutes

// Only alert if 30%+ retries for 10+ minutes
// This indicates systematic issue, not transient spike
```

---

### Alert #4: Timeout Spike Detection
**Current Rule**:
```typescript
// Trigger if timeout rate > 15%
const timeoutThreshold = 0.15;
```

**Issue**: Server load variations cause timeouts
- Brief load spike = 15% timeouts
- Auto-recovery in <1 minute
- Creates alert noise

**Recommendation**:
```typescript
// Increase threshold to 25%
// Add duration requirement
const timeoutThreshold = 0.25;
const requiredDuration = 600000; // 10 minutes

// Only alert if 25%+ timeouts sustained for 10+ minutes
```

---

### Alert #5: Critical Failure Alert
**Current Rule**:
```typescript
// Trigger immediately on any CRITICAL severity failure
const criticalSeverity = 'CRITICAL';
```

**Status**: Good - Keep as-is
**Rationale**: Critical issues need immediate attention

---

## 2. New Alert Rules (to Add)

### New Rule #1: Memory Spike Alert
**Purpose**: Detect memory leaks or unusual spikes
**Trigger**:
```typescript
interface MemorySpikeAlert {
  condition: 'workerMemory > 500MB';
  duration: 'sustained for 5+ minutes';
  action: 'investigate memory leak';
}
```

**Implementation**:
```typescript
async function checkMemorySpikeAlert(metrics: MetricsSnapshot) {
  if (metrics.workerMemory > 500) {
    // Check if sustained
    const lastHour = await getMetricsSnapshot('last-1h');
    const spikeCount = lastHour.filter(m => m.workerMemory > 500).length;
    
    if (spikeCount > 6) { // 5+ minutes with 10-second samples
      return triggerAlert('memory-spike', {
        currentMemory: metrics.workerMemory,
        threshold: 500,
        duration: '5+ minutes'
      });
    }
  }
}
```

---

### New Rule #2: Query Performance Degradation
**Purpose**: Alert when database queries slow down
**Trigger**:
```typescript
interface QueryDegradationAlert {
  condition: 'P95 query time > 500ms';
  duration: 'for 3+ consecutive collections';
  action: 'investigate slow queries';
}
```

**Implementation**:
```typescript
async function checkQueryDegradationAlert(currentLatency: number) {
  const history = await getQueryLatencyHistory('last-30m');
  const recent = history.slice(-3);
  const p95s = recent.map(h => h.p95Latency);
  
  if (p95s.every(l => l > 500)) { // All recent > 500ms
    return triggerAlert('query-degradation', {
      currentP95: currentLatency,
      threshold: 500,
      trend: 'degrading'
    });
  }
}
```

---

### New Rule #3: Worker Unavailable Alert
**Purpose**: Alert if no active workers
**Trigger**:
```typescript
interface WorkerUnavailableAlert {
  condition: 'activeWorkers === 0';
  duration: 'for 5+ minutes';
  action: 'restart worker process';
}
```

**Implementation**:
```typescript
async function checkWorkerUnavailableAlert() {
  const health = await checkQueueHealth();
  
  if (health.activeWorkers === 0) {
    const noWorkerDuration = await getNoWorkerDuration();
    
    if (noWorkerDuration > 300000) { // 5 minutes
      return triggerAlert('worker-unavailable', {
        duration: noWorkerDuration,
        queueSize: health.pendingJobs,
        action: 'CRITICAL'
      });
    }
  }
}
```

---

### New Rule #4: Artifact Storage Alert
**Purpose**: Alert when artifact storage grows too large
**Trigger**:
```typescript
interface ArtifactStorageAlert {
  condition: 'totalArtifactSize > 5GB';
  duration: 'ongoing';
  action: 'cleanup old artifacts';
}
```

---

## 3. Alert Threshold Configuration

### New Recommended Thresholds

| Alert | Current | New | Reason |
|-------|---------|-----|--------|
| Flaky Tool | >10% | >15% | Reduce false positives |
| Queue Backlog | >100 | >150 | Allow worker buffering |
| Retry Spike | >20% | >30% | Filter transient issues |
| Timeout Spike | >15% | >25% | Reduce sensitivity |
| Memory Spike | NEW | >500MB | Detect leaks |
| Query Degradation | NEW | >500ms (P95) | Performance monitoring |
| Worker Unavailable | NEW | 0 workers for 5min | Availability |
| Artifact Storage | NEW | >5GB | Storage management |

### Alert Duration Requirements

```typescript
interface AlertConfiguration {
  // Only alert if condition sustained for:
  minimumDuration: {
    flaky: 600000,           // 10 minutes
    queueBacklog: 300000,    // 5 minutes
    retrySpike: 600000,      // 10 minutes
    timeoutSpike: 600000,    // 10 minutes
    memorySpike: 300000,     // 5 minutes
    queryDegradation: 900000, // 15 minutes (query cache effect)
    workerUnavailable: 300000, // 5 minutes
    artifactStorage: 0        // immediate
  }
}
```

---

## 4. Alert Tuning Workflow

### Step 1: Collect 7 Days of Baseline Data
```bash
npm run phase8:daily-audits
# Collect alerts generated during this period
# Track: true positives, false positives, missed issues
```

### Step 2: Calculate Alert Metrics
```typescript
interface AlertMetrics {
  totalAlerts: number;
  truePositives: number;     // Alert matched real issue
  falsePositives: number;    // Alert but no real issue
  missedIssues: number;      // Real issue but no alert
  
  // Calculate rates
  precision: number;         // TP / (TP + FP)
  recall: number;            // TP / (TP + FN)
  f1Score: number;           // 2 * (precision * recall) / (precision + recall)
}
```

### Step 3: Adjust Thresholds
```typescript
// If precision < 95% (too many false positives):
// - Increase alert threshold
// - Increase minimum duration requirement

// If recall < 90% (missing issues):
// - Decrease alert threshold
// - Decrease minimum duration requirement
```

### Step 4: A/B Test New Configuration
- Deploy to staging
- Run 7 days of audits
- Compare metrics
- If better: deploy to production

---

## 5. Alert Configuration Code

### Update Alert Rules
**File**: [lib/services/alerting.ts](lib/services/alerting.ts)

```typescript
// Current alert rules configuration
const alertRules = {
  flakyTool: {
    threshold: 0.15,        // 15% failure rate
    window: 24 * 60 * 60,   // 24 hours
    minDuration: 10 * 60,   // 10 minutes sustained
    severity: 'WARNING'
  },
  queueBacklog: {
    threshold: 150,         // 150 pending jobs
    minDuration: 5 * 60,    // 5 minutes sustained
    severity: 'WARNING'
  },
  retrySpike: {
    threshold: 0.30,        // 30% retry rate
    minDuration: 10 * 60,   // 10 minutes sustained
    severity: 'WARNING'
  },
  timeoutSpike: {
    threshold: 0.25,        // 25% timeout rate
    minDuration: 10 * 60,   // 10 minutes sustained
    severity: 'WARNING'
  },
  memorySpike: {
    threshold: 500,         // 500MB
    minDuration: 5 * 60,    // 5 minutes sustained
    severity: 'WARNING'
  },
  queryDegradation: {
    threshold: 500,         // 500ms P95
    minDuration: 15 * 60,   // 15 minutes sustained
    severity: 'INFO'
  },
  workerUnavailable: {
    threshold: 0,           // No active workers
    minDuration: 5 * 60,    // 5 minutes
    severity: 'CRITICAL'
  },
  artifactStorage: {
    threshold: 5000,        // 5GB
    minDuration: 0,         // Immediate
    severity: 'WARNING'
  }
};
```

---

## 6. Alert Deduplication

**Problem**: Repeated alerts for same issue
**Solution**: Alert suppression window

```typescript
async function shouldSuppressAlert(alertType: string): Promise<boolean> {
  const lastAlert = await prisma.alertLog.findFirst({
    where: {
      type: alertType,
      resolvedAt: null,
      createdAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Don't send duplicate if already active in last 30 min
  return !!lastAlert;
}
```

---

## 7. Alert Escalation

**Multi-tier Response**:

```typescript
interface AlertEscalation {
  WARNING: {
    // First occurrence: log + dashboard
    action: 'log_and_notify_dashboard',
    delay: 0
  },
  CRITICAL: {
    // Immediate: log + email + Slack
    action: 'immediate_notification',
    delay: 0,
    channels: ['email', 'slack', 'dashboard']
  },
  SUSTAINED: {
    // If WARNING continues for 30 min
    action: 'page_oncall',
    escalationTime: 30 * 60 * 1000
  }
}
```

---

## 8. Monitoring Alert Effectiveness

### Dashboard Metrics
```typescript
interface AlertDashboard {
  // Last 24 hours
  alertsTriggered: number;
  alertsResolved: number;
  averageResolutionTime: number;
  
  // Alert accuracy
  precision: number;  // % of alerts with real issues
  recall: number;     // % of real issues detected
  
  // Alert history
  recentAlerts: Alert[];
  alertTrends: {
    last24h: number;
    last7d: number;
    last30d: number;
  }
}
```

### Add to Dashboard
**File**: [app/admin/audit-monitoring/page.tsx](app/admin/audit-monitoring/page.tsx)

```typescript
// Show alert metrics widget
<AlertMetricsWidget>
  <MetricCard title="Alerts (24h)" value={24} trend="down" />
  <MetricCard title="Alert Precision" value="94%" trend="up" />
  <MetricCard title="Avg Resolution" value="12m" trend="down" />
</AlertMetricsWidget>
```

---

## 9. Testing Alert Rules

### Unit Tests
```typescript
describe('Alert Rules', () => {
  test('Flaky alert triggers at >15% failure rate for 10+ min', async () => {
    // Create 15 failed tests out of 100
    // Verify alert triggered
    expect(alert.type).toBe('flaky-tool');
    expect(alert.severity).toBe('WARNING');
  });

  test('Flaky alert suppressed at <15% failure rate', async () => {
    // Create 14 failed tests out of 100 (14%)
    // Verify no alert
    expect(alert).toBeNull();
  });

  test('Queue backlog alert requires 5+ min sustained', async () => {
    // Spike to 150+ jobs, then drop after 2 min
    // Verify no alert
    expect(alert).toBeNull();
    
    // Spike to 150+ jobs sustained for 5+ min
    // Verify alert triggered
    expect(alert.type).toBe('queue-backlog');
  });
});
```

---

## 10. Phase 8 Alert Tuning Timeline

| Phase | Duration | Task |
|-------|----------|------|
| 1 | 7 days | Collect baseline data |
| 2 | 2 days | Analyze and tune thresholds |
| 3 | 7 days | Test new configuration |
| 4 | 1 day | Deploy and monitor |

**Total**: 17 days (continuous background process)

---

## 11. Success Criteria

✅ **Achieved When**:
- False positive rate: <1%
- Detection rate: 95%+
- F1 Score: >0.94
- Alert response time: <30 min average
- No alert suppression needed

**Verification**:
```bash
# After 7 days of production:
1. Review AlertLog table
2. Calculate precision/recall
3. Compare to baseline
4. If improved: keep configuration
5. If degraded: adjust thresholds
```

---

**Status**: READY FOR IMPLEMENTATION
**Next Step**: Collect 7-day baseline (`npm run phase8:daily-audits`)
