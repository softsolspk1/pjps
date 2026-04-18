import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroLeftAligned}>
      <div className={styles.heroContentFull}>
        <div className={styles.heroLayout}>
          <div className={styles.heroVisualLeft}>
             <div className={styles.journalCoverFrame}>
                <img 
                  src="/journal-cover-new.png" 
                  alt="Pakistan Journal of Pharmaceutical Sciences - Latest Issue" 
                  className={styles.journalImage}
                />
             </div>
          </div>

          <div className={styles.heroTextRight}>
            <div className={styles.heroBadgeLeft}>
               ACADEMIC EXCELLENCE SINCE 1988
            </div>
            <h1 className={styles.heroTitleLeft}>
              Advancing the Global <br />
              <span className={styles.titleSerifSecondary}>Pharmaceutical Frontier</span>
            </h1>
            <p className={styles.heroSubtitleLeft}>
              A globally recognized platform dedicated to advancing pharmaceutical and biomedical research, officially acknowledged by HEC and indexed in leading databases such as Web of Science and Scopus.
            </p>
            <div className={styles.heroActionsLeft}>
              <Link href="/submission" className="btn btn-primary">SUBMIT YOUR RESEARCH</Link>
              <Link href="/publication/current" className="btn btn-outline">EXPLORE CURRENT ISSUE</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
