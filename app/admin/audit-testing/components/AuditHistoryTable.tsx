'use client';

import { Eye, Redo2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface CompletedAudit {
  auditRunId: string;
  categories: string[];
  status: string;
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  skippedTests?: number;
  successPercentage?: number;
  duration?: number;
  completedAt?: string;
}

interface Props {
  audits: CompletedAudit[];
  onView: (auditRunId: string) => void;
  onRetry: (audit: CompletedAudit) => void;
  onDelete: (auditRunId: string) => void;
  loading?: boolean;
}

export function AuditHistoryTable({ audits, onView, onRetry, onDelete, loading }: Props) {
  if (audits.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    if (statusLower === 'completed') {
      return <CheckCircle size={16} className="text-green-600" />;
    } else if (statusLower === 'failed') {
      return <AlertCircle size={16} className="text-red-600" />;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    if (statusLower === 'completed') {
      return 'bg-green-50 text-green-800';
    } else if (statusLower === 'failed') {
      return 'bg-red-50 text-red-800';
    }
    return 'bg-gray-50 text-gray-800';
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Completed Audits ({audits.length})</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Run ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Tests</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Results</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Success Rate</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Duration</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Completed</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {audits.map((audit) => (
              <tr key={audit.auditRunId} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {audit.auditRunId.slice(0, 8)}...
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                    {audit.categories.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                    {getStatusIcon(audit.status)}
                    {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-gray-900">{audit.totalTests || 0}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <div className="text-xs text-green-600 font-medium">{audit.passedTests || 0} passed</div>
                      <div className="text-xs text-red-600 font-medium">{audit.failedTests || 0} failed</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {(audit.successPercentage || 0).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-600">{formatDuration(audit.duration)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-600">
                    {audit.completedAt
                      ? new Date(audit.completedAt).toLocaleDateString()
                      : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(audit.auditRunId)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onRetry(audit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Retry Audit"
                    >
                      <Redo2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(audit.auditRunId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete Audit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
