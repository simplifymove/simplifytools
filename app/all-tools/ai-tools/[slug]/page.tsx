'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, RefreshCw, Download, ArrowLeft, Loader, ChevronRight, Zap, Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getToolById } from '@/app/lib/ai-tools';
import { getAiToolFaqs } from '@/app/lib/ai-tool-faqs';
import type { AIWriteTool } from '@/app/lib/ai-tools';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import AIDetectorResults from '@/app/components/AIDetectorResults';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { uploadBrowserTextDownloadResult } from '@/app/lib/download-result-client';

/**
 * URL aliases for AI tools (must match layout.tsx aliases)
 */
const toolAliases: Record<string, string> = {
  'summarizer': 'content-summarizer',
  'email-writer': 'cold-email-writer',
  'blog-generator': 'blog-post-generator',
  'social-media-writer': 'instagram-caption-generator',
  'social-media': 'instagram-caption-generator',
  'social': 'instagram-caption-generator',
};

/**
 * Resolve tool slug to actual tool ID
 */
function resolveToolId(slug: string): string {
  const directTool = getToolById(slug);
  if (directTool) {
    return slug;
  }
  
  const aliasedId = toolAliases[slug];
  if (aliasedId) {
    const aliasTool = getToolById(aliasedId);
    if (aliasTool) {
      return aliasedId;
    }
  }
  
  return '';
}

// Action-specific CTA text for each tool
function getActionText(toolId: string): string {
  const actionMap: Record<string, string> = {
    'paragraph-writer': 'Write Paragraph',
    'content-improver': 'Improve Content',
    'content-summarizer': 'Summarize Content',
    'grammar-fixer': 'Fix Grammar',
    'translate': 'Translate',
    'blog-post-generator': 'Generate Blog Post',
    'faq-generator': 'Generate FAQs',
    'article-writer': 'Write Article',
    'article-rewriter': 'Rewrite Article',
    'blog-rewriter': 'Rewrite Blog',
    'email-writer': 'Write Email',
    'essay-writer': 'Write Essay',
    'story-generator': 'Generate Story',
    'poem-generator': 'Create Poem',
    'product-description-writer': 'Write Description',
    'cover-letter-writer': 'Write Cover Letter',
    'sentence-rewriter': 'Rewrite Sentence',
    'social-media-writer': 'Create Post',
    'facebook-post-generator': 'Generate Post',
    'instagram-caption-generator': 'Create Caption',
    'linkedin-post-generator': 'Generate Post',
    'twitter-generator': 'Create Tweet',
    'youtube-title-generator': 'Generate Title',
    'youtube-description-generator': 'Generate Description',
    'tiktok-caption-generator': 'Create Caption',
    'cold-email-writer': 'Write Email',
    'question-generator': 'Generate Questions',
    'outline-generator': 'Generate Outline',
    'title-rewriter': 'Rewrite Title',
    'tone-of-voice': 'Change Tone',
    'text-expander': 'Expand Text',
  };

  return actionMap[toolId] || 'Generate Content';
}

type ToolSeoContent = {
  introduction: string;
  useCases: string[];
  examples: Array<{ label: string; input: string; output: string }>;
};

