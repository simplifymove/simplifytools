'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function PosterizeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [levels, setLevels] = useState(4);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const applyPosterize = async () => {
    if (!file || !preview) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            setProcessing(false);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const colorLevels = levels;
          const bitsPerLevel = Math.floor(256 / colorLevels);

          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / bitsPerLevel) * bitsPerLevel;
            data[i + 1] = Math.floor(data[i + 1] / bitsPerLevel) * bitsPerLevel;
            data[i + 2] = Math.floor(data[i + 2] / bitsPerLevel) * bitsPerLevel;
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setProcessing(false);
              return;
            }
            setResult(blob);
            setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying posterize:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'posterized-image.jpg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-400 via-pink-400 to-red-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Posterize Image</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Posterize Image</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Transform your photos into bold, artistic poster art. Create striking effects by reducing color levels to create a dramatic, stylized appearance.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Perfect for creating eye-catching designs and artistic prints.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Posterize Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Color Levels: {levels}</label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={levels}
                      onChange={(e) => setLevels(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-1">Lower values = bolder effect, Higher values = more detail</p>
                  </div>

                  <button
                    onClick={applyPosterize}
                    disabled={processing}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Posterize Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Posterized Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Posterize Images</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Photo:</strong> Click the upload area to select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Color Levels:</strong> Use the slider to set the number of color levels (2-8 recommended).</li>
                <li><strong>3. Preview Settings:</strong> Lower levels create bolder effects, higher levels retain more detail.</li>
                <li><strong>4. Apply Effect:</strong> Click "Apply Posterize Effect" to process your image.</li>
                <li><strong>5. Download Result:</strong> Save your posterized artwork to your device.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Use Posterize</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create striking, stylized artwork from ordinary photos in seconds.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Bold Design Appeal</h3>
                  <p className="text-gray-700">Perfect for posters, prints, and eye-catching social media content.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Easy Customization</h3>
                  <p className="text-gray-700">Control the intensity of the effect with simple color level adjustments.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Professional Quality</h3>
                  <p className="text-gray-700">Achieve gallery-worthy results with our advanced posterization algorithm.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What does posterize mean?</summary>
                  <p className="text-gray-700 mt-2">Posterization is the process of reducing the number of distinct colors in an image to create a bold, artistic effect with flat color areas.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What color level should I use?</summary>
                  <p className="text-gray-700 mt-2">Start with 4-5 levels for moderate effects. Use 2-3 for very bold artwork, or 6-8 to maintain more photo detail.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use posterized images commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes! Images created with our tool are yours to use freely, including for commercial projects and prints.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What file formats are supported?</summary>
                  <p className="text-gray-700 mt-2">We support JPG, PNG, WebP, BMP, and TIFF formats. Download as JPG for best compatibility.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is there a file size limit?</summary>
                  <p className="text-gray-700 mt-2">No file size limit! Process images of any resolution, from small thumbnails to large prints.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I combine posterize with other effects?</summary>
                  <p className="text-gray-700 mt-2">Yes! Use the posterized image with other tools like color graders and filters for more creative effects.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Artistic Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro photo effects</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Professional color adjustment</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Add edge darkening</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Posterize Image',
          description: 'Free tool to create poster art effects from photos',
          url: 'https://simplifyconvert.com/all-tools/posterize-image',
          applicationCategory: 'MultimediaApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
    </>
  );
}
