const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const runs = await prisma.auditRun.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, status: true, categories: true, totalTests: true, passedTests: true, failedTests: true, createdAt: true }
  });
  console.log(JSON.stringify(runs, null, 2));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
