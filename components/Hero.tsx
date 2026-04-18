import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroDecorative}></div>
      <div className={`container-full ${styles.heroContent}`}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
               <span className={styles.badgeLine}></span>
               Official Journal of the Faculty
            </div>
            <h1 className={styles.heroTitle}>
              Advancing the Global <br />
              <span className={styles.titleAccent}>Pharmaceutical Frontier</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A leading global forum for the dissemination of pharmaceutical and biomedical research, officially recognized by HEC and indexed in Web of Science, Scopus, and PubMed.
            </p>
            <div className={styles.heroActions}>
              <Link href="/submission" className="btn btn-primary">Submit Manuscript</Link>
              <Link href="/publication/current" className="btn btn-outline">Current Issue</Link>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
             <div className={styles.journalCoverStub}>
                <div className={styles.coverInner}>
                   <div className={styles.coverHeader}>PJPS</div>
                   <div className={styles.coverBody}>
                      <span className={styles.volText}>Volume 39</span>
                      <span className={styles.noText}>Number 4</span>
                   </div>
                   <div className={styles.coverFooter}>April 2026</div>
                </div>
             </div>
          </div>
        </div>
        
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>0.6</span>
            <span className={styles.statLabel}>JCR Impact Factor</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>1.4</span>
            <span className={styles.statLabel}>CiteScore (Q3)</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>1011-601X</span>
            <span className={styles.statLabel}>ISSN (Print)</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>5,893+</span>
            <span className={styles.statLabel}>Total Publications</span>
          </div>
        </div>
      </div>
    </section>
  );
}
