import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import axios from 'axios';
import https from 'https';

const prisma = new PrismaClient();

const SOURCE_SITE = 'https://www.pjps.pk';
const HTML_FILE = path.join(process.cwd(), 'previous-issues.html');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const axiosInstance = axios.create({
  httpsAgent: agent,
  timeout: 10000,
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrate() {
  console.log('--- Starting PJPS Article Migration ---');

  if (!fs.existsSync(HTML_FILE)) {
    console.error('Error: previous-issues.html not found in root directory.');
    return;
  }

  const html = fs.readFileSync(HTML_FILE, 'utf8');
  const $ = cheerio.load(html);

  // Parse all Volume/Issue blocks
  const issuesBlocks = $('.issues_title');
  console.log(`Found ${issuesBlocks.length} Volume/Issue blocks.`);

  for (let i = 0; i < issuesBlocks.length; i++) {
    const block = issuesBlocks.eq(i);
    const titleText = block.text().trim();
    
    // Pattern: "Volume : 39, Issue : 5,May  2026"
    const match = titleText.match(/Volume\s*:\s*(\d+),\s*Issue\s*:\s*(\d+),\s*([A-Za-z]+)\s+(\d+)/);
    
    if (!match) {
      console.warn(`Skipping invalid header: ${titleText}`);
      continue;
    }

    const volNum = parseInt(match[1]);
    const issueNum = parseInt(match[2]);
    const month = match[3].trim();
    const year = parseInt(match[4]);

    console.log(`\nProcessing Vol ${volNum}, Issue ${issueNum} (${month} ${year})...`);

    // 1. Ensure Volume exists
    let volume = await prisma.volume.findUnique({
      where: { number: volNum }
    });

    if (!volume) {
      volume = await prisma.volume.create({
        data: { number: volNum, year: year }
      });
      console.log(`Created Volume ${volNum}`);
    }

    // 2. Ensure Issue exists
    let issue = await prisma.issue.findUnique({
      where: {
        volumeId_number: {
          volumeId: volume.id,
          number: issueNum
        }
      }
    });

    if (!issue) {
      issue = await prisma.issue.create({
        data: {
          volumeId: volume.id,
          number: issueNum,
          month: month,
          isPublished: true
        }
      });
      console.log(`Created Issue ${issueNum} for Volume ${volNum}`);
    }

    // 3. Process Articles in this block
    const articlesList = block.next('ul.latest-article').find('li');
    console.log(`Found ${articlesList.length} articles in this issue.`);

    for (let j = 0; j < articlesList.length; j++) {
      const li = articlesList.eq(j);
      const titleLink = li.find('a').first();
      const title = titleLink.text().trim();
      const pdfUrl = titleLink.attr('href');

      const doiSpan = li.find('span:contains("DOI")');
      const doi = doiSpan.find('span').text().trim() || null;

      const authorsSpan = li.find('span:contains("By:")');
      const authorsRaw = authorsSpan.text().replace('By:', '').trim();

      const abstractLink = li.find('a:contains("[View Abstract]")').attr('href');
      const legacyIdMatch = abstractLink?.match(/id=(\d+)/);
      const legacyId = legacyIdMatch ? legacyIdMatch[1] : null;

      if (!title || !legacyId) continue;

      // Check if article already exists
      const existing = await prisma.article.findFirst({
        where: {
          OR: [
            { doi: doi || undefined },
            { title: title }
          ]
        }
      });

      if (existing) {
        console.log(`  Article already exists: ${title.substring(0, 30)}...`);
        continue;
      }

      console.log(`  Migrating: ${title.substring(0, 50)}...`);

      // 4. Scrape Abstract
      let abstractText = '';
      try {
        const abstractUrl = abstractLink?.startsWith('http') ? abstractLink : `${SOURCE_SITE}/${abstractLink}`;
        console.log(`    Fetching abstract from: ${abstractUrl}`);
        const response = await axiosInstance.get(abstractUrl);
        const $abstract = cheerio.load(response.data);
        
        // Pattern: Abstract usually inside a div with class "abstract" or similar
        // Based on typical WordPress journal sites, let's look for common patterns
        abstractText = $abstract('.single-article-content p').first().text().trim() || 
                       $abstract('.entry-content').text().trim();
        
        // Fallback or cleanup
        if (abstractText.length < 20) {
          abstractText = "Abstract not found or parsing issue.";
        }
      } catch (err: any) {
        console.error(`    Failed to fetch abstract for ${legacyId}: ${err.message}`);
      }

      // 5. Create Article
      const article = await prisma.article.create({
        data: {
          title: title,
          abstract: abstractText,
          doi: doi,
          status: 'PUBLISHED',
          paymentStatus: 'PAID',
          issueId: issue.id,
          origin: 'PAKISTANI', // Default as per plan
        }
      });

      // 6. Map Authors
      const authorList = authorsRaw.split(',').map(a => a.trim()).filter(a => a);
      for (let k = 0; k < authorList.length; k++) {
        await prisma.authorMapping.create({
          data: {
            articleId: article.id,
            name: authorList[k],
            sequence: k + 1
          }
        });
      }

      // Delay to be safe (as per plan)
      await sleep(1000);
    }
    
    // Stop after one issue for the test run if needed, but let's just run it
  }

  console.log('--- Migration Completed ---');
}

migrate()
  .catch(err => {
    console.error('Fatal Error during migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
