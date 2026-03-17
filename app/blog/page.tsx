'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, ArrowRight, Search, Menu, X, FileText, Image, Video, PenTool, Database, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'pdf', title: 'PDF Tools', icon: FileText, color: 'from-purple-500 via-purple-600 to-purple-700', count: '47+', link: '/tools/pdf' },
  { id: 'image', title: 'Image Tools', icon: Image, color: 'from-orange-500 via-orange-600 to-orange-700', count: '30+', link: '/tools?category=Image' },
  { id: 'video', title: 'Video Tools', icon: Video, color: 'from-pink-500 via-pink-600 to-pink-700', count: '10+', link: '/tools?category=video' },
  { id: 'ai', title: 'AI Write', icon: PenTool, color: 'from-blue-500 via-blue-600 to-blue-700', count: '50+', link: '/tools/ai-write' },
  { id: 'data', title: 'Data Conversion', icon: Database, color: 'from-teal-500 via-teal-600 to-teal-700', count: '12', link: '/tools/data' },
  { id: 'code', title: 'Code Tools', icon: FileText, color: 'from-green-500 via-green-600 to-green-700', count: '15+', link: '/tools' }
];

export default function BlogPage() {
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
  const blogPosts = [
    {
      id: 1,
      title: '10 Essential PDF Tools Every Professional Needs',
      excerpt: 'Discover the most useful PDF tools that can save you hours of work. From merging and splitting to transformation and security.',
      category: 'PDF Tools',
      author: 'Sarah Johnson',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      image: 'PDF'
    },
    {
      id: 2,
      title: 'Image Compression Without Quality Loss',
      excerpt: 'Learn the best practices for compressing images while maintaining their visual quality. Perfect for web optimization.',
      category: 'Image Tools',
      author: 'Mike Chen',
      date: 'Jan 12, 2024',
      readTime: '8 min read',
      image: 'IMAGE'
    },
    {
      id: 3,
      title: 'Convert Your Videos Like a Pro',
      excerpt: 'Complete guide to video conversion, format selection, and optimization for different platforms.',
      category: 'Video Tools',
      author: 'Emma Davis',
      date: 'Jan 8, 2024',
      readTime: '6 min read',
      image: 'VIDEO'
    },
    {
      id: 4,
      title: 'AI Writing: Boost Your Content Creation',
      excerpt: 'Explore how AI writing tools can help improve your writing, generate ideas, and save time.',
      category: 'AI Tools',
      author: 'Alex Rodriguez',
      date: 'Jan 5, 2024',
      readTime: '7 min read',
      image: 'AI'
    },
    {
      id: 5,
      title: 'Data Transformation Tips and Tricks',
      excerpt: 'Master the art of converting and transforming your data. Includes CSV, JSON, and more formats.',
      category: 'Data Tools',
      author: 'Lisa Park',
      date: 'Dec 30, 2023',
      readTime: '9 min read',
      image: 'DATA'
    },
    {
      id: 6,
      title: 'Speaking Matters: Text-to-Speech Guide',
      excerpt: 'Discover how text-to-speech technology works and best practices for audio content creation.',
      category: 'Audio Tools',
      author: 'James Wilson',
      date: 'Dec 25, 2023',
      readTime: '5 min read',
      image: 'VOICE'
    }
  ];

  const categoryColors: { [key: string]: string } = {
    'PDF Tools': 'bg-purple-100 text-purple-700',
    'Image Tools': 'bg-orange-100 text-orange-700',
    'Video Tools': 'bg-pink-100 text-pink-700',
    'AI Tools': 'bg-blue-100 text-blue-700',
    'Data Tools': 'bg-teal-100 text-teal-700',
    'Audio Tools': 'bg-indigo-100 text-indigo-700'
  };

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
                            <div className={`p-1.5 bg-linear-to-br ${cat.color} rounded-md shrink-0`}>
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
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            SimplifyConvert Blog
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Tips, tricks, and best practices for converting and editing your files.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Featured Post */}
        <motion.div
          className="mb-16 p-8 bg-linear-to-br from-orange-50 to-orange-100/50 rounded-2xl border-2 border-orange-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${categoryColors['PDF Tools']}`}>
                Featured
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">10 Essential PDF Tools Every Professional Needs</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Discover the most useful PDF tools that can save you hours of work. From merging and splitting to transformation and security. Learn how to optimize your workflow.
              </p>
              <div className="flex flex-wrap gap-6 text-gray-600 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Sarah Johnson</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Jan 15, 2024</span>
                </div>
                <span>5 min read</span>
              </div>
              <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all flex items-center gap-2">
                Read Full Article
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="w-full md:w-64 h-64 bg-linear-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
              PDF
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, idx) => (
              <motion.article
                key={post.id}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Image */}
                <div className={`h-48 flex items-center justify-center text-4xl font-bold text-white group-hover:scale-105 transition-transform`}
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${post.image === 'IMAGE' ? '#F97316' : post.image === 'VIDEO' ? '#EC4899' : post.image === 'AI' ? '#2563EB' : post.image === 'DATA' ? '#14B8A6' : '#6366F1'} 0%, ${post.image === 'IMAGE' ? '#FB923C' : post.image === 'VIDEO' ? '#F472B6' : post.image === 'AI' ? '#3B82F6' : post.image === 'DATA' ? '#2DD4BF' : '#818CF8'} 100%)`
                  }}
                >
                  {post.image}
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-xs mb-4 pb-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 pt-4">
                      <User size={14} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 pt-4">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                    </div>
                    <span className="pt-4">{post.readTime}</span>
                  </div>
                  <button className="text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-2">
                    Read More
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 p-8 bg-blue-50 rounded-2xl border-2 border-blue-200 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-6">Subscribe to our newsletter for tips, tutorials, and product updates delivered to your inbox.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
              Subscribe
            </button>
          </div>
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
