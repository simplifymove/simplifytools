'use client';

import { RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  userEmail?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PageHeader({ title, subtitle, userEmail, onRefresh, refreshing }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Admin</div>
            <div className="text-sm font-medium text-gray-900">{userEmail || 'Loading...'}</div>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Local Dev
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
