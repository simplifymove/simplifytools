'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'All Tools', href: '/all-tools' },
      { label: 'AI Writing', href: '/all-tools/ai-tools' },
      { label: 'PDF Tools', href: '/all-tools/pdf-tools' },
      { label: 'Image Tools', href: '/all-tools/image-tools' },
    ],
    PopularTools: [
      { label: 'Remove Background', href: '/all-tools/remove-background' },
      { label: 'Compress Image', href: '/all-tools/compress-image' },
      { label: 'Merge PDF', href: '/all-tools/pdf/merge-pdf' },
      { label: 'AI Writing', href: '/all-tools/ai-tools' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact Us', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/40 p-1">
                <Image 
                  src="/Logo-icon.gif" 
                  alt="SimplifyConvert free online tools logo" 
                  width={28} 
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg text-white">SimplifyConvert</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your all-in-one toolkit for PDF, images, video, data, and more conversion and processing.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">

                <Mail size={16} />
                <a href="mailto:info@simplifyconvert.com" className="hover:text-white transition">
                  info@simplifyconvert.com
                </a>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.Product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Popular Tools</h3>
            <ul className="space-y-2">
              {footerLinks.PopularTools.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © {currentYear} SimplifyConvert. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



