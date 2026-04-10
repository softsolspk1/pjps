import styles from './policy.module.css';

export default function PolicyPage() {
  return (
    <div className={`container section-padding ${styles.policy}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Editorial Policies</h1>
        <p className={styles.subtitle}>PJPS adheres to the highest standards of academic integrity and scientific excellence.</p>
      </div>

      <div className={styles.policySection}>
        <h2>Peer Review Process</h2>
        <p>PJPS employs a double-blind peer review process. All manuscripts are reviewed by at least two independent referees who are experts in the relevant field. The Editor-in-Chief makes the final decision on acceptance, revision, or rejection.</p>
      </div>

      <div className={styles.policySection}>
        <h2>Open Access Policy</h2>
        <p>PJPS is a fully open-access journal. All articles are published under the Creative Commons Attribution (CC BY) license, allowing for unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.</p>
      </div>

      <div className={styles.policySection}>
        <h2>Ethics & Malpractice</h2>
        <p>PJPS is committed to upholding the COPE (Committee on Publication Ethics) guidelines. Plagiarism, data fabrication, and redundant publication are strictly prohibited and will be dealt with according to international standards.</p>
      </div>
    </div>
  );
}