const topToolSeoContent: Record<string, ToolSeoContent> = {
  'paragraph-writer': {
    introduction: 'The Paragraph Writer helps turn a topic, title, or rough idea into a clear paragraph that is ready to review and adapt. It is useful when you need a polished starting point for essays, articles, landing pages, reports, or everyday writing.',
    useCases: ['Draft essay body paragraphs from a topic sentence', 'Create article sections when you know the key idea', 'Write product, service, or feature explanations', 'Turn brief notes into readable prose'],
    examples: [
      {
        label: 'Topic to paragraph',
        input: 'Benefits of remote work for small businesses',
        output: 'Remote work can help small businesses reduce overhead, hire from a wider talent pool, and give employees more flexibility while maintaining productivity.',
      },
    ],
  },
  'content-improver': {
    introduction: 'The Content Improver rewrites existing text to make it clearer, smoother, and easier to read while preserving the original meaning. It is designed for drafts that already have the right ideas but need stronger structure, tone, or wording.',
    useCases: ['Polish blog drafts before publishing', 'Improve emails, reports, and proposals', 'Make rough notes sound more professional', 'Improve readability without changing the core message'],
    examples: [
      {
        label: 'Rough draft to polished copy',
        input: 'Our app helps teams do work better and faster with less confusion.',
        output: 'Our app helps teams work faster, stay aligned, and reduce confusion across everyday projects.',
      },
    ],
  },
  'content-summarizer': {
    introduction: 'The Content Summarizer condenses longer text into a shorter version that keeps the most important ideas. Use it to understand lengthy articles, documents, research notes, transcripts, or internal updates faster.',
    useCases: ['Summarize articles before sharing them', 'Extract key points from meeting notes', 'Condense research material for review', 'Create quick summaries for emails or reports'],
    examples: [
      {
        label: 'Long text to key summary',
        input: 'A 1,200-word article about how remote teams manage async communication.',
        output: 'Remote teams work best when they document decisions, set response expectations, and reserve meetings for complex discussions.',
      },
    ],
  },
  'grammar-fixer': {
    introduction: 'The Grammar Fixer checks text for grammar, spelling, punctuation, and clarity issues. It helps clean up drafts while keeping your intended meaning intact.',
    useCases: ['Fix emails before sending', 'Clean up essays and assignments', 'Correct grammar in blog or website copy', 'Improve punctuation and sentence flow'],
    examples: [
      {
        label: 'Grammar correction',
        input: 'Their is many reason why this feature are useful.',
        output: 'There are many reasons why this feature is useful.',
      },
    ],
  },
  'translate': {
    introduction: 'The Translate tool converts text into another language for quick drafts, localization checks, and everyday communication. It is most useful when paired with human review for important, technical, legal, or brand-sensitive content.',
    useCases: ['Translate short messages or support replies', 'Create first-draft localized content', 'Understand text written in another language', 'Prepare multilingual social or marketing copy'],
    examples: [
      {
        label: 'English to Spanish',
        input: 'Thank you for your order. We will send tracking details soon.',
        output: 'Gracias por su pedido. Enviaremos los detalles de seguimiento pronto.',
      },
    ],
  },
  'blog-post-generator': {
    introduction: 'The Blog Post Generator creates a structured draft from a topic, keywords, audience, and tone. It is built to help you move from idea to editable article faster, not to replace editorial review.',
    useCases: ['Draft SEO blog posts from a target topic', 'Create article sections for a content calendar', 'Generate first drafts for educational content', 'Turn outlines into readable articles'],
    examples: [
      {
        label: 'Topic to blog draft',
        input: 'How small businesses can improve local SEO',
        output: 'A structured article covering Google Business Profile, local keywords, reviews, location pages, and measurement tips.',
      },
    ],
  },
  'faq-generator': {
    introduction: 'The FAQ Generator creates question-and-answer sections for products, services, guides, landing pages, and help-center articles. It helps cover common objections and support questions before users need to ask.',
    useCases: ['Create FAQs for product pages', 'Draft help-center question sets', 'Add support content to landing pages', 'Turn documentation topics into Q&A format'],
    examples: [
      {
        label: 'Topic to FAQ',
        input: 'Online invoice generator for freelancers',
        output: 'Questions about pricing, data privacy, exporting invoices, tax fields, payment terms, and client sharing.',
      },
    ],
  },
  'word-counter': {
    introduction: 'The Word Counter measures text length and readability signals so you can check whether a draft fits a limit or needs editing. It is useful for essays, social posts, meta copy, articles, and any writing with length constraints.',
    useCases: ['Check essay or assignment length', 'Review social post character counts', 'Measure article draft size', 'Compare short and long versions of copy'],
    examples: [
      {
        label: 'Text measurement',
        input: 'Paste a product description or article draft.',
        output: 'Word count, character count, and readability-style metrics for quick review.',
      },
    ],
  },
  'sentence-rewriter': {
    introduction: 'The Sentence Rewriter creates clearer alternatives for individual sentences. It is best for fixing awkward phrasing, reducing repetition, or changing sentence style without rewriting an entire document.',
    useCases: ['Rewrite awkward sentences', 'Make a sentence more concise', 'Create clearer alternatives for headlines or intros', 'Adjust tone one sentence at a time'],
    examples: [
      {
        label: 'Sentence rewrite',
        input: 'This solution is something that can help teams in a way that saves time.',
        output: 'This solution helps teams save time.',
      },
    ],
  },
  'paragraph-rewriter': {
    introduction: 'The Paragraph Rewriter refreshes a full paragraph while keeping its main idea. It helps improve flow, reduce repetition, and create a cleaner version of text that already has the right direction.',
    useCases: ['Rewrite paragraphs for clarity', 'Refresh duplicated or stale copy', 'Improve transitions and flow', 'Adapt paragraph tone for a different audience'],
    examples: [
      {
        label: 'Paragraph rewrite',
        input: 'A rough paragraph explaining why a new feature helps customers save time.',
        output: 'A clearer version that explains the benefit, removes repetition, and connects the idea to the reader.',
      },
    ],
  },
};

