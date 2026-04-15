'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader, Zap, Copy, Download, Play, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

interface GeneratedVideo {
  jobId: string;
  generationId?: string;
  prompt: string;
  duration: number;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  videoBase64?: string;
  estimatedTime?: string;
  error?: string;
  progress: number; // 0-100
}

export default function TextToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(6);
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for video generation status
  useEffect(() => {
    if (!generatedVideo || !generatedVideo.generationId || generatedVideo.status === 'completed' || generatedVideo.status === 'failed') {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      return;
    }

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/text-to-video/status?generationId=${generatedVideo.generationId}&jobId=${generatedVideo.jobId}`
        );

        if (!response.ok) {
          console.error('Status check failed:', response.status);
          return;
        }

        const data = await response.json();
        console.log('[Frontend] Status update:', data.status, 'Progress:', data.progress);

        // Update progress and status
        setGeneratedVideo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            progress: data.progress,
            videoUrl: data.videoUrl || data.videoBase64 ? 
              (data.videoBase64 ? 
                URL.createObjectURL(new Blob([new Uint8Array(atob(data.videoBase64).split('').map(c => c.charCodeAt(0)))], { type: 'video/mp4' })) :
                data.videoUrl) :
              undefined,
            error: data.error,
          };
        });

        // Stop polling when complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Status polling error:', err);
      }
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [generatedVideo]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedVideo(null);

    try {
      const response = await fetch('/api/text-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          duration,
          style,
          aspectRatio,
        }),
      });

      const data = await response.json();
      console.log('[Frontend] Generation response:', data);

      if (!data.ok) {
        setError(data.error || 'Failed to generate video');
      } else {
        // Set up video state with Pika generation ID for polling
        setGeneratedVideo({
          jobId: data.jobId,
          generationId: data.generationId,
          prompt,
          duration,
          status: data.status || 'processing',
          progress: 10, // Start at 10%
          estimatedTime: data.estimatedTime,
          error: data.error,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedVideo?.videoUrl) {
      navigator.clipboard.writeText(generatedVideo.videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadVideo = async () => {
    if (generatedVideo?.videoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideo.videoUrl;
      link.download = `text-to-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden py-16 px-4 md:px-8">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/video-tools" className="hover:text-white transition">Video Tools</Link>
              <ChevronRight size={16} />
              <span className="text-white">Text to Video</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎬 Text to Video</h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Generate stunning AI videos from text prompts. Create cinematic videos, animations, and visual content in minutes.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Info box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex gap-3"
            >
              <Clock className="text-blue-600 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-blue-900">Processing Time</p>
                <p className="text-sm text-blue-700">Videos typically take 3-5 minutes to generate. You'll see live updates below.</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-1"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Generate Video</h2>

                  <form onSubmit={handleGenerate} className="space-y-4">
                    {/* Text Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Prompt *
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video you want to create... e.g., 'A serene forest landscape with sunlight filtering through tall trees, mist rising from the ground, birds flying in the distance'"
                        maxLength={500}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{prompt.length}/500 characters</p>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (seconds) *
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value={6}>6 seconds</option>
                        <option value={8}>8 seconds</option>
                        <option value={10}>10 seconds</option>
                      </select>
                    </div>

                    {/* Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Style
                      </label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value="cinematic">Cinematic</option>
                        <option value="anime">Anime</option>
                        <option value="realistic">Realistic</option>
                        <option value="abstract">Abstract</option>
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aspect Ratio
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="9:16">9:16 (Vertical)</option>
                        <option value="1:1">1:1 (Square)</option>
                      </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                        <AlertCircle size={18} className="text-red-600 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Generate Video
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Results Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="md:col-span-2"
              >
                {generatedVideo ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    {/* Status Badge */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        <div className={`w-2 h-2 rounded-full ${
                          generatedVideo.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                          generatedVideo.status === 'completed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}></div>
                        {generatedVideo.status === 'processing' && `Processing... (${generatedVideo.estimatedTime})`}
                        {generatedVideo.status === 'completed' && 'Completed'}
                        {generatedVideo.status === 'failed' && 'Failed'}
                      </div>
                    </div>

                    {/* Prompt Display */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Prompt</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm">{generatedVideo.prompt}</p>
                    </div>

                    {/* Duration Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{generatedVideo.duration}s</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium">Style</p>
                        <p className="text-lg font-bold text-gray-900 capitalize">{style}</p>
                      </div>
                    </div>

                    {/* Video Preview */}
                    {generatedVideo.videoUrl ? (
                      <div className="mb-6">
                        <video
                          src={generatedVideo.videoUrl}
                          controls
                          className="w-full rounded-lg bg-black"
                        />
                      </div>
                    ) : (
                      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Generating Your Video</h3>
                            <span className="text-2xl font-bold text-indigo-600">{Math.round(generatedVideo.progress || 0)}%</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">This typically takes 3-5 minutes...</p>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="bg-indigo-600 h-full rounded-full"
                              animate={{ width: `${Math.round(generatedVideo.progress || 0)}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                          
                          {/* Progress Details */}
                          <div className="flex items-center justify-between mt-4 text-sm">
                            <p className="text-gray-600">
                              Estimated time remaining: ~{Math.max(1, Math.round((100 - (generatedVideo.progress || 0)) / 30))} minutes
                            </p>
                            <p className="text-gray-500">
                              {Math.round(generatedVideo.progress || 0)}% complete
                            </p>
                          </div>
                        </div>

                        {/* Stage Indicators */}
                        <div className="space-y-3">
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            (generatedVideo.progress || 0) >= 25 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              (generatedVideo.progress || 0) >= 25 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm font-medium">Uploading & Processing</span>
                          </div>
                          
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            (generatedVideo.progress || 0) >= 50 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              (generatedVideo.progress || 0) >= 50 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm font-medium">AI Generation</span>
                          </div>
                          
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            (generatedVideo.progress || 0) >= 75 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              (generatedVideo.progress || 0) >= 75 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm font-medium">Rendering & Optimization</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">Please keep this tab open. We'll notify you when your video is ready!</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {generatedVideo.videoUrl && (
                      <div className="flex gap-3">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                        >
                          <Copy size={16} />
                          {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={downloadVideo}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                    <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create</h3>
                    <p className="text-gray-600">
                      Enter a text prompt above to generate your first AI video. Be as creative and detailed as possible!
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12"
            >
              <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Pro Tips for Better Videos</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">✨ Be Specific</h4>
                    <p className="text-sm text-gray-700">
                      Include details like lighting, camera movements, colors, and mood. Example: "Cinematic shot of a waterfall with golden sunlight, slow zoom out"
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎭 Set the Scene</h4>
                    <p className="text-sm text-gray-700">
                      Mention locations, objects, and characters. Example: "Urban street at night with neon signs reflecting in puddles"
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎬 Use Camera Terms</h4>
                    <p className="text-sm text-gray-700">
                      Reference camera movements and techniques: pan, zoom, tracking shot, slow motion, etc.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎨 Mention Style</h4>
                    <p className="text-sm text-gray-700">
                      Describe the visual style: photorealistic, animated, 3D, oil painting, vintage, etc.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
