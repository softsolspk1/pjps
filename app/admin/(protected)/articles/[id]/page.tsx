"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, CheckCircle, XCircle, 
  RotateCcw, AlertCircle, Loader2, 
  ArrowLeft, Download, User, 
  Calendar, MessageSquare, Info,
  TrendingUp, Award, Quote
} from "lucide-react";
import styles from "./Decision.module.css";

export default function ArticleDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  const handleDecision = async (decision: string) => {
    if (!confirm(`Are you sure you want to ${decision.toLowerCase()} this manuscript? This will notify the author.`)) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, status: decision })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Manuscript successfully ${decision.toLowerCase()}ed.` });
        setArticle({ ...article, status: decision });
      } else {
        throw new Error("Failed to record decision");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loaderContainer}><Loader2 className={styles.spinner} /></div>;
  if (!article) return <div className={styles.errorState}>Manuscript entry not found in active registry.</div>;

  const averageScore = article.reviews?.length > 0 
    ? (article.reviews.reduce((acc: number, r: any) => acc + (r.originality + r.quality + r.importance) / 3, 0) / article.reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={16} /> Registry View
        </button>
        <div className={styles.headerContent}>
          <div className={styles.titleBadge}>Scholarly Decision Hub</div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            <div className={styles.metaItem}><User size={14} /> {article.authors?.[0]?.name || "Lead Author"}</div>
            <div className={styles.metaItem}><Calendar size={14} /> Registered {new Date(article.createdAt).toLocaleDateString()}</div>
            <div className={`${styles.statusBadge} ${styles[article.status.toLowerCase()]}`}>{article.status}</div>
          </div>
        </div>
      </header>

      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className={styles.workspace}>
        {/* Left Side: Manuscript Abstract & Content */}
        <section className={styles.manuscriptSection}>
          <div className={styles.sectionHeader}>
            <FileText size={20} /> Manuscript Abstract
          </div>
          <div className={styles.abstractContent}>
            {article.abstract || "The author has not provided a summary abstract for this entry."}
          </div>
          
          <div className={styles.downloadCard}>
             <div className={styles.downloadIcon}><Download size={24} /></div>
             <div className={styles.downloadText}>
                <h4>Full Text Access</h4>
                <p>Scholarly PDF Manuscript</p>
             </div>
             <a href={article.media?.find((m: any) => m.type === 'DOC')?.url} target="_blank" className={styles.downloadBtn}>Download Registry File</a>
          </div>
        </section>

        {/* Right Side: Peer Review Summary & Decision */}
        <aside className={styles.decisionSection}>
          <div className={styles.statsGrid}>
             <div className={styles.statCard}>
                <div className={styles.statLabel}>Expert Consensus</div>
                <div className={styles.statValue}>{averageScore} / 10</div>
                <TrendingUp size={16} className={styles.statIcon} />
             </div>
             <div className={styles.statCard}>
                <div className={styles.statLabel}>Review Count</div>
                <div className={styles.statValue}>{article.reviews?.length || 0}</div>
                <Award size={16} className={styles.statIcon} />
             </div>
          </div>

          <div className={styles.reviewList}>
             <h3 className={styles.subTitle}><MessageSquare size={18} /> Peer Feedback</h3>
             {article.reviews?.length === 0 ? (
               <div className={styles.emptyReviews}>No expert reviews have been submitted for this stage.</div>
             ) : (
               article.reviews.map((review: any) => (
                 <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                       <span className={styles.reviewerName}>Expert Referee</span>
                       <span className={styles.reviewRec}>{review.recommendation}</span>
                    </div>
                    <p className={styles.reviewComments}>"{review.comments}"</p>
                 </div>
               ))
             )}
          </div>

          <div className={styles.decisionActions}>
             <h3 className={styles.subTitle}><Info size={18} /> Final Decision</h3>
             <div className={styles.actionGrid}>
                <button 
                  onClick={() => handleDecision("ACCEPTED")}
                  disabled={submitting}
                  className={`${styles.actionBtn} ${styles.accept}`}
                >
                  <CheckCircle size={18} /> Accept
                </button>
                <button 
                  onClick={() => handleDecision("REVISION")}
                  disabled={submitting}
                  className={`${styles.actionBtn} ${styles.revision}`}
                >
                  <RotateCcw size={18} /> Revision
                </button>
                <button 
                  onClick={() => handleDecision("REJECTED")}
                  disabled={submitting}
                  className={`${styles.actionBtn} ${styles.reject}`}
                >
                  <XCircle size={18} /> Reject
                </button>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
