'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

const sections = [
  {
    title: '1. Cookies and Similar Storage',
    content: 'Cookies are small values stored by a browser and sent with relevant web requests. SimplifyConvert also uses browser storage for certain interface features. This policy describes the categories visible in the current product; providers may change their cookie names or retention under their own policies.',
  },
  {
    title: '2. Authentication Cookies',
    content: 'SimplifyConvert uses NextAuth for account sign-in. Authentication cookies help establish and maintain a signed-in session, support security checks, and connect requests to the correct account. Blocking these cookies can prevent account, dashboard, and Premium AI Studio features from working.',
  },
  {
    title: '3. Preference Storage',
    content: 'The site uses local browser storage for features such as recent search suggestions. Clearing site data removes these saved preferences.',
  },
  {
    title: '4. Analytics',
    content: 'Google Analytics is loaded across the site to measure page visits and interactions. Google may set or read analytics cookies and receive device, browser, network, page, and event information. Analytics helps us understand which pages and tools are useful and identify technical or navigation problems.',
  },
  {
    title: '5. Advertising',
    content: 'Google AdSense is loaded to support advertising. Google and its advertising partners may use cookies or similar technologies to deliver, measure, limit, or personalize advertising according to their settings, consent requirements, and policies. Advertising identifiers and choices are managed through Google and browser controls where available.',
  },
  {
    title: '6. Payments and External Providers',
    content: 'When you use Premium AI Studio checkout, Razorpay, PayPal, or Stripe may use cookies or similar technologies for fraud prevention, session continuity, and payment processing. Those providers control their own cookies and describe them in their respective policies.',
  },
  {
    title: '7. Managing Cookies',
    content: 'You can view, block, or delete cookies and site storage through your browser settings. Blocking all cookies can affect sign-in, pricing preferences, checkout, and other account-based features. SimplifyConvert does not currently claim a separate site-wide cookie preference center, so use browser and provider controls where applicable.',
  },
  {
    title: '8. Updates and Contact',
    content: 'We may update this policy when our product or providers change. The date shown on this page identifies the current version. For questions about cookies or related privacy practices, use the Contact page or email info@simplifyconvert.com.',
  },
];

export default function CookiesPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-xl text-white/90">Last updated: August 2026</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          SimplifyConvert uses cookies and browser storage for authentication, preferences, analytics, advertising, and payment-related workflows.
        </p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="border-l-4 border-orange-500 pl-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
            </section>
          ))}
          <motion.div className="bg-orange-50 p-8 rounded-2xl mt-12" whileHover={{ scale: 1.02 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie or Privacy Questions?</h2>
            <p className="text-gray-600 text-lg mb-6">Contact us for questions about the storage categories described here.</p>
            <Link href="/contact" className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all">Contact Us</Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
