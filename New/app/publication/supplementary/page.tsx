import styles from '../../info.module.css';

const SUPPLEMENTARY_ARTICLES = [
  {
    id: 1,
    title: "Association of fibrinogen and plasminogen activator inhibitor-1 with diabetes mellitus",
    doi: "10.36721/PJPS.2023.36.1.SUP.165-169.1",
    pages: "165-169",
    authors: "Iffat Ara Aziz, Asher Fawwad, Iftikhar Ahmed Siddiqui, Kahkashan Perveen, Ruqaya Nangrejo, Nazish Waris, Abdul Basit",
    pdfUrl: "https://pjps.pk/uploads/pdfs/35/1/Supplementary/1-SUP-1801.pdf"
  }
];

export default function SupplementaryIssuePage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Supplementary Issues</h1>
        <p className={styles.subtitle}>Additional research materials and specialized data supplements to the main journal publications.</p>
      </header>

      <div className={styles.content}>
        <p>PJPS provides supplementary issues to facilitate the dissemination of detailed datasets and specialized research findings.</p>
        
        <div style={{ marginTop: '40px' }}>
          {SUPPLEMENTARY_ARTICLES.map((article) => (
            <div key={article.id} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-navy)', textDecoration: 'none' }}>
                  {article.id}. {article.title}
                </a>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>By:</strong> {article.authors}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>DOI:</strong> {article.doi} | <strong>Page No:</strong> {article.pages}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '15px' }}>
                <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View PDF</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
