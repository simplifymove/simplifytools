#!/usr/bin/env npx ts-node
/**
 * Quick database query to verify Phase 7 models
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying Phase 7 Models...\n');

  const counts = {
    'AuditJob': await prisma.auditJob.count(),
    'AuditRun': await prisma.auditRun.count(),
    'AuditTestResult': await prisma.auditTestResult.count(),
    'FailureRecord': await prisma.failureRecord.count(),
    'ToolReliability': await prisma.toolReliability.count(),
    'PlatformHealthScore': await prisma.platformHealthScore.count(),
    'PlaywrightArtifact': await prisma.playwrightArtifact.count(),
    'AlertLog': await prisma.alertLog.count(),
    'AlertingRule': await prisma.alertingRule.count(),
  };

  console.log('=== Phase 7 Database Model Counts ===\n');
  let totalRecords = 0;
  for (const [model, count] of Object.entries(counts)) {
    console.log(`${model}: ${count} records`);
    totalRecords += count;
  }
  
  console.log(`\nTotal Phase 7 Records: ${totalRecords}`);

  // Get sample records if available
  console.log('\n=== Sample Records ===\n');

  const auditJob = await prisma.auditJob.findFirst();
  if (auditJob) {
    console.log('Sample AuditJob:');
    console.log(  ID: \);
    console.log(  Status: \);
    console.log(  Categories: \);
  }

  const auditRun = await prisma.auditRun.findFirst();
  if (auditRun) {
    console.log('\nSample AuditRun:');
    console.log(  ID: \);
    console.log(  Status: \);
    console.log(  Categories: \);
  }

  const testResult = await prisma.auditTestResult.findFirst();
  if (testResult) {
    console.log('\nSample AuditTestResult:');
    console.log(  ID: \);
    console.log(  Tool: \);
    console.log(  Status: \);
  }

  const healthScore = await prisma.platformHealthScore.findFirst();
  if (healthScore) {
    console.log('\nSample PlatformHealthScore:');
    console.log(  ID: \);
    console.log(  Overall Score: \);
    console.log(  Timestamp: \);
  }

  const toolReliability = await prisma.toolReliability.findFirst();
  if (toolReliability) {
    console.log('\nSample ToolReliability:');
    console.log(  Tool: \);
    console.log(  Reliability (24h): \%);
    console.log(  Status: \);
  }

  await prisma.$disconnect();
  console.log('\n✓ Query complete');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
