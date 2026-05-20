/**
 * PDF Tools Test Report Generator
 * Converts Playwright test results into detailed reports
 */

const fs = require('fs');
const path = require('path');

interface TestResult {
  title: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  suite: string;
  duration: number;
  error?: string;
  timestamp: string;
}

interface ReportSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  successRate: number;
  totalDuration: number;
  startTime: string;
  endTime: string;
  tools: ToolReportSummary[];
}

interface ToolReportSummary {
  name: string;
  slug: string;
  totalTests: number;
  passed: number;
  failed: number;
  successRate: number;
  tests: TestResult[];
}

/**
 * Parse Playwright JSON report
 */
function parsePlaywrightReport(reportPath: string): TestResult[] {
  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️ Report file not found: ${reportPath}`);
    return [];
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const results: TestResult[] = [];

  // Extract test results from suites
  if (report.suites) {
    report.suites.forEach((suite: any) => {
      extractTests(suite, results, '');
    });
  }

  return results;
}

/**
 * Recursively extract test results from suite
 */
function extractTests(
  suite: any,
  results: TestResult[],
  parentTitle: string
): void {
  const suiteTitle = parentTitle ? `${parentTitle} / ${suite.title}` : suite.title;

  if (suite.tests) {
    suite.tests.forEach((test: any) => {
      results.push({
        title: test.title,
        status: mapStatus(test.status),
        suite: suiteTitle,
        duration: test.duration || 0,
        error: test.error?.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  if (suite.suites) {
    suite.suites.forEach((childSuite: any) => {
      extractTests(childSuite, results, suiteTitle);
    });
  }
}

/**
 * Map Playwright status to report status
 */
function mapStatus(status: string): 'PASS' | 'FAIL' | 'SKIP' {
  switch (status) {
    case 'passed':
      return 'PASS';
    case 'failed':
      return 'FAIL';
    case 'skipped':
      return 'SKIP';
    default:
      return 'FAIL';
  }
}

/**
 * Generate summary from test results
 */
function generateSummary(results: TestResult[]): ReportSummary {
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;

  // Group by tool (suite)
  const toolMap = new Map<string, TestResult[]>();
  results.forEach((result) => {
    const toolName = result.suite.split(' / ')[0];
    if (!toolMap.has(toolName)) {
      toolMap.set(toolName, []);
    }
    toolMap.get(toolName)!.push(result);
  });

  const tools: ToolReportSummary[] = [];
  toolMap.forEach((tests, toolName) => {
    const toolPassed = tests.filter((t) => t.status === 'PASS').length;
    const toolFailed = tests.filter((t) => t.status === 'FAIL').length;
    const toolTotal = tests.length;

    tools.push({
      name: toolName,
      slug: toolName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
      totalTests: toolTotal,
      passed: toolPassed,
      failed: toolFailed,
      successRate: toolTotal > 0 ? (toolPassed / toolTotal) * 100 : 0,
      tests,
    });
  });

  return {
    totalTests: total,
    passed,
    failed,
    skipped,
    successRate: total > 0 ? (passed / total) * 100 : 0,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    tools: tools.sort((a, b) => b.totalTests - a.totalTests),
  };
}

/**
 * Generate JSON report
 */
function generateJsonReport(summary: ReportSummary, outputPath: string): void {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: summary.totalTests,
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      successRate: `${summary.successRate.toFixed(1)}%`,
      totalDuration: `${(summary.totalDuration / 1000).toFixed(2)}s`,
    },
    tools: summary.tools,
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report generated: ${outputPath}`);
}

/**
 * Generate HTML report
 */
