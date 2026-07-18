'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

const TOOL_ID = 'image-to-text';
const TOOL_NAME = 'Image to Text';

export default function ImageToTextPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState('eng');
  const [outputFormat, setOutputFormat] = useState('txt');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (selectedFile: File) => {
    clearError();

    // Validate file
    const emptyCheck = validateImageNotEmpty(selectedFile);
    if (!emptyCheck.valid) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const extensionCheck = validateImageExtension(selectedFile.name);
    if (!extensionCheck.valid) {
      createError(
        ImageToolErrorType.UNSUPPORTED_FORMAT,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const mimeCheck = validateImageMimeType(selectedFile);
    if (!mimeCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_MIME_TYPE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const sizeCheck = validateImageFileSize(selectedFile, TOOL_ID);
    if (!sizeCheck.valid) {
      createError(
        ImageToolErrorType.FILE_TOO_LARGE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile },
        { filename: selectedFile.name, size: selectedFile.size, mimeType: selectedFile.type }
      );
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.onerror = () => {
      createError(
        ImageToolErrorType.FILE_CORRUPTED,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setResultText(null);
    clearError();
  };

  const handleConvert = async () => {
    if (!file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }
    
    setProcessing(true);
    clearError();
    try {
      const formData = new FormData();
      const inputExtension = file.name.split('.').pop()?.toLowerCase();
      const inputFormat = inputExtension === 'jpeg'
        ? 'jpg'
        : inputExtension === 'tif'
          ? 'tiff'
          : inputExtension;
      if (!inputFormat) {
        createError(ImageToolErrorType.UNSUPPORTED_FORMAT, TOOL_ID, TOOL_NAME, { file });
        return;
      }

      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: inputFormat,
        to_format: outputFormat,
        options: { language },
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        createError(
          ImageToolErrorType.OCR_FAILED,
          TOOL_ID,
          TOOL_NAME,
          {
            endpoint: '/api/convert',
            apiStatus: response.status,
            backendErrorCode: 'OCR_FAILED',
            stderr: failure.stderr || failure.error,
          },
          { filename: file.name, size: file.size, mimeType: file.type },
        );
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultText(
        outputFormat === 'txt'
          ? (await blob.text()).trim() || 'No text was detected in this image.'
          : 'Your searchable PDF is ready to download.',
      );
      setResultFileName(`extracted-text.${outputFormat}`);
    } catch (error) {
      createError(
        ImageToolErrorType.OCR_FAILED,
        TOOL_ID,
        TOOL_NAME,
        {
          endpoint: '/api/convert',
          error: error instanceof Error ? error.message : 'Text recognition failed',
        },
        { filename: file.name, size: file.size, mimeType: file.type },
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!result || !resultFileName) return;

      const blob = await fetch(result).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "image-to-text",
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
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Image to Text</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ImageIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image to Text</h1>
                <p className="text-lg text-white/90">Extract text from images with advanced OCR technology. Supports multiple languages and image formats.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {error && <ErrorAlert error={error} onDismiss={clearError} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    toolId={TOOL_ID}
                    onValidationError={() => {}}
                  />
                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      File: <span className="font-semibold text-gray-900">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Extraction Settings</h3>
                    
                    {/* Language Selection */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="eng">English</option>
                        <option value="spa">Spanish</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="chi_sim">Chinese (Simplified)</option>
                        <option value="jpn">Japanese</option>
                        <option value="ita">Italian</option>
                        <option value="por">Portuguese</option>
                        <option value="rus">Russian</option>
                      </select>
                    </div>

                    {/* Output Format Selection */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Output Format
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="txt">Plain Text (.txt)</option>
                        <option value="pdf">PDF (.pdf)</option>
                      </select>
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
                        Extracting...
                      </>
                    ) : (
                      'Extract Text'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  )}

                  {resultText && (
                    <div className="output-result bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Extracted Text</h3>
                      {outputFormat === 'txt' ? (
                        <textarea
                          readOnly
                          value={resultText}
                          className="w-full min-h-32 resize-y rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800"
                          aria-label="Extracted text result"
                        />
                      ) : (
                        <p className="text-sm text-gray-700">{resultText}</p>
                      )}
                    </div>
                  )}

                  {/* Success Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Extraction Complete!</h4>
                      <p className="text-sm text-green-800">Your text has been successfully extracted from the image.</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Supports 9+ languages</li>
                      <li>• Advanced OCR technology</li>
                      <li>• Multiple output formats</li>
                      <li>• Secure & instant processing</li>
                    </ul>
                  </div>
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





