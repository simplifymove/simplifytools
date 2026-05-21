const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.auditJob.findMany({
    where: { status: { in: ['PROCESSING', 'PENDING'] } },
    select: { id: true, status: true, categories: true, startedAt: true, createdAt: true }
  });
  
  const runs = await prisma.auditRun.findMany({
    where: { status: { in: ['RUNNING', 'PENDING'] } },
    select: { id: true, status: true, categories: true, totalTests: true, passedTests: true, failedTests: true, startedAt: true }
  });
  
  console.log('Active Jobs:', JSON.stringify(jobs, null, 2));
  console.log('Active Runs:', JSON.stringify(runs, null, 2));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
