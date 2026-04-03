const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Initial Pricing Seed
  await prisma.pricing.upsert({
    where: { origin: "PAKISTANI" },
    update: {},
    create: {
      origin: "PAKISTANI",
      regular: 25000,
      fast: 45000,
      ultraFast: 75000,
    }
  });

  await prisma.pricing.upsert({
    where: { origin: "INTERNATIONAL" },
    update: {},
    create: {
      origin: "INTERNATIONAL",
      regular: 250,
      fast: 450,
      ultraFast: 750,
    }
  });

  // 2. Volumes and Issues
  const v39 = await prisma.volume.upsert({
    where: { number: 39 },
    update: {},
    create: { number: 39, year: 2026 },
  });

  const i1 = await prisma.issue.upsert({
    where: { volumeId_number: { volumeId: v39.id, number: 1 } },
    update: {},
    create: { volumeId: v39.id, number: 1, month: "January", isPublished: true },
  });

  const i2 = await prisma.issue.upsert({
    where: { volumeId_number: { volumeId: v39.id, number: 2 } },
    update: {},
    create: { volumeId: v39.id, number: 2, month: "February", isPublished: true },
  });

  const i3 = await prisma.issue.upsert({
    where: { volumeId_number: { volumeId: v39.id, number: 3 } },
    update: {},
    create: { volumeId: v39.id, number: 3, month: "March", isPublished: true },
  });

  // 3. Articles (Expanding to multiple issues)
  const articlesData = [
    {
      title: "Phytochemical screening and antibacterial activity of some medicinal plants",
      abstract: "This research focuses on the antimicrobial properties of extracts from several Pakistani indigenous plants...",
      issueId: i1.id,
      authors: ["Zubair Ahmed", "Sajida Parveen", "Imran Khan"]
    },
    {
      title: "Syntheses and biological evaluation of new coumarin derivatives",
      abstract: "A series of new coumarin-3-carboxylic acid derivatives were synthesized and evaluated for their biological activities...",
      issueId: i1.id,
      authors: ["Farhan Maqbool", "Nisar Ahmed"]
    },
    {
      title: "Formulation and evaluation of sustained release tablets of Metformin",
      abstract: "The aim of the present study was to develop sustained release matrix tablets of Metformin HCl using HPMC K100M...",
      issueId: i1.id,
      authors: ["Aisha Siddiqui", "Riaz Hussain"]
    },
    {
      title: "In-vitro evaluation of antioxidant and anti-inflammatory activities of selected herbal extracts",
      abstract: "Antioxidant and anti-inflammatory activities of methanolic extracts of selected medicinal plants were evaluated...",
      issueId: i2.id,
      authors: ["Mariam Bibi", "Abdul Qadir"]
    },
    {
      title: "Pharmacokinetics of Ciprofloxacin in healthy volunteers",
      abstract: "A single-dose, randomized, open-label, two-period crossover study was conducted to compare the pharmacokinetics...",
      issueId: i2.id,
      authors: ["Saad Bin Junaid", "Faisal Mehmood"]
    },
    {
      title: "Impact of COVID-19 on pharmaceutical supply chain in Pakistan",
      abstract: "This study investigates the challenges faced by the pharmaceutical industry during the global pandemic...",
      issueId: i2.id,
      authors: ["Hina Altaf", "Zafar Iqbal"]
    },
    {
      title: "Clinical characteristics and factors affecting quality of life in children with congenital adrenal hyperplasia",
      abstract: "Congenital adrenal hyperplasia (CAH) is a group of autosomal recessive disorders...",
      issueId: i3.id,
      authors: ["Shiyi Xu", "Zhen Li", "Qingxian Fu"]
    },
    {
      title: "Pharmacodynamic basis of gabapentin combined with Hegu-point catgut embedding for post-herpetic neuralgia",
      abstract: "Post-herpetic neuralgia (PHN) is a common chronic neuropathic pain condition...",
      issueId: i3.id,
      authors: ["Li-Ping Li", "Zong-Zhou Song", "Yang Zheng"]
    },
    {
      title: "Effect of edaravone on synaptic damage in Alzheimer's disease via Rho/ROCK signaling",
      abstract: "Alzheimer's disease (AD) is the most common cause of dementia worldwide...",
      issueId: i3.id,
      authors: ["Yuejun Li", "Qiuyue Lai", "Qiong Li"]
    },
  ];

  for (const article of articlesData) {
    await prisma.article.create({
      data: {
        title: article.title,
        abstract: article.abstract,
        issueId: article.issueId,
        status: "PUBLISHED",
        authors: {
          create: article.authors.map((name, index) => ({
            name,
            sequence: index + 1,
            address: "Faculty of Pharmacy, University of Karachi"
          }))
        }
      }
    });
  }

  console.log("Seeding completed successfully with pricing and expanded article catalog!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
