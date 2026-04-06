'use client';

import React from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'When you use SimplifyConvert, we collect certain information to improve your experience. This includes: Device information (browser type, operating system, device type), usage data (which tools you use, features accessed, processing times), and temporary file data during active processing sessions. We collect IP addresses and timestamps for security and abuse prevention. We do NOT store your uploaded files permanently on our servers.'
    },
    {
      title: '2. File Handling & Retention',
      content: 'Files you upload for processing are stored temporarily on our servers ONLY during the processing phase. After you download your converted/processed file, all temporary files are automatically deleted within 5 seconds. If you upload a file but do NOT submit it for processing, the file remains only in your browser memory and is never transmitted to our servers—it is automatically cleared when you close the browser or navigate away. We have zero access to files stored only in your browser.'
    },
    {
      title: '3. How We Use Your Information',
      content: 'We use the information we collect to: Improve our services and user experience through analytics, troubleshoot technical issues, identify and fix bugs, analyze usage patterns to enhance tools and prioritize features, ensure security and prevent abuse, and provide customer support. Your privacy is our priority, and we never sell user data to third parties. We do not share identifiable information with advertisers.'
    },
    {
      title: '4. Data Security',
      content: 'SimplifyConvert uses industry-standard encryption (HTTPS/TLS) and security measures to protect your data during transmission. All file uploads are transmitted securely using SSL/TLS encryption. We implement access controls, firewalls, and regular security audits to maintain the highest standards. However, no method of transmission over the internet is 100% secure. We are not liable for unauthorized access due to factors beyond our control.'
    },
    {
      title: '5. Cookies & Tracking',
      content: 'We use cookies to remember your preferences, maintain session information, and improve your experience. These are primarily session cookies that expire when you close your browser, and persistent cookies (max 1 year) for features like "remember my settings." We use analytics cookies (Google Analytics) to understand usage patterns. You can disable cookies in your browser settings, though some features may not work optimally. We do not use cookies for tracking across other websites.'
    },
    {
      title: '6. Third-Party Services',
      content: 'SimplifyConvert uses third-party services for: Analytics (Google Analytics), hosting and infrastructure, payment processing (if applicable), and CDN services. These services are bound by similar privacy obligations and data processing agreements. We never share your personal information with third parties for marketing purposes. Your data is processed according to their privacy policies and our data processing agreements. You can opt-out of analytics tracking in your browser settings.'
    },
    {
      title: '7. User Rights & Data Control',
      content: 'You have the right to: Access your personal information (if stored), request deletion or correction of your data, opt-out of analytics and non-essential tracking, port your data to another service, and contact us with privacy concerns. To exercise these rights, email info@simplifymove.com with your request. We will respond to all requests within 30 days. If you delete your account or request data deletion, all associated information will be permanently removed from our servers.'
    },
    {
      title: '8. Children\'s Privacy',
      content: 'SimplifyConvert does not knowingly collect personal information from users under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will take immediate steps to delete such information and terminate the child\'s account. Parents or guardians who believe their child has provided information to SimplifyConvert should contact us immediately at info@simplifymove.com.'
    },
    {
      title: '9. GDPR & CCPA Compliance',
      content: 'If you are in the European Union, you are subject to GDPR (General Data Protection Regulation) rights. If you are in California, US, you are subject to CCPA (California Consumer Privacy Act) rights. We comply with both regulations. You have rights including access, deletion, portability, and opt-out of certain processing. We do not sell personal information as defined by CCPA. For GDPR/CCPA requests, email info@simplifymove.com with "GDPR REQUEST" or "CCPA REQUEST."'
    },
    {
      title: '10. International Data Transfers',
      content: 'Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have different data protection laws. By using SimplifyConvert, you consent to the transfer of your information to countries outside your country of residence, including countries that may not have the same data protection laws.'
    },
    {
      title: '11. Updates to This Policy',
      content: 'We may update this privacy policy periodically to reflect changes in our practices, technology, legal requirements, or applicable laws. We will notify you of significant changes by posting the updated policy on our website and updating the "Last updated" date. For material changes, we will provide notice via email. Your continued use of SimplifyConvert after updates means you accept the new policy. Please review this policy regularly to stay informed about how we protect your information.'
    },
    {
      title: '12. Contact Us',
      content: 'If you have any questions, concerns, or requests regarding our privacy practices, please contact our Privacy Team at: info@simplifymove.com. We will respond to all inquiries within 5 business days. For urgent privacy concerns, mark your email as "URGENT" and we will prioritize your request.'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />

      {/* Hero Section */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-xl text-white/90"
            initial={{ opacity: 0, y: 20 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 text-lg leading-relaxed">
            At SimplifyConvert, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our services.
          </p>

          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className="border-l-4 border-orange-500 pl-6 py-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Privacy Policy?</h2>
            <p className="text-gray-600 text-lg mb-6">
              If you have any questions or concerns about our privacy practices, please contact us at info@simplifymove.com
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



