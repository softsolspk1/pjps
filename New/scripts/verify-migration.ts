import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const count = await prisma.article.count();
  console.log(`Total Articles: ${count}`);

  const articles = await prisma.article.findMany({
    include: {
      authors: true,
      issue: { include: { volume: true } }
    },
    take: 5
  });

  for (const a of articles) {
    console.log(`- ${a.title}`);
    console.log(`  Issue: Vol ${a.issue?.volume.number}, Issue ${a.issue?.number}`);
    console.log(`  Authors: ${a.authors.map(au => au.name).join(', ')}`);
    console.log(`  Abstract (snippet): ${a.abstract?.substring(0, 100)}...`);
    console.log('---');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
