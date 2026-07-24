'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Download, ArrowLeft, Loader, ChevronRight, Zap, CheckCircle, TrendingUp, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { detectUserLocation, formatCurrency, getCurrencySymbol, type UserLocation } from '@/app/lib/geolocation-currency';
import { uploadBrowserTextDownloadResult } from '@/app/lib/download-result-client';

const calculatorConfig: Record<string, any> = {
  'startup-runway': {
    title: 'Startup Runway Calculator',
    description: 'Project your startup\'s financial runway and funding needs',
    icon: '🚀',
    currencyFields: ['currentFunds', 'monthlyBurnRate', 'projectedRevenue', 'targetFunding'],
    fields: [
      { name: 'currentFunds', label: 'Current Funds', type: 'number', placeholder: '500000', required: true, isCurrency: true },
      { name: 'monthlyBurnRate', label: 'Monthly Burn Rate', type: 'number', placeholder: '50000', required: true, isCurrency: true },
      { name: 'burnGrowthRate', label: 'Burn Growth Rate (% per month)', type: 'number', placeholder: '5', required: false },
      { name: 'projectedRevenue', label: 'Projected Monthly Revenue', type: 'number', placeholder: '10000', required: false, isCurrency: true },
      { name: 'revenueGrowthRate', label: 'Revenue Growth Rate (% per month)', type: 'number', placeholder: '10', required: false },
      { name: 'targetFunding', label: 'Target Funding Amount', type: 'number', placeholder: '2000000', required: false, isCurrency: true },
      { name: 'fundingMonths', label: 'Months to Next Funding', type: 'number', placeholder: '12', required: false },
    ],
  },
  'saas-profit': {
    title: 'SaaS Profit Simulator',
    description: 'Model revenue growth, costs, and profitability for SaaS businesses',
    icon: '💼',
    currencyFields: ['initialMRR', 'customerAcquisitionCost', 'lifetimeValue', 'operatingCosts'],
    fields: [
      { name: 'initialMRR', label: 'Initial MRR', type: 'number', placeholder: '50000', required: true, isCurrency: true },
      { name: 'mrrGrowthRate', label: 'MRR Growth Rate (% per month)', type: 'number', placeholder: '5', required: true },
      { name: 'customerAcquisitionCost', label: 'Customer Acquisition Cost', type: 'number', placeholder: '500', required: true, isCurrency: true },
      { name: 'lifetimeValue', label: 'Customer Lifetime Value', type: 'number', placeholder: '5000', required: true, isCurrency: true },
      { name: 'monthlyChurnRate', label: 'Monthly Churn Rate (%)', type: 'number', placeholder: '5', required: true },
      { name: 'operatingCosts', label: 'Monthly Operating Costs', type: 'number', placeholder: '30000', required: true, isCurrency: true },
      { name: 'costGrowthRate', label: 'Cost Growth Rate (% per month)', type: 'number', placeholder: '2', required: false },
      { name: 'months', label: 'Forecast Period (months)', type: 'number', placeholder: '12', required: true },
    ],
  },
  'loan-optimizer': {
    title: 'Loan Optimization Engine',
    description: 'Analyze loan terms and create optimal payment strategies',
    icon: '🏦',
    currencyFields: ['loanAmount', 'extraMonthlyPayment'],
    fields: [
      { name: 'loanAmount', label: 'Loan Amount', type: 'number', placeholder: '300000', required: true, isCurrency: true },
      { name: 'annualInterestRate', label: 'Annual Interest Rate (%)', type: 'number', placeholder: '7.5', required: true },
      { name: 'loanTermYears', label: 'Loan Term (years)', type: 'number', placeholder: '15', required: true },
      { name: 'extraMonthlyPayment', label: 'Extra Monthly Payment', type: 'number', placeholder: '1000', required: false, isCurrency: true },
      { name: 'currentAge', label: 'Your Current Age', type: 'number', placeholder: '35', required: false },
      { name: 'retirementAge', label: 'Target Retirement Age', type: 'number', placeholder: '60', required: false },
    ],
  },
  'india-tax': {
    title: 'India Tax Estimator',
    description: 'Calculate taxes and find optimization opportunities (FY 2024-25)',
    icon: '🇮🇳',
    isCurrencyINR: true,
    currencyFields: ['grossIncome', 'section80CDeductions', 'section80DDeductions', 'section80EDeductions', 'section80EEADeductions', 'section80GDeductions', 'capitalGainsLongTerm', 'capitalGainsShortTerm', 'deductibleExpenses'],
    fields: [
      { name: 'grossIncome', label: 'Gross Income', type: 'number', placeholder: '1500000', required: true, isCurrency: true },
      { name: 'section80CDeductions', label: 'Section 80C Deductions (max ₹1,50,000)', type: 'number', placeholder: '150000', required: false, isCurrency: true },
      { name: 'section80CTTCDeductions', label: 'Section 80CTT (Teachers only)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'section80DDeductions', label: 'Section 80D (Health Insurance)', type: 'number', placeholder: '25000', required: false, isCurrency: true },
      { name: 'section80EDeductions', label: 'Section 80E (Student Loan Interest)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'section80EEADeductions', label: 'Section 80EEA (First-time Home Buyers)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'section80GDeductions', label: 'Section 80G (Charity)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'capitalGainsLongTerm', label: 'Long-term Capital Gains', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'capitalGainsShortTerm', label: 'Short-term Capital Gains', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'section80TTCapitalGains', label: 'Section 80TT (max ₹50,000)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'deductibleExpenses', label: 'Deductible Expenses (Business/Professional)', type: 'number', placeholder: '0', required: false, isCurrency: true },
      { name: 'financialYear', label: 'Financial Year', type: 'number', placeholder: '2024', required: false },
    ],
  },
};

export default function CalculatorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string | undefined) ?? '';

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Detect user location on mount
  useEffect(() => {
    const detectLocation = async () => {
      const location = await detectUserLocation();
      setUserLocation(location);
      // Auto-select detected currency
      setSelectedCurrencyCode(location.currency.code);
    };
    detectLocation();
  }, []);

  const config = calculatorConfig[slug];

  if (!config) {
    return (
      <>
        <HomeHeader />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <p className="text-lg text-gray-600">Calculator not found</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show loading if still detecting location or currency not selected
  if (!userLocation || !selectedCurrencyCode) {
    return (
      <>
        <HomeHeader />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              <p className="text-lg text-gray-600">Loading calculator...</p>
            </div>
          </div>
        </main>
      </>
    );
  }
  const getAllCurrencies = () => {
    const currencies = new Map<string, { code: string; symbol: string; name: string }>();
    
    // Collect unique currencies from all countries
    const countryToCurrency: Record<string, any> = {
      IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      US: { code: 'USD', symbol: '$', name: 'US Dollar' },
      GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
      CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      DE: { code: 'EUR', symbol: '€', name: 'Euro' },
      JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
      SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
      HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
      BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
      MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
      ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
      SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Arabian Riyal' },
      AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
      PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
      BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
      TH: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
      MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
      KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    };

    Object.values(countryToCurrency).forEach(curr => {
      if (!currencies.has(curr.code)) {
        currencies.set(curr.code, curr);
      }
    });

    return Array.from(currencies.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const availableCurrencies = getAllCurrencies();
  const currentCurrency = availableCurrencies.find(c => c.code === selectedCurrencyCode) || userLocation.currency;
  const currencySymbol = currentCurrency.symbol;

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/financial-calculators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator: slug,
          inputs,
          currency: selectedCurrencyCode,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || 'Calculation failed');
      } else {
        setResult({ ...data.result, currencyCode: selectedCurrencyCode });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = async () => {
    const textToDownload = JSON.stringify(result, null, 2);
    const outputName = `${slug}-result.txt`;

    try {
      const download = await uploadBrowserTextDownloadResult({
        text: textToDownload,
        toolSlug: slug,
        originalName: outputName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="relative bg-linear-to-r from-blue-600 to-indigo-700 overflow-hidden min-h-70 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-2 text-white text-sm">
                <Link href="/" className="hover:opacity-80">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools/financial-calculators" className="hover:opacity-80">Financial Calculators</Link>
                <ChevronRight size={16} />
                <span className="opacity-90">{config.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold">
                  <Globe size={16} />
                  <select
                    value={selectedCurrencyCode}
                    onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                    className="bg-transparent text-white font-semibold border-none outline-none cursor-pointer"
                  >
                    {availableCurrencies.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-gray-900 text-white">
                        {curr.name} ({curr.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{config.icon}</div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{config.title}</h1>
                  <p className="text-white/95 text-lg">{config.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
          >
            {/* Input Form */}
            <div className="md:col-span-1">
              <div className="sticky top-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Inputs</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {config.fields.map((field: any) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.isCurrency && <span className="text-gray-500 ml-1">({currencySymbol})</span>}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={inputs[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  ))}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Calculate
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Results */}
            <div className="md:col-span-2 space-y-6">
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle size={24} className="text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                  </div>

                  {/* Custom Result Display Based on Calculator Type */}
                  {slug === 'startup-runway' && (
                    <ResultDisplayStartupRunway result={result} currency={currencySymbol} formatCurrency={formatCurrency} currencyCode={selectedCurrencyCode} />
                  )}
                  {slug === 'saas-profit' && (
                    <ResultDisplaySaasProfit result={result} currency={currencySymbol} formatCurrency={formatCurrency} currencyCode={selectedCurrencyCode} />
                  )}
                  {slug === 'loan-optimizer' && (
                    <ResultDisplayLoanOptimizer result={result} currency={currencySymbol} formatCurrency={formatCurrency} currencyCode={selectedCurrencyCode} />
                  )}
                  {slug === 'india-tax' && (
                    <ResultDisplayIndiaTax result={result} currency={currencySymbol} formatCurrency={formatCurrency} currencyCode={selectedCurrencyCode} />
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={downloadResult}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </motion.div>
              )}

              {!result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={32} className="text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to calculate</h3>
                  <p className="text-gray-600">Fill in the inputs and click Calculate to see detailed results and projections</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
}

// ============================================
// Result Display Components
// ============================================

function ResultDisplayStartupRunway({ result, currency, formatCurrency, currencyCode }: any) {
  // Handle null/undefined values
  if (!result || result.currentRunway == null) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Error: Unable to calculate runway. Please check your inputs and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Current Runway</p>
          <p className="text-3xl font-bold text-purple-900">{result.currentRunway.toFixed(1)} mo</p>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Break-even Month</p>
          <p className="text-3xl font-bold text-blue-900">{result.breakEvenMonth > 0 ? result.breakEvenMonth : 'N/A'}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {result.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              {rec}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Monthly Projection (First 12 months)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-right">Funds</th>
                <th className="px-3 py-2 text-right">Runway</th>
              </tr>
            </thead>
            <tbody>
              {result.monthlyProjection.slice(0, 12).map((row: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">{row.month}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.funds, currencyCode)}</td>
                  <td className="px-3 py-2 text-right">{row.runway} mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultDisplaySaasProfit({ result, currency, formatCurrency, currencyCode }: any) {
  // Handle null/undefined values
  if (!result || result.profit == null || result.roi == null) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Error: Unable to calculate SaaS profit. Please check your inputs and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Total Profit</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(result.profit, currencyCode)}</p>
        </div>
        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
          <p className="text-sm text-indigo-600 font-medium">ROI</p>
          <p className="text-3xl font-bold text-indigo-900">{result.roi.toFixed(1)}%</p>
        </div>
        <div className="bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">LTV:CAC Ratio</p>
          <p className="text-3xl font-bold text-orange-900">{(result.ltvCacRatio || 0).toFixed(2)}:1</p>
        </div>
        <div className="bg-linear-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Payback Period</p>
          <p className="text-3xl font-bold text-red-900">{result.paybackPeriod > 0 ? result.paybackPeriod : '∞'} mo</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {result.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              {rec}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Monthly Breakdown (First 12 months)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-right">MRR</th>
                <th className="px-3 py-2 text-right">Costs</th>
                <th className="px-3 py-2 text-right">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {result.monthlyBreakdown.slice(0, 12).map((row: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">{row.month}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.mrr, currencyCode)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.costs, currencyCode)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(row.cumulative, currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultDisplayLoanOptimizer({ result, currency, formatCurrency, currencyCode }: any) {
  // Handle null/undefined values
  if (!result || result.monthlyEMI == null || result.totalInterest == null) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Error: Unable to calculate loan optimization. Please check your inputs and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Monthly EMI</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(result.monthlyEMI, currencyCode)}</p>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Interest</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(result.totalInterest, currencyCode)}</p>
        </div>
        <div className="bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Interest Savings</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(result.interestSavings || 0, currencyCode)}</p>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Payoff Timeline</p>
          <p className="text-3xl font-bold text-purple-900">{(result.payoffMonthsWithExtra || 0)} mo</p>
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{
        backgroundColor: result.payoffBeforeRetirement ? '#dcfce7' : '#fee2e2',
        borderColor: result.payoffBeforeRetirement ? '#86efac' : '#fca5a5',
        borderWidth: '2px'
      }}>
        <p style={{ color: result.payoffBeforeRetirement ? '#166534' : '#991b1b' }} className="font-semibold">
          {result.payoffBeforeRetirement 
            ? '✓ Loan will be paid off before retirement' 
            : '⚠️ Loan extends into retirement years'}
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {(result.recommendations || []).map((rec: string, idx: number) => (
            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultDisplayIndiaTax({ result, currency, formatCurrency, currencyCode }: any) {
  // Handle null/undefined values
  if (!result || result.totalTax == null || result.effectiveTaxRate == null) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Error: Unable to calculate tax estimate. Please check your inputs and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Tax</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(result.totalTax, 'INR')}</p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Effective Tax Rate</p>
          <p className="text-3xl font-bold text-green-900">{result.effectiveTaxRate.toFixed(2)}%</p>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Total Deductions</p>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(result.totalDeductions || 0, 'INR')}</p>
        </div>
        <div className="bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Net Income</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(result.netIncome || 0, 'INR')}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Tax Breakdown</h4>
        <div className="space-y-2">
          {(result.taxBreakdown || []).map((row: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{row.slab}</span>
              <div className="text-right">
                <p className="font-semibold">{row.rate}</p>
                <p className="text-sm text-gray-600">{formatCurrency(row.tax, 'INR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {(result.recommendations || []).map((rec: string, idx: number) => (
            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
