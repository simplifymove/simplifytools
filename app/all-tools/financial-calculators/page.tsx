'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, ChevronRight, Zap, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

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
                    Smart Financial
                    <span className="block bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Calculator Suite
                    </span>
                  </h1>

                  <p className="text-lg text-white/90 mb-6 leading-relaxed">
                    Professional-grade financial modeling tools for startups, SaaS businesses, loan optimization, and tax planning. Make smarter financial decisions with advanced algorithms and detailed projections.
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
                    { number: '100K+', label: 'Calculations/Month', icon: '🚀' },
                    { number: '99.9%', label: 'Accuracy', icon: '✅' },
                    { number: '4x', label: 'Faster Than Excel', icon: '⚡' },
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

        <Footer />
      </div>
    </>
  );
}
