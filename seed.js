const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");
  
  // 1. Create global analytics record if not exists
  const analytics = await prisma.analytics.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      formattingCount: 125,
      totalExports: 89
    }
  });
  console.log("Analytics seeded:", analytics);

  // 2. Create a demo article if count is 0
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    const article = await prisma.article.create({
      data: {
        title: "Clinical characteristics and factors affecting quality of life in children with congenital adrenal hyperplasia",
        status: "PUBLISHED",
        abstract: "Background: Congenital Adrenal Hyperplasia (CAH) is a group of disorders...",
        authors: {
          create: [
            { name: "Shiyi Xu", sequence: 1 },
            { name: "Hui Liu*", sequence: 2 }
          ]
        }
      }
    });
    console.log("Demo article created:", article.id);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
