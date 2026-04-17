'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap, Info, Cpu, AlertCircle } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Footer } from '../../components/Footer';

interface UpscaleMetadata {
  original_size?: string;
  upscaled_size?: string;
  scale?: number;
  mode?: string;
  model?: string;
  engine?: string;
  processing_time_ms?: number;
  output_size_bytes?: number;
  compression_ratio?: number;
  warning?: string;
}

export default function UpscaleImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null); // ← Keep reference to prevent GC
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [useDataUrl, setUseDataUrl] = useState(false);
  
  // Upscale options
  const [scale, setScale] = useState<2 | 3 | 4>(4);
  const [mode, setMode] = useState<'auto' | 'photo' | 'anime'>('auto');
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UpscaleMetadata | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setMetadata(null);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setResultBlob(null); // ← Clear blob reference
    setResultDataUrl(null);
    setMetadata(null);
    setError(null);
    setImageLoading(false);
    setUseDataUrl(false);
  };

  const upscaleImage = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);
    setMetadata(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const startTime = Date.now();
      const response = await fetch(
        `/api/upscale?scale=${scale}&mode=${mode}&face_enhance=${faceEnhance}&format=${outputFormat}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to upscale image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('Content-Type');
      console.log('📥 Response received:', { 
        status: response.status,
        contentType,
        contentLength: response.headers.get('Content-Length')
      });

      const blob = await response.blob();
      console.log('✓ Response blob received:', { 
        size: blob.size, 
        type: blob.type,
        contentType
      });

      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      // Validate blob is actually an image
      if (!blob.type.startsWith('image/')) {
        console.error('❌ Invalid blob type:', blob.type);
        throw new Error(`Invalid response type: ${blob.type}. Expected image.`);
      }

      // Validate blob contains actual image data by checking magic bytes
      const headerBytes = await blob.slice(0, 8).arrayBuffer();
      const view = new Uint8Array(headerBytes);
      const hexHeader = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log('Blob magic bytes:', hexHeader);

      // Check for PNG (89 50 4E 47) or JPEG (FF D8 FF)
      const isPNG = view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47;
      const isJPEG = view[0] === 0xFF && view[1] === 0xD8 && view[2] === 0xFF;
      const isWebP = view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46;

      if (!isPNG && !isJPEG && !isWebP) {
        console.error('❌ Invalid image data. Magic bytes:', hexHeader);
        throw new Error(`Invalid image data: not a valid PNG, JPEG, or WebP file`);
      }

      console.log('✓ Valid image format:', { isPNG, isJPEG, isWebP });

      // Parse metadata from response header
      const metadataHeader = response.headers.get('X-Upscale-Metadata');
      if (metadataHeader) {
        try {
          const parsedMetadata = JSON.parse(metadataHeader);
          console.log('✓ Metadata parsed:', parsedMetadata);
          setMetadata(parsedMetadata);
        } catch (e) {
          console.warn('Failed to parse metadata', e);
        }
      }

      // Convert blob to data URL (CSP allows data: URIs for images)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        console.log('✓ Data URL created:', { 
          urlLength: dataUrl.length,
          blobSize: blob.size,
          blobType: blob.type,
          sizeMB: (blob.size / (1024*1024)).toFixed(1)
        });
        
        // Store blob reference in state to prevent garbage collection
        setResultBlob(blob);
        
        // Set result and start loading
        setResult(dataUrl);
        setImageLoading(true);
        console.log('🖼️ Image loading started from data URL');
      };
      
      reader.onerror = () => {
        throw new Error('Failed to convert image blob to data URL');
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Upscale error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `upscaled-${scale}x-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Upscale Image</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Zap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">AI Image Upscaler</h1>
                <p className="text-lg text-white/90">Professional image enlargement using Real-ESRGAN. Upscale to 2×, 3×, or 4× with advanced AI enhancement.</p>
              </div>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left (2 cols) */}
              <div className="lg:col-span-2">
                {/* Step 1: Upload */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                    <ImageUploader 
                      onFileSelect={handleFileSelect}
                      preview={preview}
                      onClearPreview={handleClearPreview}
                    />
                  </div>
                )}

                {/* Original Preview */}
                {preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Original Image</h2>
                    <div className="flex justify-center mb-4">
                      <img
                        src={preview}
                        alt="original"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxHeight: '500px', maxWidth: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upscaled Result ({scale}×)</h2>
                    <div className="flex justify-center mb-6 bg-gray-50 rounded-lg p-4 min-h-[300px]">
                      {imageLoading && (
                        <div className="text-center">
                          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading high-resolution image...</p>
                        </div>
                      )}
                      <img
                        src={result || ''}
                        alt="upscaled"
                        className={`rounded-lg shadow-lg max-w-full ${imageLoading ? 'hidden' : ''}`}
                        style={{ maxHeight: '600px', maxWidth: '100%' }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully');
                          setImageLoading(false);
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('❌ Image failed to load');
                          console.error('Image src length:', target.src?.length);
                          console.error('Blob info:', {
                            hasBlob: !!resultBlob,
                            blobSize: resultBlob?.size,
                            blobType: resultBlob?.type,
                          });
                          setError('Unable to display preview. The file is ready to download.');
                          setImageLoading(false);
                        }}
                      />
                    </div>

                    {/* Metadata Display */}
                    {metadata && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {metadata.original_size && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium">Original Size</p>
                            <p className="text-sm text-gray-900">{metadata.original_size}px</p>
                          </div>
                        )}
                        {metadata.upscaled_size && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium">Upscaled Size</p>
                            <p className="text-sm text-gray-900">{metadata.upscaled_size}px</p>
                          </div>
                        )}
                        {metadata.mode && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium">Detected Mode</p>
                            <p className="text-sm text-gray-900 capitalize">{metadata.mode}</p>
                          </div>
                        )}
                        {metadata.output_size_bytes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium">Output Size</p>
                            <p className="text-sm text-gray-900">{(metadata.output_size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Engine & Performance Info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {processingTime !== null && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          ⚡ {(processingTime / 1000).toFixed(1)}s processing
                        </span>
                      )}

                    </div>

                    {metadata?.warning && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">⚠️ {metadata.warning}</p>
                      </div>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How to Use:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image (JPG, PNG, or WebP)</li>
                      <li>2. Choose upscale factor (2×, 3×, or 4×)</li>
                      <li>3. Select image type (auto-detect or specific)</li>
                      <li>4. Optional: Enable face enhancement for portraits</li>
                      <li>5. Pick output format (PNG for quality, JPG for size, WebP for balance)</li>
                      <li>6. Click "Upscale" and download your enhanced image</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {!preview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Key Features</h3>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>✓ Real-ESRGAN AI upscaling</li>
                        <li>✓ 2×, 3×, 4× magnification</li>
                        <li>✓ Auto image type detection</li>
                        <li>✓ Face enhancement mode</li>
                        <li>✓ Multiple formats (PNG/JPG/WebP)</li>
                        <li>✓ Batch processing ready</li>
                      </ul>
                    </div>
                  )}

                  {/* Settings */}
                  {preview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Upscale Settings</h3>

                      {/* Scale Selection */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Upscale Factor</label>
                        <div className="flex gap-2">
                          {[2, 3, 4].map((s) => (
                            <button
                              key={s}
                              onClick={() => setScale(s as 2 | 3 | 4)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                                scale === s
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {s}×
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          <p>{scale === 2 ? '✓ Fastest, good for web' : scale === 3 ? '✓ Balanced quality & speed' : '✓ Maximum quality'}</p>
                        </div>
                      </div>

                      {/* Image Type */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Image Type</label>
                        <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value as 'auto' | 'photo' | 'anime')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="auto">Auto Detect (Recommended)</option>
                          <option value="photo">Photo / Real Image</option>
                          <option value="anime">Anime / Illustration</option>
                        </select>
                      </div>

                      {/* Output Format */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Output Format</label>
                        <div className="flex gap-2">
                          {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setOutputFormat(fmt)}
                              className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition ${
                                outputFormat === fmt
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {fmt === 'jpg' ? 'JPG' : fmt.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Face Enhancement */}
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="faceEnhance"
                          checked={faceEnhance}
                          onChange={(e) => setFaceEnhance(e.target.checked)}
                          className="w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="faceEnhance" className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">Enhance Faces</div>
                          <div className="text-xs text-gray-600">Sharpen facial details</div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-xs mt-1">{error}</p>
                    </div>
                  )}

                  {/* Upscale Button */}
                  {preview && (
                    <button
                      onClick={upscaleImage}
                      disabled={!file || processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap size={20} />
                          Upscale Now
                        </>
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  )}

                  {/* Quality Info */}
                  {preview && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Info size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-indigo-900 text-sm">Scale Comparison</h3>
                        </div>
                      </div>
                      <ul className="text-xs text-indigo-800 space-y-1">
                        <li><span className="font-medium">2×</span> — Quick, web-friendly</li>
                        <li><span className="font-medium">3×</span> — Balanced approach</li>
                        <li><span className="font-medium">4×</span> — Maximum detail</li>
                      </ul>
                    </div>
                  )}

                  {/* Format Tips */}
                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 mb-2 text-sm">Format Guide</h3>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li><span className="font-medium">PNG:</span> Lossless, best quality</li>
                        <li><span className="font-medium">WebP:</span> Optimal balance</li>
                        <li><span className="font-medium">JPG:</span> Smallest file size</li>
                      </ul>
                    </div>
                  )}
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







