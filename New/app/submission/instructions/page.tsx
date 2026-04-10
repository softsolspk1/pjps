import styles from '../../info.module.css';

export default function InstructionsPage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Instruction for Authors</h1>
        <p className={styles.subtitle}>Comprehensive guidelines for submitting original research to the Pakistan Journal of Pharmaceutical Sciences.</p>
      </header>

      <div className={styles.content}>
        <section>
          <h2>Scope of the Journal</h2>
          <p>
            Pakistan Journal of Pharmaceutical Sciences (PJPS) is a peer-reviewed multi-disciplinary pharmaceutical and medicinal publication scheduled to appear monthly from January 2026 onwards. It serves as a platform for the exchange of scientific information at an international level.
          </p>
          <p>
            All manuscripts are evaluated for their scientific content and significance by the Editor-in-Chief. Submitted manuscripts should contain unpublished, original research not under consideration for publication elsewhere.
          </p>
        </section>

        <section>
          <h2>Online Submission</h2>
          <p>
            Authors must ensure that their papers align with the journal’s scope. Articles should be comprehensive accounts of significant experimental or theoretical work. Manuscripts should be written in a clear and concise manner, including only data crucial for the final conclusion.
          </p>
          <p>
            Manuscripts should be emailed in MS Word format as a single file. Chemical formulae or equations should be prepared using the ‘mathematical equations’ option in MS Word.
          </p>
          <p>
            Submit your manuscripts to: <strong>submissions@pjps.pk</strong>, <strong>pjps@uok.edu.pk</strong>, or <strong>pakjps@hotmail.com</strong>.
          </p>
        </section>

        <section>
          <h2>Structure of Article</h2>
          <ul>
            <li><strong>Language:</strong> English only.</li>
            <li><strong>Format:</strong> A4 paper size with 1-inch (2.5 cm) margins.</li>
            <li><strong>Word Count:</strong>
              <ul>
                <li>Original Research: ≤ 8000 words</li>
                <li>Review Article: ≤ 12000 words</li>
                <li>Mini Review: ≤ 4000 words</li>
                <li>Case Report: ≤ 2000 words</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>Manuscript Organization</h2>
          <p>The manuscript should be organized in the following order:</p>
          <ol>
            <li>Title</li>
            <li>Abstract (Background, Objectives, Methods, Results, Conclusion - max 300 words)</li>
            <li>Keywords (3-5 MeSH terms)</li>
            <li>Introduction</li>
            <li>Materials and Methods</li>
            <li>Results</li>
            <li>Discussion</li>
            <li>Conclusion</li>
            <li>Acknowledgments</li>
            <li>Authors’ Contributions</li>
            <li>Funding</li>
            <li>Data Availability Statement</li>
            <li>Ethical Approval</li>
            <li>Conflict of Interest</li>
            <li>References (Harvard Style)</li>
          </ol>
        </section>

        <section>
          <h2>Publication Systems & Fees</h2>
          <div className={styles.tableContainer}>
            <table className={styles.infoTable}>
              <thead>
                <tr>
                  <th>System</th>
                  <th>Local (PKR)</th>
                  <th>International (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Regular Publication (RPS)</td>
                  <td>3,000 / page</td>
                  <td>75 / page</td>
                </tr>
                <tr>
                  <td>Fast Publication (FPS)</td>
                  <td>15,000 / page</td>
                  <td>200 / page</td>
                </tr>
                <tr>
                  <td>Ultra-Fast Review (UFR)</td>
                  <td>-</td>
                  <td>200 / page + 1,000-1,500 / article</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Anti-Plagiarism Policy</h2>
          <p>
            Manuscripts should not be plagiarized. If the similarity index is found to be more than <strong>19%</strong>, the manuscript will not be processed for review.
          </p>
        </section>
      </div>
    </div>
  );
}
