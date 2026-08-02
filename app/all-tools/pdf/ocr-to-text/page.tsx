'use client';

import React, { useState } from 'react';
import { FileUp, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function OcrToTextPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const extractText = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setError(null);
    setResultText(null);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch('/api/pdf/ocr', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract text');
      }

      const text = String(result.data?.fullText || '').trim();
      setResultText(text || 'No text was detected in this PDF.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to extract text',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultText || !pdfFile) return;

    const blob = new Blob([resultText], {
      type: 'text/plain;charset=utf-8',
    });

    const outputName = `text-${pdfFile.name.replace(/\.pdf$/i, '')}.txt`;

    const downloadResult = await uploadBrowserDownloadResult({
      blob,
      toolSlug: 'ocr-to-text',
      originalName: outputName,
      outputName,
    });

    router.push(downloadResult.downloadPageUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">📄 OCR to Text</h1>
        <p className="text-gray-600 text-sm mt-1">Extract text from PDF images using OCR</p>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-6 rounded-full">
              <FileUp className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Upload PDF</h2>
          <p className="text-center text-gray-600 mb-6">Select a PDF file to extract text</p>

          <label className="block cursor-pointer mb-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition">
              <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Click to upload PDF</p>
              <p className="text-gray-500 text-sm">or drag and drop</p>
            </div>
          </label>

          {pdfFile && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-800 font-medium truncate">📄 {pdfFile.name}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {resultText && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Extracted Text</h3>
              <textarea
                readOnly
                value={resultText}
                aria-label="Extracted PDF text"
                className="min-h-40 w-full resize-y rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800"
              />

              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Download TXT
              </button>
            </div>
          )}

          <button
            onClick={extractText}
            disabled={!pdfFile || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            <Download className="w-5 h-5" />
            {isProcessing ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      </div>
    </div>
  );
}

