const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Softsols@123', 10);

  const users = [
    { email: 'admin@pjps.com', name: 'PJPS Admin', role: 'ADMIN' },
    { email: 'editor@pjps.com', name: 'Dr. Sarah Editor', role: 'EDITOR' },
    { email: 'reviewer@pjps.com', name: 'Prof. James Reviewer', role: 'REVIEWER' },
    { email: 'author@pjps.com', name: 'John Author', role: 'AUTHOR' },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { role: userData.role, password: hashedPassword },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      },
    });
  }

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
