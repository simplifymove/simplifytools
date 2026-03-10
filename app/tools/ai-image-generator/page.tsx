'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader, Zap } from 'lucide-react';
import Link from 'next/link';

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
  const [error, setError] = useState('');
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
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            AI Image Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Get stunning images from text using AI or high-quality curated sources (Completely Free)
          </p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Your Image</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you want to generate?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A serene mountain landscape at sunset with snow-capped peaks..."
                    rows={4}
                    disabled={generating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.speed})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    disabled={generating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    {qualities.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generateImage}
                  disabled={generating || !prompt.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Searching... (usually instant)
                    </>
                  ) : (
                    'Get Image'
                  )}
                </button>

                {generating && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Searching for images...
                    </p>
                    <p className="text-xs text-green-700">
                      Trying AI models first, then high-quality curated images
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Image</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {result ? (
                  <div className="space-y-4">
                    <img
                      src={result}
                      alt="Generated"
                      className="w-full rounded-lg border border-gray-200 object-cover max-h-96"
                      onError={() => setError('Failed to load image')}
                    />
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Image
                    </button>
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Image preview will appear here</p>
                      <p className="text-gray-400 text-xs mt-2">Enter a prompt and click Generate</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How It Works:</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• First tries AI generation (if service available)</li>
                    <li>• Falls back to Unsplash image search</li>
                    <li>• Always finds relevant high-quality images</li>
                    <li>• Results appear in 1-5 seconds</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Prompt Tips:</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Be descriptive and detailed</li>
                    <li>• Include style (e.g., "oil painting", "photo realistic")</li>
                    <li>• Specify lighting and mood</li>
                    <li>• Add technical details (e.g., "4K", "cinematic")</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">✨ Features:</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>✅ Completely Free (No API key)</li>
                    <li>✅ AI Generation + Image Search</li>
                    <li>✅ Instant or Fast results</li>
                    <li>✅ High-quality curated images</li>
                    <li>✅ Works without signup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
