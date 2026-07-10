'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  CreditCard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'AI Studio', href: '/admin/ai-studio', icon: WalletCards },
  { label: 'Audit Testing', href: '/admin/audit-testing', icon: Activity },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Billing', href: '/admin/billing', icon: CreditCard },
  { label: 'System Health', href: '/admin/system-health', icon: ShieldCheck },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminShellProps {
  adminName?: string | null;
  adminEmail?: string | null;
  environmentLabel: string;
  appVersion: string;
  children: ReactNode;
}

function isActivePath(pathname: string, href: string) {
  if (href === '/admin/dashboard') {
    return pathname === '/admin' || pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  pathname,
  environmentLabel,
  appVersion,
  onNavigate,
}: {
  pathname: string;
  environmentLabel: string;
  appVersion: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-6 py-8 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">SC Admin</h1>
        </div>
      </div>

      <nav className="px-3 py-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto px-6 py-4 border-t border-gray-800 bg-gray-800/50">
        <div className="text-xs text-gray-400 space-y-2">
          <div>
            <span className="text-gray-500">Environment:</span>
            <span className="block font-medium text-gray-300">{environmentLabel}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">v{appVersion}</div>
        </div>
      </div>
    </>
  );
}

export function AdminShell({
  adminName,
  adminEmail,
  environmentLabel,
  appVersion,
  children,
}: AdminShellProps) {
  const pathname = usePathname() || '';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex-col">
        <SidebarContent pathname={pathname} environmentLabel={environmentLabel} appVersion={appVersion} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/60"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-gray-900 text-white flex flex-col">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-300 hover:text-white"
                aria-label="Close admin navigation"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              environmentLabel={environmentLabel}
              appVersion={appVersion}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileOpen(true)}
                aria-label="Open admin navigation"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  SimplifyConvert Admin
                </div>
                <div className="text-xs text-gray-500">{environmentLabel}</div>
              </div>
            </div>

            <div className="text-right min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {adminName || 'Admin'}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[220px]">
                {adminEmail || 'Signed in'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
