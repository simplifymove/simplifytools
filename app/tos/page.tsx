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

export default function TermsPage() {
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
      title: '1. Acceptance of Terms',
      content: 'By accessing and using SimplifyConvert, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of the revised terms.'
    },
    {
      title: '2. Use License',
      content: 'SimplifyConvert grants you a limited, non-exclusive, revocable license to use our platform for personal, non-commercial purposes. You agree not to: reverse engineer our tools, attempt to gain unauthorized access, upload malicious content, or use our services to violate any laws or regulations.'
    },
    {
      title: '3. User Responsibilities',
      content: 'You are responsible for maintaining the confidentiality of any account information and for all activities that occur under your account. You agree to provide accurate information and notify us immediately of any unauthorized use. You are responsible for all content you upload and process through our services.'
    },
    {
      title: '4. Acceptable Use Policy',
      content: 'You agree not to use SimplifyConvert to: Upload or process illegal content, infringe intellectual property rights, distribute malware, engage in harassment or abuse, or violate any applicable laws. Violation of this policy may result in immediate account termination.'
    },
    {
      title: '5. Intellectual Property Rights',
      content: 'SimplifyConvert and all its content, including tools, interfaces, and documentation, are owned by SimplifyConvert and protected by copyright and trademark laws. You may not reproduce, modify, or distribute any content without explicit permission. We respect your intellectual property rights to content you upload.'
    },
    {
      title: '6. User Content',
      content: 'You retain all rights to content you upload. By uploading content, you grant SimplifyConvert a license to process and temporarily store your files for service delivery. We automatically delete files after processing. We do not claim ownership of your content.'
    },
    {
      title: '7. Disclaimer of Warranties',
      content: 'SimplifyConvert is provided "as is" without warranties of any kind, express or implied. We do not guarantee that our services will be uninterrupted or error-free. We are not liable for any damages resulting from your use of our platform, including data loss, business interruption, or indirect damages.'
    },
    {
      title: '8. Limitation of Liability',
      content: 'To the fullest extent permitted by law, SimplifyConvert shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability to you for any claims is limited to the amount you paid for our services (if any).'
    },
    {
      title: '9. Service Availability',
      content: 'We strive to maintain 99% uptime, but do not guarantee uninterrupted service. We may perform maintenance, updates, or suspend services without notice. We are not liable for any downtime or service interruptions.'
    },
    {
      title: '10. Termination',
      content: 'We reserve the right to suspend or terminate your access to SimplifyConvert at any time, with or without cause. Upon termination, your license to use our services is immediately revoked. Your files will be deleted from our servers.'
    },
    {
      title: '11. Governing Law',
      content: 'These Terms of Service are governed by and construed in accordance with applicable law. Any legal action or proceeding shall be resolved through binding arbitration, not through court proceedings.'
    },
    {
      title: '12. Contact Information',
      content: 'If you have any questions about these Terms of Service, please contact us at legal@simplifyconvert.com. We will respond to all inquiries within 5 business days.'
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
            Terms of Service
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
            Welcome to SimplifyConvert. These Terms of Service govern your use of our website and services. Please read them carefully.
          </p>

          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className="border-l-4 border-orange-500 pl-6 py-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Any Questions?</h2>
            <p className="text-gray-600 text-lg mb-6">
              If you have any questions about our Terms of Service, please contact our legal team.
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
