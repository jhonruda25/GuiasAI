import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DEMO_USER !== 'true') {
    console.log('Skipping demo user seed because SEED_DEMO_USER is not enabled.');
    return;
  }

  const email = 'demo@guiasai.com';
  const password = 'Demo1234!';
  const rounds = Number(process.env.AUTH_BCRYPT_ROUNDS ?? 12);

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

  console.log(`Demo user created: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
