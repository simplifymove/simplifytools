import { useState, useCallback } from 'react';

export interface AuditRun {
  id: string;
  status: string;
  categories: string[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  skippedTests: number;
  successPercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  user: {
    email: string;
    name?: string;
  };
}

export interface AuditTestResult {
  id: string;
  category: string;
  toolName: string;
  toolSlug: string;
  url: string;
  testCase: string;
  status: string;
  errorMessage?: string;
  outputGenerated: boolean;
  outputType?: string;
  durationMs: number;
  timestamp: string;
}

export interface AuditReport {
  id: string;
  status: string;
  categories: string[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  skippedTests: number;
  successPercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  user: {
    email: string;
    name?: string;
  };
  testResults: AuditTestResult[];
}

export function useAuditAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTestRun = useCallback(
    async (categories: string[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/audit/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to start test run');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getReports = useCallback(
    async (
      page = 1,
      limit = 20,
      status?: string,
      category?: string,
      dateFrom?: string,
      dateTo?: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) params.append('status', status);
        if (category) params.append('category', category);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const response = await fetch(`/api/admin/audit/reports?${params}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch reports');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getReportDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/audit/reports/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch report');
      }

      const data: AuditReport = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/admin/audit/status/${runId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch status');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    startTestRun,
    getReports,
    getReportDetail,
    getStatus,
  };
}
