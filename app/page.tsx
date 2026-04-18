export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Hero from "@/components/Hero";
import styles from "./page.module.css";
import { 
  ShieldCheck, Globe, Zap, 
  Award, BarChart3, Hash,
  Microscope, Library
} from "lucide-react";

export default async function Home() {
  return (
    <div className={styles.home}>
      <Hero />

      <section className="container section-padding">
        <div className={styles.portalGrid}>
          {/* Main Content Column */}
          <div className={styles.mainContent}>
            <div className={styles.tabHeader}>
              <button className={styles.tabBtnActive}>Latest Articles</button>
              <button className={styles.tabBtn}>Most Read</button>
              <button className={styles.tabBtn}>Open Access</button>
            </div>

            <div className={styles.articleList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.articleCard}>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleType}>Original Research</span>
                    <span className={styles.articleDate}>Published: April 12, 2026</span>
                  </div>
                  <h3 className={styles.articleTitle}>
                    <Link href={`/articles/${i}`}>
                      Comparative Efficacy of Novel Biopharmaceutics in the Management of Metabolic Disorders: A Multicenter Study
                    </Link>
                  </h3>
                  <p className={styles.articleAuthors}>
                    Dr. Sarah Ahmed, Prof. John Smith, et al.
                  </p>
                  <div className={styles.articleLinks}>
                    <Link href={`/articles/${i}`} className={styles.linkText}>Abstract</Link>
                    <Link href={`/articles/${i}/pdf`} className={styles.linkText}>Full-Text PDF</Link>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/archive" className="btn btn-outline mt-8 w-full">View Full Archive</Link>
          </div>

          {/* Sidebar Column */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Journal Metrics</h4>
              <div className={styles.metricCard}>
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>Impact Factor (2024)</span>
                  <span className={styles.metricValue}>0.6</span>
                </div>
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>CiteScore (Q3)</span>
                  <span className={styles.metricValue}>1.4</span>
                </div>
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>Acceptance Rate</span>
                  <span className={styles.metricValue}>24%</span>
                </div>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Official Indexing</h4>
              <div className={styles.indexingGrid}>
                <div className={styles.indexItem}>Web of Science</div>
                <div className={styles.indexItem}>Scopus</div>
                <div className={styles.indexItem}>PubMed</div>
                <div className={styles.indexItem}>MEDLINE</div>
                <div className={styles.indexItem}>DOAJ</div>
                <div className={styles.indexItem}>EMBASE</div>
              </div>
            </div>

            <div className={styles.announcementBox}>
              <h4 className={styles.sidebarTitle}>Announcements</h4>
              <div className={styles.announcementItem}>
                <span className={styles.announcementDate}>April 15, 2026</span>
                <p className={styles.announcementText}>PJPS transition to monthly publication cycle starting Jan 2026.</p>
              </div>
              <Link href="/news" className={styles.viewMore}>View all announcements</Link>
            </div>

            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Submission</h4>
              <div className={styles.submissionCta}>
                <p>Submit your high-quality research to PJPS.</p>
                <Link href="/instructions" className={styles.ctaLink}>Instruction for Authors</Link>
                <Link href="/submission" className="btn btn-primary w-full mt-4">Submit Online</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Scope Section - Refined */}
      <section className={`${styles.scopeSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Scientific Frontiers</span>
            <h2 className={styles.sectionTitle}>Expanding Research Horizons</h2>
            <p className={styles.sectionSubtitle}>
              Covering a multi-disciplinary spectrum of Pharmaceutical and Biomedical Sciences.
            </p>
          </div>
          
          <div className={styles.scopeGrid}>
             {[
               "Biological Sciences", "Pharmaceutical Analysis", "Drug Delivery Systems", 
               "Molecular Biology", "Biopharmaceutics", "Pharmacology", 
               "Medicinal Chemistry", "Nanotechnology", "Generative AI in Pharma",
               "Pharmacokinetics", "Pharmacovigilance", "Bioactive Discovery"
             ].map(item => (
               <div key={item} className={styles.scopeItem}>
                 <div className={styles.scopeDot}></div>
                 <span>{item}</span>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}


