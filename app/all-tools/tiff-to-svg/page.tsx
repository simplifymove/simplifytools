'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function TiffToSvgPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cornerThreshold, setCornerThreshold] = useState(100);
  const [curveOptimize, setCurveOptimize] = useState(2);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'tiff',
          to_format: 'svg',
          options: {
            corner_threshold: cornerThreshold,
            curve_optimize: curveOptimize,
          },
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'SVG conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/svg+xml') {
        throw new Error(
          `Expected SVG output but received ${blob.type || 'unknown'}`,
        );
      }

      setResult(blob);
    } catch (err) {
      setError((err as Error).message || 'Error converting file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;

      setError(null);
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'tiff-to-svg',
            originalName: 'converted.svg',
            outputName: 'converted.svg',
          });

        router.push(downloadResult.downloadPageUrl);
      } catch (caughtError) {
        setError(
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
              <span>TIFF to SVG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">TIFF to SVG Converter</h1>
                <p className="text-lg text-white/90">Trace TIFF artwork into SVG vector paths for scalable use. High-contrast source images produce the clearest traces.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload TIFF File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".tiff,.tif"
                  />
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Options</h3>

                    {/* Corner Threshold */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Corner Threshold: {cornerThreshold}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="180"
                        value={cornerThreshold}
                        onChange={(e) => setCornerThreshold(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher values preserve more details</p>
                    </div>

                    {/* Curve Optimization */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Curve Optimization: {curveOptimize}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={curveOptimize}
                        onChange={(e) => setCurveOptimize(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">0 = No optimization, 3 = Maximum optimization</p>
                    </div>
                  </div>

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert to SVG'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download SVG
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted vector tracing</li>
                      <li>• Creates SVG paths from raster shapes</li>
                      <li>• Supports TIFF and TIF formats</li>
                      <li>• Files are temporarily processed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert TIFF to SVG online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a TIFF or TIF image, adjust the tracing controls if needed,
                and click Convert to SVG. The image is processed using vector
                tracing to identify raster shapes and create SVG paths. When the
                conversion finishes, use the download button to save the SVG file.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens during TIFF to SVG conversion?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  TIFF is a raster image format made from pixels, while SVG
                  represents graphics using scalable paths and shapes. This tool
                  traces visible shapes in the TIFF image and generates SVG path
                  data rather than simply placing the original raster image inside
                  an SVG container.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Which TIFF images trace best?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Logos, icons, line art, diagrams, signatures, illustrations,
                  and other images with clear edges and strong contrast generally
                  produce cleaner vector traces. Photographs and highly detailed
                  textures can create much more complex SVG paths.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                TIFF vs SVG
              </h2>
              <p className="text-gray-600 leading-7">
                TIFF stores pixel-based image information and is commonly used
                for scans, publishing workflows, archival images, and high-quality
                raster graphics. SVG is a vector format whose paths can scale
                without the normal pixelation associated with enlarging raster
                images. Converting is useful when the shapes in a TIFF image need
                to be reused in a scalable vector workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Corner Threshold
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The Corner Threshold control influences how the tracing process
                  identifies corners and details in the source artwork. Different
                  images may benefit from different values, so compare the output
                  when tracing artwork with sharp geometric edges or fine details.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Curve Optimization
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Curve Optimization controls how strongly traced curves are
                  simplified and optimized. Lower settings retain less
                  optimization, while higher settings apply more optimization.
                  The best setting depends on the complexity of the source image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Check the SVG after tracing
              </h2>
              <p className="text-gray-600 leading-7">
                Raster-to-vector tracing is an interpretation of the source
                image, so the resulting paths may not reproduce every pixel-level
                detail exactly. Inspect important edges, curves, small text, and
                intricate shapes after conversion. A cleaner or higher-contrast
                source image can often produce a simpler and more useful SVG.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Common uses for TIFF to SVG conversion
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  'Tracing logos and simple artwork',
                  'Converting line drawings into scalable graphics',
                  'Preparing shapes for vector editing',
                  'Reusing diagram elements in SVG workflows',
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-gray-200 rounded-lg p-4 text-sm text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                TIFF to SVG FAQ
              </h2>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Does converting TIFF to SVG make the image vector?
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    The tool performs vector tracing and creates SVG paths from
                    shapes detected in the raster TIFF image. The quality and
                    complexity of those paths depend on the source artwork.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I upload both .tif and .tiff files?
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    Yes. The uploader accepts both .tif and .tiff filename
                    extensions.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Will a photograph become a simple vector illustration?
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    Not necessarily. Photographs contain many colors, edges, and
                    fine details, which can result in complex traces. Simple,
                    high-contrast artwork is generally better suited to clean
                    vector tracing.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I enlarge the resulting SVG?
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    SVG paths are scalable, but scaling does not improve tracing
                    inaccuracies inherited from the original raster image. Review
                    the converted paths before using them at large sizes.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

</main>
      <Footer />
    </>
  );
}
