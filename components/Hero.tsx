import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className="container-full">
        <div className={styles.heroGrid}>
          {/* Visual Element First for strict alignment flow */}
          <div className={styles.visualColumn}>
             <div className={styles.coverWrapper}>
                <img 
                  src="/journal-cover-new.png" 
                  alt="PJPS Latest Issue" 
                  className={styles.journalCover}
                />
                <div className={styles.coverShadow}></div>
             </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.headerBadge}>
               ESTABLISHED 1988 • IMPACT FACTOR 0.6
            </div>
            <h1 className={styles.mainTitle}>
              Advancing the Global <br />
              <span className={styles.italicTitle}>Pharmaceutical Frontier</span>
            </h1>
            <p className={styles.description}>
              The Pakistan Journal of Pharmaceutical Sciences (PJPS) is a premier 
              peer-reviewed monthly journal dedicated to the dissemination of 
              high-impact research across the pharmaceutical and biomedical sciences.
            </p>
            <div className={styles.actionGroup}>
              <Link href="/submission" className="btn btn-primary">SUBMIT MANUSCRIPT</Link>
              <Link href="/publication/current" className="btn btn-outline">CURRENT ISSUE</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
