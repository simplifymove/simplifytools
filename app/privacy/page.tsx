'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

const sections = [
  {
    title: '1. Information We Process',
    content: 'Depending on the feature you use, SimplifyConvert may process account details, contact-form information, uploaded files or text, generated outputs, purchase and credit records, device and browser information, IP-derived location, and usage events. We use this information to provide tools, operate accounts and paid features, prevent abuse, troubleshoot problems, and understand how the site is used.',
  },
  {
    title: '2. File and Content Processing',
    content: 'SimplifyConvert uses a mixed processing model. Some utilities perform work in your browser. Other PDF, image, video, data, download, and AI features send files, text, or instructions to our servers or service providers for processing. A tool page may provide more specific information about its workflow. Do not upload confidential or sensitive material unless you are comfortable with the processing described here and on that tool page.',
  },
  {
    title: '3. Temporary Files and Download Results',
    content: 'Server-processed inputs and working files are generally temporary and cleanup behavior varies by tool. Some generated results are retained for a limited period so a download link can work; the standard download-result window is currently about 30 minutes, while some media-processing files may remain longer before scheduled cleanup. Failures can also delay cleanup. We do not promise immediate deletion or a universal deletion time for every workflow.',
  },
  {
    title: '4. Accounts and AI Studio',
    content: 'Account features use authentication data such as your name, email address, profile image, role, and sign-in records. Premium AI Studio requires an eligible account and uses credit, generation, purchase, and billing records to provide presentations, documents, spreadsheets, and related exports. Prompts and source material may be sent to configured AI or media providers when needed to produce a result.',
  },
  {
    title: '5. Analytics and Advertising',
    content: 'Google Analytics is loaded to measure visits and product usage, and Google AdSense is loaded to support advertising. These services may receive device, browser, network, page, and interaction information and may use cookies or similar technologies according to their own policies. SimplifyConvert does not claim that site usage is untracked or that no data reaches third parties.',
  },
  {
    title: '6. Payments and Service Providers',
    content: 'Paid purchases may be handled by Razorpay, PayPal, or Stripe depending on region and availability. Payment providers process payment details under their own privacy policies; SimplifyConvert stores transaction references, status, currency, amount, and related credit records needed to operate and reconcile purchases. We also use infrastructure, email, analytics, advertising, authentication, and AI providers where required to deliver the service.',
  },
  {
    title: '7. Cookies and Local Storage',
    content: 'We use authentication cookies, an AI Studio pricing-region preference cookie, and browser storage for features such as recent search suggestions. Google Analytics, Google AdSense, payment, and authentication integrations may also use cookies or similar storage. See the Cookie Policy for more detail and use your browser controls to manage stored data.',
  },
  {
    title: '8. Security and Retention',
    content: 'The site uses HTTPS in normal production use and applies access controls and validation appropriate to different features. No internet transmission or storage system is completely secure. Account, support, audit, transaction, and operational records may be retained as needed for the service, security, accounting, dispute handling, and legal obligations.',
  },
  {
    title: '9. Your Choices and Contact',
    content: 'You can manage browser cookies and storage, choose not to use server-processed tools, and contact us about account or privacy questions. Depending on applicable law, you may be able to request access, correction, or deletion of personal information. Send requests through the Contact page or email info@simplifyconvert.com; we may need to verify your identity before acting on a request.',
  },
  {
    title: '10. Children and Policy Updates',
    content: 'SimplifyConvert is not directed to children under 13, and we do not knowingly collect their personal information. We may update this policy when products, providers, or legal requirements change. The date shown on this page identifies the current published version.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-white/90">Last updated: August 2026</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          This policy explains how SimplifyConvert handles information across free utilities, account features, advertising, and Premium AI Studio. Processing differs by feature, so this policy avoids a single privacy claim for every tool.
        </p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="border-l-4 border-orange-500 pl-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
            </section>
          ))}
          <motion.div className="bg-orange-50 p-8 rounded-2xl mt-12" whileHover={{ scale: 1.02 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Questions or Requests</h2>
            <p className="text-gray-600 text-lg mb-6">Contact us through the support form or email info@simplifyconvert.com.</p>
            <Link href="/contact" className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-all">Contact Us</Link>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
