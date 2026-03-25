import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@guiasai.com';
  const password = 'Demo1234!';
  const rounds = 12;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Demo user already exists: ${email}`);
    return;
  }

  const passwordHash = await hash(password, rounds);

  await prisma.user.create({
    data: {
      email,
      fullName: 'Profesor Demo',
      passwordHash,
      role: 'TEACHER',
    },
  });

  console.log(`✅ Demo user created: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
