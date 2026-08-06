'use client';

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { motion } from 'framer-motion';

const PdfEditor = dynamic(() => import('@/app/components/PdfEditor/PdfEditor'), {
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading PDF Editor...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function EditPdfPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid PDF file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Premium Header */}
        <div className="relative bg-linear-to-r from-purple-600 via-purple-700 to-indigo-700 py-12 px-4 md:px-8 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link href="/all-tools/pdf-tools" className="hover:text-white transition">PDF Tools</Link>
              <span>/</span>
              <span className="text-white">Edit PDF</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl">✏️</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Edit PDF Online Free
                </h1>
                <p className="text-lg text-white/90">
                  Edit PDF text content with visual preview and inline editing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-12">
          {!file ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Upload Your PDF to Edit
              </h2>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Click to upload or drag & drop
                </p>
                <p className="text-gray-500 mb-4">
                  PDF files only (up to 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Trust Badge */}
              <div className="mt-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      Your PDF is processed securely
                    </p>
                    <p className="text-xs text-gray-600">
                      No account needed • Encrypted transmission
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* File Info */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {file.name}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setError('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Change PDF
                </button>
              </div>

              {/* PDF Editor */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-screen">
                <PdfEditor file={file} />
              </div>
            </div>
          )}
        </div>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to edit PDF text online
            </h2>
            <p className="text-gray-600 leading-7 mb-6">
              Upload a PDF to open it in the visual editor. Review the document,
              select editable text, make the required changes, and export the
              updated PDF when you are finished.
            </p>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                ['1', 'Upload PDF', 'Choose the PDF document you want to edit.'],
                ['2', 'Review content', 'Use the preview to locate the text you need to change.'],
                ['3', 'Edit text', 'Select supported text content and make your changes.'],
                ['4', 'Save PDF', 'Review the edited document and download the result.'],
              ].map(([number, title, text]) => (
                <div key={number} className="border border-gray-200 rounded-xl p-5">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                    {number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-6">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                What can you edit in a PDF?
              </h2>
              <p className="text-gray-600 leading-7">
                This editor is intended for text content that can be identified
                inside the PDF. The visual preview helps you locate editable
                content and review changes before downloading the updated file.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                What about scanned PDFs?
              </h2>
              <p className="text-gray-600 leading-7">
                A scanned PDF may contain page images rather than selectable
                text. If visible words cannot be selected or edited normally,
                use PDF OCR first to recognize the text.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit PDF vs other PDF tools
            </h2>
            <p className="text-gray-600 leading-7">
              Use Edit PDF when you need to change existing editable text.
              Use Add Text when you want to place new text on a document,
              Annotate PDF for markup and notes, PDF OCR for scanned pages,
              and E-Sign PDF when you need to place an electronic signature.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Tips before editing a PDF
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Keep the original PDF before making important changes.',
                'Check names, dates, amounts, and other important details after editing.',
                'Use the visual preview to confirm that you selected the correct text.',
                'Review every edited page before downloading the final PDF.',
                'Use OCR when the document contains scanned page images.',
                'Use dedicated annotation or signing tools when you do not need to edit existing text.',
              ].map((tip) => (
                <div key={tip} className="flex gap-3 border border-gray-200 rounded-lg p-4">
                  <span className="text-purple-600 font-bold">✓</span>
                  <p className="text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit PDF FAQ
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I edit PDF text online?',
                  a: 'Yes. Upload a supported PDF and use the visual editor to change text content that the editor can identify.',
                },
                {
                  q: 'Why can I see text but cannot edit it?',
                  a: 'The words may be part of a scanned image rather than selectable PDF text. PDF OCR is more appropriate for scanned documents.',
                },
                {
                  q: 'Can I preview my changes before downloading?',
                  a: 'Yes. The editor provides a visual document preview so you can inspect the document while making changes.',
                },
                {
                  q: 'Is Edit PDF the same as Annotate PDF?',
                  a: 'No. Edit PDF focuses on changing editable text, while Annotate PDF is intended for markup, notes, and annotations.',
                },
              ].map((item) => (
                <div key={item.q} className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600 leading-7">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Related PDF tools
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/all-tools/pdf/pdf-ocr"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">PDF OCR</h3>
                <p className="text-sm text-gray-600">Recognize text in scanned PDFs.</p>
              </Link>

              <Link
                href="/all-tools/pdf/annotate-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Annotate PDF</h3>
                <p className="text-sm text-gray-600">Add markup and annotations.</p>
              </Link>

              <Link
                href="/all-tools/pdf/esign-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">E-Sign PDF</h3>
                <p className="text-sm text-gray-600">Add an electronic signature.</p>
              </Link>

              <Link
                href="/all-tools/pdf/add-text"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Add Text</h3>
                <p className="text-sm text-gray-600">Place new text on PDF pages.</p>
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
