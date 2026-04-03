const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create a Volume
  const volume39 = await prisma.volume.upsert({
    where: { number: 39 },
    update: {},
    create: {
      number: 39,
      year: 2026,
    },
  });

  // 2. Create an Issue
  const issue3 = await prisma.issue.upsert({
    where: {
      volumeId_number: {
        volumeId: volume39.id,
        number: 3,
      },
    },
    update: {},
    create: {
      volumeId: volume39.id,
      number: 3,
      month: "March",
      isPublished: true,
    },
  });

  // 3. Create Articles
  const articles = [
    {
      title: "Clinical characteristics and factors affecting quality of life in children with congenital adrenal hyperplasia",
      abstract: "Congenital adrenal hyperplasia (CAH) is a group of autosomal recessive disorders resulting from a deficiency in one of the five enzymes required for cortisol synthesis in the adrenal cortex. The most common form is 21-hydroxylase deficiency.",
      authors: ["Shiyi Xu", "Zhen Li", "Qingxian Fu", "Qiuting Lin", "Hui Liu"],
      issueId: issue3.id,
    },
    {
      title: "Pharmacodynamic basis of gabapentin combined with Hegu-point catgut embedding for post-herpetic neuralgia",
      abstract: "Post-herpetic neuralgia (PHN) is a common chronic neuropathic pain condition that follows an acute herpes zoster infection. Gabapentin is a first-line treatment, but its efficacy can be limited by side effects at high doses.",
      authors: ["Li-Ping Li", "Zong-Zhou Song", "Yang Zheng", "Ting Wu", "Fang-Wei Li", "Yan Huang"],
      issueId: issue3.id,
    },
    {
      title: "Impact of ceftazidime/avibactam combined dynamic nutritional support on intestinal barrier function in sepsis patients: A focus on barrier protection mechanisms",
      abstract: "Sepsis is a complex clinical syndrome characterized by a dysregulated host response to infection, leading to life-threatening organ dysfunction. The intestinal barrier plays a critical role in the pathogenesis of sepsis.",
      authors: ["Xiaojuan Sha", "Lijuan Sun", "Jun Wu"],
      issueId: issue3.id,
    },
    {
      title: "Effect of edaravone on synaptic damage in Alzheimer's disease via Rho/ROCK signaling",
      abstract: "Alzheimer's disease (AD) is the most common cause of dementia worldwide, characterized by progressive cognitive decline and memory loss. Synaptic loss is a hallmark of AD and correlates strongly with cognitive impairment.",
      authors: ["Yuejun Li", "Qiuyue Lai", "Qiong Li", "Yixie Fan"],
      issueId: issue3.id,
    }
  ];

  for (const articleData of articles) {
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        abstract: articleData.abstract,
        issueId: articleData.issueId,
        status: "PUBLISHED",
        authors: {
          create: articleData.authors.map((name, index) => ({
            name: name,
            sequence: index + 1,
          })),
        },
      },
    });
    console.log(`Created article: ${article.title}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
