'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Users, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />

      {/* Hero Section */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About SimplifyConvert
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Making file conversion, editing, and transformation effortless for everyone.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mission */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              At SimplifyConvert, our mission is simple: to make file conversion, editing, and data transformation accessible, fast, and hassle-free for everyone.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We believe powerful tools shouldn't be complicated or hidden behind paywalls. Whether you're converting PDFs, editing images, processing videos, or working with data, everything should be easy, intuitive, and available instantly—right in your browser.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mt-4">
              With 200+ tools across multiple categories, SimplifyConvert helps users handle everyday digital tasks quickly and efficiently, without the need for downloads or technical expertise.
            </p>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SimplifyConvert brings together a wide range of tools in one place:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '📄 PDF conversion and editing',
                '🖼️ Image processing and enhancement',
                '🎥 Video tools and transformations',
                '🤖 AI-powered writing and utilities',
                '📊 Data and file format conversions',
                '💻 Code formatting and utilities',
                '🔊 Text-to-speech and audio tools'
              ].map((offer, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-gray-600">
                  <span className="text-xl">{offer.split(' ')[0]}</span>
                  <span>{offer.substring(offer.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mt-6">
              All designed to work seamlessly online.
            </p>
          </section>
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Fast & Efficient',
                  description: 'We focus on speed and performance, so your files are processed quickly without unnecessary delays.'
                },
                {
                  icon: Users,
                  title: 'User-Centric Design',
                  description: 'Every tool is built with simplicity in mind—clean interfaces, easy workflows, and no confusion.'
                },
                {
                  icon: Target,
                  title: 'Accuracy & Quality',
                  description: 'We prioritize precision to ensure your files are processed with the best possible quality.'
                },
                {
                  icon: Award,
                  title: 'Free & Accessible',
                  description: 'Many of our tools are free to use with no hidden fees or mandatory sign-ups. We aim to keep our platform accessible while continuing to improve our services.'
                }
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={idx}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all"
                    whileHover={{ y: -4 }}
                  >
                    <Icon className="w-8 h-8 text-orange-500 mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Vision */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We aim to become a one-stop platform for all digital file needs—continuously expanding our tools and improving performance based on real user feedback.
            </p>
          </section>

          {/* Team */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We're a small but passionate team of developers, designers, and problem-solvers dedicated to building practical tools that people actually use.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We believe in continuous improvement and actively listen to our users to make SimplifyConvert better every day.
            </p>
          </section>

          {/* CTA */}
          <motion.div
            className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-2xl text-center"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Simplify Your Work?</h3>
            <p className="text-gray-600 mb-6">Explore all our tools and start converting, editing, and transforming files today.</p>
            <Link href="/all-tools" className="inline-block px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all">
              Explore All Tools
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}



