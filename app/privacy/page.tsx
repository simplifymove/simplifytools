'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, FileText, Image, Video, PenTool, Database, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'pdf', title: 'PDF Tools', icon: FileText, color: 'from-purple-500 via-purple-600 to-purple-700', count: '47+', link: '/tools/pdf' },
  { id: 'image', title: 'Image Tools', icon: Image, color: 'from-orange-500 via-orange-600 to-orange-700', count: '30+', link: '/tools?category=Image' },
  { id: 'video', title: 'Video Tools', icon: Video, color: 'from-pink-500 via-pink-600 to-pink-700', count: '10+', link: '/tools?category=video' },
  { id: 'ai', title: 'AI Write', icon: PenTool, color: 'from-blue-500 via-blue-600 to-blue-700', count: '50+', link: '/tools/ai-write' },
  { id: 'data', title: 'Data Conversion', icon: Database, color: 'from-teal-500 via-teal-600 to-teal-700', count: '12', link: '/tools/data' },
  { id: 'code', title: 'Code Tools', icon: FileText, color: 'from-green-500 via-green-600 to-green-700', count: '15+', link: '/tools' }
];

export default function PrivacyPage() {
  const router = useRouter();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/tools?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch((e.target as HTMLInputElement).value);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'When you use SimplifyConvert, we collect certain information to improve your experience. This includes: Device information (browser, operating system), usage data (which tools you use, features accessed), and temporary file data during processing. We do NOT store your uploaded files permanently unless you specifically request it.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to: Improve our services and user experience, troubleshoot technical issues, analyze usage patterns to enhance tools, and ensure security of our platform. Your privacy is our priority, and we never sell user data to third parties.'
    },
    {
      title: '3. Data Security',
      content: 'SimplifyConvert uses industry-standard encryption and security measures to protect your data. All file uploads are transmitted securely, and files are automatically deleted from our servers after processing. We regularly audit our security practices to maintain the highest standards.'
    },
    {
      title: '4. Cookies & Tracking',
      content: 'We use cookies to remember your preferences and improve your experience. These are primarily session cookies that expire when you close your browser. You can disable cookies in your browser settings, though some features may not work optimally.'
    },
    {
      title: '5. Third-Party Services',
      content: 'SimplifyConvert may use third-party services for analytics, hosting, and processing. These services are bound by similar privacy obligations. We never share personal information with third parties without your consent.'
    },
    {
      title: '6. User Rights',
      content: 'You have the right to: Access your personal information, request deletion of your data, opt-out of analytics tracking, and contact us with privacy concerns. We will respond to all requests within 30 days.'
    },
    {
      title: '7. Updates to This Policy',
      content: 'We may update this privacy policy periodically to reflect changes in our practices or applicable laws. We will notify you of significant changes via email or through our platform. Your continued use of SimplifyConvert after updates means you accept the new policy.'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Top Navigation Header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isHeaderScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
            : 'bg-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
              SC
            </div>
            <span className="hidden sm:inline">SimplifyConvert</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* All Tools Dropdown */}
            <div className="relative group pb-2">
              <motion.a 
                href="/#categories"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative flex items-center gap-1 py-2 px-1"
                whileHover={{ y: -2 }}
              >
                All Tools
                <ChevronRight size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </motion.a>

              {/* Dropdown Menu */}
              <div
                className="absolute left-0 top-full w-80 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-4 pointer-events-none group-hover:pointer-events-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} href={cat.link}>
                        <motion.div
                          className="p-3 rounded-lg border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group/item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`flex items-center gap-2 mb-2`}>
                            <div className={`p-1.5 bg-gradient-to-br ${cat.color} rounded-md flex-shrink-0`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-900 group-hover/item:text-orange-600 transition whitespace-nowrap overflow-hidden text-ellipsis">{cat.title}</p>
                          </div>
                          <p className="text-xs text-gray-500">{cat.count} tools</p>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Other Navigation Items */}
            {['Image', 'Video', 'AI Write', 'Data'].map((item) => (
              <motion.a 
                key={item} 
                href="#" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          {/* Search & CTA */}
          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              searchActive ? 'bg-orange-50 border border-orange-200 shadow-lg shadow-orange-500/10' : 'bg-gray-50 border border-gray-200'
            }`}>
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                className="bg-transparent outline-none text-sm w-32 text-gray-900 placeholder-gray-400"
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/tools"
                className="hidden sm:inline-block px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all"
              >
                Browse Tools
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-gray-200 bg-white px-4 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="space-y-3">
              {['All Tools', 'Image', 'Video', 'AI Write', 'Data'].map((item) => (
                <Link key={item} href="/tools" className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition">
                  {item}
                </Link>
              ))}
              <Link href="/tools" className="block px-4 py-2 bg-orange-500 text-white rounded-lg font-medium">
                Browse Tools
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Last updated: March 2026
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 text-lg leading-relaxed">
            At SimplifyConvert, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our services.
          </p>

          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className="border-l-4 border-orange-500 pl-6 py-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            className="bg-orange-50 p-8 rounded-2xl mt-12"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Privacy Policy?</h2>
            <p className="text-gray-600 text-lg mb-6">
              If you have any questions or concerns about our privacy practices, please contact us at privacy@simplifyconvert.com
            </p>
            <Link href="/contact" className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all">
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </div>

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
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
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
                  { label: 'Terms of Service', href: '/tos' },
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
    </main>
  );
}
