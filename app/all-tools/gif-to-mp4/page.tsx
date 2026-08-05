'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { VideoToolErrorType } from '@/app/utils/types/errors';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'gif-to-mp4';
const TOOL_NAME = 'GIF to MP4';

export default function GifToMp4Page() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [fps, setFps] = useState(30);
  const { error, clearError, setError } = useImageToolErrors();


  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    clearError();
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
    clearError();
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    clearError();
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'gif',
        to_format: 'mp4',
        options: { fps },
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        setError({
          type: VideoToolErrorType.FFMPEG_FAILED,
          toolId: TOOL_ID,
          toolName: TOOL_NAME,
          message: failure.error || 'GIF to MP4 conversion failed',
          userFriendlyMessage: 'GIF to MP4 conversion failed. Please try with a different GIF.',
          timestamp: new Date(),
          details: {
            endpoint: '/api/convert',
            apiStatus: response.status,
            backendErrorCode: 'FFMPEG_FAILED',
            stderr: failure.stderr || failure.error,
          },
          fileMeta: { filename: file.name, size: file.size, mimeType: file.type },
        });
        return;
      }

      const blob = await response.blob();

      if (blob.type !== 'video/mp4') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }

      setResult(blob);
    } catch (err) {
      setError({
        type: VideoToolErrorType.FFMPEG_FAILED,
        toolId: TOOL_ID,
        toolName: TOOL_NAME,
        message: err instanceof Error ? err.message : 'Error converting file',
        userFriendlyMessage: 'GIF to MP4 conversion failed. Please try with a different GIF.',
        timestamp: new Date(),
        details: { endpoint: '/api/convert', error: err instanceof Error ? err.message : 'Error converting file' },
        fileMeta: { filename: file.name, size: file.size, mimeType: file.type },
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing) return;


    setProcessing(true);

    try {
      const downloadResult =
        await uploadBrowserDownloadResult({
          blob: result,
          toolSlug: 'gif-to-mp4',
          originalName: 'converted.mp4',
          outputName: 'converted.mp4',
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>GIF to MP4</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">GIF to MP4 Converter</h1>
                <p className="text-lg text-white/90">Convert GIF animations to MP4 video format with adjustable frame rate.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload GIF File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".gif"
                  />
                  {error && <ErrorAlert error={error} onDismiss={clearError} />}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Options</h3>

                    {/* FPS */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Frames Per Second: {fps}
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="1"
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher FPS = smoother motion</p>
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
                      'Convert to MP4'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download MP4
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted GIF to MP4 conversion</li>
                      <li>• Adjustable output frame rate</li>
                      <li>• Supports GIF format</li>
                      <li>• Files are processed only as needed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Content */}
        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-8">

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to convert GIF to MP4 online
              </h2>
              <p className="text-gray-700 leading-7 mb-6">
                SimplifyConvert converts an animated GIF into an MP4 video.
                Upload your GIF, choose the output frame rate, run the
                conversion, and download the resulting MP4 file.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ['1', 'Upload your GIF', 'Choose the animated GIF file you want to convert.'],
                  ['2', 'Choose the frame rate', 'Set the MP4 frame rate anywhere from 15 to 60 frames per second.'],
                  ['3', 'Convert to MP4', 'Start the server-assisted conversion and wait for the video to be prepared.'],
                  ['4', 'Download the video', 'Download the converted MP4 when processing is complete.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-1">
                      {number}. {title}
                    </div>
                    <p className="text-sm text-gray-600 leading-6">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Why convert GIF to MP4?
                </h2>
                <p className="text-gray-700 leading-7">
                  GIF is commonly used for short looping animations, while MP4
                  is a standard video format supported by many media players,
                  websites, presentations, messaging platforms, and video
                  workflows. Converting an animation to MP4 can make it easier
                  to use where a video file is preferred.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  How does the FPS setting work?
                </h2>
                <p className="text-gray-700 leading-7">
                  The converter provides an output frame-rate control from
                  15 to 60 FPS. A higher setting produces more video frames
                  per second, while a lower setting uses fewer frames. Choose
                  the value that best suits how you intend to use the MP4.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                GIF vs MP4
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">GIF</h3>
                  <p className="leading-7">
                    GIF is an image format that can contain multiple frames to
                    create an animation. It is widely used for short visual
                    loops and simple animated graphics.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">MP4</h3>
                  <p className="leading-7">
                    MP4 is a video container commonly used for video playback
                    and distribution. It is useful when an animated GIF needs
                    to be handled as a conventional video file.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tips for converting GIF animations
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>• Preview the source GIF and make sure the animation is correct before conversion.</li>
                <li>• Use the FPS control to select an appropriate output frame rate.</li>
                <li>• Allow the conversion to finish before starting the download.</li>
                <li>• Preview the resulting MP4 after downloading it, especially when timing is important.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                GIF to MP4 FAQ
              </h2>
              <div className="space-y-5">
                {[
                  ['What file does this tool accept?', 'This converter is designed for GIF input and produces an MP4 video.'],
                  ['Can I change the output frame rate?', 'Yes. The page provides an FPS control ranging from 15 to 60 frames per second.'],
                  ['Does converting a GIF add audio?', 'No audio source is supplied by this GIF conversion workflow, so the tool should be used for converting the visual animation to video.'],
                  ['Why would I use MP4 instead of GIF?', 'MP4 can be useful when a website, application, presentation, or other workflow expects a video file rather than an animated image.'],
                  ['Should I check the MP4 after conversion?', 'Yes. Preview the downloaded video to confirm that its animation and playback meet your needs.'],
                ].map(([question, answer]) => (
                  <div key={question}>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {question}
                    </h3>
                    <p className="text-gray-700 leading-7">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl border border-orange-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Related media tools
              </h2>
              <p className="text-gray-700 leading-7">
                Explore SimplifyConvert&apos;s Image and Video tool categories
                for other media conversion and editing utilities.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  href="/all-tools/image-tools"
                  className="text-orange-700 font-semibold hover:underline"
                >
                  Image Tools
                </Link>
                <Link
                  href="/all-tools/video-tools"
                  className="text-orange-700 font-semibold hover:underline"
                >
                  Video Tools
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}





