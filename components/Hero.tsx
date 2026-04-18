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
             <div className={styles.journalCoverWrapper}>
                <img 
                  src="/hero-pjps.png" 
                  alt="Pakistan Journal of Pharmaceutical Sciences - Latest Issue" 
                  className={styles.journalImage}
                />
             </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
