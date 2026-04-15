/**
 * Advanced Financial Calculator Engines
 * 
 * Provides complex financial modeling algorithms for:
 * 1. Startup Runway Calculator
 * 2. SaaS Profit Simulator
 * 3. Loan Optimization Engine
 * 4. India Tax Estimation
 */

// ============================================
// 1. STARTUP RUNWAY CALCULATOR
// ============================================

export interface StartupRunwayInputs {
  currentFunds: number;
  monthlyBurnRate: number;
  burnGrowthRate: number; // percentage change per month
  projectedRevenue: number; // monthly
  revenueGrowthRate: number;
  targetFunding: number; // next funding goal
  fundingMonths: number; // when is next funding expected
}

export interface StartupRunwayResult {
  currentRunway: number; // months at current burn rate
  projectedRunway: number; // considering growth
  breakEvenMonth: number; // month when revenue meets burn
  fundingNeeded: boolean;
  monthsToNextFunding: number;
  fundsAtNextFunding: number;
  monthlyProjection: {
    month: number;
    funds: number;
    burnRate: number;
    revenue: number;
    runway: number;
  }[];
  recommendations: string[];
}

export function calculateStartupRunway(inputs: StartupRunwayInputs): StartupRunwayResult {
  const {
    currentFunds,
    monthlyBurnRate,
    burnGrowthRate = 0,
    projectedRevenue = 0,
    revenueGrowthRate = 0,
    targetFunding = 0,
    fundingMonths = 12,
  } = inputs;

  // Validate required inputs
  if (!currentFunds || currentFunds <= 0 || !monthlyBurnRate || monthlyBurnRate <= 0) {
    return {
      currentRunway: 0,
      projectedRunway: 0,
      breakEvenMonth: -1,
      fundingNeeded: true,
      monthsToNextFunding: fundingMonths,
      fundsAtNextFunding: 0,
      monthlyProjection: [],
      recommendations: ['Please enter valid values for Current Funds and Monthly Burn Rate'],
    };
  }

  // Current runway at steady state
  const netMonthlyBurn = monthlyBurnRate - projectedRevenue;
  const currentRunway = netMonthlyBurn > 0 
    ? currentFunds / netMonthlyBurn
    : (projectedRevenue > monthlyBurnRate ? 120 : currentFunds / Math.max(1, monthlyBurnRate));

  // Project month by month
  const monthlyProjection = [];
  let funds = currentFunds;
  let burn = monthlyBurnRate;
  let revenue = projectedRevenue;
  let breakEvenMonth = -1;

  for (let month = 1; month <= 60; month++) {
    const netBurn = burn - revenue;
    funds -= netBurn;

    if (funds <= 0 && breakEvenMonth === -1) {
      breakEvenMonth = month;
    }

    // Apply growth rates
    burn *= (1 + burnGrowthRate / 100);
    revenue *= (1 + revenueGrowthRate / 100);

    // Add funding at specified month
    if (month === fundingMonths) {
      funds += targetFunding;
    }

    monthlyProjection.push({
      month,
      funds: Math.round(funds),
      burnRate: Math.round(burn),
      revenue: Math.round(revenue),
      runway: funds > 0 ? Math.round(funds / Math.max(1, burn - revenue)) : 0,
    });

    // Stop if we've gone far enough
    if (funds < 0 && month > 36) break;
  }

  // Funds at next funding round
  let fundsAtNextFunding = currentFunds;
  let monthlyNetBurn = monthlyBurnRate - projectedRevenue;
  
  for (let i = 1; i < fundingMonths; i++) {
    fundsAtNextFunding -= monthlyNetBurn;
    monthlyNetBurn *= (1 + (burnGrowthRate - revenueGrowthRate) / 100);
  }
  fundsAtNextFunding = Math.max(0, fundsAtNextFunding);

  // Recommendations
  const recommendations: string[] = [];
  
  if (currentRunway < 6) {
    recommendations.push("⚠️ Critical: Less than 6 months runway - fundraising urgent");
  } else if (currentRunway < 12) {
    recommendations.push("⚠️ Warning: Less than 12 months runway - start fundraising immediately");
  } else {
    recommendations.push("✓ Healthy runway - continue growth trajectory");
  }

  if (revenueGrowthRate < burnGrowthRate) {
    recommendations.push("💡 Revenue growing slower than burn - optimize cost structure");
  }

  if (breakEvenMonth > 0 && breakEvenMonth <= 24) {
    recommendations.push(`✓ Path to profitability in ${breakEvenMonth} months`);
  }

  const projectedRunway = funds > 0 ? funds / Math.max(1, burn - revenue) : -1;

  return {
    currentRunway: Math.round(currentRunway * 10) / 10,
    projectedRunway: projectedRunway > 0 ? Math.round(projectedRunway * 10) / 10 : -1,
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : -1,
    fundingNeeded: fundsAtNextFunding < targetFunding * 0.5,
    monthsToNextFunding: fundingMonths,
    fundsAtNextFunding: Math.round(fundsAtNextFunding),
    monthlyProjection,
    recommendations,
  };
}

