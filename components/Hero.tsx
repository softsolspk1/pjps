import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container-full ${styles.heroContent}`}>
        <div className={styles.heroGridElite}>
          <div className={styles.heroTextElite}>
            <div className={styles.eliteBadge}>
               <span className={styles.badgeLabel}>ESTABLISHED 1988</span>
               <span className={styles.badgeSeparator}></span>
               <span className={styles.badgeLabel}>HEC RECOGNIZED</span>
            </div>

            <h1 className={styles.heroTitleElite}>
              The Vanguard of <br />
              <span className={styles.titleSerifHighlight}>Pharmaceutical Discovery</span>
            </h1>

            <p className={styles.heroSubtitleElite}>
               Pakistan Journal of Pharmaceutical Sciences (PJPS) is a premier peer-reviewed platform dedicated to the global advancement of pharmaceutical and biomedical excellence.
            </p>

            <div className={styles.heroActionsElite}>
              <Link href="/submission" className={styles.ctaPrimary}>
                 SUBMIT MANUSCRIPT
                 <ArrowRight size={16} className={styles.ctaIcon} />
              </Link>
              <Link href="/publication/current" className={styles.ctaSecondary}>EXPLORE CURRENT ISSUE</Link>
            </div>

            <div className={styles.indexedByStrip}>
               <span className={styles.indexLabel}>INDEXED IN:</span>
               <div className={styles.indexItems}>
                  <span>Web of Science</span>
                  <span className={styles.dot}></span>
                  <span>Scopus</span>
                  <span className={styles.dot}></span>
                  <span>PubMed</span>
                  <span className={styles.dot}></span>
                  <span>EMBASE</span>
               </div>
            </div>
          </div>
          
          <div className={styles.heroVisualElite}>
             <div className={styles.mainVisualContainer}>
                <img 
                  src="/a1.jpg" 
                  alt="Advanced Pharmaceutical Research Library" 
                  className={styles.heroMainImage}
                />
                <div className={styles.visualOverlay}></div>
                <div className={styles.floatingImpactCard}>
                   <span className={styles.impactVal}>0.6</span>
                   <span className={styles.impactLabel}>IF (2024)</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
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
