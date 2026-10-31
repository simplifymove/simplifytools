'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

const sections = [
  {
    title: '1. Acceptance and Scope',
    content: 'These Terms govern your use of the SimplifyConvert website, free utility tools, account features, Premium AI Studio, and related downloads. By using the service, you agree to these Terms and the Privacy Policy. If you do not agree, do not use the service.',
  },
  {
    title: '2. Free Utilities and Premium AI Studio',
    content: 'Many conversion, editing, developer, data, writing, and calculator utilities are available without a paid AI Studio purchase. Availability, limits, supported formats, and account requirements can differ by tool. Premium AI Studio is a separate account-based, credit-based product for generating presentations, documents, spreadsheets, and related exports.',
  },
  {
    title: '3. Accounts',
    content: 'You are responsible for accurate account information, safeguarding your sign-in credentials, and activity performed through your account. Notify us if you believe your account has been used without authorization. We may restrict an account when reasonably necessary to address abuse, security issues, non-payment, or violations of these Terms.',
  },
  {
    title: '4. Credits, Purchases, and Payment Providers',
    content: 'AI Studio generations consume credits according to the product information shown at the time of use. Credit packages, prices, currencies, and payment methods can vary by region. Payments may be processed by Razorpay, PayPal, or Stripe. Your purchase is also subject to the applicable provider terms and the checkout information shown before payment. Credits are a service entitlement, not cash or a bank balance.',
  },
  {
    title: '5. Uploaded Content and Permissions',
    content: 'You retain your rights in content you upload. You grant SimplifyConvert and its service providers the limited permission needed to receive, temporarily store, transform, transmit, and return that content in order to provide the selected feature. You are responsible for having the rights and permissions required to process the content.',
  },
  {
    title: '6. AI-Generated Outputs',
    content: 'AI-generated material can be incomplete, inaccurate, unexpected, or similar to material generated for other users. You must review outputs before relying on, publishing, or distributing them. Do not treat generated financial, legal, medical, or other professional content as professional advice. You are responsible for your use of generated output and for checking third-party rights and factual accuracy.',
  },
  {
    title: '7. Acceptable Use',
    content: 'Do not use SimplifyConvert to violate law or third-party rights, distribute malware, evade security or usage controls, interfere with the service, access another user’s account, process content without authorization, or conduct abusive automated traffic. Do not upload highly sensitive information when the selected workflow or provider handling is unsuitable for it.',
  },
  {
    title: '8. Third-Party Services',
    content: 'Some features depend on third-party infrastructure, authentication, analytics, advertising, AI, media, email, and payment services. Their availability and processing may affect SimplifyConvert. Links to external services do not imply that we control their content or practices.',
  },
  {
    title: '9. Service Changes and Availability',
    content: 'We may update, limit, suspend, or discontinue features, formats, providers, or access when needed for maintenance, security, legal compliance, or product operation. We do not guarantee uninterrupted availability, a particular processing time, or that every input will produce a usable result. Keep copies of important source files and outputs.',
  },
  {
    title: '10. Disclaimers and Liability',
    content: 'The service is provided on an “as available” basis to the extent permitted by law. Results can vary with source files, browsers, providers, and tool limitations. SimplifyConvert does not guarantee accuracy, fitness for a particular purpose, preservation of every format feature, or recovery of source quality. To the extent permitted by applicable law, we are not responsible for indirect or consequential losses arising from use of the service.',
  },
  {
    title: '11. Changes and Contact',
    content: 'We may update these Terms to reflect product, provider, or legal changes. The date on this page identifies the current version. Questions about these Terms, an account, or a purchase can be sent through the Contact page or to info@simplifyconvert.com.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-white/90">Last updated: August 2026</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          These terms distinguish the site’s free utilities from the separate account- and credit-based AI Studio product.
        </p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="border-l-4 border-orange-500 pl-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
            </section>
          ))}
          <motion.div className="bg-orange-50 p-8 rounded-2xl mt-12" whileHover={{ scale: 1.02 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
            <p className="text-gray-600 text-lg mb-6">Use our support form for product, account, or purchase questions.</p>
            <Link href="/contact" className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all">Contact Us</Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
