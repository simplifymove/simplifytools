'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { aiWriteTools, type ToolCategory } from '@/app/lib/ai-tools';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';

const categoryLabels: Record<ToolCategory, string> = {
  generate: '✨ Generate',
  rewrite: '✏️ Rewrite & Improve',
  summarize: '📝 Summarize',
  business: '💼 Business & Legal',
  social: '🌐 Social Media',
  utility: '🔧 Utilities',
};

interface CategoryColorConfig {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  hoverColor: string;
}

const categoryColors: Record<ToolCategory, CategoryColorConfig> = {
  generate: { gradient: 'from-purple-600 to-purple-700', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', hoverColor: '#7c3aed' },
  rewrite: { gradient: 'from-blue-600 to-blue-700', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', hoverColor: '#2563eb' },
  summarize: { gradient: 'from-orange-600 to-orange-700', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', hoverColor: '#ea580c' },
  business: { gradient: 'from-green-600 to-green-700', badgeBg: 'bg-green-100', badgeText: 'text-green-700', hoverColor: '#16a34a' },
  social: { gradient: 'from-pink-600 to-pink-700', badgeBg: 'bg-pink-100', badgeText: 'text-pink-700', hoverColor: '#db2777' },
  utility: { gradient: 'from-slate-600 to-slate-700', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', hoverColor: '#475569' },
};

export default function AIWriteToolsPage() {
  const categories = useMemo(() => {
    const grouped: Record<ToolCategory, typeof aiWriteTools> = {
      generate: {},
      rewrite: {},
      summarize: {},
      business: {},
      social: {},
      utility: {},
    };

    Object.entries(aiWriteTools).forEach(([id, tool]) => {
      grouped[tool.category][id] = tool;
    });

    return grouped;
  }, []);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>AI Writing Tools</span>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
              Free AI Writing Tools Online
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              AI-assisted tools for drafting, rewriting, summarizing, and analyzing text. Generated output can be incomplete or inaccurate, so review it before use.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(categories).map(([category, tools], catIndex) => {
          if (Object.keys(tools).length === 0) return null;

          const categoryKey = category as ToolCategory;
          const colors = categoryColors[categoryKey];

          return (
            <motion.div 
              key={category} 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-8`}>
                {categoryLabels[categoryKey]}
              </h2>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
              >
                {Object.entries(tools).map(([id, tool], idx) => {
                  const colors = categoryColors[tool.category];
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Link href={`/all-tools/ai-tools/${id}`}>
                        <motion.div 
                          className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all group border-2 border-gray-100 hover:border-gray-200 overflow-hidden cursor-pointer"
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Card Content */}
                          <div className="p-6 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:opacity-80 transition line-clamp-2">
                                  {tool.title}
                                </h3>
                              </div>
                              <motion.div
                                className="ml-2 text-gray-300 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                whileHover={{ x: 2 }}
                                style={{ color: colors.hoverColor }}
                              >
                                <ChevronRight size={20} />
                              </motion.div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                              {tool.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
                                {categoryLabels[tool.category].split(' ').pop()}
                              </span>

                              <motion.div
                                className="flex items-center gap-1 font-medium text-sm group-hover:opacity-100 opacity-75 transition-opacity"
                                whileHover={{ gap: 8 }}
                                style={{ color: colors.hoverColor }}
                              >
                                Use tool
                                <ChevronRight size={16} />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* SEO Content Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose an AI Tool by Writing Task</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Generation tools draft new text from instructions, rewriting tools transform existing text, and summarizers shorten a source. Utility tools such as word counting use different methods. AI output is a starting point: verify facts, citations, tone, originality, and suitability for your audience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Separate from Premium AI Studio</h3>
                <p className="text-gray-700 text-sm">These category utilities are distinct from the account-based, credit-priced Premium AI Studio shown elsewhere on the site.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Installation</h3>
                <p className="text-gray-700 text-sm">These tools are accessed through the website and do not require a separate application installation. Browser and device compatibility can vary.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Provider-Dependent Responses</h3>
                <p className="text-gray-700 text-sm">Response time and availability depend on request length, provider capacity, and the selected task. Retry or narrow the prompt if a request fails.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Secure & Private</h3>
                <p className="text-gray-700 text-sm">Most AI inputs are sent over HTTPS to the server and may be handled by an AI provider. Do not submit confidential, regulated, or credential-bearing content.</p>
              </div>
            </div>

            {/* Popular AI Tools - Internal Linking Section */}
            <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular AI Writing Tools</h2>
              <p className="text-gray-700 mb-6">Quick access to several AI content generation and writing tools:</p>
              <div className="space-y-3">
                <Link href="/all-tools/ai-tools/blog-post-generator" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-blue-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-blue-600">Blog Generator - Create a blog-post draft</span>
                </Link>
                <Link href="/all-tools/ai-tools/cold-email-writer" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-blue-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-blue-600">Email Composer - Create an email draft</span>
                </Link>
                <Link href="/all-tools/ai-tools/instagram-caption-generator" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-blue-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-blue-600">Social Media Writer - Draft social-media copy</span>
                </Link>
                <Link href="/all-tools/ai-tools/content-summarizer" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-blue-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-blue-600">Summarizer - Create a shorter version of supplied text</span>
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Free AI Writing Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Select a tool for the intended task, provide the minimum source text and context needed, and state audience, tone, or length where supported. After generation, verify factual claims and names, remove unsupported citations, check originality, and edit the result into your own voice.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ
        items={[
          {
            name: 'Are all AI writing tools really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The AI writing utilities in this category are separate from Premium AI Studio credits. Availability and rate limits can vary by tool and provider capacity.'
            }
          },
          {
            name: 'What can I create with free AI writing tools?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can generate blog posts, emails, social media content, product descriptions, summaries, rewrites, paragraphs, and much more. Our AI content generator supports six categories: Generate, Rewrite & Improve, Summarize, Business & Legal, Social Media, and Utilities.'
            }
          },
          {
            name: 'Do I need to sign up to use the AI writer?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The AI writing utilities in this category can currently be used without creating an account. Select a tool, provide the requested input, and submit the request. Availability and response time can vary by tool and provider capacity.'
            }
          },
          {
            name: 'Is my content safe and private?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most AI inputs are sent over HTTPS to the server and may be handled by an AI provider. Do not submit confidential, regulated, or credential-bearing content; review the Privacy Policy for more detail.'
            }
          },
          {
            name: 'Can I use AI writing tools on mobile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The AI writing tools are available through the website and can be accessed from supported mobile browsers. Layout, browser compatibility, and provider availability can vary by device.'
            }
          },
          {
            name: 'Which AI writing tools can I start with?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can start with tools such as Blog Generator, Email Composer, Social Media Writer, or Summarizer depending on the task. Generated content should be reviewed for factual accuracy, tone, originality, and suitability before use.'
            }
          }
        ]}
        colorClass="blue"
        bgColor="white"
      />

      {/* Breadcrumb + Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://simplifyconvert.com'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'All Tools',
              item: 'https://simplifyconvert.com/all-tools'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'AI Writing Tools',
              item: 'https://simplifyconvert.com/all-tools/ai-tools'
            }
          ]
        })}
      </script>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Try an AI Writing Tool?
          </h2>
          <p className="text-lg text-white/90 mb-2">
            Choose any tool above and start generating professional content in seconds.
          </p>
          <p className="text-sm text-white/80">
            💡 All tools use our shared AI engine for consistent, high-quality results
          </p>
        </div>
      </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}



