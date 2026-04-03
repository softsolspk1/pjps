'use client';

import { useState } from 'react';
import styles from './tracking.module.css';

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
        throw new Error(data.error || 'Failed to search');
      }

      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Article Tracking</h1>
      <p className={styles.subtitle}>Please input the reference ID of the desired article to check its current status.</p>

      <div className={styles.searchBox}>
        <form onSubmit={handleSearch} className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input}
            placeholder="Enter Reference ID (e.g., cm0...) "
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {article && (
          <div className={styles.result}>
            <div className={styles.statusCard}>
              <span className={styles.statusTitle}>Manuscript Title</span>
              <p style={{ marginBottom: '20px', fontWeight: 500 }}>{article.title}</p>
              
              <span className={styles.statusTitle}>Current Status</span>
              <div className={styles.statusValue}>
                {article.status.replace('_', ' ')}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                Last Updated: {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
