import styles from '../../info.module.css';

export default function ConflictOfInterestPage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Conflict of Interest Policy</h1>
        <p className={styles.subtitle}>Transparency and integrity are the cornerstones of our publishing process.</p>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Policy Overview</h2>
          <p>
            The Pakistan Journal of Pharmaceutical Sciences (PJPS) defines "conflicts of interest" as situations involving hidden agendas—personal, financial, commercial, political, or academic—that could influence the opinions of authors, editors, or reviewers and potentially deceive or mislead readers.
          </p>
        </section>

        <section>
          <h2>For Authors</h2>
          <p>
            Authors must report any potential conflicts of interest related to their research, including financial interests (e.g., funding, shares, consultancies), personal relationships, political/academic commitments, or institutional obligations.
          </p>
          <p>
            <strong>Submission Requirements:</strong> All authors must complete and submit an "Undertaking Form" alongside their manuscript.
          </p>
          <p>
            <strong>Disclosure:</strong> A conflict of interest statement must be included in the article before the acknowledgment section. If there are no conflicts, the following statement must be used: <em>"The authors declare no conflict of interest."</em>
          </p>
        </section>

        <section>
          <h2>For Reviewers</h2>
          <p>
            Reviewers are required to declare any financial, academic, personal, professional, religious, or political conflicts of interest. 
            This includes disclosing if they have had joint grants or collaborations with the authors within the past three years or if they are employed by the same organization.
          </p>
          <p>
            <strong>Journal Action:</strong> Reviewers are asked about potential conflicts before the review process begins; the process will not be initiated if a conflict exists.
          </p>
        </section>

        <section>
          <h2>For Editors</h2>
          <p>
            Editors must abstain from making editorial decisions regarding any manuscript if they have a close family member as an author or hold any financial, religious, political, or organizational conflict of interest with the content or the authors.
          </p>
        </section>
      </div>
    </div>
  );
}
