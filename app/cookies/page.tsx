'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function CookiesPolicyPage() {

  const sections = [
    {
      title: '1. What Are Cookies?',
      content: 'Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website. They contain information that can be retrieved by SimplifyConvert when you return. Cookies are widely used to make websites work more efficiently and to provide information to the website owners. Cookies do not contain personally identifiable information unless you have provided it directly.'
    },
    {
      title: '2. Types of Cookies We Use',
      content: 'SimplifyConvert uses several types of cookies: Session Cookies - Temporary files that expire when you close your browser. Used to maintain your login status and track your session. Persistent Cookies - Files that remain on your device for a set period (up to 1 year). Used to remember preferences and settings across visits. Analytics Cookies - Used to track your interactions with our website (via Google Analytics). This helps us understand how users navigate our site and which tools are most popular. Marketing Cookies - Used to track your activity for advertising purposes and personalization. Functional Cookies - Remember your choices and preferences to enhance user experience.'
    },
    {
      title: '3. How We Use Cookies',
      content: 'We use cookies to: Maintain your login session and remember who you are, Remember your preferences and settings (language, theme, tool selections), Analyze website traffic and user behavior to improve our services, Track which tools are most frequently used, Understand where our users are coming from and how they found us, Enhance website security and prevent fraud, Deliver personalized content and recommendations, Test new features and website improvements. We use first-party cookies (set by SimplifyConvert) and third-party cookies (set by services like Google Analytics).'
    },
    {
      title: '4. Third-Party Cookies & Services',
      content: 'SimplifyConvert uses Google Analytics to track website traffic and user behavior. Google sets cookies on your device to collect data about your visits. This data is used to generate reports about website usage patterns. You can opt-out of Google Analytics tracking by installing the Google Analytics Opt-Out Browser Add-on. We may also use other third-party services that set cookies for their own purposes (advertising networks, analytics providers). These third-party services are subject to their own cookie policies. We recommend reviewing their privacy policies for more details.'
    },
    {
      title: '5. Cookie Consent & Control',
      content: 'When you first visit SimplifyConvert, you will be presented with a cookie consent banner. You can: Accept all cookies, Reject non-essential cookies, Customize your cookie preferences. By clicking "Accept All," you consent to the use of all cookies described in this policy. If you only accept essential cookies, only necessary session and security cookies will be stored. You can change your preferences at any time through your browser settings or our cookie preferences page.'
    },
    {
      title: '6. How to Manage or Delete Cookies',
      content: 'You can control and delete cookies through your browser settings: Chrome: Settings > Privacy and Security > Clear browsing data > Cookies and other site data, Firefox: Settings > Privacy & Security > Cookies and Site Data, Safari: Settings > Privacy > Cookies and website data, Edge: Settings > Privacy > Clear browsing data. You can also configure your browser to: Reject all cookies, Allow only first-party cookies, Block third-party cookies, Notify you when a cookie is being set. Note that disabling cookies may affect the functionality of some features on SimplifyConvert.'
    },
    {
      title: '7. Essential vs. Non-Essential Cookies',
      content: 'Essential Cookies - These are necessary for SimplifyConvert to function properly. They enable core features like: logging in, maintaining your session, processing tool requests, ensuring website security. These cookies cannot be disabled. Non-Essential Cookies - These are optional and primarily used for: analytics and understanding user behavior, personalizing your experience, marketing and advertising. You can opt-out of non-essential cookies during your first visit or change your preferences at any time.'
    },
    {
      title: '8. Cookie Retention Policy',
      content: 'Session cookies are automatically deleted when you close your browser. Persistent cookies are stored for the following durations: Preference cookies (1 year), Analytics cookies (2 years), Functional cookies (1 year). You can manually delete cookies at any time through your browser settings. SimplifyConvert does not retain cookies longer than necessary for their specified purposes.'
    },
    {
      title: '9. International Cookie Policies',
      content: 'SimplifyConvert complies with international cookie regulations: EU (ePrivacy Directive) - Users in the EU must explicitly consent to non-essential cookies before they are set. We obtain your consent through our cookie banner. GDPR - Cookies fall under GDPR data protection requirements. We ensure your cookie data is processed lawfully and securely. CCPA (California) - California users have the right to know about cookies and opt-out of certain cookie usage. Our cookie preferences allow you to manage this. These regulations require websites to be transparent about cookie use and provide users with control.'
    },
    {
      title: '10. Security & Cookie Safety',
      content: 'We take several measures to protect your cookie data: All cookies are transmitted over secure HTTPS connections, Cookies do not contain sensitive personal information (passwords, payment details, etc.), We use HttpOnly flag on session cookies to prevent JavaScript access, Cookies are regularly audited for security vulnerabilities, We do not share cookie data with unauthorized third parties. However, cookies can be intercepted if you use unsecured Wi-Fi networks. We recommend using secure, password-protected networks when accessing SimplifyConvert.'
    },
    {
      title: '11. Cookie Analytics & Reports',
      content: 'SimplifyConvert uses cookies to generate analytics reports that show: Total visitors to our website, Most popular tools and features, User geographic location (country/region level only), Device types used to access our site, Browser types and versions, Average session duration, Referral sources (where users came from). All analytics data is anonymized and aggregated. Individual cookies or user behavior is never shared with third parties without consent. These analytics help us continuously improve our services and user experience.'
    },
    {
      title: '12. Updates to This Cookie Policy',
      content: 'SimplifyConvert may update this Cookie Policy periodically to reflect changes in our cookie practices, new technologies, or applicable regulations. We will notify you of significant changes by: Posting the updated policy on our website, Displaying a prominent notice if major changes are made, Requiring explicit consent if cookie types change substantially. Your continued use of SimplifyConvert after policy updates means you accept the new policy. We recommend reviewing this policy regularly to stay informed.'
    },
    {
      title: '13. Contact Us',
      content: 'If you have any questions or concerns about our cookie practices, please contact: Email: info@simplifymove.com, We will respond to all cookie-related inquiries within 5 business days. If you believe your cookie rights have been violated or you have privacy concerns related to cookies, you can also contact your local data protection authority (in the EU or other jurisdictions with data protection regulations).'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Top Navigation Header */}
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
            Cookie Policy
          </motion.h1>
          <motion.p
            className="text-xl text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Last updated: April 2026
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
            SimplifyConvert uses cookies to enhance your browsing experience, analyze website traffic, and remember your preferences. This Cookie Policy explains what cookies are, why we use them, and how you can control them.
          </p>

          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className="border-l-4 border-orange-500 pl-6 py-4"
              initial={{ opacity: 0, x: -20 }}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Cookie Policy?</h2>
            <p className="text-gray-600 text-lg mb-6">
              If you have any questions or concerns about our cookie practices, please contact us at info@simplifymove.com
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
