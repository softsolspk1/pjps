import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroDecorative}></div>
      <div className={`container-full ${styles.heroContent}`}>
        <div className={styles.heroBadge}>
          <span className={styles.badgeLine}></span>
          Academic Excellence Since 1988
        </div>
        <h1 className={styles.heroTitle}>
          Advancing the Global <br />
          <span className={styles.titleAccent}>Pharmaceutical Frontier</span>
        </h1>
        <p className={styles.heroSubtitle}>
          A globally recognized platform dedicated to advancing pharmaceutical and biomedical research, officially acknowledged by HEC and indexed in leading databases such as Web of Science and Scopus.
        </p>
        <div className={styles.heroActions}>
          <Link href="/submission" className="btn btn-primary">Submit Your Research</Link>
          <Link href="/issues" className="btn btn-outline">Explore Current Issue</Link>
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
