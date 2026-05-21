// app/components/monitoring/DashboardWidgets.tsx
// Individual dashboard widgets

'use client';

import React from 'react';
import { Activity, AlertTriangle, Zap, Clock, Target, TrendingDown } from 'lucide-react';
import {
  MetricCard,
  MetricGrid,
  MonitoringPanel,
  HealthBar,
} from './MonitoringCards';
import type {
  QueueStatus,
  HealthScore,
  ReliabilityScore,
  FailureStats,
  FlakyTests,
} from './useMonitoringAPI';

// Queue Status Widget
export const QueueStatusWidget: React.FC<{ data: QueueStatus | null }> = ({
  data,
}) => {
  if (!data) {
    return <MetricCard title="Queue Status" value="Loading..." />;
  }

  const status = data.connected
    ? data.redis
      ? 'success'
      : 'warning'
    : 'danger';

  return (
    <MonitoringPanel
      title="Queue Status"
      icon={<Activity className="w-5 h-5" />}
    >
      <MetricGrid columns={3}>
        <MetricCard
          title="Active Jobs"
          value={data.active}
          icon={<Zap className="w-5 h-5" />}
          status="info"
        />
        <MetricCard
          title="Queued Jobs"
          value={data.pending}
          icon={<Clock className="w-5 h-5" />}
          status="info"
        />
        <MetricCard
          title="Failed Jobs"
          value={data.failed}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={data.failed > 0 ? 'danger' : 'success'}
        />
      </MetricGrid>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <MetricCard
          title="Completed"
          value={data.completed}
          status="success"
        />
        <MetricCard
          title="Redis"
          value={data.redis ? 'Connected' : 'Disconnected'}
          status={data.redis ? 'success' : 'danger'}
        />
      </div>
    </MonitoringPanel>
  );
};

// Platform Health Widget
export const PlatformHealthWidget: React.FC<{ data: HealthScore | null }> = ({
  data,
}) => {
  if (!data) {
    return <MetricCard title="Platform Health" value="Loading..." />;
  }

  const getHealthStatus = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Good';
    if (score >= 75) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Critical';
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'info';
    if (score >= 75) return 'warning';
    return 'danger';
  };

  return (
    <MonitoringPanel
      title="Platform Health"
      icon={<Target className="w-5 h-5" />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Overall Score</h4>
            <span className="text-3xl font-bold text-blue-600">
              {data.overallScore.toFixed(1)}
            </span>
          </div>
          <MetricCard
            title={getHealthStatus(data.overallScore)}
            value={`${data.overallScore.toFixed(1)}/100`}
            status={getHealthColor(data.overallScore) as any}
          />
        </div>

        <div className="space-y-4 mt-6">
          <h4 className="text-sm font-semibold text-gray-700">Category Health</h4>
          <HealthBar label="PDF Tools" value={data.categoryScores.pdfHealth} />
          <HealthBar label="Image Tools" value={data.categoryScores.imageHealth} />
          <HealthBar label="Video Tools" value={data.categoryScores.videoHealth} />
          <HealthBar label="AI Tools" value={data.categoryScores.aiHealth} />
          <HealthBar label="Document Tools" value={data.categoryScores.documentHealth} />
          <HealthBar label="Converter Tools" value={data.categoryScores.converterHealth} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600">Avg Wait Time</p>
            <p className="text-lg font-semibold">
              {(data.metrics.avgQueueWaitTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600">Avg Exec Time</p>
            <p className="text-lg font-semibold">
              {(data.metrics.avgExecutionTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </div>
    </MonitoringPanel>
  );
};

// Reliability Widget
export const ReliabilityWidget: React.FC<{ data: ReliabilityScore | null }> = ({
  data,
}) => {
  if (!data || !data.topFailing) {
    return <MetricCard title="Reliability" value="Loading..." />;
  }

  return (
    <MonitoringPanel
      title="Top Failing Tools"
      icon={<TrendingDown className="w-5 h-5" />}
    >
      <div className="space-y-3">
        {data.topFailing.slice(0, 5).map((tool) => (
          <div
            key={tool.toolName}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{tool.toolName}</p>
              <p className="text-xs text-gray-600">
                24h: {tool.reliability24h.toFixed(1)}% | 7d:{' '}
                {tool.reliability7d.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  tool.status === 'STABLE'
                    ? 'bg-green-100 text-green-800'
                    : tool.status === 'FLAKY'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tool.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </MonitoringPanel>
  );
};

// Flaky Tests Widget
export const FlakyTestsWidget: React.FC<{ data: FlakyTests | null }> = ({
  data,
}) => {
  if (!data || !data.flaky) {
    return <MetricCard title="Flaky Tests" value="Loading..." />;
  }

  return (
    <MonitoringPanel
      title="Flaky Tests Detected"
      icon={<AlertTriangle className="w-5 h-5" />}
    >
      <div className="space-y-2">
        {data.flaky.slice(0, 5).map((test) => (
          <div
            key={test.toolName}
            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div>
              <p className="font-medium text-gray-900">{test.toolName}</p>
              <p className="text-xs text-gray-600">{test.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-yellow-800">
                {test.flakiness.toFixed(0)}% Flaky
              </p>
            </div>
          </div>
        ))}
        {data.flaky.length === 0 && (
          <p className="text-center text-gray-500 py-4">No flaky tests detected</p>
        )}
      </div>
    </MonitoringPanel>
  );
};

// Failure Breakdown Widget
export const FailureBreakdownWidget: React.FC<{ data: FailureStats | null }> = ({
  data,
}) => {
  if (!data) {
    return <MetricCard title="Failures" value="Loading..." />;
  }

  const failureTypes = Object.entries(data.byType || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <MonitoringPanel
      title="Failure Breakdown"
      icon={<AlertTriangle className="w-5 h-5" />}
    >
      <div className="space-y-3">
        {failureTypes.map(([type, count]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{type}</span>
            <span className="font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Total Failures: {Object.values(data.byType || {}).reduce((a, b) => a + (b as number), 0)}
        </p>
      </div>
    </MonitoringPanel>
  );
};
