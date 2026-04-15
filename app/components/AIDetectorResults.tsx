'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, ThumbsUp, ThumbsDown, Zap, TrendingUp } from 'lucide-react';

interface AIDetectorResult {
  likelihood: 'likely-ai' | 'likely-human' | 'mixed';
  confidence: number;
  metrics: {
    wordCount: number;
    uniqueWordsRatio: number;
    avgWordLength: number;
    entropy: number;
    avgSentenceLength: number;
    repeatPhraseRatio: number;
  };
  analysis: {
    reasoning: string[];
    statisticalScore: number;
    linguisticScore: number;
    consistencyScore: number;
  };
}

interface AIDetectorResultsProps {
  result: AIDetectorResult;
  inputText: string;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

export default function AIDetectorResults({
  result,
  inputText,
  onCopy,
  onDownload,
  copied,
}: AIDetectorResultsProps) {
  // Calculate AI percentage based on actual likelihood and confidence
  let aiPercent = 0;
  
  if (result.likelihood === 'likely-ai') {
    aiPercent = result.confidence; // Use actual confidence for AI
  } else if (result.likelihood === 'likely-human') {
    aiPercent = 100 - result.confidence; // Invert for human-written
  } else {
    // For mixed, use the statistical score to determine lean
    aiPercent = Math.round(result.analysis.statisticalScore * 100);
  }

  const humanPercent = 100 - aiPercent;

  const getVerdictColor = () => {
    if (aiPercent > 60) {
      return { bg: 'from-orange-500 to-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' };
    } else if (aiPercent < 40) {
      return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' };
    }
    return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' };
  };

  const verdict = getVerdictColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      {/* Premium Header */}
      <div className={`bg-gradient-to-r ${verdict.bg} px-8 py-8 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analysis Results</h2>
            <p className="text-white/80 text-sm">{result.metrics.wordCount} words analyzed</p>
          </div>
          <Zap className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="p-8 grid md:grid-cols-2 gap-12">
        {/* Left Column - Analyzed Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Analyzed Text</h3>
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 max-h-80 overflow-y-auto border border-gray-200 shadow-inner">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{inputText}</p>
          </div>
        </motion.div>

        {/* Right Column - Main Verdict */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Circular Progress */}
          <div className="relative mb-6">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                stroke={aiPercent > 60 ? '#f59e0b' : aiPercent < 40 ? '#10b981' : '#3b82f6'}
                strokeDasharray={`${(aiPercent / 100) * 565.5} 565.5`}
                initial={{ strokeDasharray: '0 565.5' }}
                animate={{ strokeDasharray: `${(aiPercent / 100) * 565.5} 565.5` }}
                transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Center Percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-gray-900">{Math.round(aiPercent)}<span className="text-2xl">%</span></div>
              </motion.div>
            </div>
          </div>

          {/* Verdict Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-gray-600 text-sm mb-1">Likely</p>
            <p className={`text-2xl font-bold ${verdict.text}`}>
              {aiPercent > 60
                ? 'AI-Generated'
                : aiPercent < 40
                ? 'Human-Written'
                : 'Mixed Signals'}
            </p>
          </motion.div>

          {/* Distribution Bars - Compact */}
          <div className="w-full mt-8 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">AI-generated</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(aiPercent)}%</span>
              </div>
              <motion.div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${aiPercent}%` }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                />
              </motion.div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-600">Human-written</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(humanPercent)}%</span>
              </div>
              <motion.div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${humanPercent}%` }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main AI Contributors Section */}
      <div className="border-t border-gray-200 px-8 py-8 bg-gradient-to-br from-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              ⚡
            </span>
            Main AI Contributors
          </h3>
          <p className="text-sm text-gray-600 mb-6">Analysis breakdown showing key detection indicators</p>

          <div className="space-y-3">
            {result.analysis.reasoning.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.08 }}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  reason.includes('✓')
                    ? 'bg-green-50 border-l-green-500 border border-green-100'
                    : reason.includes('⚠')
                    ? 'bg-amber-50 border-l-amber-500 border border-amber-100'
                    : 'bg-blue-50 border-l-blue-500 border border-blue-100'
                }`}
              >
                <p className="text-sm text-gray-700 flex items-start gap-3">
                  <span
                    className={`font-bold flex-shrink-0 text-lg ${
                      reason.includes('✓')
                        ? 'text-green-600'
                        : reason.includes('⚠')
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {reason.includes('✓')
                      ? '✓'
                      : reason.includes('⚠')
                      ? '⚠'
                      : '→'}
                  </span>
                  <span>{reason.replace(/^[✓⚠]/g, '').trim()}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics Section */}
      <div className="border-t border-gray-200 px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Detailed Metrics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Word Count', value: result.metrics.wordCount, unit: '' },
              { label: 'Unique Words', value: (result.metrics.uniqueWordsRatio * 100).toFixed(1), unit: '%' },
              { label: 'Avg Word Length', value: result.metrics.avgWordLength.toFixed(1), unit: 'chars' },
              { label: 'Vocab Entropy', value: result.metrics.entropy.toFixed(2), unit: '' },
              { label: 'Sentence Length', value: result.metrics.avgSentenceLength.toFixed(1), unit: 'words' },
              { label: 'Phrase Repetition', value: (result.metrics.repeatPhraseRatio * 100).toFixed(2), unit: '%' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detection Scores */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Detection Scores</p>
            {[
              { label: 'Statistical Pattern', score: result.analysis.statisticalScore, color: 'bg-blue-600' },
              { label: 'Linguistic Markers', score: result.analysis.linguisticScore, color: 'bg-purple-600' },
              { label: 'Consistency Score', score: result.analysis.consistencyScore, color: 'bg-indigo-600' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {(item.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, item.score * 100)}%` }}
                    transition={{ delay: 0.8 + idx * 0.1 + 0.2, duration: 0.8 }}
                    className={`${item.color} h-2.5 rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 flex gap-2 flex-wrap sm:flex-nowrap">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCopy}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <Copy size={18} />
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Results'}</span>
          <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDownload}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Download</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#d1fae5' }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 bg-white border-2 border-gray-300 hover:border-green-400 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
          title="Mark as helpful"
        >
          <ThumbsUp size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 bg-white border-2 border-gray-300 hover:border-red-400 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
          title="Mark as not helpful"
        >
          <ThumbsDown size={18} />
        </motion.button>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-200 px-8 py-6 bg-amber-50/50">
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="text-amber-950">⚠ Disclaimer:</strong> This analysis is probabilistic and not definitive. AI detection accuracy varies by text domain, writing style, and generation model used.
        </p>
      </div>
    </motion.div>
  );
}
