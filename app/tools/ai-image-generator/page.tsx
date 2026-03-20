'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Loader, Sparkles, ChevronRight } from 'lucide-react';

declare global {
  interface Window {
    puter: any;
  }
}

export default function AiImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-image-1');
  const [quality, setQuality] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [puterReady, setPuterReady] = useState(false);

  // Load Puter.js
  useEffect(() => {
    console.log('[Puter] Starting script load...');
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    const startTime = Date.now();
    
    script.onload = () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Puter] Script loaded in ${duration}s, puter ready`);
      setPuterReady(true);
    };
    script.onerror = () => {
      console.error('[Puter] Failed to load Puter script');
      setError('⚠️ Failed to load image service. Check your internet connection and refresh.');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);

    const startTime = Date.now();

    try {
      console.log(`[Image Gen] Attempting Puter AI with prompt: ${prompt}`);
      
      // Try Puter.ai if available
      if (puterReady && window.puter) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Puter request timed out')), 60000)
          );

          const imageElement = await Promise.race([
            window.puter.ai.txt2img(prompt, {
              model: model,
              quality: quality,
            }),
            timeoutPromise,
          ]);

          if (imageElement?.tagName === 'IMG') {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            setResult(imageElement.src);
            console.log(`[Image Gen] Puter AI success in ${duration}s`);
            return;
          }
        } catch (puterErr) {
          console.warn('[Image Gen] Puter failed, trying fallback:', puterErr);
        }
      }

      // Fallback: Use Unsplash random image based on prompt
      console.log('[Image Gen] Using Unsplash fallback...');
      const keywords = prompt.split(' ').slice(0, 3).join('+');
      const fallbackUrl = `https://source.unsplash.com/1024x1024/?${keywords || 'abstract'}`;
      
      // Test if URL works
      const img = new Image();
      img.onload = () => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        setResult(fallbackUrl);
        console.log(`[Image Gen] Fallback image loaded in ${duration}s`);
        setGenerating(false);
      };
      img.onerror = () => {
        console.error('[Image Gen] Unsplash load failed');
        setError('⚠️ Could not fetch images. Please check your internet connection and try again.');
        setGenerating(false);
      };
      img.src = fallbackUrl;
      
    } catch (err) {
      console.error('[Image Gen] Fatal error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(`⚠️ ${errorMessage}. Please try again.`);
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    try {
      const link = document.createElement('a');
      link.href = result;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Try right-clicking the image instead.');
    }
  };

  const models = [
    { id: 'gpt-image-1', name: 'GPT Image 1 (Fast)', speed: 'Fast' },
    { id: 'gpt-image-1-mini', name: 'GPT Image 1 Mini (Very Fast)', speed: 'Very Fast' },
    { id: 'dall-e-3', name: 'DALL-E 3 (High Quality)', speed: 'Moderate' },
    { id: 'dall-e-2', name: 'DALL-E 2 (Reliable)', speed: 'Fast' },
    { id: 'gemini-2.5-flash-image-preview', name: 'Gemini 2.5 (Latest)', speed: 'Very Fast' },
  ];

  const qualities = [
    { id: 'low', name: 'Low (Fast)' },
    { id: 'medium', name: 'Medium (Balanced)' },
    { id: 'high', name: 'High (Slower)' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Hero Header */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/tools" className="hover:text-white transition">Tools</Link>
            <ChevronRight size={16} />
            <span>AI Image Generator</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">AI Image Generator</h1>
              <p className="text-lg text-white/90">Transform text prompts into stunning images using advanced AI models or curated sources. Completely free, no signup required.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section - Left (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Describe Your Image</h2>
                
                <div className="space-y-6">
                  {/* Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What do you want to generate?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., A serene mountain landscape at sunset with snow-capped peaks, oil painting style..."
                      rows={5}
                      disabled={generating}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 placeholder-gray-400 resize-none"
                    />
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      disabled={generating}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                    >
                      <option value="gpt-image-1">GPT Image 1 (Fast)</option>
                      <option value="gpt-image-1-mini">GPT Image 1 Mini (Very Fast)</option>
                      <option value="dall-e-3">DALL-E 3 (High Quality)</option>
                      <option value="dall-e-2">DALL-E 2 (Reliable)</option>
                      <option value="gemini-2.5-flash-image-preview">Gemini 2.5 (Latest)</option>
                    </select>
                  </div>

                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      disabled={generating}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                    >
                      <option value="low">Low (Fast)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Slower)</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {generating && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <Loader size={16} className="animate-spin" />
                        Searching for images... (usually instant)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    💡 Prompt Tips
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li>• Be descriptive and detailed</li>
                    <li>• Include style (e.g., "oil painting")</li>
                    <li>• Specify lighting and mood</li>
                    <li>• Add technical details (e.g., "4K", "cinematic")</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    ✨ Features
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li>✅ Completely Free</li>
                    <li>✅ No API Key Required</li>
                    <li>✅ AI + Image Search</li>
                    <li>✅ High-Quality Output</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Controls - Right (sticky sidebar) */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Generated Image</h3>

                {/* Image Preview */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <img
                        src={result}
                        alt="Generated"
                        className="w-full rounded-lg border border-gray-200 object-cover"
                        onError={() => setError('Failed to load image')}
                      />
                      <button
                        onClick={handleDownload}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="h-64 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Image preview will appear here</p>
                        <p className="text-gray-400 text-xs mt-1">Click "Generate" to create image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateImage}
                  disabled={generating || !prompt.trim()}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
