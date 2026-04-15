'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function ResumeMakerPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
          {/* Premium Header */}
          <div className="relative bg-linear-to-r from-purple-600 to-blue-700 py-16 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span>Resume Maker</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
                  <FileText className="w-10 h-10" />
                  Resume Maker
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Create professional resumes with AI-powered job matching. Choose from templates, customize designs, and download instantly.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              {/* Feature 1 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Templates</h3>
                <p className="text-gray-600">
                  Choose from industry-standard resume templates designed to impress employers.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Job Matching</h3>
                <p className="text-gray-600">
                  Match your resume with job descriptions and optimize your content automatically.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download Instantly</h3>
                <p className="text-gray-600">
                  Export your resume as PDF or DOCX with a single click. No sign-up required.
                </p>
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Resume?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Get started in minutes with our intelligent resume builder. Match your skills with job requirements and create a winning resume.
              </p>
              <Link
                href="/all-tools/resume-maker/job-match"
                className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Building Now
                <ChevronRight size={20} />
              </Link>
            </motion.div>

            {/* Process Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Choose Template', desc: 'Select a professional resume template' },
                  { step: '2', title: 'Fill Information', desc: 'Add your details and experience' },
                  { step: '3', title: 'Customize Design', desc: 'Adjust colors, fonts, and layout' },
                  { step: '4', title: 'Download & Share', desc: 'Export as PDF or DOCX' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 text-center"
                  >
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {item.step}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

