'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap, FileText, X } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function PsdToSvgPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    // PSD files can't be displayed as images, so don't set preview
    // Just acknowledge the file is selected
    setPreview('psd-selected');
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
      formData.append('config', JSON.stringify({
        from_format: 'psd',
        to_format: 'svg',
        options: {}
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/svg+xml') {
        throw new Error(`Unexpected output type: ${blob.type || 'unknown'}`);
      }

      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultFileName(`design.svg`);
    } catch (err) {
      setError((err as Error).message || 'Error converting file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!result || !resultFileName) return;

      const blob = await fetch(result).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "psd-to-svg",
        originalName: resultFileName,
        outputName: resultFileName,
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>PSD to SVG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Zap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PSD to SVG Converter</h1>
                <p className="text-lg text-white/90">Convert a Photoshop PSD into an SVG container with the rendered PSD image embedded inside it.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PSD File</h2>

                  {!file ? (
                    <ImageUploader
                      onFileSelect={handleFileSelect}
                      preview={null}
                      onClearPreview={handleClearPreview}
                      accept=".psd"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 w-full">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-blue-100 rounded-lg">
                            <FileText className="w-12 h-12 text-blue-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Selected File</p>
                            <p className="font-semibold text-gray-900 break-all">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearPreview}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      File: <span className="font-semibold text-gray-900">{file.name}</span>
                    </p>
                  )}

                  {/* Conversion Info */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">PSD Rendering</h4>
                      <p className="text-sm text-blue-800">The PSD is rendered as a raster image for the SVG output.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">SVG Container</h4>
                      <p className="text-sm text-green-800">The rendered PNG image is embedded inside a standard SVG document.</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">Important</h4>
                      <p className="text-sm text-purple-800">This does not trace PSD artwork into editable vector paths.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Conversion */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">SVG Output</h3>
                    <p className="text-xs text-gray-600 mb-4">
                      The output is an SVG document containing an embedded raster image. It is not editable vector-path artwork.
                    </p>

                    <button
                      onClick={handleConvert}
                      disabled={!file || processing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to SVG'
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="bg-white rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Conversion Complete</h3>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download SVG File
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="font-semibold text-red-900 mb-2">✗ Error</h3>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert PSD to SVG online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a Photoshop PSD file and click Convert to SVG. The PSD is
                rendered as an image on the server and placed inside a standard
                SVG document. When processing is complete, use the download
                button to save the resulting SVG file.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens during PSD to SVG conversion?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The converter renders the visible PSD design into a raster
                  image and embeds that rendered image inside an SVG document.
                  This provides an SVG-format container for the rendered design
                  without tracing the artwork into vector paths.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Does PSD to SVG create editable vector paths?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  No. The resulting SVG contains an embedded raster rendering
                  of the PSD. Shapes, text, and other artwork are not converted
                  into individually editable SVG paths by this tool.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                PSD and SVG are different types of graphics
              </h2>
              <p className="text-gray-600 leading-7">
                PSD is a Photoshop document format that can contain layers,
                effects, text, masks, and other editing information. SVG is an
                XML-based graphics format commonly used for web graphics. In
                this conversion, the rendered appearance of the PSD is placed
                inside the SVG rather than translating Photoshop editing data
                into native SVG elements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens to PSD layers?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The SVG output does not preserve Photoshop layers as separate
                  editable SVG objects. The PSD is rendered for the conversion,
                  so the output represents the visible design rather than the
                  original layered editing structure.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  When is this conversion useful?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  It can be useful when you specifically need an SVG document
                  containing the rendered appearance of a PSD. If you need true
                  vector artwork with editable paths, use the original vector
                  source when available or a dedicated tracing workflow.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Embedded raster SVG vs true vector SVG
              </h2>
              <p className="text-gray-600 leading-7">
                An SVG file can contain vector shapes, but it can also contain
                embedded raster images. This converter uses the second approach.
                The file has the SVG format and structure, while the PSD artwork
                inside it remains raster-based. Enlarging the embedded image
                therefore does not provide the same resolution-independent
                behavior as artwork made from native vector paths.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Check the SVG after conversion
              </h2>
              <p className="text-gray-600 leading-7">
                After downloading the file, open it in a browser or compatible
                graphics application and check the rendered appearance,
                dimensions, transparency, text, effects, and other important
                visual details. Complex Photoshop features may render
                differently outside the original PSD editing environment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PSD to SVG FAQ
              </h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Is the output a valid SVG file?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    The converter returns an SVG document containing the
                    rendered PSD image.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Will my Photoshop layers remain editable?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. Photoshop layers are not recreated as separate SVG
                    objects in the downloaded file.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this tool vectorize logos or illustrations?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. It does not trace the PSD artwork into editable vector
                    paths. The rendered PSD image is embedded in the SVG.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Why might the converted file look different from Photoshop?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    PSD files can contain Photoshop-specific effects, fonts,
                    blending behavior, and other features. Review the converted
                    result when visual fidelity is important.
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

