'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function WhiteBalancePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingVersionRef = useRef(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const version = ++processingVersionRef.current;
      setError('');
      setResultPreview(null);

      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type) ||
        selectedFile.size > 20 * 1024 * 1024
      ) {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError('Choose a JPG, PNG, or WebP image under 20 MB.');
        e.target.value = '';
        return;
      }

      setProcessing(false);
      setResult(null);
      setPreview(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (version === processingVersionRef.current) {
          setPreview(event.target?.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const applyWhiteBalance = async () => {
    if (!file || !preview || processing) return;
    const version = ++processingVersionRef.current;
    setResult(null);
    setResultPreview(null);
    setError('');
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        if (version !== processingVersionRef.current) return;
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            if (version === processingVersionRef.current) setProcessing(false);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (version === processingVersionRef.current) setProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply white balance
          const tempFactor = 1 + temperature / 100;
          const tintFactor = 1 - tint / 100;

          for (let i = 0; i < data.length; i += 4) {
            // Apply temperature shift (warm/cool)
            data[i] = Math.max(0, Math.min(255, data[i] * tempFactor));

            // Apply tint shift (green/magenta)
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * tintFactor));

            // Blue channel inverse to temperature
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] / tempFactor));
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              if (version === processingVersionRef.current) {
                setError('Unable to create the corrected image.');
              }
              if (version === processingVersionRef.current) setProcessing(false);
              return;
            }
            if (version === processingVersionRef.current) {
              setResult(blob);
              setResultPreview(URL.createObjectURL(blob));
            }
            if (version === processingVersionRef.current) setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          if (version === processingVersionRef.current) {
            setError('Unable to process this image.');
          }
          if (version === processingVersionRef.current) setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        if (version === processingVersionRef.current) {
          setError('This image could not be opened.');
        }
        if (version === processingVersionRef.current) setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying white balance:', error);
      if (version === processingVersionRef.current) {
        setError('Unable to apply white balance.');
      }
      if (version === processingVersionRef.current) setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing || downloading) return;


      setDownloading(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'white-balance',
            originalName: file?.name || 'image.jpg',
            outputName: `${(file?.name || 'image').replace(/\.[^.]+$/, '')}-white-balanced.jpg`,
          });

        router.push(downloadResult.downloadPageUrl);
      } catch (caughtError) {
        console.error('Download preparation failed:', caughtError);
        window.alert(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to prepare the download.',
        );
      } finally {
        setDownloading(false);
      }
    };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>White Balance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌡️ White Balance Tool</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Adjust image color temperature and tint to reduce or change warm and cool color casts.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adjust White Balance</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Temperature: {temperature > 0 ? '+' : ''}{temperature} (Warm/Cool)
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={temperature}
                        onChange={(e) => { processingVersionRef.current += 1; setProcessing(false); setResult(null); setTemperature(Number(e.target.value)); }}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600 mt-2">Negative = cooler (blue), Positive = warmer (red)</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Tint: {tint > 0 ? '+' : ''}{tint} (Green/Magenta)
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={tint}
                        onChange={(e) => { processingVersionRef.current += 1; setProcessing(false); setResult(null); setTint(Number(e.target.value)); }}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600 mt-2">Negative = green, Positive = magenta</p>
                    </div>
                  </div>

                  <button
                    onClick={applyWhiteBalance}
                    disabled={processing}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply White Balance'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {result && resultPreview && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 font-semibold text-gray-800">
                    Corrected Image Preview
                  </p>
                  <img
                    src={resultPreview}
                    alt="Image after white balance adjustment"
                    className="mx-auto max-h-80 max-w-full rounded-lg object-contain"
                  />
                  <p className="mt-3 text-sm text-gray-600">
                    JPEG ? {(result.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing || downloading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  {downloading ? 'Preparing Download...' : 'Continue to Download'}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Adjust White Balance</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Temperature:</strong> Adjust warm/cool balance (-50 to +50).</li>
                <li><strong>3. Set Tint:</strong> Adjust green/magenta balance independently.</li>
                <li><strong>4. Apply:</strong> Click "Apply White Balance".</li>
                <li><strong>5. Download:</strong> Save your color-corrected image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">White Balance Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Fix Color Casts</h3>
                  <p className="text-gray-700">Correct warm or cool lighting issues.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Natural Colors</h3>
                  <p className="text-gray-700">Fine-tune visible color casts using temperature and tint adjustments.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Fine Control</h3>
                  <p className="text-gray-700">Adjust temperature and tint independently.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What is white balance?</FAQQuestion>
                  <FAQAnswer>Adjusting the visible color temperature of images affected by different lighting conditions.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>When to adjust temperature?</FAQQuestion>
                  <FAQAnswer>If your photo looks too warm or orange, move the temperature slider toward negative values to make it cooler. If your photo looks too cool or blue, move it toward positive values to make it warmer.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What is tint?</FAQQuestion>
                  <FAQAnswer>Green/magenta balance to correct fluorescent light shifts.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all images?</FAQQuestion>
                  <FAQAnswer>Works with image formats supported by your browser, such as JPG, PNG, and WebP. Some formats may not be supported.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Yes, corrected images can be used commercially.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>The color adjustment is performed locally in the browser. When you choose Download, the generated image is sent through the download-result service so the download page can be prepared.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/color-balance" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Color Balance</h3>
                  <p className="text-sm text-gray-600">RGB adjustments</p>
                </Link>
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color intensity</p>
                </Link>
                <Link href="/all-tools/brightness-contrast" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Brightness Contrast</h3>
                  <p className="text-sm text-gray-600">Tone adjustments</p>
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
          name: 'White Balance Tool',
          description: 'Free online white balance and color temperature adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/white-balance',
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
