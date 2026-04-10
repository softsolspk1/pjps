import styles from './issues.module.css';

const MOCK_ISSUES = [
  { year: 2026, volume: 39, issues: [1, 2, 3] },
  { year: 2025, volume: 38, issues: [1, 2, 3, 4, 5, 6] },
  { year: 2024, volume: 37, issues: [1, 2, 3, 4, 5, 6] },
];

export default function IssuesPage() {
  return (
    <div className={`container section-padding ${styles.issues}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Journal Archive & Issues</h1>
        <p className={styles.subtitle}>Browse through decades of pharmaceutical research and academic excellence.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h3>Filter by Year</h3>
          <ul className={styles.yearList}>
            {MOCK_ISSUES.map(item => (
              <li key={item.year} className={item.year === 2026 ? styles.activeYear : ''}>
                {item.year} (Vol {item.volume})
              </li>
            ))}
            <li>2023 (Vol 36)</li>
            <li>2022 (Vol 35)</li>
            <li>Show More...</li>
          </ul>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.currentIssue}>
            <div className={styles.badge}>Current Issue</div>
            <h2>Volume 39, Issue 3 (March 2026)</h2>
            <p>Published monthly from January 2026 onwards.</p>
            <button className="btn btn-primary">View Current Issue Contents</button>
          </div>

          <div className={styles.archiveGrid}>
            {MOCK_ISSUES.map(yearData => (
              <div key={yearData.year} className={styles.yearGroup}>
                <h3 className={styles.yearHeader}>{yearData.year} - Volume {yearData.volume}</h3>
                <div className={styles.issueCards}>
                  {yearData.issues.map(issueNum => (
                    <div key={issueNum} className={styles.issueCard}>
                      <div className={styles.issueIcon}>📖</div>
                      <div className={styles.issueInfo}>
                        <span className={styles.issueLabel}>Issue {issueNum}</span>
                        <span className={styles.issueDate}>Available Online</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
