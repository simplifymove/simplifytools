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
            Making file conversion, editing, and transformation simple for everyone.
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
              SimplifyConvert was founded with a simple mission: to make file conversion, editing, and data transformation accessible to everyone. We believe technology should be simple, intuitive, and free - without any barriers or restrictions.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              With over 200+ tools across 7 categories, we help millions of users convert PDFs, edit images, process videos, write with AI, transform data, format code, and convert text to speech - all from their browser.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'We prioritize speed and performance. Our tools process your files instantly without lag.'
                },
                {
                  icon: Users,
                  title: 'User First',
                  description: 'Every feature is designed with users in mind. Simple, intuitive, and hassle-free.'
                },
                {
                  icon: Target,
                  title: 'Precision',
                  description: 'Accuracy matters. We ensure every conversion and edit maintains the highest quality.'
                },
                {
                  icon: Award,
                  title: 'Always Free',
                  description: 'All our tools are completely free to use. No hidden charges, no paywalls, no sign-ups required.'
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

          {/* Team */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We&apos;re a passionate team of developers, designers, and innovators dedicated to building the best file conversion and editing tools on the web. We believe in continuous improvement and always listen to user feedback to make SimplifyConvert better every day.
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



