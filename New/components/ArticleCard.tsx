import Link from 'next/link';
import styles from './ArticleCard.module.css';

interface ArticleProps {
  category: string;
  title: string;
  authors: string;
  doi: string;
  id: string;
  date?: string;
}

export default function ArticleCard({ category, title, authors, doi, id, date }: ArticleProps) {
  return (
    <div className={`card ${styles.articleCard}`}>
      <div className={styles.cardHeader}>
        <div className={styles.badgeWrapper}>
          <span className={styles.category}>{category}</span>
        </div>
        {date && <span className={styles.date}>{date}</span>}
      </div>
      <h3 className={styles.title}>
        <Link href={`/article/${id}`}>{title}</Link>
      </h3>
      <p className={styles.authors}>{authors}</p>
      <div className={styles.footer}>
        <div className={styles.doiGroup}>
          <span className={styles.doiValue}>
            DOI: <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className={styles.doiLink}>{doi}</a>
          </span>
        </div>
        <Link href={`/article/${id}`} className={styles.readMore}>
          <span>Read Full Manuscript</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