// ============================================
// 2. SAAS PROFIT SIMULATOR
// ============================================

export interface SaasProfitInputs {
  initialMRR: number; // Monthly Recurring Revenue (USD)
  mrrGrowthRate: number; // % monthly
  customerAcquisitionCost: number; // CAC
  lifetimeValue: number; // LTV
  monthlyChurnRate: number; // % of customers lost
  operatingCosts: number; // monthly
  costGrowthRate: number; // % monthly
  months: number; // forecast period
}

export interface SaasProfitResult {
  projectedMRR: number; // final MRR
  totalRevenue: number; // 12 months
  totalCosts: number;
  profit: number;
  roi: number; // percentage
  paybackPeriod: number; // months
  ltvCacRatio: number;
  monthlyBreakdown: {
    month: number;
    mrr: number;
    costs: number;
    profit: number;
    cumulative: number;
    customers: number;
  }[];
  recommendations: string[];
}

export function calculateSaasProfitSimulation(inputs: SaasProfitInputs): SaasProfitResult {
  const {
    initialMRR,
    mrrGrowthRate,
    customerAcquisitionCost,
    lifetimeValue,
    monthlyChurnRate,
    operatingCosts: initialCosts,
    costGrowthRate,
    months,
  } = inputs;

  const monthlyBreakdown = [];
  let mrr = initialMRR;
  let costs = initialCosts;
  let cumulative = 0;
  let totalRevenue = 0;
  let totalCosts = 0;
  let paybackMonth = -1;

  // Estimate customer count
  let estimatedCustomers = initialMRR / 100; // assumption: avg $100 MRR per customer

  for (let month = 1; month <= months; month++) {
    // Apply churn
    estimatedCustomers *= (1 - monthlyChurnRate / 100);
    
    // Add new customers (from growth)
    const newCustomers = (mrr - (mrr / (1 + mrrGrowthRate / 100))) / 100;
    estimatedCustomers += Math.max(0, newCustomers);

    const profit = mrr - costs;
    cumulative += profit;
    totalRevenue += mrr;
    totalCosts += costs;

    if (paybackMonth === -1 && cumulative > 0) {
      paybackMonth = month;
    }

    monthlyBreakdown.push({
      month,
      mrr: Math.round(mrr),
      costs: Math.round(costs),
      profit: Math.round(profit),
      cumulative: Math.round(cumulative),
      customers: Math.round(estimatedCustomers),
    });

    // Growth
    mrr *= (1 + mrrGrowthRate / 100);
    costs *= (1 + costGrowthRate / 100);
  }

  const roi = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100) : 0;
  const ltvCacRatio = customerAcquisitionCost > 0 ? lifetimeValue / customerAcquisitionCost : 0;

  const recommendations: string[] = [];

  if (ltvCacRatio < 3) {
    recommendations.push("⚠️ LTV:CAC ratio < 3:1 - unit economics need improvement");
  } else if (ltvCacRatio >= 3 && ltvCacRatio < 5) {
    recommendations.push("✓ Healthy LTV:CAC ratio - sustainable growth model");
  } else {
    recommendations.push("✓ Excellent LTV:CAC ratio - strong economics");
  }

  if (monthlyChurnRate > 10) {
    recommendations.push("⚠️ Churn rate > 10% - focus on retention improvements");
  }

  if (paybackMonth > 0 && paybackMonth <= 12) {
    recommendations.push(`✓ Payback period: ${paybackMonth} months - good cash flow health`);
  } else if (paybackMonth > 12) {
    recommendations.push(`💡 Long payback period (${paybackMonth} months) - optimize costs or increase growth`);
  }

  if (costGrowthRate > mrrGrowthRate) {
    recommendations.push("⚠️ Costs growing faster than revenue - need to control expenses");
  }

  return {
    projectedMRR: Math.round(mrr),
    totalRevenue: Math.round(totalRevenue),
    totalCosts: Math.round(totalCosts),
    profit: Math.round(totalRevenue - totalCosts),
    roi: Math.round(roi * 100) / 100,
    paybackPeriod: paybackMonth > 0 ? paybackMonth : -1,
    ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
    monthlyBreakdown,
    recommendations,
  };
}

