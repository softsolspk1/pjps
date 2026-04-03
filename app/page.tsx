export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Hero from "@/components/Hero";
import ArticleCard from "@/components/ArticleCard";
import styles from "./page.module.css";

import { prisma } from "../lib/prisma";

export default async function Home() {
  let LATEST_ARTICLES: any[] = [];
  
  try {
    const articlesData = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { authors: { orderBy: { sequence: 'asc' } } }
    });

    LATEST_ARTICLES = articlesData.map(a => ({
      category: "Published Article",
      title: a.title,
      authors: a.authors.map(author => author.name).join(", "),
      doi: "Pending",
      id: a.id,
      date: new Date(a.createdAt).toLocaleDateString()
    }));
  } catch (error) {
    console.error("Home page database fetch error:", error);
  }

  return (
    <div className={styles.home}>
      <Hero />
      
      <section className={`section-padding container`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionSubtitle}>Explore the historical progression of pharmaceutical research at PJPS.</p>
        </div>

        <div className={styles.archiveGrid}>
          <div className={styles.archiveCard}>
            <h3 className={styles.cardTitle}>Current Issues (2020 - Present)</h3>
            <p>Access the latest research and most recent volumes of PJPS.</p>
            <Link href="/issues" className="btn btn-primary">Browse Recent Issues</Link>
          </div>
          <div className={styles.archiveCard}>
            <h3 className={styles.cardTitle}>Legacy Archive (1988 - 2019)</h3>
            <p>Decades of groundbreaking research digitized for global access.</p>
            <Link href="/archive" className="btn btn-outline">Explore Legacy Volumes</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.indexingSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Trusted Globally</span>
            <h2 className={styles.sectionTitle}>Scientific Impact & Recognition</h2>
            <p className={styles.sectionSubtitle}>PJPS is recognized and abstracted by the world's most prestigious scientific databases.</p>
          </div>
          <div className={styles.indexingGrid}>
            <a href="https://www.scopus.com" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>S</div>
              <span>Scopus (Elsevier)</span>
            </a>
            <a href="https://www.webofscience.com" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>W</div>
              <span>Web of Science</span>
            </a>
            <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>P</div>
              <span>PubMed / MEDLINE</span>
            </a>
            <a href="https://www.embase.com" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>E</div>
              <span>EMBASE</span>
            </a>
            <a href="https://doaj.org" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>D</div>
              <span>DOAJ</span>
            </a>
            <a href="https://www.cabi.org" target="_blank" rel="noopener noreferrer" className={styles.indexItem}>
              <div className={styles.indexIcon}>C</div>
              <span>CABI</span>
            </a>
          </div>
        </div>
      </section>

      <section className={`section-padding container`}>
        <div className={styles.aboutJournal}>
          <div className={styles.aboutText}>
            <span className={styles.preTitle}>Our Heritage</span>
            <h2>Established Excellence</h2>
            <p>
              The <strong>Pakistan Journal of Pharmaceutical Sciences (PJPS)</strong> is a peer-reviewed 
              multi-disciplinary pharmaceutical sciences journal. Founded in 1988 by the 
              <strong> Faculty of Pharmacy and Pharmaceutical Sciences, University of Karachi</strong>, 
              it stands as a premier platform for global scientific discourse.
            </p>
            <p>
              Our mission is to foster innovation across drug delivery, pharmacology, and clinical research, 
              maintaining a fully open-access policy that ensures unrestricted knowledge sharing worldwide.
            </p>
            <div className={styles.aboutActions}>
              <Link href="/board" className="btn btn-primary">Learn more about us</Link>
              <Link href="/board" className="btn btn-outline">Editor-in-Chief Message</Link>
            </div>
          </div>
          <div className={styles.aboutStatsGrid}>
            <div className={styles.impactCard}>
              <span className={styles.impactNum}>35+</span>
              <span className={styles.impactLabel}>Years of Peer Review</span>
            </div>
            <div className={styles.impactCardGold}>
              <span className={styles.impactNum}>HEC</span>
              <span className={styles.impactLabel}>Platinum Category</span>
            </div>
            <div className={styles.impactCard}>
              <span className={styles.impactNum}>100+</span>
              <span className={styles.impactLabel}>Countries Represented</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

