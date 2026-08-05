'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, FileUp, Copy, Check } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

interface ImageMetadata {
  fileName: string;
  fileSize: string;
  dimensions: string;
  format: string;
  uploadTime: string;
}

export default function ViewMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [rawData, setRawData] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(null);
    setMetadata(null);
    setRawData({});

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const fileSizeKB = (selectedFile.size / 1024).toFixed(2);
        const dimensions = `${img.width} × ${img.height} px`;
        const format = selectedFile.type.split('/')[1]?.toUpperCase() || 'UNKNOWN';
        const uploadTime = new Date().toLocaleString();

        setMetadata({
          fileName: selectedFile.name,
          fileSize: `${fileSizeKB} KB (${selectedFile.size} bytes)`,
          dimensions: dimensions,
          format: format,
          uploadTime: uploadTime,
        });

        setRawData({
          'File Name': selectedFile.name,
          'File Size': `${fileSizeKB} KB`,
          'File Type': selectedFile.type || 'Unknown',
          'Width': `${img.width}px`,
          'Height': `${img.height}px`,
          'Aspect Ratio': (img.width / img.height).toFixed(2),
          'Upload Time': uploadTime,
          'Last Modified': new Date(selectedFile.lastModified).toLocaleString(),
        });

        setPreview(e.target?.result as string);
      };
      img.onerror = () => {
        alert('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setMetadata(null);
    setRawData({});
  };

  const copyToClipboard = () => {
    const text = Object.entries(rawData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
              <span>View Metadata</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">View Image Metadata</h1>
                <p className="text-lg text-white/90">View detailed metadata and properties of your images including dimensions, file size, format, and more.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept="image/*"
                  />
                </div>

                {/* Metadata Display */}
                {metadata && (
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Metadata</h2>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Dimensions</p>
                        <p className="text-xl font-bold text-blue-900">{metadata.dimensions}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-600 font-medium">File Size</p>
                        <p className="text-xl font-bold text-green-900">{(parseFloat(metadata.fileSize) / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Format</p>
                        <p className="text-xl font-bold text-purple-900">{metadata.format}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">Uploaded</p>
                        <p className="text-sm font-bold text-orange-900">{metadata.uploadTime.split(',')[0]}</p>
                      </div>
                    </div>

                    {/* Detailed Metadata Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(rawData).map(([key, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-3 text-sm font-medium text-gray-700">{key}</td>
                              <td className="px-6 py-3 text-sm text-gray-600 break-all">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Copy Button */}
                  {metadata && (
                    <button
                      onClick={copyToClipboard}
                      className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check size={20} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          Copy Metadata
                        </>
                      )}
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">What is Metadata?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Image dimensions (width & height)</li>
                      <li>• File size and format</li>
                      <li>• Upload and modification dates</li>
                      <li>• Aspect ratio</li>
                      <li>• File type details</li>
                    </ul>
                  </div>

                  {/* Features Box */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Features</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Quick detection</li>
                      <li>• Accurate measurements</li>
                      <li>• Copy all data</li>
                      <li>• No uploads</li>
                      <li>• Instant results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to view image properties online
              </h2>
              <p className="text-gray-600 leading-7 mb-5">
                Select an image to inspect basic file and image properties
                directly in your browser. The tool displays information such
                as the file name, size, type, pixel dimensions, aspect ratio,
                last-modified time, and the time the image was selected.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['1', 'Choose an image', 'Select an image file from your device.'],
                  ['2', 'View properties', 'The browser reads the image and displays its available basic properties.'],
                  ['3', 'Copy the details', 'Use Copy Metadata to copy the displayed property list to your clipboard.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="font-bold text-orange-500 mb-2">{number}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  What information does this tool show?
                </h2>
                <p className="text-gray-600 leading-7">
                  The viewer reports basic properties available from the
                  selected file and decoded image: file name, file size, MIME
                  type, width, height, aspect ratio, last-modified time, and
                  selection time.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Does it read EXIF or GPS metadata?
                </h2>
                <p className="text-gray-600 leading-7">
                  No. This viewer is designed for basic image and file
                  properties. It does not currently extract embedded EXIF,
                  camera, GPS, IPTC, or other advanced metadata fields.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Useful reasons to inspect image properties
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Check image width and height before uploading it to a website.</li>
                <li>Confirm the file type and approximate file size.</li>
                <li>Calculate or verify an image&apos;s aspect ratio.</li>
                <li>Copy basic image information for documentation or troubleshooting.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Image Metadata Viewer FAQ
              </h2>
              <div className="space-y-4">
                {[
                  ['Is my image uploaded to a conversion server?', 'The property-reading logic on this page uses browser FileReader and Image APIs to inspect the selected image locally.'],
                  ['Can I see image dimensions?', 'Yes. The tool displays the decoded image width and height in pixels.'],
                  ['Can I copy the displayed properties?', 'Yes. Use the Copy Metadata button after selecting a supported image.'],
                  ['Does the tool show camera model or GPS location?', 'No. Embedded EXIF and GPS fields are not extracted by the current viewer.'],
                ].map(([q, a]) => (
                  <div key={q} className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Related image tools
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/all-tools/image-to-text" className="text-orange-600 hover:underline">
                  Image to Text
                </Link>
                <Link href="/all-tools/resize-image" className="text-orange-600 hover:underline">
                  Resize Image
                </Link>
                <Link href="/all-tools/image-tools" className="text-orange-600 hover:underline">
                  More image tools
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'PDF Tools', href: '/all-tools/pdf-tools' },
                  { label: 'Image Tools', href: '/all-tools/image-tools' },
                  { label: 'Video Tools', href: '/all-tools/video-tools' },
                  { label: 'AI Write', href: '/all-tools/ai-tools' },
                  { label: 'Code Tools', href: '/all-tools/code-tools' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'PDF to JPG', href: '/all-tools/pdf/pdf-to-jpg' },
                  { label: 'Remove BG', href: '/all-tools/remove-background' },
                  { label: 'Compress Image', href: '/all-tools/compress-image' },
                  { label: 'JSON Formatter', href: '/all-tools/code-tools/json-formatter' },
                  { label: 'CSV to Excel', href: '/all-tools/data/csv-to-excel' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}






