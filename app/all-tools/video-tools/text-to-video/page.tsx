'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Film, Sparkles, ChevronRight, Loader, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { VideoScript } from '@/app/utils/types/video-generation';

export default function TextToVideoPage() {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'modern' | 'minimal' | 'corporate' | 'social-reel' | 'explainer' | 'product-promo'>('modern');
  const [duration, setDuration] = useState<15 | 30 | 45>(30);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'energetic' | 'educational'>('professional');
  const [ctaText, setCtaText] = useState('Learn More');

  // Processing state
  const [step, setStep] = useState<'form' | 'generating' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null);

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStep('generating');

    try {
      if (!prompt.trim()) {
        throw new Error('Please enter a prompt');
      }

      if (prompt.length > 1000) {
        throw new Error('Prompt must be 1000 characters or less');
      }

      const response = await fetch('/api/video/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          duration,
          aspectRatio,
          tone,
          ctaText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      if (!data.script) {
        throw new Error('No script returned from API');
      }

      setGeneratedScript(data.script);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadScript = () => {
    if (!generatedScript) return;

    const scenes = generatedScript.scenes.map((scene, index) => [
      `Scene ${index + 1} (${scene.duration}s)`,
      `Headline: ${scene.headline}`,
      `Subtext: ${scene.subtext}`,
      `Visual direction: ${scene.visual}`,
      `Caption: ${scene.caption}`,
    ].join('\n')).join('\n\n');
    const content = [
      generatedScript.title,
      `Style: ${generatedScript.style}`,
      `Planned duration: ${generatedScript.duration} seconds`,
      `Aspect ratio: ${generatedScript.aspectRatio}`,
      `Tone: ${generatedScript.tone}`,
      '',
      'Voiceover',
      generatedScript.voiceover,
      '',
      'Scene plan',
      scenes,
    ].join('\n');
    const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `video-script-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleRestart = () => {
    setPrompt('');
    setStep('form');
    setError('');
    setGeneratedScript(null);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden py-16 px-4 md:px-8">
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
              <span className="text-white">AI Video Script Planner</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
                <Film size={40} />
                AI Video Script Planner
              </h1>
              <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">Beta</span>
            </div>
            <p className="text-lg text-white/90 max-w-2xl">
              Turn an idea into a structured video script, voiceover, and scene plan. Video rendering is not currently available.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleGenerateScript} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Your Video Script</h2>

                {/* Prompt Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What's your video about? *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want your video to showcase. E.g., 'Product launch for our new smartwatch with features highlighted'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={4}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">{prompt.length}/1000 characters</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Style */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Video Style</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="corporate">Corporate</option>
                      <option value="social-reel">Social Reel</option>
                      <option value="explainer">Explainer</option>
                      <option value="product-promo">Product Promo</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={45}>45 seconds</option>
                    </select>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="16:9">Widescreen (16:9)</option>
                      <option value="9:16">Mobile (9:16)</option>
                      <option value="1:1">Square (1:1)</option>
                    </select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="energetic">Energetic</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>
                </div>

                {/* CTA Text */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Call-to-Action Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="E.g., Learn More, Shop Now, Get Started"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {loading ? 'Generating Script...' : 'Generate Script'}
                </button>
              </form>
            )}

            {step === 'generating' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-indigo-50 p-5 rounded-full flex items-center justify-center">
                      <Loader className="animate-spin text-indigo-600" size={32} />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Your Script</h2>
                <p className="text-gray-600">Our AI is crafting a professional video script based on your prompt...</p>
              </div>
            )}

            {step === 'preview' && generatedScript && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Script Preview</h2>
                  <CheckCircle className="text-green-600" size={24} />
                </div>

                {/* Script Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Style</p>
                    <p className="text-gray-900 capitalize">{generatedScript.style}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Duration</p>
                    <p className="text-gray-900">{generatedScript.duration} seconds</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Aspect Ratio</p>
                    <p className="text-gray-900">{generatedScript.aspectRatio}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Tone</p>
                    <p className="text-gray-900 capitalize">{generatedScript.tone}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Video Title</h3>
                  <p className="text-lg font-semibold text-gray-900">{generatedScript.title}</p>
                </div>

                {/* Voiceover */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Voiceover Script</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{generatedScript.voiceover}</p>
                  </div>
                </div>

                {/* Scenes */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Video Scenes</h3>
                  <div className="space-y-3">
                    {generatedScript.scenes.map((scene, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{scene.headline}</p>
                            <p className="text-sm text-gray-600">{scene.subtext}</p>
                          </div>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{scene.duration}s</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>Visual:</strong> {scene.visual}</p>
                        <p className="text-sm text-gray-700"><strong>Caption:</strong> {scene.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleDownloadScript}
                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={20} />
                    Download Script
                  </button>
                  <button
                    onClick={handleRestart}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Create New
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border-t border-gray-200 py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-900">What does this tool create?</summary>
                <p className="text-gray-600 mt-3">It creates a text plan containing a title, voiceover, scene directions, captions, and timing. It does not currently render a video.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-900">Can I download the plan?</summary>
                <p className="text-gray-600 mt-3">Yes. After generating a plan, you can download the script and scene directions as a plain-text file.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-900">Can I edit the generated script?</summary>
                <p className="text-gray-600 mt-3">Currently, you can preview and accept the script. In future updates, we'll add editing capabilities.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-900">Does this page render or export video?</summary>
                <p className="text-gray-600 mt-3">No. Video rendering and MP4 export are currently unavailable. The current output is a downloadable text plan.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-900">What do the duration and aspect-ratio settings do?</summary>
                <p className="text-gray-600 mt-3">They guide the structure and timing of the generated script. They do not create a media file.</p>
              </details>
            </div>
          </div>
        </div>

        {/* Beta Info Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-orange-200 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Current availability</h3>
            <p className="text-orange-800">
              Script and scene-plan generation is available on this page. Video rendering, video preview, and MP4 export are currently unavailable.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
