import styles from '../../info.module.css';

export default function PeerReviewPage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Peer Review Guidelines</h1>
        <p className={styles.subtitle}>Our commitment to maintaining the highest standards of scientific integrity and transparency through rigorous peer review.</p>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Introduction</h2>
          <p>
            The Pakistan Journal of Pharmaceutical Sciences (PJPS) is dedicated to maintaining the highest standards of review and the integrity of scientific publication. 
            All manuscripts undergo a rigorous peer review process to ensure objectivity, quality, and clinical significance.
          </p>
        </section>

        <section>
          <h2>Review Process</h2>
          <p>
            Manuscripts are evaluated by the Editor-in-Chief for initial suitability. If suitable, the manuscript undergoes a **double-anonymous peer review** by at least two independent subject experts. 
            Anonymity is strictly maintained throughout the process to ensure unbiased evaluation.
          </p>
        </section>

        <section>
          <h2>Review Timelines</h2>
          <p>We strive to process documents in a fair and timely manner. Reviewers are requested to submit feedback based on the publication system:</p>
          <ul>
            <li><strong>Ultra-Fast Review (UFR):</strong> Within 7 business days.</li>
            <li><strong>Fast Publication System (FPS):</strong> Within 10 business days.</li>
            <li><strong>Regular Publication System (RPS):</strong> Within 21 business days.</li>
          </ul>
        </section>

        <section>
          <h2>Responsibilities of Reviewers</h2>
          <p>Peer reviewers are expected to adhere to the following principles:</p>
          <ul>
            <li><strong>Promptness:</strong> Respond promptly to review requests to avoid unnecessary delays.</li>
            <li><strong>Conflict of Interest:</strong> Disclose any financial, personal, or professional conflicts of interest before accepting a review.</li>
            <li><strong>Confidentiality:</strong> Maintain absolute confidentiality regarding the authors' identities and the content of the manuscript.</li>
            <li><strong>Constructive Feedback:</strong> Provide helpful, corrective comments rather than disparaging remarks.</li>
            <li><strong>Integrity:</strong> Do not use generative AI tools (like ChatGPT) for creating review reports or analyzing confidential manuscript data.</li>
            <li><strong>Objectivity:</strong> Maintain unbiasedness regardless of authors' nationality, gender, or political/religious views.</li>
          </ul>
        </section>

        <section>
          <h2>Importance of Peer Review</h2>
          <p>
            The feedback and suggestions from peer reviewers are a crucial source of information for the Editor-in-Chief when choosing manuscripts for publication. 
            Peer review ensures that articles receive objective criticism, enabling authors to improve their work and publish high-caliber scientific studies.
          </p>
        </section>
      </div>
    </div>
  );
}
