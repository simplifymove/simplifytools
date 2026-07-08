'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

// Import components
import { AdminSidebar } from './components/AdminSidebar';
import { PageHeader } from './components/PageHeader';
import { AuditKpiCards } from './components/AuditKpiCards';
import { CategorySelectionTable } from './components/CategorySelectionTable';
import { ExecutionSettingsCard } from './components/ExecutionSettingsCard';
import { ActiveRunsTable } from './components/ActiveRunsTable';
import { AuditHistoryTable } from './components/AuditHistoryTable';
import { DeleteAuditModal } from './components/DeleteAuditModal';
import { BulkCleanupPanel } from './components/BulkCleanupPanel';

const AUDIT_CATEGORIES = [
  { id: 'pdf-tools', name: 'PDF Tools', toolsCount: 15, estimatedTests: 15 },
  { id: 'image-tools', name: 'Image Tools', toolsCount: 12, estimatedTests: 12 },
  { id: 'video-tools', name: 'Video Tools', toolsCount: 8, estimatedTests: 8 },
  { id: 'data-conversion-tools', name: 'Data Conversion Tools', toolsCount: 18, estimatedTests: 18 },
  { id: 'data-tools', name: 'Data Tools', toolsCount: 14, estimatedTests: 14 },
  { id: 'code-tools', name: 'Code Tools', toolsCount: 9, estimatedTests: 9 },
];

interface AuditRun {
  auditRunId: string;
  categories: string[];
  status: string;
  startedAt?: string;
  completedAt?: string;
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  skippedTests?: number;
  successPercentage?: number;
  duration?: number;
  livePassedTests?: number;
  liveFailedTests?: number;
  liveTotalTests?: number;
}

interface ExecutionSettings {
  sequential: boolean;
  maxConcurrency: number;
  timeoutProfile: 'safe' | 'fast' | 'extended';
  storeArtifacts: boolean;
  captureScreenshots: boolean;
}

