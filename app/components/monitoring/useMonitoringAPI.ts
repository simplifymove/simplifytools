// app/components/monitoring/useMonitoringAPI.ts
// Hook for fetching monitoring data with polling

import { useState, useEffect, useCallback } from 'react';

export interface QueueStatus {
  connected: boolean;
  redis: boolean;
  queue: boolean;
  active: number;
  pending: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
  timestamp: string;
}

export interface HealthScore {
  id: string;
  overallScore: number;
  categoryScores: {
    pdfHealth: number;
    imageHealth: number;
    videoHealth: number;
    aiHealth: number;
    documentHealth: number;
    converterHealth: number;
  };
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgExecutionTimeMs: number;
    avgQueueWaitTimeMs: number;
    activeWorkers: number;
    redisConnected: boolean;
  };
  timestamp: string;
}

export interface ReliabilityScore {
  topFailing: Array<{
    toolName: string;
    reliability24h: number;
    reliability7d: number;
    reliability30d: number;
    status: 'STABLE' | 'FLAKY' | 'CRITICAL';
    lastFailureAt: string;
    consecutiveFailures: number;
  }>;
}

export interface FailureStats {
  byType: Record<string, number>;
  flakyCount: number;
  timeoutCount: number;
  recentFailures: Array<{
    toolName: string;
    failureType: string;
    failureReason: string;
    isFlaky: boolean;
    occurrenceCount: number;
  }>;
}

export interface FlakyTests {
  flaky: Array<{
    toolName: string;
    category: string;
    flakiness: number;
    consecutiveFailures: number;
    lastFailureAt: string;
  }>;
}

export function useMonitoringAPI(pollInterval: number = 5000) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [reliability, setReliability] = useState<ReliabilityScore | null>(null);
  const [failures, setFailures] = useState<FailureStats | null>(null);
  const [flakyTests, setFlakyTests] = useState<FlakyTests | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setError(null);

      const [queueRes, healthRes, reliabilityRes, failuresRes, flakyRes] =
        await Promise.all([
          fetch('/api/admin/audit/monitoring/queue'),
          fetch('/api/admin/audit/monitoring/health'),
          fetch('/api/admin/audit/monitoring/reliability'),
          fetch('/api/admin/audit/monitoring/failures'),
          fetch('/api/admin/audit/monitoring/flaky'),
        ]);

      if (queueRes.ok) setQueueStatus(await queueRes.json());
      if (healthRes.ok) setHealthScore(await healthRes.json());
      if (reliabilityRes.ok) setReliability(await reliabilityRes.json());
      if (failuresRes.ok) setFailures(await failuresRes.json());
      if (flakyRes.ok) setFlakyTests(await flakyRes.json());

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchMonitoringData, pollInterval]);

  return {
    queueStatus,
    healthScore,
    reliability,
    failures,
    flakyTests,
    loading,
    error,
    refetch: fetchMonitoringData,
  };
}
