import { PrismaClient } from './src/infrastructure/database/prisma/client'; // Try standard
const { PrismaClient: PC } = require('@prisma/client');
const prisma = new PC();

async function main() {
    const guide = await prisma.workGuide.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log("Latest Guide Content:", JSON.stringify(guide?.content, null, 2).substring(0, 1000));
    if (guide?.content) {
        console.log("Has Theme?:", !!(guide.content as any).theme);
        console.log("Theme value:", (guide.content as any).theme);
    }
}

main().finally(() => prisma.$disconnect());