function generateHtmlReport(summary: ReportSummary, outputPath: string): void {
  const passRate = summary.successRate.toFixed(1);
  const statusColor = summary.failed === 0 ? '#10b981' : '#ef4444';
  const statusText = summary.failed === 0 ? '✅ ALL PASSED' : '❌ FAILURES';

  const toolRows = summary.tools
    .map(
      (tool) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${tool.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background-color: #dbeafe; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${tool.totalTests}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background-color: #dcfce7; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #166534;">
          ${tool.passed}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background-color: ${tool.failed > 0 ? '#fee2e2' : '#dcfce7'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: ${tool.failed > 0 ? '#991b1b' : '#166534'};">
          ${tool.failed}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <strong>${tool.successRate.toFixed(1)}%</strong>
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Tools Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .status {
      background-color: ${statusColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
      margin-top: 10px;
    }
    .content {
      padding: 40px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .summary-card-value {
      font-size: 32px;
      font-weight: 700;
      margin: 10px 0;
    }
    .summary-card-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card.passed .summary-card-value {
      color: #10b981;
    }
    .summary-card.failed .summary-card-value {
      color: #ef4444;
    }
    .summary-card.total .summary-card-value {
      color: #3b82f6;
    }
    .summary-card.rate .summary-card-value {
      color: #667eea;
    }
    .tools-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }
    .tools-table th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tools-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .tools-table tr:hover {
      background-color: #f9fafb;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px 40px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .alert {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 14px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 PDF Tools Test Report</h1>
      <p>${new Date().toLocaleString()}</p>
      <div class="status">${statusText}</div>
    </div>
    
    <div class="content">
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-card-label">Total Tests</div>
          <div class="summary-card-value">${summary.totalTests}</div>
        </div>
        <div class="summary-card passed">
          <div class="summary-card-label">Passed</div>
          <div class="summary-card-value">${summary.passed}</div>
        </div>
        <div class="summary-card failed">
          <div class="summary-card-label">Failed</div>
          <div class="summary-card-value">${summary.failed}</div>
        </div>
        <div class="summary-card rate">
          <div class="summary-card-label">Success Rate</div>
          <div class="summary-card-value">${passRate}%</div>
        </div>
      </div>

      ${
        summary.failed > 0
          ? `<div class="alert">⚠️ ${summary.failed} test(s) failed. Please review the details below.</div>`
          : `<div class="alert">✅ All tests passed successfully!</div>`
      }

      <h2 style="margin-top: 0;">Per-Tool Breakdown</h2>
      <table class="tools-table">
        <thead>
          <tr>
            <th>Tool Name</th>
            <th style="text-align: center;">Total</th>
            <th style="text-align: center;">Passed</th>
            <th style="text-align: center;">Failed</th>
            <th style="text-align: center;">Success Rate</th>
          </tr>
        </thead>
        <tbody>
          ${toolRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Generated on ${new Date().toISOString()}</p>
      <p>For more details, check the JSON and CSV reports.</p>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(outputPath, html);
  console.log(`📊 HTML report generated: ${outputPath}`);
}

/**
 * Generate CSV report
 */
function generateCsvReport(summary: ReportSummary, outputPath: string): void {
  let csv = 'Tool Name,Total Tests,Passed,Failed,Success Rate %\n';

  summary.tools.forEach((tool) => {
    csv += `${tool.name},${tool.totalTests},${tool.passed},${tool.failed},${tool.successRate.toFixed(1)}\n`;
  });

  // Add summary line
  csv += `\nSUMMARY,${summary.totalTests},${summary.passed},${summary.failed},${summary.successRate.toFixed(1)}\n`;

  fs.writeFileSync(outputPath, csv);
  console.log(`📋 CSV report generated: ${outputPath}`);
}

/**
 * Main report generation function
 */
function generateReports(playwrightReportPath: string): void {
  console.log('\n📊 Generating PDF Tools Test Reports...\n');

  // Ensure output directory exists
  const reportDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Parse test results
  const results = parsePlaywrightReport(playwrightReportPath);
  
  if (results.length === 0) {
    console.warn('⚠️ No test results found. Make sure tests have been run.');
    return;
  }

  // Generate summary
  const summary = generateSummary(results);

  // Generate reports
  const jsonReportPath = path.join(reportDir, 'pdf-tools-report.json');
  const htmlReportPath = path.join(reportDir, 'pdf-tools-report.html');
  const csvReportPath = path.join(reportDir, 'pdf-tools-report.csv');

  generateJsonReport(summary, jsonReportPath);
  generateHtmlReport(summary, htmlReportPath);
  generateCsvReport(summary, csvReportPath);

  // Print summary to console
  console.log('\n📈 Test Summary:');
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(`   ✅ Passed: ${summary.passed}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   ⏭️ Skipped: ${summary.skipped}`);
  console.log(`   📊 Success Rate: ${summary.successRate.toFixed(1)}%\n`);

  if (summary.failed > 0) {
    console.log('❌ Failed Tools:');
    summary.tools
      .filter((t) => t.failed > 0)
      .forEach((tool) => {
        console.log(`   - ${tool.name}: ${tool.failed}/${tool.totalTests} failed`);
      });
    console.log();
  }

  console.log('📊 Reports Generated:');
  console.log(`   📄 JSON: ${jsonReportPath}`);
  console.log(`   🌐 HTML: ${htmlReportPath}`);
  console.log(`   📋 CSV: ${csvReportPath}\n`);
}

// Run if executed directly
if (require.main === module) {
  const playwrightReportPath = process.argv[2] || 'playwright-report/report.json';
  generateReports(playwrightReportPath);
}

module.exports = { generateReports, parsePlaywrightReport, generateSummary };
