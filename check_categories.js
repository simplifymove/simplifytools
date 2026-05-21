const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const run = await prisma.auditRun.findFirst({
    where: { status: 'COMPLETED' },
    take: 1
  });
  
  if (run) {
    console.log('Categories field value:', JSON.stringify(run.categories));
    console.log('Categories type:', typeof run.categories);
    try {
      const parsed = JSON.parse(run.categories);
      console.log('Parsed successfully:', parsed);
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  } else {
    console.log('No completed runs found');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
