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
    description: 'Estimate startup runway from entered funds, burn, revenue, and growth assumptions',
    icon: '📊',
    color: 'from-purple-600 to-purple-700',
    badge: 'Advanced',
  },
  {
    id: 'saas-profit',
    title: '💼 SaaS Profit Simulator',
    description: 'Explore SaaS revenue, churn, costs, and profitability scenarios',
    icon: '📈',
    color: 'from-blue-600 to-blue-700',
    badge: 'Advanced',
  },
  {
    id: 'loan-optimizer',
    title: '🏦 Loan Repayment Calculator',
    description: 'Estimate EMI, interest costs, and repayment timing from entered loan terms',
    icon: '💰',
    color: 'from-green-600 to-green-700',
    badge: 'Advanced',
  },
  {
    id: 'india-tax',
    title: '🇮🇳 India Tax Estimator',
    description: 'Under review and not for current Indian tax filing or planning',
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
                    <span className="text-white/80 text-sm font-semibold">FINANCIAL PLANNING TOOLS</span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    Free Financial Calculators
                    <span className="block bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      for Loans, Tax & Startups
                    </span>
                  </h1>

                  <p className="text-lg text-white/90 mb-6 leading-relaxed">
                    Explore startup runway, SaaS performance, and loan repayment scenarios using the values and assumptions you enter. The India Tax Estimator is currently under review and is not available for current filing or tax-planning calculations.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {[
                      { icon: Zap, text: 'Input-based estimates' },
                      { icon: Target, text: 'Scenario Based' },
                      { icon: Sparkles, text: 'Defined Assumptions' },
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
                    { number: '⚡', label: 'Interactive Results', icon: '✨' },
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
                Select from focused financial calculators designed for different planning scenarios
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
                    title: 'Defined Calculations',
                    desc: 'Complex financial modeling, not simple math',
                  },
                  {
                    icon: ChevronRight,
                    title: 'Detailed Insights',
                    desc: 'Month-by-month projections based on entered assumptions',
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Four Focused Planning Calculators</h2>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Explore a <Link href="/all-tools/financial-calculators/startup-runway" className="text-green-600 font-medium hover:underline">startup runway estimate</Link>, <Link href="/all-tools/financial-calculators/saas-profit" className="text-green-600 font-medium hover:underline">SaaS profit scenario</Link>, <Link href="/all-tools/financial-calculators/loan-optimizer" className="text-green-600 font-medium hover:underline">loan repayment comparison</Link>, or <Link href="/all-tools/financial-calculators/india-tax" className="text-green-600 font-medium hover:underline">Indian income tax estimate</Link>. Each calculator has a narrower purpose and depends on the figures and assumptions entered.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Each calculator applies a defined set of assumptions to the values you enter. Use the output to explore scenarios, then verify formulas, dates, tax rules, rates, and source figures before making a financial decision.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Defined Calculations</h3>
                  <p className="text-gray-700 text-sm">Each calculator applies its documented calculation method to the values you enter. Review the assumptions and limitations shown with the calculator before interpreting the result.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Interactive Scenarios</h3>
                  <p className="text-gray-700 text-sm">Adjust the available inputs to compare different scenarios. Results depend on the figures entered and the calculation assumptions used by each tool.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Informational Estimates</h3>
                  <p className="text-gray-700 text-sm">Results are informational estimates, not accounting, tax, legal, investment, or lending advice.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Input Privacy Guidance</h3>
                  <p className="text-gray-700 text-sm">Calculator inputs are sent to the financial-calculator service. Avoid entering account numbers, credentials, or personally identifying financial records.</p>
                </div>
              </div>

              {/* Popular Use Cases */}
              <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Financial Calculator Uses</h2>
                <p className="text-gray-700 mb-6">These calculators can be used to explore:</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Startup Runway Scenarios:</strong> Explore runway, cash burn, revenue assumptions, and possible funding gaps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>SaaS Scenario Modeling:</strong> Explore MRR, churn, costs, and profitability under the assumptions entered</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Loan & EMI Estimates:</strong> Review estimated EMI, total interest, repayment timing, and the effect of additional payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>India Tax Calculator:</strong> Currently under review and unavailable for current filing, payment, or tax-planning decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Scenario Review:</strong> Change assumptions to see how the displayed runway, profit, repayment, or tax estimate responds</span>
                  </li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Calculator Scenarios</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  This collection covers four defined workflows: startup runway, SaaS profit, loan repayment, and Indian income tax estimates. Select the calculator that matches the question you are exploring, and treat its result as an estimate based on the inputs and assumptions shown.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The available calculator workflows include:
                </p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/startup-runway" className="text-green-600 font-medium hover:underline">Startup Runway Calculator</Link>:</strong> Explore cash burn, runway, and funding scenarios from entered assumptions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/saas-profit" className="text-green-600 font-medium hover:underline">SaaS Profit Simulator</Link>:</strong> Explore recurring revenue, churn, costs, and profitability scenarios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/loan-optimizer" className="text-green-600 font-medium hover:underline">Loan Repayment Calculator</Link>:</strong> Estimate EMI, interest costs, and repayment timing from entered loan terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong><Link href="/all-tools/financial-calculators/india-tax" className="text-green-600 font-medium hover:underline">India Tax Estimator</Link>:</strong> Currently under review and not available for current tax planning or filing</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Financial Calculators</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Select the calculator that matches the scenario you want to explore, then enter the requested values such as revenue, expenses, loan amount, or growth assumptions. Review the result together with the assumptions and limitations shown on the calculator page, and adjust inputs to compare scenarios. Verify important figures independently before using an estimate in a financial decision. For <Link href="/all-tools/data" className="text-green-600 font-medium hover:underline">data conversion tools</Link> to format your financial data, visit our converter section.
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
                text: 'The four calculators on this page are available without Premium AI Studio credits. Normal service limits can still apply.'
              }
            },
            {
              name: 'What can I do with the financial calculator results?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use the results to explore scenarios and understand how changes to the entered assumptions affect the displayed estimate. Verify important figures independently before using them in business, borrowing, investment, tax, or other financial decisions.'
              }
            },
            {
              name: 'Are the calculations reliable?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The calculators produce estimates from the inputs and assumptions shown. They can contain errors or omit rules relevant to your situation. Verify important results and consult an appropriately qualified professional.'
              }
            },
            {
              name: 'Can I use these calculators for business decisions?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The startup, SaaS, and loan calculators can support scenario exploration, but their outputs are estimates rather than professional advice. Verify material assumptions and results before using them in business plans, presentations, borrowing decisions, or investor materials.'
              }
            },
            {
              name: 'Do I need an account to use the calculators?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The calculators can currently be opened without using Premium AI Studio credits. Calculator inputs are submitted to the financial-calculator service for processing, so avoid entering account numbers, credentials, or personally identifying financial records.'
              }
            },
            {
              name: 'What financial calculators do you offer?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The collection includes a Startup Runway Calculator, SaaS Profit Simulator, and loan repayment calculator. The India Tax Estimator is currently under review and should not be used for current filing, payment, or tax-planning calculations.'
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
            name: 'Financial Calculators',
            description: 'Scenario calculators for startup runway, SaaS performance, and loan repayment, with an India tax calculator currently under review',
            itemListElement: [
              {
                '@type': 'SoftwareApplication',
                position: 1,
                name: 'Startup Runway Calculator',
                description: 'Estimate startup runway from entered funds, burn, revenue, and growth assumptions',
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
                description: 'Explore SaaS revenue, churn, costs, and profitability scenarios',
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
                name: 'Loan Repayment Calculator',
                description: 'Estimate EMI, interest costs, and repayment timing from entered loan terms',
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
                description: 'Under review and not for current Indian tax filing or planning',
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
