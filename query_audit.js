const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = await prisma.auditRun.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 3,
    select: {
      id: true,
      status: true,
      totalTests: true,
      passedTests: true,
      failedTests: true,
      skippedTests: true
    }
  });
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.'disconnect'();
  });
