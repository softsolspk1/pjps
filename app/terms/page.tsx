import styles from './legal.module.css';

export default function TermsPage() {
  return (
    <div className={`container section-padding ${styles.legal}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <p className={styles.subtitle}>By using the PJPS website or submitting a manuscript, you agree to these terms.</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Use of Website</h2>
          <p>The content of this website is the property of the Pakistan Journal of Pharmaceutical Sciences (PJPS). You may access the website for scholarly research and non-commercial purposes only.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Intellectual Property</h2>
          <p>All materials published on this website, including but not limited to articles, images, and logos, are protected by copyright laws. Unauthorized reproduction or distribution is strictly prohibited.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Submission Terms</h2>
          <p>By submitting a paper to PJPS, authors warrant that the work is original, has not been published elsewhere, and does not infringe upon any third-party rights. Authors retain copyright under the CC BY license.</p>
        </section>
      </div>
    </div>
  );
}
