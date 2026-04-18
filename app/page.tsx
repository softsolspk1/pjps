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
      {/* Restored Hero Component from previous build structure */}
      <Hero />

      {/* Announcements & Key Metrics */}
      <section className="section-padding container">
        <div className={styles.announcementGrid}>
          <div className={styles.announcementCard}>
            <Zap className="text-amber-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Monthly Publication Cycle</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pakistan Journal of Pharmaceutical Sciences is scheduled to be published monthly from January 2026 onwards to expedite scientific dissemination.
            </p>
          </div>
          <div className={styles.metricsHighlight}>
            <div className={styles.metricEntry}>
              <span className={styles.metricVal}>0.6</span>
              <span className={styles.metricTag}>JCR Impact Factor (2024)</span>
            </div>
            <div className={styles.metricEntry}>
              <span className={styles.metricVal}>0.8</span>
              <span className={styles.metricTag}>5-Year Impact Factor</span>
            </div>
            <div className={styles.metricEntry}>
              <span className={styles.metricVal}>1.4</span>
              <span className={styles.metricTag}>Scopus CiteScore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Academic Scope */}
      <section className={`${styles.scopeSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Scientific Frontiers</span>
            <h2 className={styles.sectionTitle}>Expanding Research Horizons</h2>
            <p className={styles.sectionSubtitle}>
              PJPS covers a multi-disciplinary spectrum of Pharmaceutical and Biomedical Sciences.
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

      {/* Global Recognition & Recognition */}
      <section className="section-padding container">
        <div className={styles.recognitionGrid}>
          <div className={styles.recognitionContent}>
            <h2 className={styles.titleSerif}>Global Scholarly Impact</h2>
            <p className={styles.bodyText}>
              Recognized by the Higher Education Commission (HEC) of Pakistan and abstracted by the world's most prestigious scientific databases.
            </p>
            <div className={styles.indexingList}>
              <div className={styles.indexTag}>Web of Science (SCIE)</div>
              <div className={styles.indexTag}>Scopus</div>
              <div className={styles.indexTag}>PubMed / MEDLINE</div>
              <div className={styles.indexTag}>EMBASE</div>
              <div className={styles.indexTag}>DOAJ</div>
              <div className={styles.indexTag}>CABI</div>
            </div>
          </div>
          
          <div className={styles.heritageBox}>
             <div className={styles.heritageIcon}>
                <Library size={48} className="text-blue-600" />
             </div>
             <div>
                <h4 className="font-bold text-lg mb-2">Heritage of Excellence</h4>
                <p className="text-sm text-slate-500 mb-4">Digitizing pharmaceutical research from 1988 to the present day with over 5,893+ published contributions.</p>
                <div className="flex gap-4">
                   <Link href="/issues" className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Recent Issues</Link>
                   <Link href="/archive" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:underline">Full Archive</Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Ethics, Licensing & Associated Journals */}
      <section className={`${styles.ethicsArea} section-padding`}>
        <div className="container">
          <div className={styles.gridColumns}>
             <div className={styles.ethicsBox}>
                <ShieldCheck size={32} className="text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold mb-3">Open Access & Licensing</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Items are licensed under CC BY-NC-4.0. PJPS ensures that all published content remains unrestricted globally while authors retain full copyright of their work.
                </p>
                <div className={styles.ethicsLinks}>
                  <Link href="/policy">Publishing Ethics</Link>
                  <Link href="/instructions">Author Instructions</Link>
                </div>
             </div>

             <div className={styles.associatedJournals}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Microscope size={20} className="text-blue-600" /> Associated Journals
                </h3>
                <div className={styles.journalCard}>
                   <div>
                      <h4 className="font-bold text-slate-800">Pakistan Journal of Pharmacology</h4>
                      <p className="text-xs text-slate-400 mt-1">Official Affiliate publication of the Faculty.</p>
                   </div>
                   <ArrowRight size={18} className="text-slate-300" />
                </div>
                <div className={styles.issnBlock}>
                   <div className={styles.issnItem}>
                      <strong>ISSN (Print):</strong> 1011-601X
                   </div>
                   <div className={styles.issnItem}>
                      <strong>ISSN (Online):</strong> 3105-9686
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
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


