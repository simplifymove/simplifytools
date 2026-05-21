// app/components/monitoring/MonitoringCards.tsx
// Reusable card components for monitoring dashboard

'use client';

import React from 'react';
import { Activity, Database, AlertCircle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const MetricCard: React.FC<CardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = 'info',
  className = '',
}) => {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-600" />,
    down: <TrendingDown className="w-4 h-4 text-red-600" />,
    stable: <TrendingUp className="w-4 h-4 text-gray-600" />,
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 ${statusColors[status]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          {trend && trendIcons[trend]}
        </div>
      </div>
    </div>
  );
};

interface GridProps {
  children: React.ReactNode;
  columns?: number;
}

export const MetricGrid: React.FC<GridProps> = ({ children, columns = 4 }) => {
  const colClass =
    columns === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
};

interface PanelProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const MonitoringPanel: React.FC<PanelProps> = ({
  title,
  children,
  icon,
  action,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

interface HealthBarProps {
  label: string;
  value: number;
  max?: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ label, value, max = 100 }) => {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
