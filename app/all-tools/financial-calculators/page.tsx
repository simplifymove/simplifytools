'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, ChevronRight, Zap, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { FAQ } from '@/app/components/FAQ';

const financialTools = [
  {
    id: 'startup-runway',
    title: '🚀 Startup Runway Calculator',
    description: 'Calculate months of runway and project financial trajectory for startups',
    icon: '📊',
    color: 'from-purple-600 to-purple-700',
    badge: 'Advanced',
  },
  {
    id: 'saas-profit',
    title: '💼 SaaS Profit Simulator',
    description: 'Model MRR growth, churn, and profitability for SaaS businesses',
    icon: '📈',
    color: 'from-blue-600 to-blue-700',
    badge: 'Advanced',
  },
  {
    id: 'loan-optimizer',
    title: '🏦 Loan Optimization Engine',
    description: 'Analyze loan terms, EMI, and create optimal payment strategies',
    icon: '💰',
    color: 'from-green-600 to-green-700',
    badge: 'Advanced',
  },
  {
    id: 'india-tax',
    title: '🇮🇳 India Tax Estimator',
    description: 'Calculate taxes, deductions, and optimization for Indian residents',
    icon: '💵',
    color: 'from-orange-600 to-orange-700',
    badge: 'India-Specific',
  },
];

