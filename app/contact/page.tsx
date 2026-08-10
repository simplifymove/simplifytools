'use client';

import React, { useState } from 'react';
import { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* NAVBAR */}
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <motion.div
          className="absolute top-10 left-5 w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ x: [0, 60, -40, 0], y: [0, 40, -60, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-5 w-80 h-80 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, -60, 40, 0], y: [0, -40, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Ask about a tool, account, payment, privacy practice, or technical problem.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">Before you send a support request</h2>
            <p className="mt-2 leading-7">Include the tool page URL, input format and approximate file size, the result you expected, and any error message. Do not send passwords, payment credentials, API keys, or other secrets.</p>
            <p className="mt-3">You can also email <a className="font-semibold text-orange-700 underline" href="mailto:info@simplifyconvert.com">info@simplifyconvert.com</a>.</p>
          </div>
          <motion.div
            className="bg-gray-50 p-8 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-gray-700 font-semibold mb-2">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-gray-700 font-semibold mb-2">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-gray-700 font-semibold mb-2">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition resize-none"
                  placeholder="Your message here..."
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white font-semibold rounded-full transition-all disabled:cursor-not-allowed`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
              {submitted && (
                <motion.div
                  className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✓ Message sent successfully. We've received your request.
                </motion.div>
              )}
              {error && (
                <motion.div
                  className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✕ {error}
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

