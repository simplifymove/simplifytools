export type AiStudioBenchmarkCategory =
  | 'Business Proposal'
  | 'Business Plan'
  | 'Marketing Plan'
  | 'Resume'
  | 'Blog'
  | 'Report'
  | 'Budget'
  | 'Sales Dashboard'
  | 'Project Tracker'
  | 'Inventory'
  | 'Invoice'
  | 'Comparison'
  | 'Education'
  | 'Travel'
  | 'Logistics';

export type AiStudioBenchmarkTool = 'document' | 'spreadsheet';

export interface AiStudioMinimumQualityChecks {
  minSections?: number;
  minSheets?: number;
  minTables?: number;
  minRows?: number;
  minFormulas?: number;
  requireExecutiveSummary?: boolean;
  requireRecommendations?: boolean;
  requireSummaryMetrics?: boolean;
  requireChartSuggestions?: boolean;
  requiredTerms?: string[];
  forbiddenPhrases?: string[];
  exportRequired?: boolean;
}

export interface AiStudioQualityBenchmark {
  id: string;
  category: AiStudioBenchmarkCategory;
  tool: AiStudioBenchmarkTool;
  prompt: string;
  requestOptions: {
    documentType?: string;
    tone?: string;
    length?: string;
    spreadsheetType?: string;
    complexity?: string;
  };
  expectedType: string;
  expectedStructure: string;
  expectedSections?: string[];
  expectedSheets?: string[];
  minimumQualityChecks: AiStudioMinimumQualityChecks;
}

const commonForbiddenPhrases = [
  "in today's fast-paced world",
  'leverage cutting-edge',
  'game-changer',
  'revolutionize',
  'unlock your potential',
];

function documentBenchmark(input: {
  id: string;
  category: AiStudioBenchmarkCategory;
  prompt: string;
  documentType: string;
  expectedType: string;
  expectedStructure: string;
  expectedSections: string[];
  requiredTerms?: string[];
  minSections?: number;
  minTables?: number;
}) {
  return {
    id: input.id,
    category: input.category,
    tool: 'document',
    prompt: input.prompt,
    requestOptions: {
      documentType: input.documentType,
      tone: 'professional',
      length: 'detailed',
    },
    expectedType: input.expectedType,
    expectedStructure: input.expectedStructure,
    expectedSections: input.expectedSections,
    minimumQualityChecks: {
      minSections: input.minSections ?? Math.min(input.expectedSections.length, 6),
      minTables: input.minTables ?? 1,
      requireExecutiveSummary: true,
      requireRecommendations: input.documentType !== 'resume' && input.documentType !== 'letter',
      requiredTerms: input.requiredTerms ?? [],
      forbiddenPhrases: commonForbiddenPhrases,
      exportRequired: true,
    },
  } satisfies AiStudioQualityBenchmark;
}

function spreadsheetBenchmark(input: {
  id: string;
  category: AiStudioBenchmarkCategory;
  prompt: string;
  spreadsheetType: string;
  expectedType: string;
  expectedStructure: string;
  expectedSheets: string[];
  requiredTerms?: string[];
  minSheets?: number;
  minRows?: number;
  minFormulas?: number;
}) {
  return {
    id: input.id,
    category: input.category,
    tool: 'spreadsheet',
    prompt: input.prompt,
    requestOptions: {
      spreadsheetType: input.spreadsheetType,
      complexity: 'detailed',
    },
    expectedType: input.expectedType,
    expectedStructure: input.expectedStructure,
    expectedSheets: input.expectedSheets,
    minimumQualityChecks: {
      minSheets: input.minSheets ?? Math.min(input.expectedSheets.length, 4),
      minRows: input.minRows ?? 8,
      minFormulas: input.minFormulas ?? 2,
      requireSummaryMetrics: true,
      requireChartSuggestions: true,
      requiredTerms: input.requiredTerms ?? [],
      forbiddenPhrases: commonForbiddenPhrases,
      exportRequired: true,
    },
  } satisfies AiStudioQualityBenchmark;
}

