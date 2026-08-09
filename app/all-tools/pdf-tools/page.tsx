'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { ToolCard } from '@/app/components/ToolCard';
import { SearchBox } from '@/app/components/SearchBox';
import { FAQ } from '@/app/components/FAQ';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

function PdfToolsGuidance() {
  return (
    <section
      aria-label="Guidance for choosing and using PDF tools"
      className="border-t border-gray-200 bg-white px-4 py-16 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="working-with-pdfs-heading">
            <h2
              id="working-with-pdfs-heading"
              className="text-3xl font-bold tracking-tight text-gray-900"
            >
              Working With PDFs: Choose the Right Tool for the Job
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-gray-700">
              <p>
                PDF files are designed to keep a document looking consistent across different
                devices and applications. That makes them convenient for sharing, but it can also
                make editing, extracting content and converting them more complicated than working
                with an ordinary document file.
              </p>
              <p>
                SimplifyConvert&apos;s PDF tools cover different types of tasks, from combining and
                splitting pages to compression, conversion and editing. The right tool depends on
                what you want to change and what needs to remain intact.
              </p>
            </div>
          </section>

          <section aria-labelledby="converting-pdf-heading">
            <h2 id="converting-pdf-heading" className="text-3xl font-bold tracking-tight text-gray-900">
              Converting a PDF to Another Format
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-gray-700">
              <p>
                Use a conversion tool when the information inside a PDF needs to be used in another
                application or file format.
              </p>
              <p>
                For example, PDF to Word can be useful when you need an editable document, while PDF
                to JPG is more appropriate when you need individual pages as images.
              </p>
              <p>
                A PDF conversion is not simply a change to the filename. PDF pages can contain
                positioned text, embedded fonts, images, tables, vector graphics and other elements.
                The destination format may represent those elements differently.
              </p>
              <p>
                Because of this, complex layouts can change during conversion. Check tables,
                columns, fonts, spacing and page breaks before relying on the converted file.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
          <section className="border-t border-gray-200 pt-6" aria-labelledby="combining-pdfs-heading">
            <h2 id="combining-pdfs-heading" className="text-2xl font-bold text-gray-900">
              Combining PDF Files
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>
                Merging is useful when several PDFs belong together and need to be shared or stored
                as one document.
              </p>
              <p>
                Examples include combining separate invoices, joining chapters of a report or
                putting several scanned documents into a single file.
              </p>
              <p>
                Before merging, check the order of the source files and review the finished PDF.
                Documents created from different sources can have different page sizes, orientations
                or margins, and merging them does not automatically make those pages visually
                consistent.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="splitting-pdfs-heading">
            <h2 id="splitting-pdfs-heading" className="text-2xl font-bold text-gray-900">
              Splitting or Extracting PDF Pages
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>You do not always need to convert an entire document.</p>
              <p>
                If only a few pages are required, splitting or extracting pages can be more
                appropriate. This is useful when you want to separate a chapter, remove unrelated
                pages from a working copy or create smaller documents from a larger PDF.
              </p>
              <p>Keep the original file if you may need the complete document again.</p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="compressing-pdf-heading">
            <h2 id="compressing-pdf-heading" className="text-2xl font-bold text-gray-900">
              Compressing a PDF
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>
                PDF compression is useful when a document is too large for an upload form, email
                attachment or storage requirement.
              </p>
              <p>
                The amount of reduction depends heavily on what the PDF contains. A document made
                mostly from text may behave differently from a scanned PDF containing high-resolution
                photographs on every page.
              </p>
              <p>
                Reducing file size can involve changing how images or other resources are stored.
                More compression can sometimes mean lower visual quality, so inspect important
                diagrams, photographs and small text after processing.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="pdf-text-scans-heading">
            <h2 id="pdf-text-scans-heading" className="text-2xl font-bold text-gray-900">
              Text-Based PDFs and Scanned PDFs Are Different
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>Two PDFs that look similar on screen may be very different internally.</p>
              <p>
                A text-based PDF usually contains actual text characters that software can select or
                extract. A scanned PDF may contain pages that are essentially photographs of paper
                documents.
              </p>
              <p>
                This distinction matters when extracting text, searching a document or converting it
                to an editable format. A scanned page may require optical character recognition (OCR)
                before its text can be interpreted, and OCR can make mistakes&mdash;particularly
                with unclear scans, unusual fonts, handwriting, tables or complex layouts.
              </p>
              <p>If extracted text matters, compare it with the source document.</p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="editing-pdf-heading">
            <h2 id="editing-pdf-heading" className="text-2xl font-bold text-gray-900">
              Editing a PDF
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>Small PDF changes and full document editing are different tasks.</p>
              <p>
                Operations such as rotating, rearranging, deleting or extracting pages generally
                work with the existing page structure. Changing the actual text or visual elements
                inside a PDF can be more complicated because the file may not contain editable
                paragraphs in the way a word-processing document does.
              </p>
              <p>
                For substantial rewriting, converting to an editable format may sometimes be more
                practical. For page-level changes, a dedicated PDF page tool is usually the simpler
                option.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="images-in-pdfs-heading">
            <h2 id="images-in-pdfs-heading" className="text-2xl font-bold text-gray-900">
              Images Inside PDFs
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>PDFs can contain photographs, screenshots, illustrations and scanned pages.</p>
              <p>
                Converting a PDF page to an image creates a raster representation of that page. The
                resulting usefulness depends partly on the chosen dimensions, resolution and source
                quality.
              </p>
              <p>
                Similarly, converting images into a PDF packages those images into PDF pages; it does
                not improve the underlying image quality.
              </p>
              <p>
                If small text or detailed graphics are important, inspect the result at normal
                viewing size before discarding the source files.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="pdf-layout-change-heading">
            <h2 id="pdf-layout-change-heading" className="text-2xl font-bold text-gray-900">
              Why PDF Layout Can Change During Conversion
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>
                A PDF describes how content should appear on a page, while formats such as DOCX are
                designed around editable document structures.
              </p>
              <p>
                Reconstructing one from the other can require the converter to interpret where
                paragraphs, columns, tables and other elements belong.
              </p>
              <p>
                Simple documents often translate more predictably than complex ones. Multi-column
                layouts, unusual fonts, forms, mathematical notation, tightly positioned graphics
                and scanned pages can require additional review.
              </p>
              <p>
                A successful conversion therefore means that an output file was created; it does not
                necessarily mean every visual or structural detail is identical to the source.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="protected-pdfs-heading">
            <h2 id="protected-pdfs-heading" className="text-2xl font-bold text-gray-900">
              Password-Protected and Restricted PDFs
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>Some PDFs are protected by passwords or document permissions.</p>
              <p>
                A tool cannot necessarily process a protected file unless the required access is
                available. Restrictions may also exist for a legitimate reason, so only modify or
                unlock documents that you own or have permission to use.
              </p>
              <p>
                Removing a password from an authorized copy does not recover a password that you do
                not know.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6" aria-labelledby="pdf-processing-heading">
            <h2 id="pdf-processing-heading" className="text-2xl font-bold text-gray-900">
              PDF File Size and Processing
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>
                PDF processing requirements vary according to both the selected tool and the
                document itself.
              </p>
              <p>
                A short text document can require far fewer resources than a large scanned report
                containing hundreds of high-resolution images. Some operations may therefore take
                longer or have different file-size restrictions.
              </p>
              <p>
                Check the individual tool page for its supported inputs, limits and processing
                requirements rather than assuming that every PDF tool works under the same
                conditions.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-14 space-y-10">
          <section className="border-t border-gray-200 pt-8" aria-labelledby="important-pdf-heading">
            <h2 id="important-pdf-heading" className="text-2xl font-bold text-gray-900">
              Before Processing an Important PDF
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>For documents that matter, a few simple precautions can prevent problems:</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Keep an untouched copy of the original.</li>
                <li>Make sure you selected the operation you actually need.</li>
                <li>Check page order and orientation when combining or rearranging pages.</li>
                <li>Review fonts, tables and spacing after format conversion.</li>
                <li>
                  Compare extracted or OCR-generated text with the source when accuracy matters.
                </li>
                <li>Inspect image-heavy documents after compression.</li>
                <li>Open the downloaded result before deleting the original.</li>
              </ol>
              <p>
                These checks are particularly useful for contracts, applications, financial
                records, reports and documents that would be difficult to recreate.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8" aria-labelledby="smallest-change-heading">
            <h2 id="smallest-change-heading" className="text-2xl font-bold text-gray-900">
              Choose the Smallest Change That Solves the Problem
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
              <p>
                You do not need to convert a PDF simply because something about the file needs to
                change.
              </p>
              <p>
                If the file is too large, try compression. If only several pages are needed, extract
                or split them. If pages are in the wrong order, reorganize them. If the content needs
                substantial editing, consider converting it to an editable format.
              </p>
              <p>
                Starting with the smallest necessary operation usually makes it easier to preserve
                the parts of the original document that you want to keep.
              </p>
              <p>
                Browse the PDF tools above to choose the operation that matches your task, then check
                that tool&apos;s page for its supported formats, controls and limitations.
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default function PdfToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allPdfTools = getAllPdfTools();

  // Get unique categories
  const categories = Array.from(new Set(allPdfTools.map((tool) => tool.category)));

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let results = allPdfTools;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter((tool) => tool.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return results;
  }, [searchTerm, selectedCategory]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'PDF Tools',
                item: 'https://simplifyconvert.com/all-tools/pdf-tools',
              },
            ],
          }),
        }}
      />
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
          {/* Premium Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 py-16 px-4 md:px-8 overflow-hidden">
            {/* Animated background shapes */}
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
              animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span>PDF Tools</span>
              </div>

              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Free PDF Tools Online - Merge, Split & Compress</h1>
                <p className="text-lg text-white/90 max-w-2xl mb-4">
                  Professional free PDF tools for merging, splitting, compressing, converting, and editing PDF files. No signup or installation required.
                </p>
                {/* Keyword-rich intro paragraph */}
                <p className="text-base text-white/85 max-w-3xl leading-relaxed">
                  Use our free online PDF tools to merge, split, compress, and convert PDF files. No signup required.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="space-y-6"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Search Bar with Enhanced Component */}
                <div className="flex-1">
                  <SearchBox
                    placeholder="Search PDF tools..."
                    onSearch={(query) => setSearchTerm(query)}
                    variant="header"
                    showSuggestions={true}
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-semibold text-gray-700">Filter by:</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    All ({allPdfTools.length})
                  </button>
                  {categories.map((category) => {
                    const count = allPdfTools.filter((t) => t.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        {category} ({count})
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="py-12 px-4 md:px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              {filteredTools.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-32"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <p className="text-lg text-gray-500 font-medium">
                      {searchTerm
                        ? `No PDF tools found matching "${searchTerm}"`
                        : 'No PDF tools available'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
                >
                  {filteredTools.map((tool) => (
                    <motion.div
                      key={tool.id}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Link href={`/all-tools/pdf/${tool.id}`}>
                        <motion.div
                          className="h-full rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Hover gradient background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />

                          <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition mb-4"
                              whileHover={{ scale: 1.2, rotate: 12 }}
                              title={tool.title}
                              role="img"
                              aria-label={`${tool.title} tool icon`}
                            >
                              {tool.icon && <tool.icon className="w-6 h-6 text-purple-600" />}
                            </motion.div>

                            {/* Content */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                            <motion.div
                              className="flex items-center gap-1 text-purple-600 font-medium text-sm"
                              whileHover={{ gap: 8 }}
                            >
                              Open tool
                              <ChevronRight size={16} />
                            </motion.div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          <PdfToolsGuidance />

          {/* Popular PDF Tools - Internal Linking Section */}
          <section className="border-b border-gray-200 bg-slate-50 px-4 py-12 md:px-8">
            <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular PDF Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/all-tools/pdf/merge-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                  <span className="text-purple-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-purple-600">Merge PDF Files</span>
                </Link>
                <Link href="/all-tools/pdf/compress-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                  <span className="text-purple-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-purple-600">Compress PDF</span>
                </Link>
                <Link href="/all-tools/pdf/split-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                  <span className="text-purple-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-purple-600">Split PDF Pages</span>
                </Link>
                <Link href="/all-tools/pdf/pdf-to-word" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                  <span className="text-purple-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-purple-600">PDF to Word Converter</span>
                </Link>
              </div>
            </div>
          </section>

          <FAQ
            items={[
              {
                name: 'Are all PDF tools really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The PDF utilities on this category page are available without a Premium AI Studio credit purchase. Individual tools can still enforce file-size, page-count, or rate limits.'
                }
              },
              {
                name: 'Do I need to install software to use PDF tools?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No installation is required to access the PDF tools. Check the individual tool page for its supported inputs and processing requirements.'
                }
              },
              {
                name: 'Is my data safe when using SimplifyConvert PDF tools?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PDF files are sent over HTTPS for server processing. Temporary working files are cleaned during the request, and standard generated download results normally expire after about 30 minutes.'
                }
              },
            ]}
            colorClass="purple"
            bgColor="white"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
