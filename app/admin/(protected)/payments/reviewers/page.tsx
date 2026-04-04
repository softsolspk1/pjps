"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, CheckCircle, Search, 
  DollarSign, User, FileText, 
  ArrowRight, Loader2, Award,
  CheckCircle2, Clock
} from "lucide-react";
import styles from "./ReviewerPayments.module.css";

export default function ReviewerPaymentsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/admin/payments/reviewers");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Fetch reviews error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const handleRecordPayment = async (reviewId: string) => {
    const amount = prompt("Enter payment amount (e.g. 5000 or 50):");
    const ref = prompt("Enter payment reference / Transaction ID:");
    
    if (!amount || !ref) return;

    setUpdating(reviewId);
    try {
      const res = await fetch("/api/admin/payments/reviewers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, amount: parseFloat(amount), reference: ref })
      });

      if (res.ok) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, paymentStatus: 'PAID', paymentAmount: parseFloat(amount), paymentRef: ref } : r));
      }
    } catch (err) {
      console.error("Update payment error:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className={styles.loader}><Loader2 className={styles.spinner} /></div>;

  const unpaidCount = reviews.filter(r => r.paymentStatus !== 'PAID').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
           <div className={styles.badge}>Fiscal Oversight</div>
           <h1 className={styles.title}>Reviewer Disbursements</h1>
        </div>
        <div className={styles.stats}>
           <div className={styles.statItem}>
              <Clock size={16} />
              <span>{unpaidCount} Pending Payments</span>
           </div>
        </div>
      </header>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Expert Participant</th>
              <th>Manuscript Reference</th>
              <th>Review Status</th>
              <th>Disbursement</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userIcon}><User size={16} /></div>
                    <div>
                      <div className={styles.userName}>{r.reviewer.name}</div>
                      <div className={styles.userEmail}>{r.reviewer.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.articleInfo}>
                    <FileText size={14} color="#a0aec0" />
                    <span className={styles.articleTitle}>{r.article.title}</span>
                  </div>
                </td>
                <td>
                   <span className={`${styles.statusBadge} ${styles[r.status.toLowerCase()]}`}>
                      {r.status}
                   </span>
                </td>
                <td>
                   {r.paymentStatus === 'PAID' ? (
                     <div className={styles.paidInfo}>
                        <CheckCircle2 size={14} color="#10b981" />
                        <span className={styles.paidAmount}>{r.paymentAmount} (Ref: {r.paymentRef})</span>
                     </div>
                   ) : (
                     <span className={styles.unpaidBadge}>UNPAID</span>
                   )}
                </td>
                <td style={{ textAlign: 'right' }}>
                   {r.paymentStatus !== 'PAID' ? (
                     <button 
                       onClick={() => handleRecordPayment(r.id)}
                       disabled={updating === r.id}
                       className={styles.payBtn}
                     >
                       {updating === r.id ? <Loader2 size={14} className={styles.spinner} /> : <><DollarSign size={14} /> Record Payment</>}
                     </button>
                   ) : (
                     <div className={styles.completedBadge}><CheckCircle size={14} /> Recorded</div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
