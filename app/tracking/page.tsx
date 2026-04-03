'use client';

import { useState } from 'react';
import styles from './TrackingPage.module.css';

const STEPS = [
  { id: 'SUBMITTED', label: 'Technical Screening', desc: 'Initial verification of scholarly criteria.' },
  { id: 'IN_REVIEW', label: 'Peer Evaluation', desc: 'Expert scholarly assessment in progress.' },
  { id: 'REVISION', label: 'Editorial Revision', desc: 'Author responding to scholarly feedback.' },
  { id: 'ACCEPTED', label: 'Accepted', desc: 'Approved for institutional publication.' },
  { id: 'PUBLISHED', label: 'Published Registry', desc: 'Live in the digital scholarly archive.' }
];

export default function TrackingPage() {
  const [refId, setRefId] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;

    setLoading(true);
    setError('');
    setArticle(null);

    try {
      const res = await fetch(`/api/tracking?id=${refId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Reference identifier not found.');
      }

      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
         <div className={styles.badge}>Editorial Monitoring</div>
         <h1 className={styles.title}>Manuscript Tracking</h1>
         <p className={styles.subtitle}>Ensuring scholarly transparency through editorial monitorization.</p>
      </header>

      <section className={styles.searchSection}>
         <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputGroup}>
               <label className={styles.inputLabel}>Registry Reference Identifier</label>
               <input 
                 type="text" 
                 required
                 className={styles.input}
                 placeholder="e.g. clm7..."
                 value={refId}
                 onChange={(e) => setRefId(e.target.value)}
               />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Analyzing Status..." : "Analyze Status"}
            </button>
         </form>

         {error && (
           <div style={{ marginTop: '20px', color: '#ff4444', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
             Registry Search Failure: {error}
           </div>
         )}
      </section>

      {!article && !loading && !error && (
        <div className={styles.emptyState}>
           <p className={styles.emptyText}>
             Provide your scholarly reference identifier <br/> to access real-time registry status.
           </p>
        </div>
      )}

      {article && (
        <div className={styles.resultContainer}>
           <div className={styles.articleCard}>
              <span className={styles.articleBadge}>Registry Profile Entry</span>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              <div className={styles.articleMeta}>
                 <div>
                    <span className={styles.metaLabel}>Received</span>
                    <span className={styles.metaValue}>{new Date(article.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div>
                    <span className={styles.metaLabel}>Evaluation Protocol</span>
                    <span className={styles.metaValue}>{article.reviewType} REVIEW</span>
                 </div>
              </div>
           </div>

           <div className={styles.timelineSection}>
              <h3 className={styles.timelineHeading}>Editorial Lifecycle Monitoring</h3>
              <div className={styles.timeline}>
                 {STEPS.map((step, idx) => {
                   const currentIdx = getCurrentStepIndex(article.status);
                   const isCompleted = idx <= currentIdx;
                   const isActive = idx === currentIdx;

                   return (
                     <div key={step.id} className={styles.step}>
                        {idx !== STEPS.length - 1 && (
                          <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineActive : ''}`} />
                        )}
                        <div className={`${styles.bullet} ${isCompleted ? styles.bulletActive : ''}`} />
                        <div className={`${styles.stepContent} ${isCompleted ? styles.stepContentActive : ''}`}>
                           <h4 className={styles.stepLabel} style={isActive ? { color: 'var(--primary-navy)' } : {}}>
                              {step.label} {isActive && "— Active Cycle"}
                           </h4>
                           <p className={styles.stepDesc}>{step.desc}</p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {article.status === 'REJECTED' && (
              <div style={{ marginTop: '40px', padding: '30px', background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: '12px', textAlign: 'center' }}>
                 <p style={{ color: '#c53030', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Registry Decision: Final Rejection</p>
                 <p style={{ color: '#c53030', fontSize: '13px', marginTop: '8px' }}>This manuscript has been determined to be outside the scoping technical criteria for PJPS.</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
}