export default function AIWriteToolPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string | undefined) ?? '';

  const [tool, setTool] = useState<AIWriteTool | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string | any>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load tool configuration with alias resolution
  useEffect(() => {
    const resolvedToolId = resolveToolId(slug);
    if (resolvedToolId) {
      const loadedTool = getToolById(resolvedToolId);
      if (loadedTool) {
        setTool(loadedTool);
        // Initialize inputs with default values
        const defaultInputs: Record<string, any> = {};
        loadedTool.fields.forEach(field => {
          if (field.type === 'select' && field.options) {
            defaultInputs[field.name] = field.options[0]?.value || '';
          } else {
            defaultInputs[field.name] = '';
          }
        });
        setInputs(defaultInputs);
      }
    }
  }, [slug]);

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          inputs,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || 'Failed to generate content');
      } else {
        // Store result - could be string or object
        setResult(data.result);
        if (data.meta?.usingMock) {
          setError('Note: Using mock response. Add GROQ_API_KEY to .env.local to enable real AI generation.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = async () => {
    if (!tool) return;

    const textToDownload = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const outputName = `${tool.id}.txt`;

    try {
      const download = await uploadBrowserTextDownloadResult({
        text: textToDownload,
        toolSlug: tool.id,
        originalName: outputName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/all-tools/ai-tools" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Write Tools
          </Link>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Writing Tool Not Found</h1>
            <p className="text-lg text-gray-600">The requested AI writing tool could not be found.</p>
          </div>
        </div>
      </main>
    );
  }

  const seoContent = topToolSeoContent[tool.id];
  const faqItems = getAiToolFaqs(tool.id);

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
        >
          <Link href="/" className="hover:opacity-80">Home</Link>
          <ChevronRight size={16} />
          <Link href="/all-tools/ai-tools" className="hover:opacity-80">AI Write</Link>
          <ChevronRight size={16} />
          <span className="opacity-90">{tool.title}</span>
        </motion.div>

        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✍️</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
              <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#B90A45' }}>
                  {tool.category}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`max-w-7xl mx-auto grid gap-8 ${slug === 'ai-detector' ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}
        >
          {/* Left Column - Generate Form (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={slug === 'ai-detector' ? 'md:col-span-2' : 'md:col-span-1'}
          >
            <div className="sticky top-4 space-y-6">
              {/* Input Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Input Fields */}
                  <div className="space-y-4">
                    {tool.fields.map(field => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'textarea' && (
                          <textarea
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.validation?.maxLength}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                            rows={slug === 'ai-detector' ? 12 : 3}
                          />
                        )}

                        {field.type === 'text' && (
                          <input
                            type="text"
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.validation?.maxLength}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                          >
                            {field.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.validation?.maxLength && (
                          <p className="text-xs text-gray-500 mt-1">
                            {inputs[field.name]?.length || 0} / {field.validation.maxLength}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && !error.includes('Note:') && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        {tool ? getActionText(tool.id) : 'Generate'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Output & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={slug === 'ai-detector' ? 'md:col-span-3 space-y-6' : 'md:col-span-2 space-y-6'}
          >
            {/* Info Box */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {tool.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Category: {tool.category}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Quick & Easy</span>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {slug === 'ai-detector' ? 'Detection Results' : 'Output'}
                  </h2>
                </div>

                {error && error.includes('Note:') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
                    {error}
                  </div>
                )}

                {/* AI Detector Custom Display */}
                {slug === 'ai-detector' && typeof result === 'object' && result.likelihood ? (
                  <AIDetectorResults
                    result={result}
                    inputText={inputs.inputText || ''}
                    onCopy={copyToClipboard}
                    onDownload={downloadResult}
                    copied={copied}
                  />
                ) : tool.outputFormat === 'json' ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono text-gray-800 mb-4">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-auto whitespace-pre-wrap text-gray-800 leading-relaxed mb-4">
                    {result}
                  </div>
                )}

                {slug !== 'ai-detector' && (
                  <div className="flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium duration-0 flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={downloadResult}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium duration-0 flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to generate</h3>
                <p className="text-gray-600">Fill in the form and click Generate to see the result here</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Generation',
                description: 'Get AI-powered suggestions instantly with advanced algorithms',
              },
              {
                icon: Shield,
                title: 'Privacy & Security',
                description: 'Your content is processed securely. Always review and edit AI-generated content before use. Keep your originals safe.',
              },
              {
                icon: CheckCircle,
                title: 'Professional Quality',
                description: 'AI-assisted content designed to help with your writing workflow',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <feature.icon size={24} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SEO Content Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="max-w-4xl mx-auto mt-24 space-y-16">
          {seoContent && (
            <>
              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What is {tool.title}?</h2>
                <p className="text-gray-700 leading-relaxed">{seoContent.introduction}</p>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases for {tool.title}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {seoContent.useCases.map((useCase, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm">{useCase}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{tool.title} Examples</h2>
                <div className="space-y-6">
                  {seoContent.examples.map((example, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">{example.label}</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Example input</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{example.input}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Example output</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{example.output}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* How-To Guide Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to {getActionText(tool.id)}</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>Fill in your details:</strong> Enter the required information in the fields on the left. Be specific for better results.
              </li>
              <li className="text-gray-700">
                <strong>Click {getActionText(tool.id)}:</strong> Hit the button to generate your content with AI assistance.
              </li>
              <li className="text-gray-700">
                <strong>Review the output:</strong> Carefully read the generated content. AI output requires human review and editing.
              </li>
              <li className="text-gray-700">
                <strong>Edit and refine:</strong> Make adjustments to match your exact needs and voice before using the final content.
              </li>
            </ol>
          </section>

          {/* Why Use Section */}
          <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use {tool.title}?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Save Time',
                  description: 'Reduce time spent on initial drafts. AI assistance helps you work faster.'
                },
                {
                  title: 'Overcome Writer\'s Block',
                  description: 'Get inspired with AI suggestions when you\'re stuck on what to write next.'
                },
                {
                  title: 'Quality First Draft',
                  description: 'Use as a starting point that you can edit and customize for your needs.'
                },
                {
                  title: 'Free to Use',
                  description: 'No credit card required. Test our AI writing tools completely free.'
                }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-700 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools Section */}
          <RelatedToolsSection
            family="ai"
            toolId={tool.id}
            limit={8}
            description="Explore other AI writing tools to complement your workflow:"
          />

          {/* Important Notice - AI Trust & Usage Guidelines */}
          <section className="bg-amber-50 rounded-xl border border-amber-200 p-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important: Using AI Writing Tools Responsibly</h3>
                <ul className="text-amber-900 text-sm space-y-2 list-disc list-inside">
                  <li>AI content requires human review and editing before publication or submission</li>
                  <li>Do not claim AI-generated content as entirely your own without proper disclosure when required</li>
                  <li>Verify facts and claims - AI can make mistakes or hallucinate information</li>
                  <li>Follow your institution's or organization's AI usage policies</li>
                  <li>For academic work, check guidelines on AI tool usage before using output</li>
                  <li>Keep your original work and AI-generated versions distinct</li>
                </ul>
              </div>
            </div>
          </section>
        </motion.div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
