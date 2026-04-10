import styles from '../../info.module.css';

const ARTICLES = [
  {
    id: 1,
    title: "Clinical characteristics and factors affecting quality of life in children with congenital adrenal hyperplasia",
    doi: "10.36721/PJPS.2026.39.6.151.1",
    pages: "1602-1610",
    authors: "Shiyi Xu, Zhen Li, Qingxian Fu, Qiuting Lin, Hui Liu",
    pdfUrl: "https://pjps.pk/uploads/2026/03/1774515854.pdf"
  },
  {
    id: 2,
    title: "Pharmacodynamic basis of gabapentin combined with Hegu-point catgut embedding for post-herpetic neuralgia",
    doi: "10.36721/PJPS.2026.39.5.152.1",
    pages: "1611-1617",
    authors: "Li-Ping Li, Zong-Zhou Song, Yang Zheng, Ting Wu, Fang-Wei Li, Yan Huang",
    pdfUrl: "https://pjps.pk/uploads/2026/03/1774516005.pdf"
  },
  {
    id: 3,
    title: "Impact of ceftazidime/avibactam combined dynamic nutritional support on intestinal barrier function in sepsis patients: A focus on barrier protection mechanisms",
    doi: "10.36721/PJPS.2026.39.6.153.1",
    pages: "1618-1624",
    authors: "Xiaojuan Sha, Lijuan Sun, Jun Wu",
    pdfUrl: "https://pjps.pk/uploads/2026/03/1774516263.pdf"
  },
  {
    id: 4,
    title: "Effect of edaravone on synaptic damage in Alzheimer's disease via Rho/ROCK signaling",
    doi: "10.36721/PJPS.2026.39.6.154.1",
    pages: "1625-1630",
    authors: "Yuejun Li, Qiuyue Lai, Qiong Li, Yixie Fan",
    pdfUrl: "https://pjps.pk/uploads/2026/03/1774691677.pdf"
  },
  {
    id: 5,
    title: "Comparative pharmacokinetic analysis of curcumin and curcumin O-glucuronide through curcumin nano-gel-based delivery system using liquid chromatogram tandem mass spectrometry",
    doi: "10.36721/PJPS.2026.39.6.155.1",
    pages: "1631-1644",
    authors: "Lue Hong, Ruohan Man, Xiaowan Chen, Ziming Yang, Dingjie Shen, Wei Chen",
    pdfUrl: "https://pjps.pk/uploads/2026/03/1774698012.pdf"
  }
];

export default function CurrentIssuePage() {
  return (
    <div className={styles.infoPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Current Issue</h1>
        <p className={styles.subtitle}>Volume 39, Issue 3 (March 2026)</p>
      </header>

      <div className={styles.content}>
        <p>Following is the list of articles published in the current issue. Click on the title to view the full PDF.</p>
        
        <div style={{ marginTop: '40px' }}>
          {ARTICLES.map((article) => (
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
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View Abstract</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
