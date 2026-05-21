#!/usr/bin/env npx ts-node
/**
 * End-to-End test for Phase 7 audit functionality
 * Tests the complete pipeline: Job creation -> Worker execution -> Data storage */

import { PrismaClient } from '@prisma/client';
import { getAuditQueue } from '../lib/queue/client';
import { calculateToolReliability } from '../lib/services/reliability';
import { recordFailure } from '../lib/services/failure-classifier';
import { generateHealthReport } from '../lib/services/health-score';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

const results: TestResult[] = [];

async function logResult(testName: string, passed: boolean, details: string) {
  const result: TestResult = {
    testName,
    passed,
    details,
    timestamp: new Date().toISOString(),
  };
  results.push(result);
  console.log(\[\] \: \\);
}

async function test1CreateAuditJob() {
  try {
    console.log('\n=== Test 1: Create AuditJob ===');
    
    // Find a valid user ID first
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found in database');

    const job = await prisma.auditJob.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        categories: ['pdf', 'image'],
      },
    });

    await logResult('AuditJob Creation', true, \Created job: \\);
    return job;
  } catch (error) {
    await logResult('AuditJob Creation', false, \Error: \\);
    throw error;
  }
}

async function test2CreateAuditRun() {
  try {
    console.log('\n=== Test 2: Create AuditRun ===');

    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found in database');

    const run = await prisma.auditRun.create({
      data: {
        userId: user.id,
        categories: JSON.stringify(['pdf']),
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    await logResult('AuditRun Creation', true, \Created run: \\);
    return run;
  } catch (error) {
    await logResult('AuditRun Creation', false, \Error: \\);
    throw error;
  }
}

async function test3CreateTestResult(auditRunId: string) {
  try {
    console.log('\n=== Test 3: Create AuditTestResult ===');

    const result = await prisma.auditTestResult.create({
      data: {
        auditRunId,
        category: 'pdf',
        toolName: 'Merge PDF',
        toolSlug: 'merge-pdf',
        url: 'https://example.com/merge-pdf',
        testCase: 'Basic Merge',
        status: 'PASS',
        durationMs: 5234,
      },
    });

    await logResult('AuditTestResult Creation', true, \Created result: \\);
    return result;
  } catch (error) {
    await logResult('AuditTestResult Creation', false, \Error: \\);
    throw error;
  }
}

async function test4RecordFailure(auditRunId: string) {
  try {
    console.log('\n=== Test 4: Record Failure ===');

    await recordFailure(
      auditRunId,
      'Split PDF',
      'pdf',
      'TIMEOUT',
      'PDF splitting failed with timeout',
      'Basic Split'
    );

    await logResult('FailureRecord Creation', true, \Recorded failure for run: \\);
    return true;
  } catch (error) {
    await logResult('FailureRecord Creation', false, \Error: \\);
    return null;
  }
}

async function test5ToolReliability() {
  try {
    console.log('\n=== Test 5: Tool Reliability Calculation ===');

    const reliability = await calculateToolReliability('Merge PDF');
    
    await logResult('ToolReliability Calculation', true, \Calculated reliability score: \\);
    return reliability;
  } catch (error) {
    await logResult('ToolReliability Calculation', false, \Error: \\);
    return null;
  }
}

async function test6HealthScore() {
  try {
    console.log('\n=== Test 6: Platform Health Score ===');

    const report = await generateHealthReport();
    
    await logResult('Health Score Generation', true, \Generated health report with score: \\);
    return report;
  } catch (error) {
    await logResult('Health Score Generation', false, \Error: \\);
    return null;
  }
}

async function test7PlaywrightArtifact(auditRunId: string) {
  try {
    console.log('\n=== Test 7: PlaywrightArtifact Creation ===');

    const artifact = await prisma.playwrightArtifact.create({
      data: {
        auditRunId,
        toolName: 'Merge PDF',
        category: 'pdf',
        testName: 'PDF Merge Test',
        type: 'screenshot',
        mimeType: 'image/png',
        filePath: 'test-screenshot.png',
        fileSize: 1024,
      },
    });

    await logResult('PlaywrightArtifact Creation', true, \Created artifact: \\);
    return artifact;
  } catch (error) {
    await logResult('PlaywrightArtifact Creation', false, \Error: \\);
    return null;
  }
}

async function test8QueueHealth() {
  try {
    console.log('\n=== Test 8: Queue Health Check ===');

    const queue = await getAuditQueue();
    const active = await queue.getActiveCount();
    const pending = await queue.getWaitingCount();
    const completed = await queue.getCompletedCount();

    await logResult(
      'Queue Health Check',
      true,
      \Active: \, Pending: \, Completed: \\
    );
  } catch (error) {
    await logResult('Queue Health Check', false, \Error: \\);
  }
}

async function test9DatabaseCounts() {
  try {
    console.log('\n=== Test 9: Database Model Counts ===');

    const counts = {
      AuditJob: await prisma.auditJob.count(),
      AuditRun: await prisma.auditRun.count(),
      AuditTestResult: await prisma.auditTestResult.count(),
      FailureRecord: await prisma.failureRecord.count(),
      ToolReliability: await prisma.toolReliability.count(),
      PlatformHealthScore: await prisma.platformHealthScore.count(),
      PlaywrightArtifact: await prisma.playwrightArtifact.count(),
      AlertLog: await prisma.alertLog.count(),
    };

    const details = Object.entries(counts)
      .map(([model, count]) => \\: \\)
      .join(', ');

    await logResult('Database Counts', true, details);
    return counts;
  } catch (error) {
    await logResult('Database Counts', false, \Error: \\);
    return null;
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('PHASE 7 E2E TESTING STARTED');
  console.log('================================================================');

  try {
    await test1CreateAuditJob();
    const auditRun = await test2CreateAuditRun();
    await test3CreateTestResult(auditRun.id);
    await test4RecordFailure(auditRun.id);
    await test5ToolReliability();
    await test6HealthScore();
    await test7PlaywrightArtifact(auditRun.id);
    await test8QueueHealth();
    await test9DatabaseCounts();

    // Summary
    console.log('\n================================================================');
    console.log('TEST SUMMARY');
    const passedTests = results.filter(r => r.passed).length;
    console.log(\Passed: \ / \\);
    
    // Save report
    const reportPath = path.join(process.cwd(), 'PHASE_7_E2E_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        total: results.length,
        passed: passedTests,
        failed: results.length - passedTests,
        timestamp: new Date().toISOString()
      },
      results
    }, null, 2));
    
    console.log(\Report saved to: \\);
    
    if (passedTests === results.length) {
      console.log('PHASE 7 E2E TESTING COMPLETED SUCCESSFULLY');
      process.exit(0);
    } else {
      console.log('PHASE 7 E2E TESTING COMPLETED WITH FAILURES');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during E2E testing:', error);
    process.exit(1);
  } finally {
    await prisma.\();
  }
}

runAllTests();
