'use client';

import React, { useState } from 'react';
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setConversionTip('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreview(evt.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setDownloadUrl(null);
    setError(null);
    setConversionTip('');
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setConversionTip('Converting video to GIF... This may take a moment depending on video length and resolution.');

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/gif') {
        throw new Error(
          `Expected GIF output but received ${blob.type || 'unknown'}`,
        );
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConversionTip('✓ Conversion complete! Your GIF is ready to download.');
    } catch (error) {
      setError((error as Error).message || 'Error converting video');
      setConversionTip('');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!downloadUrl) return;

      const blob = await fetch(downloadUrl).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "mp4-to-gif",
        originalName: "converted.gif",
        outputName: "converted.gif",
      });

      router.push(downloadResult.downloadPageUrl);
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
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
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
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      ← Clear and upload different video
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                  disabled={!file || processing}
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
                  <button
                    onClick={handleDownload}
                    className="w-full mt-3 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download GIF
                  </button>
                )}

                {/* Info */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 mb-2">
                    <strong>💡 GIF Benefits:</strong>
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• No sound needed (silent animation)</li>
                    <li>• Works on all platforms & browsers</li>
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
                  <li>• Remove audio before converting (we do it automatically)</li>
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
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What is GIF format?</h3>
                <p className="text-gray-600">GIF (Graphics Interchange Format) is an animated image format that displays a sequence of frames to create an animation. It's widely supported across all browsers and social media platforms without requiring plugins.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Why convert MP4 to GIF?</h3>
                <p className="text-gray-600">GIFs can be useful for sharing short visual animations on websites, messaging apps, and other compatible platforms. They autoplay, don't require plugins, and work everywhere. Plus, they're silent, so they're great for meme-worthy moments.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's the file size of the resulting GIF?</h3>
                <p className="text-gray-600">GIF file sizes vary based on video duration, frame rate, dimensions, and visual complexity. Animated GIFs can become significantly larger than the source video.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How is the GIF generated?</h3>
                <p className="text-gray-600">The converter generates the GIF at 10 frames per second and limits the output width while preserving the source aspect ratio. FFmpeg generates and applies a color palette for the animation.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What video formats are supported?</h3>
                <p className="text-gray-600">Currently, we support MP4 files. If you have other formats like MOV, AVI, or WebM, you can use a video converter to convert them to MP4 first.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Will the GIF have audio?</h3>
                <p className="text-gray-600">No, GIFs are silent image animations and cannot contain audio. We automatically remove all audio during conversion, so the resulting GIF will be a silent animation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}







