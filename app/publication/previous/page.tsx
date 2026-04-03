import styles from '../../info.module.css';
import Link from 'next/link';

export default function PreviousIssuesPage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Previous Issues</h1>
        <p className={styles.subtitle}>Explore our extensive archive of pharmaceutical research dating back to 1988.</p>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Browse Archive</h2>
          <p>
            The Pakistan Journal of Pharmaceutical Sciences (PJPS) has been a leading publisher of pharmaceutical research for over three decades. 
            All past issues are organized by year and volume for easy access.
          </p>
          <div style={{ marginTop: '30px' }}>
            <Link href="/issues" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
              Browse Issues by Year
            </Link>
          </div>
        </section>

        <section style={{ marginTop: '60px' }}>
          <h2>Journal History</h2>
          <p>
            PJPS was established in 1988 by the Faculty of Pharmacy and Pharmaceutical Sciences, University of Karachi. 
            Initially a bi-annual journal, it transitioned to quarterly in 2005, bi-monthly in 2013, and is now published monthly from January 2026.
          </p>
          <ul>
            <li><strong>Total Publications:</strong> 5,881+ articles</li>
            <li><strong>Indexing:</strong> Web of Science (SCIE), Scopus, PubMed, and more.</li>
            <li><strong>Impact Factor:</strong> 0.6 (2024 JCR)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
