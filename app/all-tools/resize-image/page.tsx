'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Maximize2 } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { resizeImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';

export default function ResizeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setPreview(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleResize = async () => {
    if (!file) return;
    
    setProcessing(true);
    try {
      const result = await resizeImage(file, width, height, false);
      setResult(result.blob);
    } catch (error) {
      alert('Error resizing image: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resized-${width}x${height}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resizePercentage = ((width / originalDimensions.width) * 100).toFixed(0);

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
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Image Resizer</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Maximize2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Resizer</h1>
                <p className="text-lg text-white/90">Resize your images with custom dimensions and optional aspect ratio preservation.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {originalDimensions.width > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Original size: <span className="font-semibold text-gray-900">{originalDimensions.width} × {originalDimensions.height} px</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Resize Settings</h3>
                    
                    {/* Width Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Height Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Aspect Ratio Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Maintain aspect ratio</span>
                    </label>
                  </div>

                  {/* Resize Button */}
                  <button
                    onClick={handleResize}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Resizing...
                      </>
                    ) : (
                      'Resize Image'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Image
                    </button>
                  )}

                  {/* Preview Size Box */}
                  {resizePercentage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        New size: <span className="font-semibold text-blue-900">{width} × {height} px</span>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {resizePercentage}% of original
                      </p>
                    </div>
                  )}

                  {/* Success Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Resize Complete!</h4>
                      <p className="text-sm text-green-800">Your image has been successfully resized.</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Custom width & height</li>
                      <li>• Aspect ratio preservation</li>
                      <li>• All image formats supported</li>
                      <li>• Instant processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Resize Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select any JPG, PNG, WebP, or other image format</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Set your dimensions:</strong> Enter desired width and height in pixels</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Optional: Maintain aspect ratio</strong> to automatically adjust height when you change width (or vice versa)</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Click Resize Image:</strong> Processing happens instantly</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">5</div>
              <div><p className="text-gray-700"><strong>Download your resized image:</strong> Save the file in your original format</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Resizing Use Cases</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Social media optimization - Instagram (1080x1080), Facebook (1200x628), Twitter (1200x675) dimensions</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Website images - fit images to specific container widths</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Thumbnail creation - generate preview images for galleries</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Email headers - resize to email-friendly dimensions (600px wide)</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Avatar creation - make square images (200x200, 400x400)</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Print preparation - resize to standard print sizes (8x10, 4x6 inches at 300 DPI)</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What happens if I make an image larger?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Enlarging images can result in quality loss or pixelation. Our resizer uses interpolation to minimize this, but for best results, resize images smaller rather than larger. Original resolution is always highest quality.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What does "maintain aspect ratio" do?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">When enabled, changing the width automatically adjusts height proportionally (and vice versa). This prevents distortion and keeps your image looking natural. Uncheck to resize freely to any dimensions.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What are standard social media image sizes?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Instagram Feed: 1080x1080px. Facebook: 1200x628px. Twitter: 1200x675px. LinkedIn: 1200x627px. YouTube Thumbnail: 1280x720px. Pinterest: 1000x1500px.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Which formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">We support JPG, PNG, WebP, GIF, BMP, TIFF, and most common image formats. Maximum file size is 50MB. Resized images maintain the original format.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I resize multiple images at once?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Currently, this tool processes one image at a time. For batch resizing multiple images to the same dimensions, try our Bulk Resize Images tool.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is the resizer free and private?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes. Completely free with no signup required. Resizing happens in your browser - images are never uploaded or stored on our servers. Complete privacy guaranteed.</p>
            </details>
          </div>
        </div>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What happens if I make an image larger?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enlarging images can result in quality loss. Our resizer uses interpolation to minimize this, but original resolution is always best."
            }
          },
          {
            "@type": "Question",
            "name": "What does maintain aspect ratio do?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When enabled, changing width automatically adjusts height proportionally. This prevents distortion and keeps images natural-looking."
            }
          },
          {
            "@type": "Question",
            "name": "What are standard social media image sizes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Instagram: 1080x1080px. Facebook: 1200x628px. Twitter: 1200x675px. LinkedIn: 1200x627px. YouTube: 1280x720px."
            }
          },
          {
            "@type": "Question",
            "name": "Which formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "JPG, PNG, WebP, GIF, BMP, TIFF and most common formats up to 50MB."
            }
          },
          {
            "@type": "Question",
            "name": "Can I resize multiple images at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Currently one at a time. For batch resizing, try our Bulk Resize Images tool."
            }
          },
          {
            "@type": "Question",
            "name": "Is the resizer free and private?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, completely free with no signup. Processing happens in your browser - images never uploaded to servers."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
            <Link href="/all-tools/batch-resize-images" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Batch Resize Images</span><p className="text-xs text-gray-600">Resize multiple files</p></div>
            </Link>
            <Link href="/all-tools/instagram-post-resizer" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Instagram Post Resizer</span><p className="text-xs text-gray-600">Quick social resizing</p></div>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}







