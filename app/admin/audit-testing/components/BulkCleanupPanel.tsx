'use client';

import { Trash, AlertCircle } from 'lucide-react';

interface Props {
  onCleanup: (daysOld: number) => void;
  loading?: boolean;
}

export function BulkCleanupPanel({ onCleanup, loading }: Props) {
  const cleanupOptions = [
    { days: 7, label: '7 Days Old' },
    { days: 30, label: '30 Days Old' },
    { days: 90, label: '90 Days Old' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <AlertCircle size={18} className="text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Bulk Cleanup</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Automatically delete audits older than the selected period. This helps manage storage and database size.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {cleanupOptions.map((option) => (
          <button
            key={option.days}
            onClick={() => {
              if (window.confirm(`Delete all audits older than ${option.days} days? This cannot be undone.`)) {
                onCleanup(option.days);
              }
            }}
            disabled={loading}
            className="px-4 py-3 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash size={16} />
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        ⚠️ Be careful: this operation is permanent and cannot be reversed.
      </p>
    </div>
  );
}