export const aiStudioQualityBenchmarks: AiStudioQualityBenchmark[] = [
  documentBenchmark({
    id: 'business-proposal-logistics-saas',
    category: 'Business Proposal',
    prompt: 'Create a business proposal for a logistics SaaS startup that sells route optimization software to regional delivery fleets.',
    documentType: 'proposal',
    expectedType: 'Business Proposal',
    expectedStructure: 'Consulting-style proposal with problem, solution, scope, timeline, deliverables, pricing assumptions, benefits, risks, and conclusion.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Pricing Assumptions', 'Benefits', 'Risks', 'Conclusion'],
    requiredTerms: ['route optimization', 'fleet', 'implementation'],
  }),
  documentBenchmark({
    id: 'business-proposal-cybersecurity-midmarket',
    category: 'Business Proposal',
    prompt: 'Create a business proposal for a cybersecurity firm offering managed detection and response to mid-market healthcare companies.',
    documentType: 'proposal',
    expectedType: 'Business Proposal',
    expectedStructure: 'Buyer-ready service proposal with risk context, solution, scope, onboarding plan, deliverables, assumptions, and success measures.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Benefits', 'Risks', 'Conclusion'],
    requiredTerms: ['managed detection', 'healthcare', 'risk'],
  }),
  documentBenchmark({
    id: 'business-proposal-warehouse-automation',
    category: 'Business Proposal',
    prompt: 'Create a proposal for a warehouse automation consulting engagement for a third-party logistics operator.',
    documentType: 'proposal',
    expectedType: 'Business Proposal',
    expectedStructure: 'Operational improvement proposal with current-state problem, recommended solution, workstreams, timeline, assumptions, risks, and action plan.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Benefits', 'Risks'],
    requiredTerms: ['warehouse', 'automation', 'throughput'],
  }),
  documentBenchmark({
    id: 'business-proposal-hr-onboarding-platform',
    category: 'Business Proposal',
    prompt: 'Create a business proposal for an HR onboarding platform selling to fast-growing professional services firms.',
    documentType: 'proposal',
    expectedType: 'Business Proposal',
    expectedStructure: 'SaaS sales proposal with buyer pain points, proposed product package, rollout plan, value case, risk mitigation, and next steps.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Benefits', 'Conclusion'],
    requiredTerms: ['onboarding', 'professional services', 'adoption'],
  }),
  documentBenchmark({
    id: 'business-plan-electric-bike-rental',
    category: 'Business Plan',
    prompt: 'Create a business plan for an electric bike rental startup launching in Austin.',
    documentType: 'business plan',
    expectedType: 'Business Plan',
    expectedStructure: 'Founder-ready business plan with market analysis, competitor analysis, SWOT, business model, go-to-market, financial assumptions, risks, and conclusion.',
    expectedSections: ['Executive Summary', 'Market Analysis', 'Competitor Analysis', 'SWOT', 'Business Model', 'Marketing Strategy', 'Financial Projections', 'Risks', 'Conclusion'],
    requiredTerms: ['Austin', 'rental', 'unit economics'],
  }),
  documentBenchmark({
    id: 'business-plan-ai-meeting-assistant',
    category: 'Business Plan',
    prompt: 'Create a business plan for an AI meeting assistant for customer success teams at B2B SaaS companies.',
    documentType: 'business plan',
    expectedType: 'Business Plan',
    expectedStructure: 'B2B SaaS business plan with market, positioning, ICP, pricing assumptions, go-to-market, financial assumptions, and risks.',
    expectedSections: ['Executive Summary', 'Market Analysis', 'Competitor Analysis', 'Business Model', 'Marketing Strategy', 'Financial Projections', 'Risks'],
    requiredTerms: ['customer success', 'B2B SaaS', 'retention'],
  }),
  documentBenchmark({
    id: 'business-plan-healthy-meal-delivery',
    category: 'Business Plan',
    prompt: 'Create a business plan for a healthy meal delivery company serving office workers in Chicago.',
    documentType: 'business plan',
    expectedType: 'Business Plan',
    expectedStructure: 'Local services business plan with market, operations, customer segments, channels, financial assumptions, risks, and launch plan.',
    expectedSections: ['Executive Summary', 'Market Analysis', 'Competitor Analysis', 'Business Model', 'Marketing Strategy', 'Financial Projections', 'Risks'],
    requiredTerms: ['Chicago', 'meal delivery', 'operations'],
  }),
  documentBenchmark({
    id: 'business-plan-specialty-coffee-subscription',
    category: 'Business Plan',
    prompt: 'Create a business plan for a specialty coffee subscription brand targeting remote workers.',
    documentType: 'business plan',
    expectedType: 'Business Plan',
    expectedStructure: 'Consumer subscription business plan with positioning, market, competition, business model, retention strategy, financial assumptions, and risks.',
    expectedSections: ['Executive Summary', 'Market Analysis', 'Competitor Analysis', 'SWOT', 'Business Model', 'Marketing Strategy', 'Financial Projections'],
    requiredTerms: ['subscription', 'remote workers', 'retention'],
  }),
  documentBenchmark({
    id: 'marketing-plan-fintech-app',
    category: 'Marketing Plan',
    prompt: 'Create a marketing plan for a fintech budgeting app targeting Gen Z users in the United States.',
    documentType: 'report',
    expectedType: 'Marketing Plan',
    expectedStructure: 'Marketing strategy document with audience, positioning, channels, campaign calendar, budget assumptions, KPIs, risks, and recommendations.',
    expectedSections: ['Executive Summary', 'Audience', 'Positioning', 'Channels', 'Campaign Plan', 'KPIs', 'Risks', 'Recommendations'],
    requiredTerms: ['Gen Z', 'fintech', 'acquisition'],
  }),
  documentBenchmark({
    id: 'marketing-plan-b2b-saas-launch',
    category: 'Marketing Plan',
    prompt: 'Create a quarterly marketing plan for a B2B SaaS product launching a new analytics module.',
    documentType: 'report',
    expectedType: 'Marketing Plan',
    expectedStructure: 'Quarterly B2B launch plan with segments, message, campaigns, content, funnel KPIs, budget assumptions, and action items.',
    expectedSections: ['Executive Summary', 'Audience', 'Positioning', 'Campaign Plan', 'Content Plan', 'KPIs', 'Recommendations'],
    requiredTerms: ['analytics module', 'pipeline', 'launch'],
  }),
  documentBenchmark({
    id: 'marketing-plan-local-fitness-studio',
    category: 'Marketing Plan',
    prompt: 'Create a marketing plan for a boutique fitness studio opening its second location.',
    documentType: 'report',
    expectedType: 'Marketing Plan',
    expectedStructure: 'Local growth marketing plan with audience, positioning, launch channels, referral ideas, KPIs, and execution timeline.',
    expectedSections: ['Executive Summary', 'Audience', 'Positioning', 'Channels', 'Timeline', 'KPIs', 'Recommendations'],
    requiredTerms: ['second location', 'local', 'membership'],
  }),
  documentBenchmark({
    id: 'marketing-plan-sustainable-fashion',
    category: 'Marketing Plan',
    prompt: 'Create a marketing plan for a sustainable fashion ecommerce brand preparing for holiday season.',
    documentType: 'report',
    expectedType: 'Marketing Plan',
    expectedStructure: 'Seasonal ecommerce marketing plan with audience, offer strategy, channels, calendar, KPIs, and risks.',
    expectedSections: ['Executive Summary', 'Audience', 'Positioning', 'Campaign Plan', 'Timeline', 'KPIs', 'Risks'],
    requiredTerms: ['holiday', 'ecommerce', 'sustainable'],
  }),
  documentBenchmark({
    id: 'resume-product-manager-saas',
    category: 'Resume',
    prompt: 'Create a resume for a senior product manager with SaaS, analytics, and cross-functional leadership experience.',
    documentType: 'resume',
    expectedType: 'Resume',
    expectedStructure: 'Professional resume with summary, skills, experience, achievements, education, certifications, and projects where useful.',
    expectedSections: ['Professional Summary', 'Skills', 'Experience', 'Education', 'Certifications', 'Projects'],
    requiredTerms: ['product manager', 'SaaS', 'analytics'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'resume-logistics-operations-manager',
    category: 'Resume',
    prompt: 'Create a resume for a logistics operations manager with warehouse, transportation, and process improvement experience.',
    documentType: 'resume',
    expectedType: 'Resume',
    expectedStructure: 'Operations resume with summary, skills, experience, achievements, education, certifications, and project highlights.',
    expectedSections: ['Professional Summary', 'Skills', 'Experience', 'Education', 'Certifications'],
    requiredTerms: ['logistics', 'warehouse', 'transportation'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'resume-data-analyst-healthcare',
    category: 'Resume',
    prompt: 'Create a resume for a healthcare data analyst skilled in SQL, dashboards, and operational reporting.',
    documentType: 'resume',
    expectedType: 'Resume',
    expectedStructure: 'Analyst resume with summary, technical skills, experience, measurable achievements, education, and projects.',
    expectedSections: ['Professional Summary', 'Skills', 'Experience', 'Education', 'Projects'],
    requiredTerms: ['SQL', 'dashboards', 'healthcare'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'blog-saas-customer-retention',
    category: 'Blog',
    prompt: 'Write a blog article about practical customer retention strategies for early-stage SaaS companies.',
    documentType: 'blog article',
    expectedType: 'Blog Article',
    expectedStructure: 'Scannable article with hook, introduction, multiple H2-style sections, examples, key takeaways, and conclusion.',
    expectedSections: ['Hook', 'Introduction', 'Core Idea', 'Practical Examples', 'Best Practices', 'Key Takeaways', 'Conclusion'],
    requiredTerms: ['retention', 'SaaS', 'churn'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'blog-remote-team-productivity',
    category: 'Blog',
    prompt: 'Write a blog article about improving productivity in remote software teams without adding meetings.',
    documentType: 'blog article',
    expectedType: 'Blog Article',
    expectedStructure: 'Practical blog with hook, introduction, actionable sections, examples, checklist, takeaways, and conclusion.',
    expectedSections: ['Hook', 'Introduction', 'Practical Examples', 'Best Practices', 'Key Takeaways', 'Conclusion'],
    requiredTerms: ['remote', 'software teams', 'meetings'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'blog-inventory-management-small-business',
    category: 'Blog',
    prompt: 'Write a blog article explaining inventory management basics for small ecommerce businesses.',
    documentType: 'blog article',
    expectedType: 'Blog Article',
    expectedStructure: 'Educational article with hook, inventory concepts, examples, checklist, common mistakes, takeaways, and conclusion.',
    expectedSections: ['Hook', 'Introduction', 'Core Idea', 'Practical Examples', 'Best Practices', 'Key Takeaways'],
    requiredTerms: ['inventory', 'ecommerce', 'reorder'],
    minTables: 0,
  }),
  documentBenchmark({
    id: 'report-quarterly-support-performance',
    category: 'Report',
    prompt: 'Create a quarterly support performance report for a SaaS company reviewing ticket volume, response time, CSAT, and improvement actions.',
    documentType: 'report',
    expectedType: 'Business Report',
    expectedStructure: 'Executive report with summary, background, findings, analysis, recommendations, and conclusion.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['ticket volume', 'response time', 'CSAT'],
  }),
  documentBenchmark({
    id: 'report-employee-engagement-survey',
    category: 'Report',
    prompt: 'Create an employee engagement survey report for a 250-person technology company.',
    documentType: 'report',
    expectedType: 'Business Report',
    expectedStructure: 'Survey report with summary, methodology assumptions, findings, analysis, recommendations, and action plan.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['engagement', 'survey', 'action plan'],
  }),
  documentBenchmark({
    id: 'report-supply-chain-risk',
    category: 'Report',
    prompt: 'Create a supply chain risk report for a consumer electronics company sourcing components from multiple regions.',
    documentType: 'report',
    expectedType: 'Business Report',
    expectedStructure: 'Risk report with background, findings, risk analysis, mitigations, recommendations, and conclusion.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['supply chain', 'components', 'risk'],
  }),
  documentBenchmark({
    id: 'report-retail-store-performance',
    category: 'Report',
    prompt: 'Create a monthly retail store performance report covering sales, foot traffic, conversion rate, staffing, and improvement actions.',
    documentType: 'report',
    expectedType: 'Business Report',
    expectedStructure: 'Retail performance report with summary, background, findings, analysis, recommendations, and conclusion.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['sales', 'foot traffic', 'conversion rate'],
  }),
  documentBenchmark({
    id: 'education-online-course-proposal',
    category: 'Education',
    prompt: 'Create a proposal for an online course that teaches small business owners how to read financial statements.',
    documentType: 'proposal',
    expectedType: 'Education Proposal',
    expectedStructure: 'Education-focused proposal with learner problem, course solution, curriculum scope, timeline, deliverables, outcomes, risks, and conclusion.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Benefits', 'Conclusion'],
    requiredTerms: ['financial statements', 'course', 'small business owners'],
  }),
  documentBenchmark({
    id: 'education-school-stem-program-report',
    category: 'Education',
    prompt: 'Create a report recommending a STEM enrichment program for middle school students.',
    documentType: 'report',
    expectedType: 'Education Report',
    expectedStructure: 'Recommendation report with background, student needs, program options, analysis, recommendations, and implementation steps.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['STEM', 'middle school', 'implementation'],
  }),
  documentBenchmark({
    id: 'travel-corporate-retreat-proposal',
    category: 'Travel',
    prompt: 'Create a proposal for a three-day leadership retreat in Portugal for a remote-first software company.',
    documentType: 'proposal',
    expectedType: 'Travel Proposal',
    expectedStructure: 'Corporate retreat proposal with objectives, destination rationale, agenda, logistics, budget assumptions, risks, and next steps.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Pricing Assumptions', 'Risks', 'Conclusion'],
    requiredTerms: ['Portugal', 'retreat', 'remote-first'],
  }),
  documentBenchmark({
    id: 'travel-family-japan-itinerary-report',
    category: 'Travel',
    prompt: 'Create a travel planning report for a family visiting Japan for 10 days with a moderate budget.',
    documentType: 'report',
    expectedType: 'Travel Report',
    expectedStructure: 'Travel planning report with summary, assumptions, itinerary, budget considerations, risks, recommendations, and conclusion.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['Japan', '10 days', 'budget'],
  }),
  documentBenchmark({
    id: 'logistics-last-mile-report',
    category: 'Logistics',
    prompt: 'Create a report on improving last-mile delivery performance for an ecommerce logistics provider.',
    documentType: 'report',
    expectedType: 'Logistics Report',
    expectedStructure: 'Operations report with background, findings, analysis, recommendations, metrics, and conclusion.',
    expectedSections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    requiredTerms: ['last-mile', 'delivery', 'ecommerce'],
  }),
  documentBenchmark({
    id: 'logistics-fleet-maintenance-proposal',
    category: 'Logistics',
    prompt: 'Create a proposal for implementing a preventive maintenance program for a 120-vehicle delivery fleet.',
    documentType: 'proposal',
    expectedType: 'Logistics Proposal',
    expectedStructure: 'Fleet operations proposal with problem, solution, scope, timeline, deliverables, benefits, risks, and conclusion.',
    expectedSections: ['Executive Summary', 'Problem', 'Proposed Solution', 'Scope', 'Timeline', 'Deliverables', 'Benefits', 'Risks'],
    requiredTerms: ['preventive maintenance', 'fleet', 'vehicles'],
  }),
  spreadsheetBenchmark({
    id: 'budget-nonprofit-annual',
    category: 'Budget',
    prompt: 'Create an annual operating budget workbook for a small nonprofit with grants, donations, program expenses, and admin costs.',
    spreadsheetType: 'budget',
    expectedType: 'Budget Workbook',
    expectedStructure: 'Workbook with summary, income, expenses, monthly overview, and dashboard notes.',
    expectedSheets: ['Summary', 'Income', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    requiredTerms: ['grants', 'donations', 'expenses'],
  }),
  spreadsheetBenchmark({
    id: 'budget-saas-department',
    category: 'Budget',
    prompt: 'Create a department budget tracker for a SaaS marketing team with planned spend, actual spend, and variance.',
    spreadsheetType: 'budget',
    expectedType: 'Budget Workbook',
    expectedStructure: 'Budget workbook with income or allocation summary, expenses, monthly overview, dashboard notes, variance formulas, and totals.',
    expectedSheets: ['Summary', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    requiredTerms: ['planned spend', 'actual spend', 'variance'],
  }),
  spreadsheetBenchmark({
    id: 'budget-event-conference',
    category: 'Budget',
    prompt: 'Create a conference event budget workbook with sponsorship income, venue costs, marketing spend, staffing, and contingency.',
    spreadsheetType: 'budget',
    expectedType: 'Budget Workbook',
    expectedStructure: 'Event budget workbook with summary, income, expenses, monthly overview, notes, totals, and variance calculations.',
    expectedSheets: ['Summary', 'Income', 'Expenses', 'Monthly Overview'],
    requiredTerms: ['sponsorship', 'venue', 'contingency'],
  }),
  spreadsheetBenchmark({
    id: 'sales-dashboard-saas-monthly',
    category: 'Sales Dashboard',
    prompt: 'Create a monthly SaaS sales dashboard spreadsheet with MRR, ARR, leads, opportunities, closed won deals, win rate, pipeline, and forecast.',
    spreadsheetType: 'sales report',
    expectedType: 'Sales Dashboard Workbook',
    expectedStructure: 'Sales dashboard with summary, sales data, KPIs, monthly trends, forecast, realistic SaaS values, and formulas.',
    expectedSheets: ['Summary', 'Sales Data', 'KPIs', 'Monthly Trends', 'Forecast'],
    requiredTerms: ['MRR', 'ARR', 'win rate', 'forecast'],
    minFormulas: 4,
  }),
  spreadsheetBenchmark({
    id: 'sales-dashboard-regional',
    category: 'Sales Dashboard',
    prompt: 'Create a regional sales dashboard for a B2B software company comparing Northeast, Midwest, South, and West performance.',
    spreadsheetType: 'sales report',
    expectedType: 'Sales Dashboard Workbook',
    expectedStructure: 'Regional sales dashboard with summary, sales data, KPIs, trends, forecast, and formulas for totals and conversion rates.',
    expectedSheets: ['Summary', 'Sales Data', 'KPIs', 'Monthly Trends', 'Forecast'],
    requiredTerms: ['regional', 'pipeline', 'conversion'],
    minFormulas: 4,
  }),
  spreadsheetBenchmark({
    id: 'sales-dashboard-account-executive',
    category: 'Sales Dashboard',
    prompt: 'Create an account executive sales performance dashboard with quota, bookings, pipeline coverage, win rate, and forecast.',
    spreadsheetType: 'sales report',
    expectedType: 'Sales Dashboard Workbook',
    expectedStructure: 'AE dashboard with sales data, KPIs, trends, forecast, quota attainment, and pipeline formulas.',
    expectedSheets: ['Summary', 'Sales Data', 'KPIs', 'Monthly Trends', 'Forecast'],
    requiredTerms: ['quota', 'pipeline coverage', 'forecast'],
    minFormulas: 4,
  }),
  spreadsheetBenchmark({
    id: 'project-tracker-website-redesign',
    category: 'Project Tracker',
    prompt: 'Create a project tracker for a website redesign project with tasks, owners, milestones, resources, risks, and completion status.',
    spreadsheetType: 'project tracker',
    expectedType: 'Project Tracker Workbook',
    expectedStructure: 'Project workbook with dashboard, tasks, milestones, resources, risks, status formulas, and progress metrics.',
    expectedSheets: ['Dashboard', 'Tasks', 'Milestones', 'Resources', 'Risks'],
    requiredTerms: ['owners', 'milestones', 'risks'],
  }),
  spreadsheetBenchmark({
    id: 'project-tracker-erp-implementation',
    category: 'Project Tracker',
    prompt: 'Create an ERP implementation project tracker with phases, dependencies, risks, milestones, owners, and resource load.',
    spreadsheetType: 'project tracker',
    expectedType: 'Project Tracker Workbook',
    expectedStructure: 'Implementation tracker with dashboard, tasks, milestones, resources, risks, COUNTIF formulas, and progress calculations.',
    expectedSheets: ['Dashboard', 'Tasks', 'Milestones', 'Resources', 'Risks'],
    requiredTerms: ['ERP', 'dependencies', 'resource'],
  }),
  spreadsheetBenchmark({
    id: 'project-tracker-product-launch',
    category: 'Project Tracker',
    prompt: 'Create a product launch project tracker for a SaaS analytics module with marketing, sales enablement, QA, and customer rollout workstreams.',
    spreadsheetType: 'project tracker',
    expectedType: 'Project Tracker Workbook',
    expectedStructure: 'Launch tracker with tasks, milestones, resources, risks, dashboard metrics, status formulas, and owners.',
    expectedSheets: ['Dashboard', 'Tasks', 'Milestones', 'Resources', 'Risks'],
    requiredTerms: ['launch', 'workstream', 'customer rollout'],
  }),
  spreadsheetBenchmark({
    id: 'inventory-ecommerce-sku',
    category: 'Inventory',
    prompt: 'Create an inventory management workbook for an ecommerce store with SKUs, suppliers, reorder points, low-stock alerts, and inventory value.',
    spreadsheetType: 'inventory',
    expectedType: 'Inventory Workbook',
    expectedStructure: 'Inventory workbook with inventory, suppliers, stock alerts, summary, reorder formulas, and stock status logic.',
    expectedSheets: ['Inventory', 'Suppliers', 'Stock Alerts', 'Summary'],
    requiredTerms: ['SKU', 'supplier', 'reorder'],
  }),
  spreadsheetBenchmark({
    id: 'inventory-restaurant-supplies',
    category: 'Inventory',
    prompt: 'Create an inventory tracker for a restaurant managing food supplies, vendors, par levels, reorder alerts, and weekly usage.',
    spreadsheetType: 'inventory',
    expectedType: 'Inventory Workbook',
    expectedStructure: 'Restaurant inventory workbook with supplies, suppliers, stock alerts, summary metrics, and reorder calculations.',
    expectedSheets: ['Inventory', 'Suppliers', 'Stock Alerts', 'Summary'],
    requiredTerms: ['vendor', 'par level', 'weekly usage'],
  }),
  spreadsheetBenchmark({
    id: 'inventory-manufacturing-components',
    category: 'Inventory',
    prompt: 'Create an inventory workbook for a small manufacturer tracking components, suppliers, lead times, safety stock, and reorder quantities.',
    spreadsheetType: 'inventory',
    expectedType: 'Inventory Workbook',
    expectedStructure: 'Manufacturing inventory workbook with inventory, suppliers, stock alerts, summary, lead time fields, and reorder formulas.',
    expectedSheets: ['Inventory', 'Suppliers', 'Stock Alerts', 'Summary'],
    requiredTerms: ['components', 'lead time', 'safety stock'],
  }),
  spreadsheetBenchmark({
    id: 'invoice-consulting-project',
    category: 'Invoice',
    prompt: 'Create an invoice workbook for a consulting project with line items, hours, rates, tax, discount, total due, and payment notes.',
    spreadsheetType: 'invoice',
    expectedType: 'Invoice Workbook',
    expectedStructure: 'Invoice workbook with invoice, items, tax summary, payment notes, and formulas for subtotal, tax, discount, and total due.',
    expectedSheets: ['Invoice', 'Items', 'Tax Summary', 'Payment Notes'],
    requiredTerms: ['hours', 'rates', 'total due'],
  }),
  spreadsheetBenchmark({
    id: 'invoice-design-agency',
    category: 'Invoice',
    prompt: 'Create an invoice workbook for a design agency billing a brand identity project with phases, quantities, rates, tax, and payment terms.',
    spreadsheetType: 'invoice',
    expectedType: 'Invoice Workbook',
    expectedStructure: 'Invoice workbook with invoice summary, items, tax summary, payment notes, and real formulas.',
    expectedSheets: ['Invoice', 'Items', 'Tax Summary', 'Payment Notes'],
    requiredTerms: ['brand identity', 'payment terms', 'tax'],
  }),
  spreadsheetBenchmark({
    id: 'invoice-saas-annual-subscription',
    category: 'Invoice',
    prompt: 'Create an invoice workbook for a SaaS annual subscription with licenses, implementation fee, discount, tax, total, and payment schedule.',
    spreadsheetType: 'invoice',
    expectedType: 'Invoice Workbook',
    expectedStructure: 'SaaS invoice workbook with invoice, items, tax summary, payment notes, subtotal, discount, tax, and total formulas.',
    expectedSheets: ['Invoice', 'Items', 'Tax Summary', 'Payment Notes'],
    requiredTerms: ['licenses', 'implementation fee', 'payment schedule'],
  }),
  spreadsheetBenchmark({
    id: 'comparison-crm-vendors',
    category: 'Comparison',
    prompt: 'Create a CRM vendor comparison spreadsheet with weighted criteria, cost, implementation effort, risk, pros, cons, and recommendation.',
    spreadsheetType: 'comparison table',
    expectedType: 'Comparison Workbook',
    expectedStructure: 'Comparison workbook with summary, options, scoring, recommendation, weighted scores, and decision logic.',
    expectedSheets: ['Summary', 'Options', 'Scoring', 'Recommendation'],
    requiredTerms: ['CRM', 'weighted', 'recommendation'],
  }),
  spreadsheetBenchmark({
    id: 'comparison-cloud-storage',
    category: 'Comparison',
    prompt: 'Create a cloud storage comparison workbook comparing three providers on price, security, collaboration, admin controls, and support.',
    spreadsheetType: 'comparison table',
    expectedType: 'Comparison Workbook',
    expectedStructure: 'Vendor comparison workbook with options, scoring, weighted totals, pros, cons, and recommendation.',
    expectedSheets: ['Summary', 'Options', 'Scoring', 'Recommendation'],
    requiredTerms: ['security', 'collaboration', 'support'],
  }),
  spreadsheetBenchmark({
    id: 'comparison-hiring-candidates',
    category: 'Comparison',
    prompt: 'Create a candidate comparison spreadsheet for hiring a customer success manager using experience, communication, SaaS knowledge, and references.',
    spreadsheetType: 'comparison table',
    expectedType: 'Comparison Workbook',
    expectedStructure: 'Candidate scorecard with options, scoring, weighted totals, notes, and recommendation.',
    expectedSheets: ['Summary', 'Options', 'Scoring', 'Recommendation'],
    requiredTerms: ['candidate', 'SaaS', 'references'],
  }),
  spreadsheetBenchmark({
    id: 'education-training-budget',
    category: 'Education',
    prompt: 'Create a training program budget workbook for a school district planning teacher professional development workshops.',
    spreadsheetType: 'budget',
    expectedType: 'Education Budget Workbook',
    expectedStructure: 'Education budget workbook with summary, income or funding, expenses, monthly overview, notes, and formulas.',
    expectedSheets: ['Summary', 'Income', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    requiredTerms: ['teacher', 'workshops', 'professional development'],
  }),
  spreadsheetBenchmark({
    id: 'travel-trip-budget',
    category: 'Travel',
    prompt: 'Create a travel budget workbook for a 12-day family trip to Italy with flights, hotels, meals, activities, transport, and contingency.',
    spreadsheetType: 'budget',
    expectedType: 'Travel Budget Workbook',
    expectedStructure: 'Travel budget workbook with summary, income or budget, expenses, monthly or daily overview, notes, totals, and variance.',
    expectedSheets: ['Summary', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    requiredTerms: ['Italy', 'flights', 'hotels'],
  }),
  spreadsheetBenchmark({
    id: 'logistics-fleet-cost-dashboard',
    category: 'Logistics',
    prompt: 'Create a logistics fleet cost dashboard spreadsheet with fuel, maintenance, driver hours, route count, cost per mile, and monthly trends.',
    spreadsheetType: 'sales report',
    expectedType: 'Logistics Dashboard Workbook',
    expectedStructure: 'Dashboard workbook with summary, operational data, KPIs, monthly trends, forecast, and formulas for cost and efficiency.',
    expectedSheets: ['Summary', 'Sales Data', 'KPIs', 'Monthly Trends', 'Forecast'],
    requiredTerms: ['fuel', 'maintenance', 'cost per mile'],
    minFormulas: 4,
  }),
  spreadsheetBenchmark({
    id: 'logistics-warehouse-labor-planner',
    category: 'Logistics',
    prompt: 'Create a warehouse labor planning spreadsheet with inbound volume, outbound orders, pick rates, staffing needs, overtime risk, and weekly trends.',
    spreadsheetType: 'project tracker',
    expectedType: 'Logistics Planning Workbook',
    expectedStructure: 'Operational planning workbook with dashboard, tasks or labor plan, milestones, resources, risks, workload formulas, and trend metrics.',
    expectedSheets: ['Dashboard', 'Tasks', 'Milestones', 'Resources', 'Risks'],
    requiredTerms: ['inbound volume', 'pick rates', 'staffing'],
    minFormulas: 3,
  }),
  spreadsheetBenchmark({
    id: 'budget-startup-runway',
    category: 'Budget',
    prompt: 'Create a startup runway budget workbook with cash balance, monthly burn, hiring plan, software costs, revenue assumptions, and runway forecast.',
    spreadsheetType: 'budget',
    expectedType: 'Budget Workbook',
    expectedStructure: 'Startup budget workbook with summary, income, expenses, monthly overview, notes, burn-rate formulas, variance, and runway forecast.',
    expectedSheets: ['Summary', 'Income', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    requiredTerms: ['runway', 'burn', 'cash balance'],
    minFormulas: 4,
  }),
];

export const aiStudioBenchmarkCategories = Array.from(
  new Set(aiStudioQualityBenchmarks.map((benchmark) => benchmark.category)),
);
