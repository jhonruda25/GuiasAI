const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  try {
    console.log('Testing connection...');
    const result = await prisma.workGuide.findMany();
    console.log('Connection successful, found:', result.length);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();