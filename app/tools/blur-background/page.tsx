'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BlurBackgroundPage() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurStrength, setBlurStrength] = useState(35);
  const [featherRadius, setFeatherRadius] = useState(5);
  const [portraitMode, setPortraitMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('blurStrength', blurStrength.toString());
      formData.append('featherRadius', featherRadius.toString());
      formData.append('portraitMode', portraitMode.toString());

      // Process
      const processResponse = await fetch('/api/blur-background', {
        method: 'POST',
        body: formData,
      });

      const data = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      // Set result
      const resultDataUrl = `data:image/jpeg;base64,${data.image}`;
      setResult(resultDataUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result;
    link.download = `blur-background-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-12 px-4 md:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/tools" className="hover:text-white transition">Tools</Link>
            <ChevronRight size={16} />
            <span>Blur Background</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Blur Background
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Professional portrait mode effect with sharp subject and blurred background. Perfect for creating stunning photos with depth effect.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {/* Controls Panel */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">⚙️</span>
              Settings
            </h2>

            <form onSubmit={handleProcess} className="space-y-6">
              {/* Image Upload */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={processing}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="block w-full p-6 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <Upload className="w-8 h-8 mx-auto text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-gray-700">
                      {image ? '✓ Image selected' : 'Click to upload image'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
                  </label>
                </div>
              </motion.div>

              {/* Blur Strength */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Blur Strength
                  </label>
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{blurStrength}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="51"
                  step="2"
                  value={blurStrength}
                  onChange={(e) => setBlurStrength(parseInt(e.target.value))}
                  disabled={processing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  {blurStrength <= 25
                    ? '🎯 Natural, subtle blur'
                    : blurStrength <= 35
                    ? '📸 Balanced portrait mode'
                    : '✨ Strong, dramatic effect'}
                </p>
              </motion.div>

              {/* Feather Radius */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Edge Feathering
                  </label>
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{featherRadius}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={featherRadius}
                  onChange={(e) => setFeatherRadius(parseInt(e.target.value))}
                  disabled={processing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  Higher = softer, smoother edges (avoids cutout look)
                </p>
              </motion.div>

              {/* Portrait Mode */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all"
              >
                <input
                  type="checkbox"
                  id="portrait-mode"
                  checked={portraitMode}
                  onChange={(e) => setPortraitMode(e.target.checked)}
                  disabled={processing}
                  className="w-5 h-5 text-purple-600 rounded accent-purple-600 cursor-pointer"
                />
                <label htmlFor="portrait-mode" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Portrait Mode (darkens background for depth effect)
                </label>
              </motion.div>

              {/* Process Button */}
              <motion.button
                type="submit"
                disabled={processing || !image}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing... (30-60 seconds first time)
                  </span>
                ) : (
                  '✨ Apply Blur Background'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Preview Panel */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">👁</span>
              Preview
            </h2>

            {/* Original Preview */}
            {preview && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-semibold text-gray-700 mb-3">Original</p>
                <img
                  src={preview}
                  alt="Original"
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 hover:shadow-md transition-all"
                />
              </motion.div>
            )}

            {/* Result Preview */}
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-semibold text-gray-700 mb-3">Result</p>
                <img
                  src={result}
                  alt="Result"
                  className="w-full h-64 object-cover rounded-xl border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all"
                />
                <motion.button
                  onClick={downloadResult}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </motion.button>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
              >
                <p className="text-red-700 font-semibold">✗ Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </motion.div>
            )}

            {!preview && !result && !error && (
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-center font-medium">
                  Upload an image to see preview
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="mt-12 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-indigo-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">🎯 Recommended Settings</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><strong className="text-gray-900">Natural:</strong> Blur 25, Feather 5</li>
              <li><strong className="text-gray-900">Portrait:</strong> Blur 45, Feather 5</li>
              <li><strong className="text-gray-900">Professional:</strong> Blur 35 + Portrait Mode</li>
            </ul>
          </motion.div>
          <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-purple-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">⚡ Processing Speed</h3>
            <p className="text-sm text-gray-600">
              First run takes 30-60 seconds (downloads AI model). Subsequent runs are significantly faster—typically 10-20 seconds.
            </p>
          </motion.div>
          <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-pink-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">📸 Best Use Cases</h3>
            <p className="text-sm text-gray-600">
              Perfect for portraits, headshots, selfies, professional photos, and creating social media content with depth effect.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
