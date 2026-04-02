import styles from '../terms/legal.module.css';

export default function PrivacyPage() {
  return (
    <div className={`container section-padding ${styles.legal}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>PJPS is committed to protecting the privacy of its authors and users.</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. Data Collection</h2>
          <p>We collect personal information such as your name, email address, and institutional affiliation when you submit a manuscript or register for an account.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Use of Information</h2>
          <p>Your information is used solely for the purpose of the editorial and publication process. We do not sell or share your personal data with third parties for marketing purposes.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Cookies</h2>
          <p>The PJPS website uses cookies to enhance user experience and analyze website traffic. By using our website, you consent to our use of cookies in accordance with this policy.</p>
        </section>
      </div>
    </div>
  );
}
