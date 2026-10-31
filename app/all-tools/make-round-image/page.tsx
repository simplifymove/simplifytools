'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Circle } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function MakeRoundImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [radius, setRadius] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadGeneration = useRef(0);

  useEffect(() => {
    if (!result) {
      setResultUrl(null);
      return;
    }

    const url = URL.createObjectURL(result);
    setResultUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [result]);

  const drawRoundedImage = (
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    size: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported');

    const width = Math.max(1, Math.round(size));
    const border = Math.min((borderWidth / 300) * width, width / 4);
    const inset = border / 2;
    const extent = width - border;
    const cornerRadius = (extent / 2) * (radius / 100);

    canvas.width = width;
    canvas.height = width;
    ctx.clearRect(0, 0, width, width);

    if (!transparentBackground) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, width);
    }

    const roundedPath = () => {
      ctx.beginPath();
      ctx.roundRect(inset, inset, extent, extent, cornerRadius);
      ctx.closePath();
    };

    ctx.save();
    roundedPath();
    ctx.clip();

    const scale = Math.max(extent / img.width, extent / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(
      img,
      width / 2 - drawWidth / 2,
      width / 2 - drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = border;
      roundedPath();
      ctx.stroke();
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const generation = ++uploadGeneration.current;

    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a supported image file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (generation !== uploadGeneration.current) return;

      const dataUrl = reader.result;

      if (typeof dataUrl !== 'string') {
        setError('Failed to read the selected image.');
        return;
      }

      const img = new Image();

      img.onload = () => {
        if (generation !== uploadGeneration.current) return;

        if (!img.naturalWidth || !img.naturalHeight) {
          setError('The selected image has invalid dimensions.');
          return;
        }

        setFile(selectedFile);
        setPreview(dataUrl);
      };

      img.onerror = () => {
        if (generation === uploadGeneration.current) {
          setError('Failed to decode the selected image.');
        }
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      if (generation === uploadGeneration.current) {
        setError('Failed to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  useEffect(() => {
    if (!preview) return;

    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled || !previewCanvasRef.current) return;

      try {
        drawRoundedImage(previewCanvasRef.current, img, 300);
      } catch (err) {
        console.error('Round image preview failed:', err);
        setError('Unable to render the preview.');
      }
    };

    img.onerror = () => {
      if (!cancelled) setError('Unable to load the preview image.');
    };

    img.src = preview;

    return () => {
      cancelled = true;
    };
  }, [preview, borderWidth, borderColor, backgroundColor, transparentBackground, radius]);

  const makeRoundImage = async () => {
    if (!preview || !file || processing) {
      if (!preview) setError('Please upload an image first.');
      return;
    }

    const generation = uploadGeneration.current;

    setProcessing(true);
    setResult(null);
    setError(null);

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = preview;
      });

      if (generation !== uploadGeneration.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas unavailable');

      const size = Math.max(img.naturalWidth, img.naturalHeight);
      drawRoundedImage(canvas, img, size);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => value
            ? resolve(value)
            : reject(new Error('PNG export failed')),
          'image/png'
        );
      });

      if (generation === uploadGeneration.current) {
        setResult(blob);
      }
    } catch (err) {
      if (generation === uploadGeneration.current) {
        console.error('Round image processing failed:', err);
        setError('Failed to create the rounded PNG. Please try another image.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing) return;

    setProcessing(true);
    setError(null);

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'make-round-image',
        originalName: file.name,
        outputName: 'round-image.png',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to prepare the download. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClearPreview = () => {
    uploadGeneration.current += 1;
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
      <main>
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

                {result && resultUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
                    <div className="flex justify-center mb-4">
                      <img
                        src={resultUrl || undefined}
                        alt="Rounded PNG image preview"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      disabled={processing}
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

              {/* Corner Roundness */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roundness: {radius}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    setResult(null);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  0% keeps square corners; 100% creates a circle.
                </p>
              </div>

              {/* Transparent Background */}
              <label className="flex items-center gap-3 mb-6 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={transparentBackground}
                  onChange={(e) => {
                    setTransparentBackground(e.target.checked);
                    setResult(null);
                  }}
                  className="accent-orange-500"
                />
                Transparent background outside the rounded shape
              </label>

              {/* Border Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Width: {borderWidth}px (preview scale)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderWidth}
                  onChange={(e) => {
                    setBorderWidth(Number(e.target.value));
                    setResult(null);
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
                      setResult(null);
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
                      setResult(null);
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
                <li>• Adjust roundness, border width, and color</li>
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
                <li>• Enable transparent background for clear PNG corners</li>
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
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Profile pictures - create circular or rounded images for supported profile-image uses</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Branding graphics - create rounded images for websites and portfolios</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Custom styling - add borders and background colors for unique designs</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Transparency support - PNG format preserves transparent backgrounds</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Browser-based workflow - create rounded images using the available controls</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <FAQPanel>
          <FAQHeading>Frequently Asked Questions</FAQHeading>
          <FAQList>
            <FAQDisclosure>
              <FAQQuestion>
                Can I control the roundness level?


              </FAQQuestion>
              <FAQAnswer>Yes, the radius slider lets you adjust the roundness from slightly rounded toward a fully circular appearance (0-100%).</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What formats are supported for input?


              </FAQQuestion>
              <FAQAnswer>The tool accepts image formats that the browser can decode. The processed rounded result is exported as PNG.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Can I add transparent backgrounds?


              </FAQQuestion>
              <FAQAnswer>Yes. Enable the transparent background option to leave the corners outside the rounded shape transparent in the PNG output.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                How do I add a border to the rounded image?


              </FAQQuestion>
              <FAQAnswer>Use the border width slider (0-50px at preview scale) and choose a color with the color picker. The border scales proportionally in the exported PNG.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Does rounding reduce image quality?


              </FAQQuestion>
              <FAQAnswer>Rounding changes the visible canvas area and creates a newly encoded PNG result. Review the output if preserving exact source appearance is important.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Is this round image tool free?


              </FAQQuestion>
              <FAQAnswer>Yes, You can use the available tool controls to create and download rounded images.</FAQAnswer>
            </FAQDisclosure>
                        <FAQDisclosure>
                <FAQQuestion>
                  Does processing improve the original image quality?
                </FAQQuestion>
                <FAQAnswer>
                  No. The tool applies the selected shape and border settings.
                  It cannot restore image detail missing from the source file.
                </FAQAnswer>
              </FAQDisclosure>

              <FAQDisclosure>
                <FAQQuestion>
                  Should I check the result before downloading?
                </FAQQuestion>
                <FAQAnswer>
                  Yes. Review the generated PNG to confirm its shape, crop,
                  transparency, and border before downloading.
                </FAQAnswer>
              </FAQDisclosure>
            </FAQList>
        </FAQPanel>
      </div>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Can I control the roundness level?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use the roundness slider from 0% for square corners to 100% for a circular image." } },
          { "@type": "Question", "name": "What formats are supported for input?", "acceptedAnswer": { "@type": "Answer", "text": "The tool accepts image formats supported by your browser and exports the rounded result as PNG." } },
          { "@type": "Question", "name": "Can I add transparent backgrounds?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Enable transparent background to keep the area outside the rounded shape transparent." } },
          { "@type": "Question", "name": "How do I add a border to the rounded image?", "acceptedAnswer": { "@type": "Answer", "text": "Adjust the border width at preview scale and select a color. The border scales proportionally in the exported PNG." } },
          { "@type": "Question", "name": "Does rounding reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "The tool crops and re-encodes the image as PNG. Review the output if preserving the original appearance is important." } },
          { "@type": "Question", "name": "Is this round image tool free?", "acceptedAnswer": { "@type": "Answer", "text": "You can use the available controls to create and download rounded PNG images." } },
          { "@type": "Question", "name": "Does processing improve the original image quality?", "acceptedAnswer": { "@type": "Answer", "text": "No. The tool applies shape and border settings but cannot restore missing source image detail." } },
          { "@type": "Question", "name": "Should I check the result before downloading?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Review the generated PNG to confirm the crop, shape, transparency, and border before downloading." } }
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


        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-9">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to make an image round
              </h2>
              <p className="text-gray-600 leading-7">

                Upload an image and adjust the roundness control to change the
                shape of its corners. The browser draws the image onto a
                canvas using the selected radius. When you select Download,
                the generated PNG is uploaded to prepare your download link.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the tool changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The output uses a square canvas and center-crops the image. A 100% roundness setting creates a circle, while lower settings produce rounded squares.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Check the preview
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Review the processed image before downloading it. The final
                  appearance depends on the source image and the settings you
                  select.
                </p>
              </div>
            </div>



          </div>
        </section>

</main>

      <Footer />
    </div>
  );
}





