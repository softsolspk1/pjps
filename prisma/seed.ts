const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Softsols@123', 10);

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@pjps.com' },
    update: {},
    create: {
      email: 'admin@pjps.com',
      name: 'PJPS Admin',
      password,
      role: 'ADMIN',
    },
  });

  // 2. Editor
  await prisma.user.upsert({
    where: { email: 'editor@pjps.com' },
    update: {},
    create: {
      email: 'editor@pjps.com',
      name: 'Dr. Sarah Editor',
      password,
      role: 'EDITOR',
    },
  });

  // 3. Reviewer
  await prisma.user.upsert({
    where: { email: 'reviewer@pjps.com' },
    update: {},
    create: {
      email: 'reviewer@pjps.com',
      name: 'Prof. James Reviewer',
      password,
      role: 'REVIEWER',
    },
  });

  // 4. Author
  await prisma.user.upsert({
    where: { email: 'author@pjps.com' },
    update: {},
    create: {
      email: 'author@pjps.com',
      name: 'John Author',
      password,
      role: 'AUTHOR',
    },
  });

  console.log('Demo users created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
