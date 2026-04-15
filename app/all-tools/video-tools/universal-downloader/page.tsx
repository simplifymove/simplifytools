'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function UniversalDownloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [downloadInfo, setDownloadInfo] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    downloadUrl: string; // blob URL
  } | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setStatus('error');
      setMessage('Please enter a URL');
      return;
    }

    setStatus('loading');
    setMessage('Processing your download...');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to download file. Please check the URL and try again.');
        return;
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'download';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      // Format file size
      let fileSizeFormatted = '0 B';
      if (blob.size > 0) {
        if (blob.size > 1024 * 1024) {
          fileSizeFormatted = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
        } else {
          fileSizeFormatted = `${(blob.size / 1024).toFixed(2)} KB`;
        }
      }

      setStatus('success');
      setMessage('File ready for download!');
      setDownloadInfo({
        fileName,
        fileSize: fileSizeFormatted,
        fileType: blob.type,
        downloadUrl: URL.createObjectURL(blob),
      });

      // Auto-download the file
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Reset form after 3 seconds
      setTimeout(() => {
        setUrl('');
        setDownloadInfo(null);
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred while downloading');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mb-6 shadow-lg">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Save From Online</h1>
          <p className="text-lg text-gray-600">
            Download any file from any URL - videos, images, PDFs, documents, and more
          </p>
        </div>

        {/* Supported Formats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-green-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Supported Sources:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'YouTube',
              'TikTok',
              'Instagram',
              'Facebook',
              'Twitter/X',
              'Dailymotion',
              'Vimeo',
              'Direct Links',
            ].map((source) => (
              <div
                key={source}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{source}</span>
              </div>
            ))}
          </div>
        </div>

        {/* File Types */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-green-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Supported File Types:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              '🎬 Videos (MP4, WebM, MKV)',
              '🖼️ Images (JPG, PNG, GIF, WebP)',
              '📄 Documents (PDF, DOCX, PPTX)',
              '📊 Sheets (XLSX, XLS, CSV)',
              '🎵 Audio (MP3, WAV, M4A)',
              '📦 Archives (ZIP, RAR, 7Z)',
            ].map((fileType) => (
              <div key={fileType} className="text-sm text-gray-700 px-3 py-2 bg-green-50 rounded-lg">
                {fileType}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleDownload} className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-3">
              Paste URL Here
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or any file URL"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
              disabled={status === 'loading'}
            />
            <p className="text-xs text-gray-500 mt-2">
              Supports: YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, or direct file URLs
            </p>
          </div>

          {/* Status Messages */}
          {status !== 'idle' && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                status === 'loading'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : status === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-5 h-5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Download Info */}
          {downloadInfo && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">FILE NAME</p>
                  <p className="text-sm text-gray-900 truncate font-mono">{downloadInfo.fileName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">FILE SIZE</p>
                  <p className="text-sm text-gray-900">{downloadInfo.fileSize}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 font-semibold">FILE TYPE</p>
                  <p className="text-sm text-gray-900">{downloadInfo.fileType}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download File
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How it works:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Paste any URL from social media, video platforms, or direct links</li>
            <li>✓ The tool automatically detects and downloads the file</li>
            <li>✓ Your file downloads directly to your device</li>
            <li>✓ No registration or account needed</li>
            <li>✓ Works with videos, images, documents, and more</li>
          </ul>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Note: Please respect copyright and usage rights when downloading content. Only download content you have permission to download.
        </p>
      </div>
    </div>
  );
}

