'use client';

import { Play, Square, Eye, Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AuditRun {
  auditRunId: string;
  categories: string[];
  status: string;
  startedAt?: string;
  livePassedTests?: number;
  passedTests?: number;
  liveFailedTests?: number;
  failedTests?: number;
  liveSkippedTests?: number;
  skippedTests?: number;
  liveTotalTests?: number;
  totalTests?: number;
  progress?: {
    currentTool?: string;
    currentToolSlug?: string;
    currentToolTitle?: string;
    currentUrl?: string;
    currentCategory?: string;
    completedTools?: number;
    totalTools?: number;
    elapsedMs?: number;
    elapsedTime?: number;
    estimatedRemainingMs?: number | null;
    estimatedRemainingTime?: number | null;
    workerCount?: string;
  } | null;
}

interface Props {
  runs: AuditRun[];
  onStop: (auditRunId: string) => void;
  onView: (auditRunId: string) => void;
  loading?: boolean;
}

export function ActiveRunsTable({ runs, onStop, onView, loading }: Props) {
  if (runs.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    switch (statusLower) {
      case 'running':
        return <Play size={16} className="text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Loader size={16} className="text-gray-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    switch (statusLower) {
      case 'running':
        return 'bg-blue-50 text-blue-800';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800';
      case 'completed':
        return 'bg-green-50 text-green-800';
      case 'failed':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const formatDuration = (ms?: number | null) => {
    if (!ms || ms < 0) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Active Runs ({runs.length})</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Run ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Current Tool</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Started</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {runs.map((run) => {
              const total = run.liveTotalTests ?? run.totalTests ?? 0;
              const passed = run.livePassedTests ?? run.passedTests ?? 0;
              const failed = run.liveFailedTests ?? run.failedTests ?? 0;
              const skipped = run.liveSkippedTests ?? run.skippedTests ?? 0;
              const completed = run.progress?.completedTools ?? (passed + failed + skipped);
              const expectedTotal = run.progress?.totalTools ?? total;
              const progressPercent = expectedTotal > 0 ? (completed / expectedTotal) * 100 : 0;
              const currentToolTitle = run.progress?.currentToolTitle || run.progress?.currentTool || '-';
              const elapsedMs = run.progress?.elapsedTime ?? run.progress?.elapsedMs;
              const estimatedRemainingMs = run.progress?.estimatedRemainingTime ?? run.progress?.estimatedRemainingMs;

              return (
                <tr key={run.auditRunId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {run.auditRunId.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                      {run.categories.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                      {getStatusIcon(run.status)}
                      {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-fit">
                          {completed}/{expectedTotal || total}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {passed} passed | {failed} failed
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {currentToolTitle}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {run.progress?.currentCategory || run.categories.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Elapsed {formatDuration(elapsedMs)} | ETA {formatDuration(estimatedRemainingMs)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600">
                      {run.startedAt ? new Date(run.startedAt).toLocaleTimeString() : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(run.auditRunId)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {run.status?.toUpperCase() === 'RUNNING' && (
                        <button
                          onClick={() => onStop(run.auditRunId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Stop Audit"
                        >
                          <Square size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
