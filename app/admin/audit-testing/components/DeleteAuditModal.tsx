'use client';

import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  auditRunId: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteAuditModal({ open, auditRunId, onConfirm, onCancel, loading }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Audit</h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded transition">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-2">
            This will permanently delete the audit run <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">{auditRunId.slice(0, 8)}...</code> and all associated data:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
            <li>Test results</li>
            <li>Failure records</li>
            <li>Screenshots and videos</li>
            <li>Playwright artifacts</li>
            <li>All stored files</li>
          </ul>
          <p className="text-sm text-red-600 font-medium mt-4">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Audit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
