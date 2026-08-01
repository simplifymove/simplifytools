'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'All Tools', href: '/all-tools' },
      { label: 'AI Studio', href: '/ai-studio' },
      { label: 'AI Studio Pricing', href: '/ai-studio/pricing' },
      { label: 'AI Writing', href: '/all-tools/ai-tools' },
    ],
    Categories: [
      { label: 'PDF Tools', href: '/all-tools/pdf-tools' },
      { label: 'Image Tools', href: '/all-tools/image-tools' },
      { label: 'Video Tools', href: '/all-tools/video-tools' },
      { label: 'Data Tools', href: '/all-tools/data' },
      { label: 'Code Tools', href: '/all-tools/code-tools' },
      { label: 'Financial Calculators', href: '/all-tools/financial-calculators' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'SimplifyConvert Blog', href: '/blog' },
    ],
    Support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/40 p-1">
                <Image 
                  src="/Logo-icon.gif" 
                  alt="SimplifyConvert free online tools logo" 
                  width={28} 
                  height={28}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg text-white">SimplifyConvert</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Free utilities for everyday PDF, image, video, data, and code tasks, plus a separate credit-based AI Studio.
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

          {/* Category Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.Categories.map((link) => (
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

          {/* Support and Legal Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Support &amp; Legal</h3>
            <ul className="space-y-2">
              {footerLinks.Support.map((link) => (
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
