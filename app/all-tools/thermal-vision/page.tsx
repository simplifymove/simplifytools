'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Eye } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ThermalVisionPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const generationRef = useRef(0);
  const fileReaderRef = useRef<FileReader | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      fileReaderRef.current?.abort();
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const invalidateResult = () => {
    generationRef.current += 1;
    setResult(null);
    setResultPreview(null);
    setError('');
    setProcessing(false);

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    fileReaderRef.current?.abort();
    invalidateResult();
    setPreview(null);
    setFile(null);

    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Please select an image smaller than 20 MB.');
      e.target.value = '';
      return;
    }

    const requestId = generationRef.current;
    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = () => {
      if (!mountedRef.current || requestId !== generationRef.current) return;

      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        return;
      }

      setFile(selectedFile);
      setPreview(reader.result);
    };

    reader.onerror = () => {
      if (mountedRef.current && requestId === generationRef.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const applyThermalVision = async () => {
    if (!file || !preview || processing) return;

    invalidateResult();
    const requestId = generationRef.current;
    setProcessing(true);

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to decode the image.'));
        img.src = preview;
      });

      if (!mountedRef.current || requestId !== generationRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) {
        throw new Error('Canvas processing is unavailable.');
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
      );

      const data = imageData.data;
      const factor = intensity / 100;

      for (let i = 0; i < data.length; i += 4) {
        const brightness =
          (0.2126 * data[i] +
           0.7152 * data[i + 1] +
           0.0722 * data[i + 2]) / 255;

        let r = 0;
        let g = 0;
        let b = 0;

        if (brightness < 0.25) {
          r = 0;
          g = Math.round(brightness * 4 * 255);
          b = 255;
        } else if (brightness < 0.5) {
          r = 0;
          g = 255;
          b = Math.round((0.5 - brightness) * 4 * 255);
        } else if (brightness < 0.75) {
          r = Math.round((brightness - 0.5) * 4 * 255);
          g = 255;
          b = 0;
        } else {
          r = 255;
          g = Math.round((1 - brightness) * 4 * 255);
          b = 0;
        }

        data[i] = Math.round(r * factor + data[i] * (1 - factor));
        data[i + 1] = Math.round(g * factor + data[i + 1] * (1 - factor));
        data[i + 2] = Math.round(b * factor + data[i + 2] * (1 - factor));
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          value => value
            ? resolve(value)
            : reject(new Error('Unable to export the processed image.')),
          'image/jpeg',
          0.95
        );
      });

      if (!mountedRef.current || requestId !== generationRef.current) return;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult(blob);
      setResultPreview(url);
    } catch (caughtError) {
      if (mountedRef.current && requestId === generationRef.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to process the image.'
        );
      }
    } finally {
      if (mountedRef.current && requestId === generationRef.current) {
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'thermal-vision',
            originalName: `thermal-vision-${Date.now()}.jpg`,
            outputName: `thermal-vision-${Date.now()}.jpg`,
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
        setProcessing(false);
      }
    };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Thermal Vision</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌡️ Thermal Vision</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply a heat-map-style color transformation based on image brightness. This is a visual effect, not thermal or infrared measurement.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Thermal Vision</h2>

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
                    <label className="block text-gray-700 font-semibold mb-3">
                      Thermal Intensity: {intensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => {
                         invalidateResult();
                         setIntensity(Number(e.target.value));
                       }}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = original, 100 = pure thermal</p>
                  </div>

                  <button
                    onClick={applyThermalVision}
                    disabled={processing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {processing ? 'Processing...' : 'Apply Thermal Vision'}
                  </button>
                </>
              )}

              {preview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Original Image
                  </h3>
                  <img
                    src={preview}
                    alt="Original uploaded image"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {resultPreview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Thermal Effect Preview
                  </h3>
                  <img
                    src={resultPreview}
                    alt="Image with simulated thermal colors applied"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Thermal Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Thermal Vision</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Intensity:</strong> Control thermal effect strength (0-100%).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Thermal Vision".</li>
                <li><strong>4. Download:</strong> Save your thermal image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thermal Vision Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Thermal Mapping</h3>
                  <p className="text-gray-700">Heat-map color visualization.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control thermal effect blend.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Infrared Effect</h3>
                  <p className="text-gray-700">Applies a heat-map-style color palette for a simulated thermal appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What intensity should I use?</FAQQuestion>
                  <FAQAnswer>The intensity setting controls how strongly the simulated heat-map colors replace the original appearance. Choose a value according to the visual result you want.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Color mapping explained?</FAQQuestion>
                  <FAQAnswer>The visual mapping assigns blue/cyan tones to darker ranges and yellow/red tones to brighter ranges. These colors do not represent measured temperatures.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all images?</FAQQuestion>
                  <FAQAnswer>It works with JPG, PNG, and WebP files that your browser can decode. Very large or damaged images may fail during processing.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>You can use the generated visual effect in commercial projects when you have the necessary rights to the original image.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>The visual effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Real thermal imaging?</FAQQuestion>
                  <FAQAnswer>No. This tool maps visible image brightness to a simulated thermal color palette. It cannot detect temperature, heat signatures, or infrared radiation.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color adjustment</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Color grading</p>
                </Link>
                <Link href="/all-tools/duotone-effect" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Duotone Effect</h3>
                  <p className="text-sm text-gray-600">Color mapping</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Batch supporting content: thermal-vision */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Understanding the thermal vision effect
              </h2>
              <p className="text-gray-600 leading-7">
                The Thermal Vision tool processes image pixels in your browser to create a heat-map-style visual effect. It changes the appearance of the uploaded image rather than performing real thermal or infrared measurement. The processed result is exported as a JPEG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Browser-based image processing
                </h3>
                <p className="text-gray-600 leading-7">
                  The visual transformation is performed with browser canvas
                  processing. The uploaded image is drawn to a canvas and the
                  selected effect is applied before the result is prepared for
                  download.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  JPEG output
                </h3>
                <p className="text-gray-600 leading-7">
                  The processed canvas is encoded as a JPEG for download.
                  The downloaded file is JPEG encoded, so its compression
                  characteristics can differ from those of the original
                  uploaded image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Choosing an image for this effect
              </h2>
              <p className="text-gray-600 leading-7">
                JPG, PNG, and WebP images are supported by the upload control.
                The appearance of the effect depends on the colors, contrast,
                details, and composition of the source image. Try different
                settings when available to find a result that suits the image.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What happens to image dimensions?
              </h2>
              <p className="text-gray-600 leading-7">
                The processing canvas uses the loaded image width and height.
                The effect changes the visual pixel content rather than acting
                as an image resizing tool.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better effect results
              </h2>
              <ul className="text-gray-600 leading-7 list-disc pl-6 space-y-2">
                <li>Start with a clear source image at a useful resolution.</li>
                <li>Use the available control gradually instead of assuming the maximum setting will look best.</li>
                <li>Compare the original image and thermal-effect preview before downloading.</li>
                <li>Remember that the final downloaded file is JPEG output.</li>
              </ul>
            </div>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Thermal Vision',
          description: 'Apply a simulated thermal color palette to an image based on visible brightness. This effect does not measure infrared radiation or temperature.',
          url: 'https://simplifyconvert.com/all-tools/thermal-vision',
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
