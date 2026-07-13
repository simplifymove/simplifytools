'use client';

import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { useRouter } from 'next/navigation';
import { uploadBrowserPdfResult } from '@/app/lib/download-result-client';

interface Props {
  file: File;
  edits: PdfEdit[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ file, edits, isOpen, onClose }: Props) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState(file.name.replace('.pdf', '-edited.pdf'));

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      // Dynamic import - only load when needed
      const { exportPdfWithEdits } = await import('@/app/lib/pdf-editor/pdfExport');
      
      const blob = await exportPdfWithEdits(file, edits);
      const result = await uploadBrowserPdfResult({
        blob,
        toolSlug: 'edit-pdf',
        originalName: file.name,
        outputName: fileName,
      });
      onClose();
      router.push(result.downloadPageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6 w-96 max-h-96 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-white">Export PDF</h3>

        {/* File name input */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Info about edits */}
        <div className="bg-blue-900/30 border border-blue-500 rounded p-3 text-sm text-blue-200">
          <p className="font-semibold mb-1">📊 Export Summary</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>• Total edits: {edits.length}</li>
            <li>• Pages affected: {new Set(edits.map((e) => e.pageNumber)).size}</li>
            <li>• Document pages: {edits.length > 0 ? Math.max(...edits.map((e) => e.pageNumber)) : 1}</li>
          </ul>
        </div>

        {/* Warning */}
        {edits.some((e) => e.type === 'drawing') && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded p-3 flex gap-2 text-sm text-yellow-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Drawing edits are exported as placeholder lines. Full path support coming soon.</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded p-3 text-sm text-red-200">
            <p>❌ {error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-end mt-auto">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || edits.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
