const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.auditTestResult.count();
    console.log('AuditTestResult count:', count);
    
    if (count > 0) {
      const recentResults = await prisma.auditTestResult.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' }
      });
      console.log('Recent results:', JSON.stringify(recentResults, null, 2));
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
