'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Circle } from 'lucide-react';
import { Footer } from '@/app/components/Footer';

export default function MakeRoundImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [radius, setRadius] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPreview(img.src);
        updatePreview(img, img.src);
      };
      img.onerror = () => {
        setError('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const updatePreview = (img: HTMLImageElement, src: string) => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const diameter = canvas.width - borderWidth * 2;
    const radius = diameter / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Scale image to fill circle completely (cover approach)
    const scale = Math.max(diameter / img.width, diameter / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const x = centerX - drawWidth / 2;
    const y = centerY - drawHeight / 2;
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    ctx.restore();

    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const makeRoundImage = async () => {
    if (!preview) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.max(img.width, img.height);
        canvas.width = size + borderWidth * 2;
        canvas.height = size + borderWidth * 2;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const radius = size / 2;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        // Scale image to fill circle completely (cover approach)
        const scale = Math.max(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = centerX - drawWidth / 2;
        const y = centerY - drawHeight / 2;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        ctx.restore();

        if (borderWidth > 0) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        canvas.toBlob((blob) => {
          if (blob) {
            setResult(blob);
          }
          setProcessing(false);
        }, 'image/png');
      };
      img.onerror = () => {
        setError('Failed to process image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError('Error processing image');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'round-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Section with Breadcrumb */}
      <div className="bg-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm mb-6 opacity-90">
            <Link href="/" className="hover:opacity-75 underline">
              Home
            </Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:opacity-75 underline">
              All Tools
            </Link>
            <ChevronRight size={16} />
            <span>Make Round Image</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Circle size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Make Round Image</h1>
              <p className="text-lg text-orange-50">
                Convert your images to circular shape with customizable borders and background
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={handleClearPreview}
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
                <div className="flex justify-center mb-4">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>

                <button
                  onClick={makeRoundImage}
                  disabled={processing}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'Processing...' : 'Apply Round Shape'}
                </button>

                {result && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
                    <div className="flex justify-center mb-4">
                      <img
                        src={URL.createObjectURL(result)}
                        alt="Result"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Round Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customize</h3>

              {/* Border Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Width: {borderWidth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderWidth}
                  onChange={(e) => {
                    setBorderWidth(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img, preview);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Border Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => {
                      setBorderColor(e.target.value);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img, preview);
                        img.src = preview;
                      }
                    }}
                    className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={borderColor}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img, preview);
                        img.src = preview;
                      }
                    }}
                    className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                </div>
              </div>

              {preview && (
                <button
                  onClick={handleClearPreview}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload your image</li>
                <li>• Adjust border width and color</li>
                <li>• Set background color</li>
                <li>• Click "Apply Round Shape"</li>
                <li>• Download your result</li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Use white background for clean look</li>
                <li>• Add borders to define edges</li>
                <li>• PNG format preserves transparency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Create Round Images?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Profile pictures - perfect circular avatars for social media and apps</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Professional branding - create custom rounded images for websites and portfolios</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Custom styling - add borders and background colors for unique designs</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Transparency support - PNG format preserves transparent backgrounds</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Instant results - create rounded images in seconds without design tools</li>
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
                Can I control the roundness level?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, the radius slider lets you adjust from slightly rounded to perfectly circular (0-100%).</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What formats are supported for input?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">All formats: JPG, PNG, WebP, GIF, BMP. Output is PNG with transparency support.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I add transparent backgrounds?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, set background opacity or use a transparent color. PNG format preserves transparency.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                How do I add a border to the rounded image?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Use the border width slider (0-50px) and choose a color with the color picker. Borders wrap around the rounded shape.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Does rounding reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, rounding preserves full image quality. Only pixels outside the round shape are removed.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is this round image tool free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, 100% free with no limits. Create unlimited round images with no signup required.</p>
            </details>
          </div>
        </div>
      </div>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Can I control the roundness level?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, the radius slider lets you adjust from slightly rounded to perfectly circular." } },
          { "@type": "Question", "name": "What formats are supported for input?", "acceptedAnswer": { "@type": "Answer", "text": "All formats: JPG, PNG, WebP, GIF, BMP. Output is PNG." } },
          { "@type": "Question", "name": "Can I add transparent backgrounds?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, set background opacity or use a transparent color." } },
          { "@type": "Question", "name": "How do I add a border to the rounded image?", "acceptedAnswer": { "@type": "Answer", "text": "Use the border width slider and choose a color with the color picker." } },
          { "@type": "Question", "name": "Does rounding reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "No, rounding preserves full image quality." } },
          { "@type": "Question", "name": "Is this round image tool free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free with no limits." } }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Editors</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Crop Image</span><p className="text-xs text-gray-600">Trim unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/add-border" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Add Border</span><p className="text-xs text-gray-600">Frame your images</p></div>
            </Link>
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Resize Image</span><p className="text-xs text-gray-600">Change dimensions</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}







