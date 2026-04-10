import styles from '../../info.module.css';

const SPECIAL_ARTICLES = [
  {
    id: 1,
    title: "Association of GRK5 variant rs10886471 with the therapeutic effect of repaglinide in patients of type 2 diabetes mellitus in Peshawar, Pakistan",
    doi: "10.36721/PJPS.2024.37.2.SP.417-421.1",
    pages: "417-421",
    authors: "Kiran Ijaz, Zakiullah, Haseenullah Shah, Sajid Ali, Mohsin Raziq, Haji Bahadar",
    pdfUrl: "https://pjps.pk/uploads/2024/05/1715921561.pdf"
  },
  {
    id: 2,
    title: "Sodium valproate inhibited apoptosis in lethally scalded rat cardiomyocytes by regulating hypoxia-inducible factor-1? expression",
    doi: "10.36721/PJPS.2024.37.2.SP.423-428.1",
    pages: "423-428",
    authors: "Xiangxi Meng, Hailing Wen, Sen Hu, Jinguang Zheng",
    pdfUrl: "https://pjps.pk/uploads/2024/05/1715921624.pdf"
  },
  {
    id: 3,
    title: "Synthesis and characterization of honey based hybrid dental implants with enhanced antibacterial activity",
    doi: "10.36721/PJPS.2024.37.2.SP.429-434.1",
    pages: "429-434",
    authors: "Hina Zahid, Sumbul Shamim, Muhammad Kawish, Rukesh Maharjan, Muhammad Raza Shah",
    pdfUrl: "https://pjps.pk/uploads/2024/05/1715921712.pdf"
  }
];

export default function SpecialIssuePage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Special Issues</h1>
        <p className={styles.subtitle}>Focused collections of research on emerging topics and specialized pharmaceutical fields.</p>
      </header>

      <div className={styles.content}>
        <p>PJPS occasionally publishes special issues dedicated to specific research areas. Below are some of our recently featured special issue articles.</p>
        
        <div style={{ marginTop: '40px' }}>
          {SPECIAL_ARTICLES.map((article) => (
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
