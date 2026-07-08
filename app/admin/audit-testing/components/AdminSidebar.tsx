'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Activity,
  History,
  Zap,
  FileText,
  Box,
  Settings,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Audit Testing', href: '/admin/audit-testing', icon: Activity, active: true },
  { label: 'Audit History', href: '/admin/audit-history', icon: History },
  { label: 'Tool Health', href: '/admin/tool-health', icon: Zap },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Artifacts', href: '/admin/artifacts', icon: Box },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const environmentLabel = process.env.NODE_ENV === 'production' ? 'Production' : 'Local Development';

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">QA Admin</h1>
        </div>
      </div>

      {/* Menu */}
      <nav className="px-3 py-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = item.href.startsWith('/') ? item.href : `/admin/${item.href}`;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-800 bg-gray-800/50">
        <div className="text-xs text-gray-400 space-y-2">
          <div>
            <span className="text-gray-500">Environment:</span>
            <span className="block font-medium text-gray-300">{environmentLabel}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">v1.0.0</div>
        </div>
      </div>
    </div>
  );
}
