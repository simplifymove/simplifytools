'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, FileText, Image, Video, PenTool, Database, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '@/app/components/Footer';

const categories = [
  { id: 'pdf', title: 'PDF Tools', icon: FileText, color: 'from-purple-500 via-purple-600 to-purple-700', link: '/all-tools/pdf-tools' },
  { id: 'image', title: 'Image Tools', icon: Image, color: 'from-orange-500 via-orange-600 to-orange-700', link: '/all-tools/image-tools' },
  { id: 'video', title: 'Video Tools', icon: Video, color: 'from-pink-500 via-pink-600 to-pink-700', link: '/all-tools/video-tools' },
  { id: 'ai', title: 'AI Writing', icon: PenTool, color: 'from-blue-500 via-blue-600 to-blue-700', link: '/all-tools/ai-tools' },
  { id: 'data', title: 'Data Tools', icon: Database, color: 'from-teal-500 via-teal-600 to-teal-700', link: '/all-tools/data' },
  { id: 'code', title: 'Code Tools', icon: FileText, color: 'from-green-500 via-green-600 to-green-700', link: '/all-tools' }
];

export default function TermsPage() {
  const router = useRouter();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/all-tools?search=${encodeURIComponent(query)}`);
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
      content: 'SimplifyConvert grants you a limited, non-exclusive, non-transferable, revocable license to use our platform for personal and internal business purposes. This license does not permit you to: reverse engineer, decompile, or disassemble our tools, attempt to gain unauthorized access to our systems, bypass security measures or rate limits, upload malicious content (viruses, malware, ransomware), compromise the integrity of our services, or use our services to violate any applicable local, state, national, or international laws or regulations. Unauthorized use will result in immediate account termination and possible legal action.'
    },
    {
      title: '3. User Account & Responsibilities',
      content: 'You are responsible for maintaining the confidentiality and security of your account credentials and for all activities that occur under your account. You agree to: provide accurate and current information, notify us immediately of any unauthorized use or security breaches, use strong passwords, comply with all applicable laws in your jurisdiction, and not share your account with others or allow others to use your account. You are solely responsible for all content you upload, process, and download through our services. SimplifyConvert is not responsible for unauthorized account access due to your negligence.'
    },
    {
      title: '4. Acceptable Use Policy & Prohibited Activities',
      content: 'You agree NOT to use SimplifyConvert to: upload, process, or share illegal content or materials that violate laws, infringe on copyrights, trademarks, or intellectual property rights of others, distribute malware, viruses, ransomware, or harmful code, engage in phishing, fraud, identity theft, hacking, or cybercrime, harass, threaten, defame, or abuse other users, spam or send unsolicited communications, violate privacy rights of others, process confidential or sensitive data without authorization, conduct automated attacks or DDoS attacks, scrape or crawl our website without permission, or circumvent any limitations or restrictions on our services. Violations may result in immediate account suspension, legal action, and reporting to law enforcement.'
    },
    {
      title: '5. Intellectual Property Rights & Ownership',
      content: 'SimplifyConvert and all its content, including but not limited to software, tools, source code, interfaces, documentation, designs, trademarks, logos, and all original works, are owned exclusively by SimplifyConvert or its licensors and protected by international copyright, patent, and trademark laws. You may not reproduce, modify, translate, adapt, distribute, rent, lease, sublicense, sell, or create derivative works of any content without explicit written permission from SimplifyConvert. All rights not expressly granted are reserved. Unauthorized use of our intellectual property constitutes copyright infringement and may result in legal action.'
    },
    {
      title: '6. User Generated Content & Rights',
      content: 'You retain all intellectual property rights (copyright, patent, trademark) to content you create and upload. By uploading content to SimplifyConvert, you grant us a non-exclusive, worldwide, royalty-free license to: process and temporarily store your files to provide our services, display your files to you only, analyze your content to improve our tools (anonymously), and use your content according to your preferences as indicated in our Privacy Policy. This license is limited to the purpose of providing our services. We automatically delete files within 5 seconds of download. You remain the sole owner of your content. Do not upload content that violates third-party rights or contains sensitive/confidential information.'
    },
    {
      title: '7. Disclaimer of Warranties & "As-Is" Service',
      content: 'SimplifyConvert is provided "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. We disclaim ALL WARRANTIES INCLUDING: merchantability, fitness for a particular purpose, non-infringement, accuracy, or completeness. We do NOT warrant that our services will be: uninterrupted, error-free, secure, free of malicious code, or meet your specific requirements. We make no warranty regarding the accuracy, quality, completeness, or reliability of any content processed by our tools. Use of SimplifyConvert is at your sole risk. Some jurisdictions do not allow disclaimer of warranties, so this may not apply to you.'
    },
    {
      title: '8. Limitation of Liability & Damages',
      content: 'TO THE FULLEST EXTENT PERMITTED BY LAW, SimplifyConvert and its officers, directors, employees, agents, and licensors SHALL NOT BE LIABLE FOR ANY: indirect, incidental, special, consequential, exemplary, or punitive damages; lost profits, revenue, data, or business opportunities; damage to reputation or goodwill; cost of substitute services; or any other damages arising from your use or inability to use our services, even if we have been advised of the possibility of such damages. Our total aggregate liability to you for all claims is limited to the amount you paid for our services (if applicable), or $0 if you used free services. This limitation applies regardless of the legal theory (contract, tort, strict liability, etc.). Some jurisdictions do not allow limitation of liability, so this may not apply to you.'
    },
    {
      title: '9. Service Availability, Maintenance & Downtime',
      content: 'We strive to maintain high availability and aim for 99% uptime, but we do NOT guarantee uninterrupted or error-free service. SimplifyConvert may perform scheduled or emergency maintenance, updates, patches, or improvements at any time with or without notice. During maintenance, all or portions of our services may be temporarily unavailable. We may also suspend or limit access to specific features without notice. We are NOT liable for any downtime, service interruptions, data loss, or damages resulting from maintenance or system failures. For critical services, users should maintain backup copies of important files.'
    },
    {
      title: '10. Termination & Account Suspension',
      content: 'SimplifyConvert reserves the right to: suspend or terminate your account and access to our services at any time, with or without cause, with or without notice. Reasons for termination may include: violation of these Terms, illegal activity, abuse of service, non-payment, or at our sole discretion. Upon termination: your license to use our services immediately terminates, you lose access to all account data, and all files on our servers will be permanently deleted within 30 days. You may terminate your account at any time by contacting us. We are not liable for termination of services or loss of data. Provide at least 30 days notice for non-violation terminations.'
    },
    {
      title: '11. Indemnification',
      content: 'You agree to indemnify, defend, and hold harmless SimplifyConvert, its officers, directors, employees, agents, and successors from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorney\'s fees) arising from: your violation of these Terms, your violation of any applicable law or regulation, your infringement of third-party intellectual property rights, your upload or processing of illegal content, your use of our services in an unlawful manner, or any third-party claim related to your use of SimplifyConvert. SimplifyConvert reserves the right to assume control of defense and settlement of any claim subject to indemnification.'
    },
    {
      title: '12. Governing Law, Jurisdiction & Dispute Resolution',
      content: 'These Terms of Service are governed by and construed in accordance with applicable law, without regard to its conflict of law principles. Any legal action, proceeding, or dispute shall be resolved EXCLUSIVELY through binding arbitration administered by an agreed-upon arbitration organization. Arbitration shall be conducted on an individual basis (no class actions), in English, and held in a mutually agreed location or remotely. Each party bears its own costs unless the arbitrator awards costs. Judgment on the arbitration award may be entered in any court of competent jurisdiction. Notwithstanding this, either party may seek injunctive relief or other equitable relief in court to prevent irreparable harm or enforce intellectual property rights.'
    },
    {
      title: '13. Modifications to Terms of Service',
      content: 'SimplifyConvert reserves the right to modify these Terms of Service at any time. We will notify users of material changes by: posting the updated Terms on our website, sending an email notification, or displaying a prominent notice on our platform. Your continued use of SimplifyConvert after modifications constitutes acceptance of the revised Terms. If you do not agree with modifications, you must stop using our services within 30 days of the change. We recommend reviewing these Terms regularly to stay informed of any updates.'
    },
    {
      title: '14. Severability & Waiver',
      content: 'If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, or if that is not possible, severed from these Terms, and the remaining provisions shall remain in full force and effect. Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision. No waiver is effective unless made in writing and signed by an authorized representative of SimplifyConvert.'
    },
    {
      title: '15. Entire Agreement',
      content: 'These Terms of Service, together with our Privacy Policy, constitute the entire and exclusive agreement between you and SimplifyConvert regarding your use of our services and supersede all prior or contemporaneous agreements, understandings, negotiations, or discussions between the parties, whether written or oral. If there is any conflict between these Terms and our Privacy Policy regarding privacy matters, the Privacy Policy controls. Any other prior agreements or arrangements are void and of no effect.'
    },
    {
      title: '16. Contact & Support',
      content: 'If you have any questions, concerns, or disputes regarding these Terms of Service, please contact: SimplifyConvert Legal Team, info@simplifyconvert.com. We will respond to all inquiries within 5 business days. For urgent matters or to dispute a decision, clearly mark your email as "URGENT" or "DISPUTE." You can also initiate arbitration through the agreed-upon arbitration process. We are committed to resolving concerns fairly and promptly.'
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
                          <p className="text-xs text-gray-500">Explore tools</p>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Other Navigation Items */}
            {['Image', 'Video', 'AI Writing', 'Data'].map((item) => (
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
                href="/all-tools"
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
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
          >
            <div className="space-y-3">
              {['All Tools', 'Image', 'Video', 'AI Writing', 'Data'].map((item) => (
                <Link key={item} href="/all-tools" className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition">
                  {item}
                </Link>
              ))}
              <Link href="/all-tools" className="block px-4 py-2 bg-orange-500 text-white rounded-lg font-medium">
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-xl text-white/90"

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
              initial={{ x: 0 }}
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
      <Footer />
    </main>
  );
}

