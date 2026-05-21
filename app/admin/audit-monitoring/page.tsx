'use client';

import React, { useState } from 'react';
import { Activity, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';
import { useMonitoringAPI } from '@/app/components/monitoring/useMonitoringAPI';
import {
  QueueStatusWidget,
  PlatformHealthWidget,
  ReliabilityWidget,
  FlakyTestsWidget,
  FailureBreakdownWidget,
} from '@/app/components/monitoring/DashboardWidgets';
import { MonitoringPanel } from '@/app/components/monitoring/MonitoringCards';

export default function AuditMonitoringPage() {
  const { queueStatus, healthScore, reliability, failures, flakyTests, loading, error, refetch } =
    useMonitoringAPI(5000);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    dateRange: '24h',
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Monitoring</h1>
            <p className="text-gray-600">Real-time platform health and test reliability</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <RotateCcw className="w-4 h-4" />
            Recovery
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Loading monitoring data...</p>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="pdf">PDF Tools</option>
            <option value="image">Image Tools</option>
            <option value="video">Video Tools</option>
            <option value="ai">AI Tools</option>
            <option value="document">Document Tools</option>
            <option value="converter">Converter Tools</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="stable">Stable</option>
            <option value="flaky">Flaky</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="space-y-8">
        {/* Row 1: Queue and Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QueueStatusWidget data={queueStatus} />
          <PlatformHealthWidget data={healthScore} />
        </div>

        {/* Row 2: Reliability and Flaky Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReliabilityWidget data={reliability} />
          <FlakyTestsWidget data={flakyTests} />
        </div>

        {/* Row 3: Failure Breakdown */}
        <FailureBreakdownWidget data={failures} />

        {/* Row 4: Recent Logs */}
        <MonitoringPanel title="System Information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Queue Connected</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {queueStatus?.connected ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Redis Status</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {queueStatus?.redis ? '✓ Online' : '✗ Offline'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Total Jobs</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {queueStatus?.total || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {queueStatus
                  ? new Date(queueStatus.timestamp).toLocaleTimeString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </MonitoringPanel>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>
          Auto-refreshing every 5 seconds • Last update:{' '}
          {queueStatus ? new Date(queueStatus.timestamp).toLocaleTimeString() : 'N/A'}
        </p>
      </div>
    </div>
  );
}
