'use client';

import React, { useState, useRef, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Zap, Shield, CheckCircle, Loader } from 'lucide-react';
import { getToolById } from '@/app/lib/video-tools';
import { validateToolInput } from '@/app/lib/media-validation';
import type { VideoTool } from '@/app/lib/video-tools';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { useVideoToolErrors } from '@/app/hooks/useVideoToolErrors';
import { validateFile } from '@/app/utils/validation/file-validation';
import { ErrorAlert } from '@/app/components/error-components';
import { VideoToolErrorType } from '@/app/utils/types/errors';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { notFound } from 'next/navigation';

// Action-specific CTA text for each tool
function getActionText(toolId: string): string {
  const actionMap: Record<string, string> = {
    // Conversion tools
    'mp4-to-mp3': 'Convert MP4 to MP3',
    'mov-to-mp4': 'Convert MOV to MP4',
    'mp4-to-wav': 'Extract as WAV',
    'avi-to-mp4': 'Convert AVI to MP4',
    'mkv-to-mp4': 'Convert MKV to MP4',
    'webm-to-mp4': 'Convert WebM to MP4',
    'mp4-to-avi': 'Convert to AVI',
    'mov-to-mp3': 'Extract Audio as MP3',
    'aac-to-mp3': 'Convert AAC to MP3',
    'webm-to-mp3': 'Extract as MP3',
    'ogg-to-wav': 'Convert OGG to WAV',
    'avi-to-mov': 'Convert to MOV',
    'mkv-to-gif': 'Convert to GIF',
    'avi-to-mkv': 'Convert to MKV',
    'aac-to-m4r': 'Create M4R Ringtone',
    'mp4-to-mov': 'Convert to MOV',
    'mkv-to-mp3': 'Extract as MP3',
    'mov-to-avi': 'Convert to AVI',
    'avi-to-gif': 'Convert to GIF',
    'aac-to-wav': 'Convert to WAV',
    'aac-to-flac': 'Convert to FLAC',
    'mov-to-gif': 'Convert to GIF',
    'gif-to-mov': 'Convert GIF to MOV',
    'm4a-to-mp4': 'Convert M4A to MP4',
    'mkv-to-avi': 'Convert to AVI',
    'avi-to-mp3': 'Extract as MP3',
    'm4a-to-mp3': 'Convert M4A to MP3',
    'mp4-to-gif': 'Convert to GIF',
    'ogg-to-mp3': 'Convert OGG to MP3',
    'm4a-to-wav': 'Convert to WAV',
    'gif-to-webp': 'Convert to WebP',
    'webm-to-mov': 'Convert to MOV',
    'mkv-to-mov': 'Convert to MOV',
    'aac-to-mp4': 'Convert to MP4',
    'mp4-to-ogg': 'Convert to OGG',
    'mp4-to-webm': 'Convert to WebM',
    
    // Editing tools
    'trim-video': 'Trim Video',
    'resize-video': 'Resize Video',
    'mute-video': 'Mute Video',
    'extract-audio-from-video': 'Extract Audio',
    'video-to-gif': 'Convert to GIF',
    'compress-video': 'Compress Video',
    'compress-mov': 'Compress MOV',
    'compress-avi': 'Compress AVI',
    'compress-mkv': 'Compress MKV',
    'video-to-webp': 'Convert to WebP',
    
    // Transcription tools
    'audio-to-text': 'Transcribe Audio',
    'video-to-text': 'Transcribe Video',
    'youtube-to-text': 'Download & Transcribe',
    'youtube-transcript': 'Get Transcript',
    'transcribe-podcast': 'Transcribe Podcast',
    
    // Download tools
    'instagram-download': 'Download Video',
    'tiktok-video-download': 'Download TikTok Video',
    'twitter-download': 'Download Video',
    'facebook-download': 'Download Video',
    
    // Special tools
    'summarize-podcast': 'Summarize Podcast',
    'add-subtitles': 'Add Subtitles',
    'text-to-video': 'Generate Video',
  };

  return actionMap[toolId] || 'Process File';
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function VideoToolPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tool = getToolById(resolvedParams.slug);
  
  // Use centralized error handling
  const { error, isError, createAndHandleError, clearError } = useVideoToolErrors({
    toolId: resolvedParams.slug,
    toolName: tool?.title || 'Video Tool'
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) {
    notFound();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      clearError();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    clearError();
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions({ ...options, [optionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResult(null);

    // Validate input with legacy validator
    const validation = validateToolInput(tool, { file: file || undefined, url });
    if (!validation.valid) {
      // Map validation error to specific type instead of generic API_ERROR
      const validationErrorType = VideoToolErrorType.UNSUPPORTED_FORMAT; // Default to format error
      createAndHandleError(validationErrorType, { 
        validationError: validation.error || 'Validation failed'
      }, undefined, validation.error);
      return;
    }

    // Additional file validation if file is present
    if (file) {
      const fileValidation = await validateFile(file, tool.accepts, resolvedParams.slug);
      if (!fileValidation.valid) {
        // Use proper validation error type with custom user message
        createAndHandleError(VideoToolErrorType.UNSUPPORTED_FORMAT, {
          validationError: fileValidation.error || 'File validation failed'
        }, {
          filename: file.name,
          size: file.size,
          mimeType: file.type
        }, fileValidation.error); // Custom user message
        setLoading(false);
        // setProgress(0);
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tool', resolvedParams.slug);

      if (file) {
        formData.append('file', file);
      }

      if (url) {
        formData.append('url', url);
      }

      // Add options
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorType = errorData.type || VideoToolErrorType.API_ERROR;
        const errorMessage = errorData.error || errorData.message || 'Processing failed';
        
        // Log detailed error for debugging - use JSON.stringify for reliability
        const errorLogData = {
          status: response.status,
          type: errorType,
          message: errorMessage,
          toolId: errorData.toolId,
          toolName: errorData.toolName,
          details: errorData.details,
        };
        console.error(`[${resolvedParams.slug}] API Error: ${JSON.stringify(errorLogData)}`);

        createAndHandleError(errorType, {
          apiError: errorMessage,
          statusCode: response.status,
          details: errorData.details,
        });
        return;
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setResult(data);
      } else if (contentType?.includes('text')) {
        const text = await response.text();
        setResult({ content: text, type: 'text' });
      } else {
        // Binary file
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `output${getFileExtension(tool.outputType)}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        setResult({ type: 'file', message: 'File downloaded successfully' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown network error';
      const errorStack = err instanceof Error ? err.stack : undefined;
      const errorLogData = {
        errorMessage,
        errorType: err instanceof TypeError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
        stack: errorStack,
      };
      console.error(`[${resolvedParams.slug}] Network/Processing Error: ${JSON.stringify(errorLogData)}`);
      
      createAndHandleError(VideoToolErrorType.NETWORK_ERROR, {
        networkError: errorMessage,
        errorType: err instanceof TypeError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative z-10 w-full">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-white text-sm mb-6"
          >
            <Link href="/" className="hover:opacity-80 transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools/video-tools" className="hover:opacity-80 transition">Video Tools</Link>
            <ChevronRight size={16} />
            <span className="opacity-90">{tool.title}</span>
          </motion.div>

          {/* Header Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
                <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#B90A45' }}>
                    {tool.category}
                  </span>
                  <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#B90A45' }}>
                    Engine: {tool.engine}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
        >
          {/* Left Column - Upload & Configure (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1"
          >
            <div className="sticky top-4 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File/URL Input */}
                  <div className="space-y-4">
                    {(tool.inputMethod === 'file' || tool.inputMethod === 'both') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload {tool.inputMethod === 'both' ? 'File (or use URL below)' : 'File'}
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition"
                        >
                          <div className="text-gray-600">
                            <p className="text-sm font-medium mb-1">
                              {file ? file.name : 'Click to upload'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tool.accepts.join(', ')}
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={tool.accepts.join(',')}
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {(tool.inputMethod === 'url' || tool.inputMethod === 'both') && (
                      <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                          {tool.inputMethod === 'both' ? 'Or enter URL' : 'Enter URL'}
                        </label>
                        <input
                          id="url"
                          type="text"
                          value={url}
                          onChange={handleUrlChange}
                          placeholder="https://example.com/video.mp4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tool Options */}
                  {tool.options.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Options</h3>
                      <div className="space-y-3">
                        {tool.options.map((option) => (
                          <div key={option.id}>
                            <label htmlFor={option.id} className="block text-xs font-medium text-gray-700 mb-1">
                              {option.label}
                              {option.required && <span className="text-red-500">*</span>}
                            </label>

                            {option.type === 'select' && (
                              <select
                                id={option.id}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              >
                                {option.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {option.type === 'number' && (
                              <input
                                id={option.id}
                                type="number"
                                min={option.min}
                                max={option.max}
                                step={option.step}
                                placeholder={option.placeholder}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) =>
                                  handleOptionChange(option.id, parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              />
                            )}

                            {option.type === 'text' && (
                              <input
                                id={option.id}
                                type="text"
                                placeholder={option.placeholder}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              />
                            )}

                            {option.type === 'checkbox' && (
                              <div className="flex items-center">
                                <input
                                  id={option.id}
                                  type="checkbox"
                                  checked={options[option.id] ?? option.default ?? false}
                                  onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                                />
                                <label htmlFor={option.id} className="ml-2 text-sm text-gray-600">
                                  {option.label}
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {isError && error && <ErrorAlert error={error} onDismiss={clearError} className="mb-4" />}

                  {/* Submit Button - Action-Specific CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        {getActionText(resolvedParams.slug)}...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        {getActionText(resolvedParams.slug)}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Info & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Info Box */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Process video and audio files with the options available for this tool. Files are uploaded to our server when processing is required, so avoid uploading sensitive content.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-pink-600 flex-shrink-0" />
                  <span>Supported: {tool.accepts.slice(0, 3).join(', ')}...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-pink-600 flex-shrink-0" />
                  <span>Output: {tool.outputType.toUpperCase()}</span>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-900">Success!</h2>
                </div>

                {result.type === 'text' && (
                  <div>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
                      <pre
                        data-testid="podcast-summary-output"
                        className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono"
                      >
                        {result.content}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        const element = document.createElement('a');
                        element.setAttribute(
                          'href',
                          'data:text/plain;charset=utf-8,' + encodeURIComponent(result.content)
                        );
                        element.setAttribute('download', `output.txt`);
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium duration-0"
                    >
                      Download Text
                    </button>
                  </div>
                )}

                {result.type === 'file' && (
                  <p className="text-green-700 font-medium">{result.message}</p>
                )}
              </motion.div>
            )}

            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-pink-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to process</h3>
                <p className="text-gray-600">Upload a file or enter a URL and click Process to get started</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20 mb-20">
          {/* SEO Content Sections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
            <motion.h2 className="text-3xl font-bold text-gray-900 mb-6">How to {getActionText(resolvedParams.slug)}</motion.h2>
            
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 1: Upload Your File</h3>
                <p className="text-gray-700 leading-relaxed">
                  Click the upload area above and select your {tool.accepts.join(', ')} file from your computer. Alternatively, you can paste a URL to process files from the web.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 2: Configure Options (if needed)</h3>
                <p className="text-gray-700 leading-relaxed">
                  {tool.options.length > 0 
                    ? `Choose your preferred settings from the available options such as quality, format, or dimensions to customize the output.`
                    : `This tool works with default settings, but you can customize if needed.`
                  }
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 3: Click {getActionText(resolvedParams.slug)}</h3>
                <p className="text-gray-700 leading-relaxed">
                  Press the conversion button to start processing. The tool will process your file in seconds and provide you with the result.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step 4: Download Your Result</h3>
                <p className="text-gray-700 leading-relaxed">
                  Once processing is complete, download your converted file. No file limits, no watermarks, completely free.
                </p>
              </div>
            </div>
          </div>

          {/* Why Use This Tool */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200 p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use {tool.title}?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Free to Use</h3>
                  <p className="text-gray-700 text-sm">No subscription or credit card is required. Processing limits can vary by tool, file type, and file size.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Installation Required</h3>
                  <p className="text-gray-700 text-sm">Works directly in your web browser. Use on Windows, Mac, iPhone, Android, or any device with internet.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fast & Reliable</h3>
                  <p className="text-gray-700 text-sm">Process files in seconds. Advanced engines handle large files with optimal speed and quality preservation.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-gray-700 text-sm">Files are uploaded to our server for processing over an HTTPS connection. Avoid uploading sensitive or confidential content.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  Is this tool really free?
                  <span className="text-pink-600">+</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm">You can use {tool.title} without a subscription or credit card. Processing limits can vary by tool, file type, and file size.</p>
              </details>
              
              <details className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  Do you store my files?
                  <span className="text-pink-600">+</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm">Files are uploaded to our server when processing is required and may remain temporarily while the request and download are handled. Avoid uploading sensitive or confidential content.</p>
              </details>
              
              <details className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  What's the file size limit?
                  <span className="text-pink-600">+</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm">We support files up to several hundred MB depending on your internet connection and browser capabilities. Larger files may take longer to process.</p>
              </details>
              
              <details className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  Which browsers are supported?
                  <span className="text-pink-600">+</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm">This tool works on all modern browsers including Chrome, Firefox, Safari, and Edge on desktop, tablet, and mobile devices.</p>
              </details>
              
              <details className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                <summary className="font-semibold text-gray-900 flex items-center justify-between">
                  Is there a watermark on the output?
                  <span className="text-pink-600">+</span>
                </summary>
                <p className="text-gray-700 mt-3 text-sm">No watermarks! Your converted files are clean and ready to use immediately. No branding or quality degradation.</p>
              </details>
            </div>
          </div>

          <RelatedToolsSection
            family="video"
            toolId={resolvedParams.slug}
            description="Check out these related video and audio tools that might help with your media processing needs."
            limit={8}
          />
        </motion.div>

        {/* Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Fast Processing',
                description: 'Optimized conversion engines for rapid video processing',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Files are uploaded to our server when processing is required. Avoid uploading sensitive or confidential content.',
              },
              {
                icon: CheckCircle,
                title: 'Multiple Formats',
                description: 'Support for all major video and audio formats',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                    <feature.icon size={24} className="text-pink-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function getFileExtension(outputType: string): string {
  if (outputType === 'text' || outputType === 'multiple') {
    return '.txt';
  }
  return outputType.startsWith('.') ? outputType : '.' + outputType;
}

// Import tools for related tools section
interface ToolItem {
  id: string;
  title: string;
  description: string;
  route: string;
}

function getRelatedTools(toolId: string): ToolItem[] {
  const relatedMap: Record<string, ToolItem[]> = {
    // MP4 tools should link to other conversions
    'mp4-to-mp3': [
      { id: 'extract-audio-from-video', title: 'Extract Audio from Video', description: 'Extract audio track from any video', route: '/all-tools/video/extract-audio-from-video' },
      { id: 'mov-to-mp3', title: 'MOV to MP3', description: 'Convert MOV videos to MP3', route: '/all-tools/video/mov-to-mp3' },
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce video file size', route: '/all-tools/video/compress-video' },
      { id: 'video-to-gif', title: 'Video to GIF', description: 'Create animated GIFs', route: '/all-tools/video/video-to-gif' },
    ],
    'mov-to-mp4': [
      { id: 'mp4-to-mov', title: 'MP4 to MOV', description: 'Convert MP4 to MOV format', route: '/all-tools/video/mp4-to-mov' },
      { id: 'compress-mov', title: 'Compress MOV', description: 'Reduce MOV file size', route: '/all-tools/video/compress-mov' },
      { id: 'trim-video', title: 'Trim Video', description: 'Trim unwanted video sections', route: '/all-tools/video/trim-video' },
      { id: 'resize-video', title: 'Resize Video', description: 'Change video dimensions', route: '/all-tools/video/resize-video' },
    ],
    'mp4-to-wav': [
      { id: 'extract-audio-from-video', title: 'Extract Audio from Video', description: 'Extract audio from any video', route: '/all-tools/video/extract-audio-from-video' },
      { id: 'mp4-to-mp3', title: 'MP4 to MP3', description: 'Convert MP4 to MP3 audio', route: '/all-tools/video/mp4-to-mp3' },
      { id: 'audio-to-text', title: 'Audio to Text', description: 'Transcribe audio to text', route: '/all-tools/video/audio-to-text' },
      { id: 'video-to-text', title: 'Video to Text', description: 'Transcribe video to text', route: '/all-tools/video/video-to-text' },
    ],
    'avi-to-mp4': [
      { id: 'mkv-to-mp4', title: 'MKV to MP4', description: 'Convert MKV to MP4', route: '/all-tools/video/mkv-to-mp4' },
      { id: 'webm-to-mp4', title: 'WebM to MP4', description: 'Convert WebM to MP4', route: '/all-tools/video/webm-to-mp4' },
      { id: 'compress-avi', title: 'Compress AVI', description: 'Reduce AVI file size', route: '/all-tools/video/compress-avi' },
      { id: 'trim-video', title: 'Trim Video', description: 'Cut video sections', route: '/all-tools/video/trim-video' },
    ],
    'mkv-to-mp4': [
      { id: 'avi-to-mp4', title: 'AVI to MP4', description: 'Convert AVI to MP4', route: '/all-tools/video/avi-to-mp4' },
      { id: 'webm-to-mp4', title: 'WebM to MP4', description: 'Convert WebM to MP4', route: '/all-tools/video/webm-to-mp4' },
      { id: 'compress-mkv', title: 'Compress MKV', description: 'Reduce MKV size', route: '/all-tools/video/compress-mkv' },
      { id: 'mkv-to-mp3', title: 'MKV to MP3', description: 'Extract audio from MKV', route: '/all-tools/video/mkv-to-mp3' },
    ],
    'trim-video': [
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce file size after editing', route: '/all-tools/video/compress-video' },
      { id: 'mute-video', title: 'Mute Video', description: 'Remove audio from video', route: '/all-tools/video/mute-video' },
      { id: 'resize-video', title: 'Resize Video', description: 'Change video dimensions', route: '/all-tools/video/resize-video' },
      { id: 'video-to-gif', title: 'Video to GIF', description: 'Convert trimmed video to GIF', route: '/all-tools/video/video-to-gif' },
    ],
    'resize-video': [
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce file size', route: '/all-tools/video/compress-video' },
      { id: 'trim-video', title: 'Trim Video', description: 'Cut unwanted sections', route: '/all-tools/video/trim-video' },
      { id: 'video-to-gif', title: 'Video to GIF', description: 'Create GIF from video', route: '/all-tools/video/video-to-gif' },
      { id: 'mute-video', title: 'Mute Video', description: 'Remove audio', route: '/all-tools/video/mute-video' },
    ],
    'mute-video': [
      { id: 'extract-audio-from-video', title: 'Extract Audio', description: 'Extract audio from video', route: '/all-tools/video/extract-audio-from-video' },
      { id: 'trim-video', title: 'Trim Video', description: 'Cut video sections', route: '/all-tools/video/trim-video' },
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce file size', route: '/all-tools/video/compress-video' },
      { id: 'video-to-gif', title: 'Video to GIF', description: 'Create GIF', route: '/all-tools/video/video-to-gif' },
    ],
    'extract-audio-from-video': [
      { id: 'audio-to-text', title: 'Audio to Text', description: 'Transcribe audio', route: '/all-tools/video/audio-to-text' },
      { id: 'mp4-to-mp3', title: 'MP4 to MP3', description: 'Convert specific format', route: '/all-tools/video/mp4-to-mp3' },
      { id: 'transcribe-podcast', title: 'Transcribe Podcast', description: 'Transcribe podcast audio', route: '/all-tools/video/transcribe-podcast' },
      { id: 'mute-video', title: 'Mute Video', description: 'Remove audio instead', route: '/all-tools/video/mute-video' },
    ],
    'video-to-gif': [
      { id: 'gif-to-webp', title: 'GIF to WebP', description: 'Convert GIF to modern format', route: '/all-tools/video/gif-to-webp' },
      { id: 'gif-to-mov', title: 'GIF to MOV', description: 'Convert GIF to video', route: '/all-tools/video/gif-to-mov' },
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce file size', route: '/all-tools/video/compress-video' },
      { id: 'trim-video', title: 'Trim Video', description: 'Cut before converting', route: '/all-tools/video/trim-video' },
    ],
    'compress-video': [
      { id: 'trim-video', title: 'Trim Video', description: 'Remove sections first', route: '/all-tools/video/trim-video' },
      { id: 'resize-video', title: 'Resize Video', description: 'Reduce dimensions', route: '/all-tools/video/resize-video' },
      { id: 'video-to-webp', title: 'Video to WebP', description: 'Modern format compression', route: '/all-tools/video/video-to-webp' },
      { id: 'mp4-to-webm', title: 'MP4 to WebM', description: 'Web-optimized format', route: '/all-tools/video/mp4-to-webm' },
    ],
    // Transcription tools
    'audio-to-text': [
      { id: 'video-to-text', title: 'Video to Text', description: 'Transcribe videos', route: '/all-tools/video/video-to-text' },
      { id: 'transcribe-podcast', title: 'Transcribe Podcast', description: 'Transcribe podcasts', route: '/all-tools/video/transcribe-podcast' },
      { id: 'youtube-transcript', title: 'YouTube Transcript', description: 'Get YouTube transcripts', route: '/all-tools/video/youtube-transcript' },
      { id: 'summarize-podcast', title: 'Summarize Podcast', description: 'Summarize audio content', route: '/all-tools/video/summarize-podcast' },
    ],
    'video-to-text': [
      { id: 'audio-to-text', title: 'Audio to Text', description: 'Transcribe audio files', route: '/all-tools/video/audio-to-text' },
      { id: 'youtube-to-text', title: 'YouTube to Text', description: 'Transcribe YouTube videos', route: '/all-tools/video/youtube-to-text' },
      { id: 'youtube-transcript', title: 'YouTube Transcript', description: 'Get YouTube transcripts', route: '/all-tools/video/youtube-transcript' },
      { id: 'transcribe-podcast', title: 'Transcribe Podcast', description: 'Transcribe podcasts', route: '/all-tools/video/transcribe-podcast' },
    ],
    // Default related tools
    'default': [
      { id: 'trim-video', title: 'Trim Video', description: 'Cut and edit video sections', route: '/all-tools/video/trim-video' },
      { id: 'compress-video', title: 'Compress Video', description: 'Reduce file size', route: '/all-tools/video/compress-video' },
      { id: 'video-to-gif', title: 'Video to GIF', description: 'Create animated GIFs', route: '/all-tools/video/video-to-gif' },
      { id: 'extract-audio-from-video', title: 'Extract Audio', description: 'Get audio from videos', route: '/all-tools/video/extract-audio-from-video' },
    ]
  };

  return relatedMap[toolId] || relatedMap['default'];
}
