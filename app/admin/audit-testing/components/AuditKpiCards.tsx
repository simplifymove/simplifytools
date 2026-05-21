'use client';

import { BarChart3, CheckCircle, AlertCircle, Activity, Database, TrendingUp } from 'lucide-react';

interface KPIData {
  totalRuns: number;
  activeRuns: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  storageUsed: string;
}

export function AuditKpiCards({ data }: { data: KPIData }) {
  const cards = [
    {
      label: 'Total Runs',
      value: data.totalRuns,
      icon: BarChart3,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Runs',
      value: data.activeRuns,
      icon: Activity,
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Passed Tests',
      value: data.passedTests,
      icon: CheckCircle,
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Failed Tests',
      value: data.failedTests,
      icon: AlertCircle,
      color: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Success Rate',
      value: `${data.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Storage Used',
      value: data.storageUsed,
      icon: Database,
      color: 'bg-slate-50',
      textColor: 'text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={20} className={card.textColor} />
            </div>
            <div className="text-sm text-gray-600 font-medium">{card.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
}
