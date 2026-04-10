import Link from 'next/link';
import styles from './archive.module.css';

export default function ArchivePage() {
  return (
    <div className={`container section-padding ${styles.archive}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>PJPS Archive</h1>
        <p className={styles.subtitle}>Explore the historical progression of pharmaceutical research at PJPS.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.archiveCard}>
          <h2>Current Issues (2020 - Present)</h2>
          <p>Access the latest research and most recent volumes of PJPS.</p>
          <Link href="/issues" className="btn btn-primary">Browse Recent Issues</Link>
        </div>

        <div className={styles.archiveCard}>
          <h2>Legacy Archive (1988 - 2019)</h2>
          <p>Decades of groundbreaking research digitized for global access.</p>
          <Link href="/issues" className="btn btn-outline">Explore Legacy Volumes</Link>
        </div>
      </div>
    </div>
  );
}
