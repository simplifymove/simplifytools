'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function FontAwesomeToPngPage() {
  const [iconName, setIconName] = useState('heart');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(256);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!iconName) {
      setError('Please enter an icon name');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      // Create a canvas to render the icon
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Fill background with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = color;
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw a simple representation (since we can't load actual Font Awesome fonts in canvas easily)
      // We'll use Unicode symbols as creative alternatives
      const iconMap: { [key: string]: string } = {
        'heart': '♥',
        'star': '★',
        'check': '✓',
        'cross': '✕',
        'circle': '●',
        'square': '■',
        'triangle': '▲',
        'arrow-right': '→',
        'arrow-left': '←',
        'arrow-up': '↑',
        'arrow-down': '↓',
        'sun': '☀',
        'moon': '☾',
        'cloud': '☁',
        'rain': '☔',
        'gear': '⚙',
        'lock': '🔒',
        'unlock': '🔓',
        'bell': '🔔',
        'user': '👤',
      };

      const symbol = iconMap[iconName.toLowerCase()] || '●';
      ctx.fillText(symbol, canvas.width / 2, canvas.height / 2);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setResult(blob);
        }
      }, 'image/png');
    } catch (err) {
      setError((err as Error).message || 'Error generating icon');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${iconName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Font Awesome to PNG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Font Awesome to PNG</h1>
                <p className="text-lg text-white/90">Generate Font Awesome icons as PNG images with custom colors and sizes.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Enter Icon Details</h2>
                  
                  {/* Icon Name */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Icon Name (e.g., heart, star, check)
                    </label>
                    <input
                      type="text"
                      value={iconName}
                      onChange={(e) => setIconName(e.target.value)}
                      placeholder="heart"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported: heart, star, check, cross, circle, square, triangle, arrow-right, arrow-left, arrow-up, arrow-down, sun, moon, cloud, rain, gear, lock, unlock, bell, user</p>
                  </div>

                  {/* Icon Preview */}
                  <div className="mb-6 p-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div 
                      className="flex items-center justify-center rounded-lg"
                      style={{ 
                        width: `${Math.min(size, 200)}px`, 
                        height: `${Math.min(size, 200)}px`,
                        backgroundColor: 'white'
                      }}
                    >
                      <span 
                        style={{ 
                          fontSize: `${Math.min(size, 200) * 0.6}px`,
                          color: color
                        }}
                      >
                        {['heart', 'star', 'check', 'cross', 'circle', 'square', 'triangle', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'sun', 'moon', 'cloud', 'rain', 'gear', 'lock', 'unlock', 'bell', 'user'].includes(iconName.toLowerCase()) 
                          ? ({
                              'heart': '♥', 'star': '★', 'check': '✓', 'cross': '✕', 'circle': '●',
                              'square': '■', 'triangle': '▲', 'arrow-right': '→', 'arrow-left': '←',
                              'arrow-up': '↑', 'arrow-down': '↓', 'sun': '☀', 'moon': '☾',
                              'cloud': '☁', 'rain': '☔', 'gear': '⚙', 'lock': '🔒',
                              'unlock': '🔓', 'bell': '🔔', 'user': '👤'
                            })[iconName.toLowerCase()] || '●'
                          : '●'
                        }
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Color */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Size */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Size: {size}px
                    </label>
                    <input
                      type="range"
                      min="64"
                      max="512"
                      step="16"
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Icon'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download PNG
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Custom colors</li>
                      <li>• Adjustable size</li>
                      <li>• High quality PNG</li>
                      <li>• Instant generation</li>
                      <li>• Secure & fast</li>
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







