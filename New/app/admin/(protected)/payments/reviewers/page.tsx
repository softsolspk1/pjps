"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, CheckCircle, Search, 
  DollarSign, User, FileText, 
  ArrowRight, Loader2, Award,
  CheckCircle2, Clock, X, Upload,
  ExternalLink, Camera, Sparkles, AlertCircle
} from "lucide-react";
import styles from "./ReviewerPayments.module.css";

import { useSession } from "next-auth/react";

export default function ReviewerPaymentsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [chequeUrl, setChequeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/payments/reviewers");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenModal = (review: any) => {
    setSelectedReview(review);
    setIsModalOpen(true);
    setAmount(review.paymentAmount || "5000"); // Use existing amount if pending
    setReference(review.paymentRef || "");
    setChequeUrl(review.paymentDocUrl || "");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pjps_portal"); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setChequeUrl(data.secure_url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !amount || !reference) return;

    setUpdating(selectedReview.id);
    try {
      const res = await fetch("/api/admin/payments/reviewers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reviewId: selectedReview.id, 
          amount: parseFloat(amount), 
          reference: reference,
          chequeUrl: chequeUrl 
        })
      });

      if (res.ok) {
        const feedbackMsg = userRole === 'FINANCE_ADMIN' 
          ? `Disbursement for ${selectedReview.reviewer.name} submitted for Admin approval.`
          : `Disbursement of ${amount} finalized for ${selectedReview.reviewer.name}.`;
        setSuccess(feedbackMsg);
        setIsModalOpen(false);
        fetchReviews();
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      console.error("Update payment error:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className={styles.loader}><Loader2 className={styles.spinner} size={40} color="#0061ff" /></div>;

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
              <Clock size={16} color="#f59e0b" />
              <span>{unpaidCount} Pending Payments</span>
           </div>
           <div className={styles.statItem}>
              <Award size={16} color="#0061ff" />
              <span>Expert Rewards Ledger</span>
           </div>
        </div>
      </header>

      {success && (
        <div style={{ backgroundColor: '#1a202c', color: 'white', padding: '16px 24px', borderRadius: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '6px solid #10b981', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <Sparkles color="#10b981" size={20} />
          <span style={{ fontSize: '13px', fontWeight: 800 }}>{success}</span>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Expert Participant</th>
              <th>Manuscript Reference</th>
              <th>Review Status</th>
              <th>Disbursement Status</th>
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
                   <span className={`${styles.statusBadge} ${r.status === 'COMPLETED' ? styles.completed : styles.pending}`}>
                      {r.status}
                   </span>
                </td>
                <td>
                   {r.paymentStatus === 'PAID' ? (
                     <div className={styles.paidInfo}>
                        <CheckCircle2 size={14} color="#10b981" />
                        <span className={styles.paidAmount}>{r.paymentAmount} (Ref: {r.paymentRef})</span>
                        {r.paymentDocUrl && (
                          <a href={r.paymentDocUrl} target="_blank" title="View Cheque Artifact"><Camera size={14} color="#0061ff" /></a>
                        )}
                     </div>
                   ) : r.paymentStatus === 'PENDING' ? (
                     <span className={`${styles.statusBadge} ${styles.pendingApproval}`}>
                        PENDING APPROVAL
                     </span>
                   ) : (
                     <span className={styles.unpaidBadge}>UNPAID</span>
                   )}
                </td>
                <td style={{ textAlign: 'right' }}>
                   {r.paymentStatus === 'UNPAID' ? (
                     <button 
                       onClick={() => handleOpenModal(r)}
                       disabled={updating === r.id}
                       className={styles.payBtn}
                     >
                       {updating === r.id ? <Loader2 size={14} className={styles.spinner} /> : <><DollarSign size={14} /> Record Reward</>}
                     </button>
                   ) : r.paymentStatus === 'PENDING' && (userRole === 'ADMIN' || userRole === 'EDITOR_IN_CHIEF') ? (
                     <button 
                       onClick={() => handleOpenModal(r)}
                       disabled={updating === r.id}
                       className={styles.payBtn}
                       style={{ backgroundColor: '#10b981' }}
                     >
                       {updating === r.id ? <Loader2 size={14} className={styles.spinner} /> : <><CheckCircle size={14} /> Approve Disbursement</>}
                     </button>
                   ) : r.paymentStatus === 'PAID' ? (
                     <div className={styles.completedBadge}><CheckCircle size={14} /> Disbursement Finalized</div>
                   ) : r.paymentStatus === 'PENDING' ? (
                     <div className={styles.unpaidBadge} style={{ fontStyle: 'italic' }}>Awaiting Admin Verify</div>
                   ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
           <div className={styles.modal}>
              <div className={styles.modalHeader}>
                 <h3 className={styles.modalTitle}>Record Scholarly Reward</h3>
                 <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmitPayment} className={styles.modalBody}>
                 <div className={styles.formGroup}>
                    <label className={styles.label}>Manuscript Assigned</label>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, color: '#4a5568', border: '1px solid #edf2f7' }}>
                       {selectedReview?.article.title}
                    </div>
                 </div>

                 <div className={styles.formGroup}>
                    <label className={styles.label}>Expert Recipient</label>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#1a202c' }}>{selectedReview?.reviewer.name}</div>
                    <div style={{ fontSize: '11px', color: '#a0aec0', fontWeight: 600 }}>{selectedReview?.reviewer.email}</div>
                 </div>

                 <div className={styles.formGroup}>
                    <label className={styles.label}>Reward Amount (Calculated Institutional Rate)</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className={styles.input}
                    />
                 </div>

                 <div className={styles.formGroup}>
                    <label className={styles.label}>Transaction / Cheque Reference</label>
                    <input 
                      type="text" 
                      value={reference} 
                      onChange={(e) => setReference(e.target.value)}
                      required
                      placeholder="e.g. CHQ-928374 or TXN_88"
                      className={styles.input}
                    />
                 </div>

                 <div className={styles.formGroup}>
                    <label className={styles.label}>Cheque / Disbursement Artifact (Optional)</label>
                    <label className={styles.uploadArea}>
                       <Upload size={24} color={chequeUrl ? "#10b981" : "#0061ff"} style={{ margin: '0 auto 8px' }} />
                       <div style={{ fontSize: '11px', fontWeight: 800, color: chequeUrl ? "#10b981" : "#4a5568" }}>
                          {uploading ? "Uploading to Cloud Registry..." : chequeUrl ? "Artifact Successfully Linked" : "Click to Upload Cheque Image"}
                       </div>
                       <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                    </label>
                 </div>

                 <button type="submit" disabled={updating !== null || uploading} className={styles.submitBtn}>
                    {updating !== null ? <Loader2 className={styles.spinner} size={18} /> : "Finalize Disbursement"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
