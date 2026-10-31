'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Video } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function Mp4ToGifPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState('');
  const [dragging, setDragging] = useState(false);

  const processingRef = useRef(false);
  const downloadingRef = useRef(false);
  const conversionGeneration = useRef(0);

  useEffect(() => {
    return () => {
      conversionGeneration.current++;
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!downloadUrl) return;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const selectFile = (selectedFile: File | null) => {
    if (processingRef.current || downloadingRef.current) return;

    conversionGeneration.current++;
    setFile(null);
    setDownloadUrl(null);
    setConversionTip('');
    setError(null);

    if (!selectedFile) return;

    const isMp4 =
      selectedFile.type === 'video/mp4' ||
      (selectedFile.type === '' && /\.mp4$/i.test(selectedFile.name));

    if (!isMp4) {
      setError('Please select an MP4 video file.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('The selected MP4 file is empty.');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('MP4 files must be 500 MB or smaller.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
    e.target.value = '';
  };

  const handleClearPreview = () => {
    selectFile(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    if (processingRef.current || downloadingRef.current) return;

    selectFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleConvert = async () => {
    if (!file || processingRef.current || downloadingRef.current) return;

    const generation = ++conversionGeneration.current;

    processingRef.current = true;
    setProcessing(true);
    setDownloadUrl(null);
    setError(null);
    setConversionTip(
      'Converting your MP4 to GIF. Longer videos may take more time.'
    );

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'mp4',
        to_format: 'gif',
        options: {
          fps: 10,
          scale: 480,
        },
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || 'MP4 to GIF conversion failed.'
        );
      }

      const blob = await response.blob();

      if (blob.type !== 'image/gif' || blob.size === 0) {
        throw new Error('The conversion did not produce a valid GIF.');
      }

      const signature = new Uint8Array(
        await blob.slice(0, 6).arrayBuffer()
      );

      const gif87a = [71, 73, 70, 56, 55, 97];
      const gif89a = [71, 73, 70, 56, 57, 97];

      const validSignature = [gif87a, gif89a].some(
        expected => expected.every(
          (byte, index) => signature[index] === byte
        )
      );

      if (!validSignature) {
        throw new Error('The generated file has an invalid GIF signature.');
      }

      if (generation !== conversionGeneration.current) return;

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConversionTip('Conversion complete. Preview or download your GIF.');
    } catch (caughtError) {
      if (generation === conversionGeneration.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to convert the MP4 video.'
        );
        setConversionTip('');
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl || processingRef.current || downloadingRef.current) {
      return;
    }

    downloadingRef.current = true;
    setDownloading(true);
    setError(null);

    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('Unable to read the generated GIF.');
      }

      const blob = await response.blob();

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: 'mp4-to-gif',
        originalName: file?.name || 'video.mp4',
        outputName: 'converted.gif',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the GIF download.'
      );
    } finally {
      downloadingRef.current = false;
      setDownloading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-purple-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>MP4 to GIF</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <Video size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">MP4 to GIF Converter</h1>
              <p className="text-lg text-white/90">Convert MP4 videos to animated GIF format. Useful for creating short animated images from MP4 video clips.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload MP4 Video</h2>
                <p className="text-gray-600 mb-6 text-sm">Select a video file in MP4 format. Recommended: 5-30 seconds for best results.</p>

                {/* File Upload Area */}
                <label className="block">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 transition ${
                      dragging
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-purple-300 bg-purple-50 hover:bg-purple-100'
                    } ${processing || downloading
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
                      disabled={processing || downloading}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Video size={48} className="mx-auto mb-3 text-purple-500" />
                      <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-gray-600 text-sm">MP4 files up to 500MB</p>
                    </div>
                  </div>
                </label>

                {preview && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Video Preview:</p>
                    <video
                      src={preview}
                      controls
                      className="w-full rounded-lg border border-gray-200 max-h-64"
                    />
                    <button
                      onClick={handleClearPreview}
                      disabled={processing || downloading}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      ← Clear and upload different video
                    </button>
                  </div>
                )}

                {error && (
                  <div role="alert" className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls - Right (sticky sidebar) */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Settings</h3>

                {/* Video Info */}
                {file && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700"><strong>File:</strong> {file.name}</p>
                    <p className="text-sm text-gray-700"><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing || downloading}
                  className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Video size={18} />
                      Convert to GIF
                    </>
                  )}
                </button>

                {/* Conversion Status */}
                {conversionTip && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${
                    conversionTip.includes('✓')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {conversionTip}
                  </div>
                )}

                {/* Download Button */}
                {downloadUrl && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Generated GIF preview
                    </p>
                    <img
                      src={downloadUrl}
                      alt="Converted animated GIF preview"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={handleDownload}
                      disabled={processing || downloading}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      {downloading ? 'Preparing download...' : 'Download GIF'}
                    </button>
                  </div>
                )}

                {/* Info */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 mb-2">
                    <strong>💡 GIF Benefits:</strong>
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• No sound needed (silent animation)</li>
                    <li>• Supported by major browsers and many messaging platforms</li>
                    <li>• Useful for short web and messaging animations</li>
                    <li>• GIF playback does not use video playback controls</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Best Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">✓</span> Recommended Settings
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Keep video length between 5-30 seconds</li>
                  <li>• Higher resolution videos create larger GIFs</li>
                  <li>• Fast-paced videos work best</li>
                  <li>• GIF does not support audio; the output is always silent</li>
                  <li>• Ensure good lighting in your video</li>
                  <li>• Steady camera movement or static shots</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠</span> Things to Avoid
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Very long videos (results in large file sizes)</li>
                  <li>• Slowly changing scenes (may appear choppy)</li>
                  <li>• Complex, detailed backgrounds</li>
                  <li>• Extremely dark or dim videos</li>
                  <li>• Videos with too much text</li>
                  <li>• Uncompressed video files</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQPanel>
            <FAQHeading>Frequently Asked Questions</FAQHeading>
            <FAQList>
              <FAQCard>
                <FAQStaticQuestion>What is GIF format?</FAQStaticQuestion>
                <FAQAnswer>GIF (Graphics Interchange Format) is an animated image format that displays a sequence of frames to create an animation. It's widely supported across all browsers and social media platforms without requiring plugins.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>Why convert MP4 to GIF?</FAQStaticQuestion>
                <FAQAnswer>GIFs can be useful for sharing short visual animations on websites, messaging apps, and other compatible platforms. They typically animate automatically on compatible platforms without video controls. Plus, they're silent, so they're great for meme-worthy moments.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>What's the file size of the resulting GIF?</FAQStaticQuestion>
                <FAQAnswer>GIF file sizes vary based on video duration, frame rate, dimensions, and visual complexity. Animated GIFs can become significantly larger than the source video.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>How is the GIF generated?</FAQStaticQuestion>
                <FAQAnswer>The converter generates the GIF at 10 frames per second and limits the output width while preserving the source aspect ratio. FFmpeg generates and applies a color palette for the animation.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>What video formats are supported?</FAQStaticQuestion>
                <FAQAnswer>Currently, we support MP4 files. If you have other formats like MOV, AVI, or WebM, you can use a video converter to convert them to MP4 first.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>Will the GIF have audio?</FAQStaticQuestion>
                <FAQAnswer>No, GIFs are silent image animations and cannot contain audio. We automatically remove all audio during conversion, so the resulting GIF will be a silent animation.</FAQAnswer>
              </FAQCard>
            </FAQList>
          </FAQPanel>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}







