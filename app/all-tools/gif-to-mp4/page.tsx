'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { VideoToolErrorType } from '@/app/utils/types/errors';

const TOOL_ID = 'gif-to-mp4';
const TOOL_NAME = 'GIF to MP4';

export default function GifToMp4Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(85);
  const { error, clearError, setError } = useImageToolErrors();


  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    clearError();
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    clearError();
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    clearError();
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'gif',
        to_format: 'mp4',
        options: { fps, quality },
      }));
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        setError({
          type: VideoToolErrorType.FFMPEG_FAILED,
          toolId: TOOL_ID,
          toolName: TOOL_NAME,
          message: failure.error || 'GIF to MP4 conversion failed',
          userFriendlyMessage: 'GIF to MP4 conversion failed. Please try with a different GIF.',
          timestamp: new Date(),
          details: {
            endpoint: '/api/convert',
            apiStatus: response.status,
            backendErrorCode: 'FFMPEG_FAILED',
            stderr: failure.stderr || failure.error,
          },
          fileMeta: { filename: file.name, size: file.size, mimeType: file.type },
        });
        return;
      }
      
      const blob = await response.blob();
      setResult(blob);
    } catch (err) {
      setError({
        type: VideoToolErrorType.FFMPEG_FAILED,
        toolId: TOOL_ID,
        toolName: TOOL_NAME,
        message: err instanceof Error ? err.message : 'Error converting file',
        userFriendlyMessage: 'GIF to MP4 conversion failed. Please try with a different GIF.',
        timestamp: new Date(),
        details: { endpoint: '/api/convert', error: err instanceof Error ? err.message : 'Error converting file' },
        fileMeta: { filename: file.name, size: file.size, mimeType: file.type },
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}
        
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>GIF to MP4</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">GIF to MP4 Converter</h1>
                <p className="text-lg text-white/90">Convert GIF animations to MP4 video format with adjustable frame rate and quality.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload GIF File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".gif"
                  />
                  {error && <ErrorAlert error={error} onDismiss={clearError} />}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Options</h3>
                    
                    {/* FPS */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Frames Per Second: {fps}
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="1"
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher FPS = smoother motion</p>
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        MP4 Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="95"
                        step="5"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher quality = larger file size</p>
                    </div>
                  </div>

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert to MP4'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download MP4
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Instant conversion in your browser</li>
                      <li>• Adjustable frame rate and quality</li>
                      <li>• Supports GIF format</li>
                      <li>• Secure - files never uploaded</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}





