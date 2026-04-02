import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroDecorative}></div>
      <div className={`container ${styles.heroContent} reveal`}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeLine}></span>
          Academic Excellence Since 1988
        </div>
        <h1 className={styles.heroTitle}>
          Advancing the Global <br />
          <span className={styles.titleAccent}>Pharmaceutical Frontier</span>
        </h1>
        <p className={styles.heroSubtitle}>
          A world-class forum for the dissemination of pharmaceutical and biomedical research. 
          Directly recognized by <strong>HEC</strong> and indexed in <strong>Web of Science</strong> and <strong>Scopus</strong>.
        </p>
        <div className={styles.heroActions}>
          <Link href="/submission" className="btn btn-primary">Submit Your Research</Link>
          <Link href="/issues" className="btn btn-outline">Explore Current Issue</Link>
        </div>
        
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>0.601</span>
            <span className={styles.statLabel}>Impact Factor</span>
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
            <span className={styles.statValue}>6,000+</span>
            <span className={styles.statLabel}>Citations</span>
          </div>
        </div>
      </div>
    </section>
  );
}