export default function FinancialCalculatorsPage() {
  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex items-center gap-2 text-white/80 text-sm"
              >
                <Link href="/" className="hover:text-white transition">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span className="text-white">Financial Calculators</span>
              </motion.div>

              {/* Main Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Side */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-semibold">ADVANCED FINANCIAL TOOLS</span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    Free Financial Calculators
                    <span className="block bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      for Loans, Tax & Startups
                    </span>
                  </h1>

                  <p className="text-lg text-white/90 mb-6 leading-relaxed">
                    Designed for advanced financial analysis. Create financial models, projections, and data-driven planning for startups, SaaS businesses, loans, and tax planning. Free online calculator tools with no signup or credit card required.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {[
                      { icon: Zap, text: 'Real-time' },
                      { icon: Target, text: 'Accurate' },
                      { icon: Sparkles, text: 'Professional' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm"
                      >
                        <item.icon size={16} />
                        {item.text}
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link
                      href="#calculators"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
                    >
                      Explore Calculators
                      <ArrowRight size={20} />
                    </Link>
                  </motion.div>
                </div>

                {/* Right Side - Stats/Benefits */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  {[
                    { number: '4', label: 'Advanced Calculators', icon: '📊' },
                    { number: '⚡', label: 'Instant Results', icon: '✨' },
                    { number: '📈', label: 'Scenario Planning', icon: '🎯' },
                    { number: '💰', label: 'Free to Use', icon: '✅' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-white"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{stat.icon}</span>
                        <div>
                          <div className="text-2xl font-bold">{stat.number}</div>
                          <div className="text-white/70 text-sm">{stat.label}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-16" id="calculators">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Calculator
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select from our suite of advanced financial tools designed for different business needs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {financialTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Link href={`/all-tools/financial-calculators/${tool.id}`}>
                    <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{tool.icon}</div>
                        <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full ${
                          tool.color.includes('purple') ? 'bg-purple-600' :
                          tool.color.includes('blue') ? 'bg-blue-600' :
                          tool.color.includes('green') ? 'bg-green-600' :
                          'bg-orange-600'
                        }`}>
                          {tool.badge}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {tool.description}
                      </p>

                      <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
                        <span>Use Calculator</span>
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-blue-50 border-t border-blue-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Use Our Calculators?</h2>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: TrendingUp,
                    title: 'Advanced Algorithms',
                    desc: 'Complex financial modeling, not simple math',
                  },
                  {
                    icon: ChevronRight,
                    title: 'Detailed Insights',
                    desc: 'Month-by-month projections and recommendations',
                  },
                  {
                    icon: ArrowRight,
                    title: 'Scenario Planning',
                    desc: 'Model different assumptions and outcomes',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="bg-white rounded-lg p-6 text-center"
                  >
                    <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="py-12 px-4 md:px-8 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Our Financial Calculators?</h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                SimplifyConvert provides advanced <Link href="/all-tools" className="text-green-600 font-medium hover:underline">financial calculator tools</Link> designed for advanced financial analysis. Create models, projections, and scenario planning for startups, small businesses, loan analysis, and tax planning. Whether you need a <Link href="/all-tools/financial-calculators/startup-runway" className="text-green-600 font-medium hover:underline">startup runway calculator</Link>, <Link href="/all-tools/financial-calculators/saas-profit" className="text-green-600 font-medium hover:underline">SaaS profit simulator</Link>, <Link href="/all-tools/financial-calculators/loan-optimizer" className="text-green-600 font-medium hover:underline">loan optimization tool</Link>, or <Link href="/all-tools/financial-calculators/india-tax" className="text-green-600 font-medium hover:underline">India tax estimator</Link>, our calculators provide instant, reliable estimates without signup or fees.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Unlike basic Excel sheets or simple calculators, these tools provide deeper financial insights and projections. Automated calculations eliminate manual errors, while built-in formulas handle complex financial scenarios that would take hours in spreadsheets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Advanced Algorithms</h3>
                  <p className="text-gray-700 text-sm">Complex financial modeling beyond simple arithmetic. Get month-by-month projections, scenario planning, and detailed insights for informed planning.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Real-Time Results</h3>
                  <p className="text-gray-700 text-sm">Instant calculations with no delays. Adjust inputs and see results immediately. Perfect for quick what-if analysis and financial planning sessions.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Business-Ready Insights</h3>
                  <p className="text-gray-700 text-sm">Actionable recommendations and detailed breakdowns. Use results for pitch decks, investor presentations, business planning, and financial strategy decisions.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ 100% Free & Private</h3>
                  <p className="text-gray-700 text-sm">No hidden fees, no premium tiers, no signup required. Your financial data stays private. Use unlimited times for business and personal planning.</p>
                </div>
              </div>

              {/* Popular Use Cases */}
              <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Financial Calculator Uses</h2>
                <p className="text-gray-700 mb-6">Our free financial calculators help with:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Startup Financial Planning:</strong> Calculate runway, cash burn, profitability timelines, and investor funding requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>SaaS Business Modeling:</strong> Project MRR growth, analyze churn impact, and forecast profitability with growth scenarios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Loan & EMI Analysis:</strong> Compare loan terms, calculate EMI, optimize payment strategies, and analyze total interest costs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Tax Planning:</strong> Estimate taxes, identify deductions, and optimize savings for Indian residents and businesses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Investment Analysis:</strong> Evaluate returns, compare investment options, and model long-term wealth growth scenarios</span>
                  </li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Free Financial Calculators Online</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Looking for the best free financial calculators? Our collection delivers professional-grade financial analysis tools designed for everyone. Whether you're an entrepreneur calculating startup runway, a SaaS founder modeling growth, or an individual planning finances, our online financial calculators provide instant, reliable results without signup or fees.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our best financial calculators include:
                </p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/startup-runway" className="text-green-600 font-medium hover:underline">Startup Runway Calculator</Link>:</strong> Best for entrepreneurs planning cash burn and profitability timelines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/saas-profit" className="text-green-600 font-medium hover:underline">SaaS Profit Simulator</Link>:</strong> Best online financial calculator for recurring revenue modeling and churn analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/loan-optimizer" className="text-green-600 font-medium hover:underline">Loan Optimization Engine</Link>:</strong> Best financial tool for comparing loan terms and calculating EMI payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/india-tax" className="text-green-600 font-medium hover:underline">India Tax Estimator</Link>:</strong> Best tool for tax planning and deduction optimization</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Financial Calculators</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Using our free online financial calculators is straightforward. First, select the calculator that matches your needs from our calculator suite above. Next, enter your financial data into each input field—values like revenue, expenses, loan amount, or income. Then, review the real-time results displayed instantly. Finally, adjust inputs to explore different scenarios and download or share results as needed. Each calculator includes helpful guidance and tooltips. For detailed <Link href="/all-tools/data" className="text-green-600 font-medium hover:underline">data conversion tools</Link> to format your financial data, visit our converter section.
              </p>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQ
          items={[
            {
              name: 'Are these financial calculators really free?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! All our financial calculators are completely free with no hidden costs, signup requirements, or premium features. Calculate unlimited scenarios without any charges or ads. We believe everyone deserves access to professional financial planning tools.'
              }
            },
            {
              name: 'What can I do with the financial calculator results?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Results can be used for business planning, investor presentations, personal finance decisions, pitch decks, and financial strategy. Most calculators allow downloading or exporting results. Use them for startups, established businesses, loan comparisons, or tax planning.'
              }
            },
            {
              name: 'Are the calculations reliable?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our financial calculators use standard algorithms and formulas for financial modeling. Results provide reliable estimates for planning and decision-making purposes. Always consult a financial advisor for critical business or investment decisions.'
              }
            },
            {
              name: 'Can I use these calculators for business decisions?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Absolutely! Our advanced calculators are designed for business use including startup planning, SaaS modeling, and loan analysis. Results can be used in presentations, business plans, and investor pitches. For critical decisions, verify with professional financial advisors.'
              }
            },
            {
              name: 'Do I need an account to use the calculators?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No account required! Access all financial calculators immediately. No registration, no email verification needed. Just select a calculator, enter your data, and get instant results. No signup required. Data is processed securely and not permanently stored.'
              }
            },
            {
              name: 'What financial calculators do you offer?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'We offer advanced financial calculators including Startup Runway Calculator for projecting cash burn and runway; SaaS Profit Simulator for MRR and churn analysis; Loan Optimization Engine for EMI and term comparison; and India Tax Estimator for tax planning and deductions.'
              }
            }
          ]}
          colorClass="green"
          bgColor="white"
        />

        {/* Calculators ItemList Schema for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Free Financial Calculators',
            description: 'Advanced financial calculators for startups, SaaS businesses, loan optimization, and tax planning',
            itemListElement: [
              {
                '@type': 'SoftwareApplication',
                position: 1,
                name: 'Startup Runway Calculator',
                description: 'Calculate months of runway and project financial trajectory for startups',
                url: 'https://simplifyconvert.com/all-tools/financial-calculators/startup-runway',
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD'
                }
              },
              {
                '@type': 'SoftwareApplication',
                position: 2,
                name: 'SaaS Profit Simulator',
                description: 'Model MRR growth, churn, and profitability for SaaS businesses',
                url: 'https://simplifyconvert.com/all-tools/financial-calculators/saas-profit',
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD'
                }
              },
              {
                '@type': 'SoftwareApplication',
                position: 3,
                name: 'Loan Optimization Engine',
                description: 'Analyze loan terms, EMI, and create optimal payment strategies',
                url: 'https://simplifyconvert.com/all-tools/financial-calculators/loan-optimizer',
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD'
                }
              },
              {
                '@type': 'SoftwareApplication',
                position: 4,
                name: 'India Tax Estimator',
                description: 'Calculate taxes, deductions, and optimization for Indian residents',
                url: 'https://simplifyconvert.com/all-tools/financial-calculators/india-tax',
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD'
                }
              }
            ]
          })}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Financial Calculators',
                item: 'https://simplifyconvert.com/all-tools/financial-calculators'
              }
            ]
          })}
        </script>
      </div>
    </>
  );
}
