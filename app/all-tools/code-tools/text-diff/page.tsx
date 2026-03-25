'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { ChevronRight, Upload, Play, Loader2, Copy, Download, Trash2, Share2, Lightbulb, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DiffResult {
  valid: boolean;
  message: string;
  meta: {
    identical: boolean;
    changes: number;
    lines1: number;
    lines2: number;
    added: number[];
    removed: number[];
    modified: { line1: number; line2: number }[];
  };
}

export default function TextDiffPage() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setText: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleFindDifference = async () => {
    if (!text1.trim() || !text2.trim()) {
      setError('Please enter text in both fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'text-diff',
          input: text1,
          options: { text2 },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Comparison failed');
        return;
      }

      console.log('Diff Result:', data.result);
      setDiffResult(data.result);
      setSuccess('✓ Comparison complete');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText1('');
    setText2('');
    setDiffResult(null);
    setError('');
    setSuccess('');
  };

  const handleExportPDF = () => {
    if (!diffResult) {
      setError('Please run comparison first');
      return;
    }
    
    try {
      const pdf = new jsPDF();
      let yPosition = 10;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 10;
      const maxWidth = 190;
      const lineHeight = 7;

      // Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Text Diff Comparison Report', marginLeft, yPosition);
      yPosition += 15;

      // Summary
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary:', marginLeft, yPosition);
      yPosition += 7;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const summaryText = [
        `Total Changes: ${diffResult.meta.changes}`,
        `Added Lines: ${Array.isArray(diffResult.meta.added) ? diffResult.meta.added.length : 0}`,
        `Removed Lines: ${Array.isArray(diffResult.meta.removed) ? diffResult.meta.removed.length : 0}`,
        `Modified Lines: ${Array.isArray(diffResult.meta.modified) ? diffResult.meta.modified.length : 0}`,
      ];

      summaryText.forEach((text) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 10;
        }
        pdf.text(text, marginLeft, yPosition);
        yPosition += 7;
      });

      // Original Text
      yPosition += 5;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Original Text:', marginLeft, yPosition);
      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const originalLines = text1.split('\n').slice(0, 10); // Limit to first 10 lines
      originalLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 10;
        }
        const wrappedText = pdf.splitTextToSize(line, maxWidth);
        pdf.text(wrappedText, marginLeft, yPosition);
        yPosition += lineHeight * wrappedText.length;
      });

      // Changed Text
      yPosition += 5;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Changed Text:', marginLeft, yPosition);
      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const changedLines = text2.split('\n').slice(0, 10); // Limit to first 10 lines
      changedLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 10;
        }
        const wrappedText = pdf.splitTextToSize(line, maxWidth);
        pdf.text(wrappedText, marginLeft, yPosition);
        yPosition += lineHeight * wrappedText.length;
      });

      pdf.save('diff-comparison.pdf');
      setSuccess('✓ Exported as PDF');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to export PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleExportExcel = () => {
    if (!diffResult) {
      setError('Please run comparison first');
      return;
    }
    // CSV export (Excel compatible)
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    let csv = 'Line,Original Text,Changed Text,Status\n';
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const removed = Array.isArray(diffResult.meta.removed) ? diffResult.meta.removed : [];
    const added = Array.isArray(diffResult.meta.added) ? diffResult.meta.added : [];
    
    for (let i = 0; i < maxLines; i++) {
      const status = removed.includes(i + 1) ? 'Removed' : 
                    added.includes(i + 1) ? 'Added' :
                    lines1[i] !== lines2[i] ? 'Modified' : 'Same';
      csv += `${i + 1},"${(lines1[i] || '').replace(/"/g, '""')}","${(lines2[i] || '').replace(/"/g, '""')}","${status}"\n`;
    }
    
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'diff-comparison.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setSuccess('✓ Exported as Excel');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSave = () => {
    if (!diffResult) {
      setError('Please run comparison first');
      return;
    }
    const data = { text1, text2, diffResult, timestamp: new Date().toISOString() };
    localStorage.setItem('textDiffComparison', JSON.stringify(data));
    setSuccess('✓ Saved to browser storage');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleShare = () => {
    if (!diffResult) {
      setError('Please run comparison first');
      return;
    }
    const shareData = btoa(JSON.stringify({ text1, text2 }));
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${shareData}`;
    navigator.clipboard.writeText(shareUrl);
    setSuccess('✓ Share link copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleExplain = () => {
    if (!diffResult) {
      setError('Please run comparison first');
      return;
    }
    alert(`Comparison Summary:\n\nTotal Changes: ${diffResult.meta.changes}\nAdded Lines: ${diffResult.meta.added.length}\nRemoved Lines: ${diffResult.meta.removed.length}\nModified Lines: ${diffResult.meta.modified.length}\n\nThis diff shows the differences between your two text inputs. Red background indicates removed lines, green indicates added lines, and yellow indicates modified lines.`);
  };

  // Simple word-level diff - split into words and mark differences
  const getWordDifferences = (str1: string, str2: string) => {
    const words1 = str1.split(/\b/).filter(w => w.length > 0);
    const words2 = str2.split(/\b/).filter(w => w.length > 0);
    
    const result: { type: 'equal' | 'removed' | 'added'; value: string }[] = [];
    
    let i = 0, j = 0;
    while (i < words1.length || j < words2.length) {
      // If words match, add as equal
      if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
        result.push({ type: 'equal', value: words1[i] });
        i++;
        j++;
      }
      // If one list is exhausted
      else if (i >= words1.length) {
        result.push({ type: 'added', value: words2[j] });
        j++;
      }
      else if (j >= words2.length) {
        result.push({ type: 'removed', value: words1[i] });
        i++;
      }
      // Try to find matching words ahead
      else {
        let found1 = -1, found2 = -1;
        
        // Look for words1[i] in upcoming words2
        for (let k = j; k < Math.min(j + 3, words2.length); k++) {
          if (words1[i] === words2[k]) {
            found1 = k;
            break;
          }
        }
        
        // Look for words2[j] in upcoming words1
        for (let k = i; k < Math.min(i + 3, words1.length); k++) {
          if (words2[j] === words1[k]) {
            found2 = k;
            break;
          }
        }
        
        // Prefer closer matches and handle accordingly
        if (found1 !== -1 && (found2 === -1 || found1 - j <= found2 - i)) {
          result.push({ type: 'removed', value: words1[i] });
          i++;
        } else if (found2 !== -1) {
          result.push({ type: 'added', value: words2[j] });
          j++;
        } else {
          result.push({ type: 'removed', value: words1[i] });
          i++;
          result.push({ type: 'added', value: words2[j] });
          j++;
        }
      }
    }
    
    return result;
  };

  const renderTextWithLineNumbers = (text: string, isOriginal: boolean) => {
    const lines = text.split('\n');
    const otherText = isOriginal ? text2 : text1;
    const otherLines = otherText.split('\n');

    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const isRemoved =
        Array.isArray(diffResult?.meta.removed) && diffResult?.meta.removed.includes(lineNum);
      const isAdded =
        Array.isArray(diffResult?.meta.added) && diffResult?.meta.added.includes(lineNum);
      
      // Check if line is modified
      let isModified = Array.isArray(diffResult?.meta.modified) &&
        diffResult?.meta.modified.some((m) =>
          isOriginal ? m.line1 === lineNum : m.line2 === lineNum
        );
      
      // Also check if this line simply differs from the corresponding line
      if (!isModified && idx < otherLines.length && line !== otherLines[idx]) {
        isModified = true;
      }

      let lineClass = '';
      if (isRemoved) lineClass = 'bg-red-200 border-l-4 border-red-600';
      else if (isAdded) lineClass = 'bg-green-200 border-l-4 border-green-600';
      else if (isModified) lineClass = 'bg-yellow-200 border-l-4 border-yellow-600';

      return (
        <div key={idx} className={`flex ${lineClass} hover:bg-opacity-75 transition`}>
          <div className="w-12 flex-shrink-0 bg-gray-100 text-gray-600 text-right pr-4 py-1 font-mono text-xs border-r border-gray-300 select-none">
            {lineNum}
          </div>
          <div className="flex-1 px-4 py-1 font-mono text-sm text-gray-800 break-words whitespace-pre-wrap">
            {line || '\u00A0'}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-white text-sm mb-6"
              >
                <Link href="/" className="hover:opacity-80">
                  Home
                </Link>
                <ChevronRight size={16} />
                <Link href="/all-tools/code-tools" className="hover:opacity-80">
                  Code Tools
                </Link>
                <ChevronRight size={16} />
                <span className="opacity-90">Text Diff Checker</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📋 Text Diff Checker</h1>
                <p className="text-white text-lg opacity-95">Compare and highlight differences between two texts</p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {/* Side by side comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Original Text */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Original text</h2>
                    <button
                      onClick={() => fileInput1Ref.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      <Upload size={16} />
                      Open file
                    </button>
                    <input
                      ref={fileInput1Ref}
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(e, setText1)}
                      accept=".txt,.md,.csv,.json,.xml,.html,.js,.ts,.py,.java,.cpp,.cs"
                    />
                  </div>

                  <div className="p-4">
                    <textarea
                      value={text1}
                      onChange={(e) => setText1(e.target.value)}
                      placeholder="Paste or upload original text here..."
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </motion.div>

                {/* Changed Text */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Changed text</h2>
                    <button
                      onClick={() => fileInput2Ref.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      <Upload size={16} />
                      Open file
                    </button>
                    <input
                      ref={fileInput2Ref}
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(e, setText2)}
                      accept=".txt,.md,.csv,.json,.xml,.html,.js,.ts,.py,.java,.cpp,.cs"
                    />
                  </div>

                  <div className="p-4">
                    <textarea
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      placeholder="Paste or upload changed text here..."
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6"
                >
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </motion.div>
              )}

              {/* Find Difference Button */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleFindDifference}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Finding differences...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Find difference
                    </>
                  )}
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6"
                >
                  <p className="text-green-700 font-semibold text-sm">{success}</p>
                </motion.div>
              )}

              {/* Action Buttons Toolbar */}
              {diffResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-3 justify-center mb-8 items-center"
                >
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>

                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition">
                      <Download size={16} />
                      Export
                    </button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                      <button
                        onClick={handleExportPDF}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm border-t border-gray-200"
                      >
                        Export as Excel
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition"
                  >
                    <Save size={16} />
                    Save
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                  >
                    <Share2 size={16} />
                    Share
                  </button>

                  <button
                    onClick={handleExplain}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                  >
                    <Lightbulb size={16} />
                    Explain
                  </button>
                </motion.div>
              )}

              {/* Diff Results */}
              {diffResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Summary */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{diffResult.meta.changes ?? 0}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Changes</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{(Array.isArray(diffResult.meta.added) ? diffResult.meta.added.length : diffResult.meta.added) ?? 0}</div>
                        <div className="text-sm text-gray-600 mt-1">Added Lines</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{(Array.isArray(diffResult.meta.removed) ? diffResult.meta.removed.length : diffResult.meta.removed) ?? 0}</div>
                        <div className="text-sm text-gray-600 mt-1">Removed Lines</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{(Array.isArray(diffResult.meta.modified) ? diffResult.meta.modified.length : 0) ?? 0}</div>
                        <div className="text-sm text-gray-600 mt-1">Modified Lines</div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Diff View */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original with highlights */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-50 to-red-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Original text</h3>
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        {renderTextWithLineNumbers(text1, true)}
                      </div>
                    </div>

                    {/* Changed with highlights */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-green-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Changed text</h3>
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        {renderTextWithLineNumbers(text2, false)}
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
