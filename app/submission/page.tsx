import styles from './submission.module.css';

export default function SubmissionPage() {
  return (
    <div className={`container section-padding ${styles.submission}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submission Guidelines</h1>
        <p className={styles.subtitle}>Please follow these instructions carefully to ensure the efficient review and publication of your manuscript.</p>
      </div>

      <div className={styles.submissionGrid}>
        <div className={styles.instructionCard}>
          <h3>Manuscript Preparation</h3>
          <ul className={styles.guidelineList}>
            <li><strong>Language:</strong> All manuscripts must be in English.</li>
            <li><strong>Structure:</strong> Must include Title Page, Abstract, Keywords (3-6), Introduction, Methods, Results, Discussion, and Conclusion.</li>
            <li><strong>Word Limits:</strong>
              <ul>
                <li>Original Research: ≤ 8,000 words</li>
                <li>Review Articles: ≤ 12,000 words</li>
                <li>Case Reports: ≤ 2,000 words</li>
              </ul>
            </li>
            <li><strong>References:</strong> Use the Vancouver style for citations.</li>
          </ul>
          <div className={styles.ctaBox}>
            <button className="btn btn-secondary">Download MS Word Template</button>
          </div>
        </div>

        <div className={styles.formPlaceholder}>
          <div className={styles.submissionInfo}>
            <h3 className={styles.infoTitle}>How to Submit</h3>
            <p className={styles.infoText}>
              PJPS currently accepts electronic submissions via email. Please send your manuscript files 
              and a cover letter to the following official editorial addresses:
            </p>
            <div className={styles.emailList}>
              <div className={styles.emailItem}>
                <strong>Primary:</strong> submissions@pjps.pk
              </div>
              <div className={styles.emailItem}>
                <strong>Secondary:</strong> pjps@uok.edu.pk
              </div>
              <div className={styles.emailItem}>
                <strong>Official:</strong> pakjps@hotmail.com
              </div>
            </div>
            
            <div className={styles.policyNotice}>
              <h4>Ethics Policy</h4>
              <p>All submissions are subjected to a double-blind peer-review process. PJPS maintains 
              a zero-tolerance policy towards plagiarism and scientific misconduct.</p>
            </div>

            <button className="btn btn-primary">Download Submission Checklist</button>
          </div>
        </div>
      </div>
    </div>
  );
}
