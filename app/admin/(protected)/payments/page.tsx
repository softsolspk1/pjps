"use client";

import { useState, useEffect } from "react";
import { CreditCard, ExternalLink, CheckCircle, XCircle, Clock, Search, AlertCircle, FileText, User, ShieldCheck } from "lucide-react";
import styles from "./Payments.module.css";

export default function PaymentsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId("");
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.authors[0]?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className={styles.emptyState}><Clock className={styles.spinner} /> <p className={styles.emptyText}>Retrieving Registry...</p></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
           <div className={styles.badge}>Institutional Finance</div>
           <h1 className={styles.title}>Fee Verification Hub</h1>
           <p className={styles.subtitle}>Audit and verify scholarly processing and publication fees for global submissions.</p>
        </div>

        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search by manuscript title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </header>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
               <th>Manuscript Identity</th>
               <th>Submission Track</th>
               <th>Origin</th>
               <th style={{ textAlign: 'center' }}>Status</th>
               <th>Proof Artifact</th>
               <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article: any) => (
              <tr key={article.id}>
                <td>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  <div className={styles.authorInfo}>
                    <User size={12} />
                    <span>{article.authors[0]?.name || "Anonymous Scholar"}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.trackBadge} ${
                    article.trackingType === 'FAST' ? styles.trackFast : 
                    article.trackingType === 'ULTRA_FAST' ? styles.trackUltrafast : styles.trackRegular
                  }`}>
                    {article.trackingType}
                  </span>
                </td>
                <td>
                  <div className={`${styles.originLabel} ${article.origin === 'PAKISTANI' ? styles.originPakistani : styles.originInternational}`}>
                    {article.origin}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                    {article.paymentStatus === 'PAID' ? (
                       <span className={`${styles.status} ${styles.statusPaid}`}><CheckCircle size={14} /> Verified</span>
                    ) : article.paymentStatus === 'PENDING' ? (
                       <span className={`${styles.status} ${styles.statusPending}`}><Clock size={14} /> Screening</span>
                    ) : (
                       <span className={`${styles.status} ${styles.statusUnpaid}`}><AlertCircle size={14} /> UNPAID</span>
                    )}
                </td>
                <td>
                  {article.paymentProofUrl ? (
                    <a 
                      href={article.paymentProofUrl} 
                      target="_blank" 
                      className={styles.proofLink}
                    >
                      <FileText size={14} /> View File <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className={styles.emptyText} style={{ fontSize: '10px' }}>No proof uploaded</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    {article.paymentStatus !== 'PAID' && (
                      <button 
                        onClick={() => updateStatus(article.id, 'PAID')}
                        disabled={updatingId === article.id}
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        title="Approve Payment"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {article.paymentStatus !== 'REJECTED' && (
                      <button 
                        onClick={() => updateStatus(article.id, 'REJECTED')}
                        disabled={updatingId === article.id}
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        title="Reject / Flag Payment"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className={styles.emptyState}>
             <div className={styles.emptyIcon}>
               <Search size={32} />
             </div>
             <p className={styles.emptyText}>No scholarly payment records found matching your filters.</p>
          </div>
        )}
      </div>

      <div className={styles.policyCard}>
        <div className={styles.policyContent}>
           <div className={styles.policyIcon}>
             <ShieldCheck size={20} />
           </div>
           <div>
              <h4 className={styles.policyTitle}>Institutional Policy Reminder</h4>
              <p className={styles.policyDesc}>Submission fees are non-refundable. Marking an article as "Verified" authorizes the immediate commencement of the peer-review phase.</p>
           </div>
        </div>
        <div className={styles.policyProtocol}>
          PJPS Administrative Protocol
        </div>
      </div>
    </div>
  );
}