// ============================================
// 3. LOAN OPTIMIZATION ENGINE
// ============================================

export interface LoanOptimizerInputs {
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
  extraMonthlyPayment: number;
  currentAge: number;
  retirementAge: number;
}

export interface LoanOptimizationResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  payoffMonthsStandard: number;
  payoffMonthsWithExtra: number;
  interestSavings: number;
  payoffBeforeRetirement: boolean;
  monthlySchedule: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  recommendations: string[];
}

export function calculateLoanOptimization(inputs: LoanOptimizerInputs): LoanOptimizationResult {
  const {
    loanAmount,
    annualInterestRate,
    loanTermYears,
    extraMonthlyPayment,
    currentAge,
    retirementAge,
  } = inputs;

  const monthlyRate = annualInterestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  // Calculate base EMI (Equated Monthly Installment)
  const monthlyEMI = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Calculate total interest without extra payment
  const totalInterestStandard = (monthlyEMI * totalMonths) - loanAmount;

  // Month-by-month breakdown with extra payment
  const monthlySchedule = [];
  let balance = loanAmount;
  let totalInterestWithExtra = 0;
  let totalPaymentWithExtra = 0;
  let payoffMonth = 0;

  for (let month = 1; balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyEMI + extraMonthlyPayment - interestPayment, balance);
    const totalPayment = interestPayment + principalPayment;

    balance -= principalPayment;
    totalInterestWithExtra += interestPayment;
    totalPaymentWithExtra += totalPayment;

    if (month <= totalMonths * 1.5) { // reasonable limit
      monthlySchedule.push({
        month,
        payment: Math.round(totalPayment),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    if (balance <= 0 && payoffMonth === 0) {
      payoffMonth = month;
    }
  }

  const yearsToPayoff = payoffMonth / 12;
  const payoffAge = currentAge + yearsToPayoff;
  const payoffBeforeRetirement = payoffAge <= retirementAge;
  const interestSavings = totalInterestStandard - totalInterestWithExtra;

  const recommendations: string[] = [];

  if (payoffBeforeRetirement) {
    recommendations.push(`✓ Loan paid off by age ${Math.round(payoffAge)} - before retirement`);
  } else {
    recommendations.push(`⚠️ Loan extends to age ${Math.round(payoffAge)} - past retirement (${retirementAge})`);
  }

  if (extraMonthlyPayment > 0) {
    const yearsFromStandard = totalMonths / 12;
    const monthsReduced = totalMonths - payoffMonth;
    recommendations.push(`💡 Extra payment saves ${Math.round(interestSavings.toLocaleString())} and pays off ${Math.round(monthsReduced / 12)} years early`);
  }

  if (annualInterestRate > 7) {
    recommendations.push("💡 Consider refinancing at lower rates");
  }

  return {
    monthlyEMI: Math.round(monthlyEMI),
    totalInterest: Math.round(totalInterestStandard),
    totalPayment: Math.round((monthlyEMI * totalMonths)),
    payoffMonthsStandard: totalMonths,
    payoffMonthsWithExtra: payoffMonth,
    interestSavings: Math.round(interestSavings),
    payoffBeforeRetirement,
    monthlySchedule: monthlySchedule.slice(0, 60), // First 5 years
    recommendations,
  };
}

// ============================================
// 4. INDIA TAX ESTIMATION
// ============================================

export interface IndiaTaxInputs {
  financialYear: number; // 2024, 2025, etc.
  grossIncome: number;
  section80CDeductions: number; // Till 1,50,000
  section80CTTCDeductions: number; // Teachers
  section80DDeductions: number; // Health insurance
  section80EDeductions: number; // Student loan interest
  section80EEADeductions: number; // First time home buyers
  section80GDeductions: number; // Medical insurance (up to 15% of income)
  capitalGainsLongTerm: number;
  capitalGainsShortTerm: number;
  section80TTCapitalGains: number; // Up to 50000
  deductibleExpenses: number; // for business
}

export interface IndiaTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  netIncome: number;
  taxBreakdown: {
    slab: string;
    rate: string;
    tax: number;
  }[];
  deductionBreakdown: {
    section: string;
    amount: number;
  }[];
  recommendations: string[];
}

export function calculateIndiaTax(inputs: IndiaTaxInputs): IndiaTaxResult {
  const {
    financialYear,
    grossIncome,
    section80CDeductions,
    section80CTTCDeductions,
    section80DDeductions,
    section80EDeductions,
    section80EEADeductions,
    section80GDeductions,
    capitalGainsLongTerm,
    capitalGainsShortTerm,
    section80TTCapitalGains,
    deductibleExpenses,
  } = inputs;

  // Calculate total deductions (max 1.5L for 80C)
  const section80C = Math.min(section80CDeductions, 150000);
  const totalDeductions = section80C + 
    section80CTTCDeductions + 
    section80DDeductions + 
    section80EDeductions + 
    section80EEADeductions + 
    Math.min(section80GDeductions, grossIncome * 0.15);

  // Taxable income calculation
  const incomeBeforeCG = grossIncome - totalDeductions - deductibleExpenses;
  
  // Capital gains treatment
  // Long-term: 20% tax (indexed)
  // Short-term: normal tax
  const ltcgTax = capitalGainsLongTerm * 0.20;
  const stcgTax = capitalGainsShortTerm * 0.30; // approximate average rate
  const capitalGainsTax = capitalGainsShortTerm > 0 ? stcgTax : (capitalGainsLongTerm > 0 ? ltcgTax : 0);

  // Income tax slabs (FY 2024-25)
  let incomeTax = 0;
  const taxBreakdown: { slab: string; rate: string; tax: number }[] = [];

  if (incomeBeforeCG <= 300000) {
    incomeTax = 0;
    taxBreakdown.push({ slab: "0 - 3,00,000", rate: "0%", tax: 0 });
  } else if (incomeBeforeCG <= 700000) {
    const taxableAboveSlabStart = incomeBeforeCG - 300000;
    incomeTax = taxableAboveSlabStart * 0.05;
    taxBreakdown.push({ slab: "3,00,001 - 7,00,000", rate: "5%", tax: Math.round(incomeTax) });
  } else if (incomeBeforeCG <= 1000000) {
    const taxableUpToSlab = Math.min(incomeBeforeCG, 700000) - 300000;
    const taxableAboveSlab = incomeBeforeCG - 700000;
    incomeTax = (taxableUpToSlab * 0.05) + (taxableAboveSlab * 0.20);
    taxBreakdown.push({ slab: "3,00,001 - 7,00,000", rate: "5%", tax: Math.round(taxableUpToSlab * 0.05) });
    taxBreakdown.push({ slab: "7,00,001 - 10,00,000", rate: "20%", tax: Math.round(taxableAboveSlab * 0.20) });
  } else if (incomeBeforeCG <= 1500000) {
    const tax1 = (700000 - 300000) * 0.05;
    const tax2 = (1000000 - 700000) * 0.20;
    const taxableAbove = incomeBeforeCG - 1000000;
    incomeTax = tax1 + tax2 + (taxableAbove * 0.30);
    taxBreakdown.push({ slab: "3,00,001 - 7,00,000", rate: "5%", tax: Math.round(tax1) });
    taxBreakdown.push({ slab: "7,00,001 - 10,00,000", rate: "20%", tax: Math.round(tax2) });
    taxBreakdown.push({ slab: "10,00,001 - 15,00,000", rate: "30%", tax: Math.round(taxableAbove * 0.30) });
  } else {
    const tax1 = (700000 - 300000) * 0.05;
    const tax2 = (1000000 - 700000) * 0.20;
    const tax3 = (1500000 - 1000000) * 0.30;
    const taxableAbove = incomeBeforeCG - 1500000;
    incomeTax = tax1 + tax2 + tax3 + (taxableAbove * 0.45);
    taxBreakdown.push({ slab: "3,00,001 - 7,00,000", rate: "5%", tax: Math.round(tax1) });
    taxBreakdown.push({ slab: "7,00,001 - 10,00,000", rate: "20%", tax: Math.round(tax2) });
    taxBreakdown.push({ slab: "10,00,001 - 15,00,000", rate: "30%", tax: Math.round(tax3) });
    taxBreakdown.push({ slab: "15,00,001+", rate: "45%", tax: Math.round(taxableAbove * 0.45) });
  }

  // Add health/life insurance cess if applicable
  let cess = 0;
  if (grossIncome > 5000000) {
    cess = incomeTax * 0.04; // 4% cess
  }

  const totalTax = incomeTax + cess + capitalGainsTax;
  const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  const netIncome = grossIncome - totalTax - totalDeductions;

  const deductionBreakdown = [
    { section: "Section 80C (max 1,50,000)", amount: section80C },
    { section: "Section 80CTT (Teachers)", amount: section80CTTCDeductions },
    { section: "Section 80D (Health Insurance)", amount: section80DDeductions },
    { section: "Section 80E (Student Loan Interest)", amount: section80EDeductions },
    { section: "Section 80EEA (Home Buyers)", amount: section80EEADeductions },
    { section: "Section 80G (Medical Insurance - 15% max)", amount: Math.min(section80GDeductions, grossIncome * 0.15) },
  ].filter(d => d.amount > 0);

  const recommendations: string[] = [];

  const unusedSection80C = Math.max(0, 150000 - section80CDeductions);
  if (unusedSection80C > 0) {
    recommendations.push(`💡 Opportunity to save ₹${Math.round(unusedSection80C * 0.20).toLocaleString()} by maximizing Section 80C (₹${unusedSection80C.toLocaleString()} unused)`);
  }

  if (grossIncome > 5000000) {
    recommendations.push("⚠️ 4% Health/Education cess applicable on income > 50 lakhs");
  }

  if (capitalGainsLongTerm > 0) {
    recommendations.push(`✓ Long-term capital gains taxed at 20% (with indexation benefit)`);
  }

  if (effectiveTaxRate < 10) {
    recommendations.push("✓ Effective tax rate is low - optimize further if possible");
  }

  return {
    grossIncome: Math.round(grossIncome),
    totalDeductions: Math.round(totalDeductions),
    taxableIncome: Math.round(incomeBeforeCG),
    incomeTax: Math.round(incomeTax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    netIncome: Math.round(netIncome),
    taxBreakdown,
    deductionBreakdown,
    recommendations,
  };
}