export default function AuditTestingPage() {
  const { data: session } = useSession();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [executionSettings, setExecutionSettings] = useState<ExecutionSettings>({
    sequential: true,
    maxConcurrency: 1,
    timeoutProfile: 'safe',
    storeArtifacts: true,
    captureScreenshots: true,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [activeRuns, setActiveRuns] = useState<AuditRun[]>([]);
  const [completedRuns, setCompletedRuns] = useState<AuditRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkCleanupLoading, setBulkCleanupLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load audit runs from database
  const loadAuditRuns = async () => {
    try {
      const response = await fetch('/api/admin/audit/manual-trigger');
      if (!response.ok) return;
      const data = await response.json();

      setActiveRuns(data.runningRuns || []);
      setCompletedRuns(data.recentRuns || []);
    } catch (err) {
      console.error('Failed to load audit runs:', err);
    }
  };

  // Load storage stats
  const loadStorageStats = async () => {
    try {
      const response = await fetch('/api/admin/audit-stats');
      if (!response.ok) return;
      const data = await response.json();
      setStorageStats(data);
    } catch (err) {
      console.error('Failed to load storage stats:', err);
    }
  };

  // Initial load and polling
  useEffect(() => {
    loadAuditRuns();
    loadStorageStats();
    const interval = setInterval(loadAuditRuns, 2000);
    const statsInterval = setInterval(loadStorageStats, 30000);
    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, []);

  const startAudit = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/audit/manual-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          sequential: executionSettings.sequential,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errData.error || 'Failed to start audit');
      }

      setSelectedCategories([]);
      await loadAuditRuns();
      setError('✅ Audit started successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Failed to start audit'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopAudit = async (auditRunId: string) => {
    try {
      const response = await fetch(`/api/admin/audit/manual-trigger/${auditRunId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errData.error || 'Failed to stop audit');
      }

      setError('✅ Audit stopped');
      setTimeout(() => loadAuditRuns(), 3000);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Failed to stop audit'}`);
    }
  };

  const deleteAudit = async () => {
    if (!auditToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/audit-delete/${auditToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete audit');
      }

      setError('✅ Audit deleted successfully');
      setDeleteModalOpen(false);
      setAuditToDelete(null);
      await loadAuditRuns();
      await loadStorageStats();
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Failed to delete audit'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const retryAudit = async (audit: AuditRun) => {
    try {
      setIsRunning(true);
      setError(null);

      const response = await fetch('/api/admin/audit/manual-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: audit.categories,
          sequential: executionSettings.sequential,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Failed to retry audit');
      }

      await loadAuditRuns();
      setError('✅ Audit queued for retry');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Failed to retry audit'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const bulkCleanup = async (daysOld: number) => {
    setBulkCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/audit-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daysOld }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to cleanup');
      }

      const data = await response.json();
      setError(`✅ ${data.message}`);
      await loadAuditRuns();
      await loadStorageStats();
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Failed to cleanup'}`);
    } finally {
      setBulkCleanupLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAuditRuns(), loadStorageStats()]);
    setRefreshing(false);
  };

  const categoryData = AUDIT_CATEGORIES.map((cat) => ({
    ...cat,
    lastRun: undefined,
    lastStatus: undefined,
  }));

  const totalTests = selectedCategories.reduce((total, catId) => {
    const cat = AUDIT_CATEGORIES.find((c) => c.id === catId);
    return total + (cat?.estimatedTests || 0);
  }, 0);

  const kpiData = {
    totalRuns: storageStats?.audits?.total || 0,
    activeRuns: activeRuns.length,
    passedTests: storageStats?.audits?.completed || 0,
    failedTests: activeRuns.filter((r) => r.status?.toLowerCase() === 'failed').length,
    successRate: storageStats?.audits?.total > 0
      ? ((storageStats?.audits?.completed / storageStats?.audits?.total) * 100)
      : 0,
    storageUsed: storageStats?.storage?.diskUsageFormatted || '0 Bytes',
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Header */}
        <PageHeader
          title="Audit Testing"
          subtitle="Run and monitor automated tool audits across all categories"
          userEmail={session?.user?.email}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {/* Error Alert */}
            {error && (
              <div className={`mb-6 rounded-lg p-4 flex gap-3 ${
                error.includes('✅')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {error.includes('✅') ? (
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className={error.includes('✅') ? 'text-green-700 text-sm' : 'text-red-700 text-sm'}>
                    {error.replace(/[✅❌]/g, '').trim()}
                  </p>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <AuditKpiCards data={kpiData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Left Column: Categories & Settings */}
              <div className="col-span-2 space-y-6">
                {/* Category Selection */}
                <CategorySelectionTable
                  categories={categoryData}
                  selectedCategories={selectedCategories}
                  onToggle={(catId) => {
                    setSelectedCategories((prev) =>
                      prev.includes(catId)
                        ? prev.filter((id) => id !== catId)
                        : [...prev, catId]
                    );
                  }}
                  onSelectAll={() => setSelectedCategories(AUDIT_CATEGORIES.map((c) => c.id))}
                  onClearAll={() => setSelectedCategories([])}
                />

                {/* Execution Settings */}
                <ExecutionSettingsCard
                  settings={executionSettings}
                  onSettingsChange={setExecutionSettings}
                />
              </div>

              {/* Right Column: Start & Summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Run Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-600">Categories Selected</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {selectedCategories.length}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-2">Total Tests</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-gray-900">{totalTests}</div>
                        <div className="text-sm text-gray-500">tests</div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-1">Execution Mode</div>
                      <div className="inline-block px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {executionSettings.sequential ? 'Sequential' : 'Concurrent'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startAudit}
                    disabled={isRunning || selectedCategories.length === 0}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Starting...
                      </>
                    ) : (
                      '► Start Audit'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Runs execute in background. Check tables below for progress.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Runs */}
            {activeRuns.length > 0 && (
              <div className="mb-8">
                <ActiveRunsTable
                  runs={activeRuns}
                  onStop={stopAudit}
                  onView={(auditRunId) => {
                    // TODO: Implement view details drawer
                  }}
                />
              </div>
            )}

            {/* Completed Audits */}
            {completedRuns.length > 0 && (
              <div className="mb-8">
                <AuditHistoryTable
                  audits={completedRuns}
                  onView={(auditRunId) => {
                    // TODO: Implement view details drawer
                  }}
                  onRetry={retryAudit}
                  onDelete={(auditRunId) => {
                    setAuditToDelete(auditRunId);
                    setDeleteModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* Bulk Cleanup */}
            <div className="mb-8">
              <BulkCleanupPanel onCleanup={bulkCleanup} loading={bulkCleanupLoading} />
            </div>

            {/* Empty State */}
            {activeRuns.length === 0 && completedRuns.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No audit runs yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Select categories in the panel above and click "Start Audit" to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAuditModal
        open={deleteModalOpen}
        auditRunId={auditToDelete || ''}
        onConfirm={deleteAudit}
        onCancel={() => {
          setDeleteModalOpen(false);
          setAuditToDelete(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}
