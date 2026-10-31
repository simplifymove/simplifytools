'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ColorBalancePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [redShift, setRedShift] = useState(0);
  const [greenShift, setGreenShift] = useState(0);
  const [blueShift, setBlueShift] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingVersionRef = useRef(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const version = ++processingVersionRef.current;
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

  const applyColorBalance = async () => {
    if (!file || !preview || processing) return;
    const version = ++processingVersionRef.current;
    setResult(null);
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

          for (let i = 0; i < data.length; i += 4) {
            // Apply color shifts
            data[i] = Math.max(0, Math.min(255, data[i] + redShift));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + greenShift));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + blueShift));
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              if (version === processingVersionRef.current) setProcessing(false);
              return;
            }
            if (version === processingVersionRef.current) {
              setResult(blob);
            }
            if (version === processingVersionRef.current) setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          if (version === processingVersionRef.current) setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        if (version === processingVersionRef.current) setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying color balance:', error);
      if (version === processingVersionRef.current) setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing || downloading) return;

    setDownloading(true);
    setDownloadError('');

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'color-balance',
        originalName: file.name,
        outputName: 'color-balance.jpg',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      console.error('Error preparing color balance download:', error);
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'Failed to prepare the download. Please try again.'
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
        <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Color Balance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Color Balance Tool</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Adjust the red, green, and blue channels independently for color correction and creative color adjustments.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adjust Color Balance</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Red Channel: {redShift > 0 ? '+' : ''}{redShift}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={redShift}
                        onChange={(e) => { processingVersionRef.current += 1; setProcessing(false); setResult(null); setRedShift(Number(e.target.value)); }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Green Channel: {greenShift > 0 ? '+' : ''}{greenShift}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={greenShift}
                        onChange={(e) => { processingVersionRef.current += 1; setProcessing(false); setResult(null); setGreenShift(Number(e.target.value)); }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Blue Channel: {blueShift > 0 ? '+' : ''}{blueShift}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={blueShift}
                        onChange={(e) => { processingVersionRef.current += 1; setProcessing(false); setResult(null); setBlueShift(Number(e.target.value)); }}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyColorBalance}
                    disabled={processing}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply Color Balance'}
                  </button>
                </>
              )}

              {downloadError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {downloadError}
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing || downloading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Preparing download...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Balanced Image
                    </>
                  )}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Balance Colors</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Red:</strong> Shift red channel from -100 to +100.</li>
                <li><strong>3. Adjust Green:</strong> Shift green channel independently.</li>
                <li><strong>4. Adjust Blue:</strong> Shift blue channel as needed.</li>
                <li><strong>5. Download:</strong> Click Apply Color Balance, then select Download Balanced Image to open the download page and save the JPEG result.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Balance Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Independent Control</h3>
                  <p className="text-gray-700">Adjust each RGB channel separately.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">White Balance</h3>
                  <p className="text-gray-700">Manually reduce unwanted warm or cool color casts by adjusting the red, green, and blue channels.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Color Grading</h3>
                  <p className="text-gray-700">Create custom color adjustments by changing the RGB channel balance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What are RGB channels?</FAQQuestion>
                  <FAQAnswer>Red, Green, Blue are primary color components in images.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>How to fix white balance?</FAQQuestion>
                  <FAQAnswer>Use the RGB sliders to adjust a color cast manually. For example, reducing red can help with an overly red image. This is not automatic white-balance correction.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all images?</FAQQuestion>
                  <FAQAnswer>The tool accepts image files that your browser can decode, including common JPG, PNG, and WebP images. Unsupported formats may not load. The processed result is exported as JPEG.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>You can use the edited result commercially when you have the necessary rights to the original image. Editing an image does not change its copyright or licensing restrictions.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>Image adjustments happen locally in your browser. When you click Download, the generated image is sent to our download-result service to prepare your download page.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Reset to original?</FAQQuestion>
                  <FAQAnswer>Set the red, green, and blue sliders to 0 and click Apply Color Balance again to generate an unadjusted JPEG version of the uploaded image.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color adjustments</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Pro grading</p>
                </Link>
                <Link href="/all-tools/brightness-contrast" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
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
          name: 'Color Balance Tool',
          description: 'Free online RGB color balance adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/color-balance',
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
