"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, CheckCircle, XCircle, 
  RotateCcw, AlertCircle, Loader2, 
  ArrowLeft, Download, User, 
  Calendar, MessageSquare, Info,
  TrendingUp, Award, Quote,
  ShieldCheck, Eye, Search,
  ChevronRight, ExternalLink, PlusCircle
} from "lucide-react";
import styles from "./DecisionUpgrade.module.css";

export default function ArticleDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [doi, setDoi] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSendMessage = async () => {
    if (!messageContent.trim() && (!files || files.length === 0)) return;
    setMessaging(true);
    try {
      const formData = new FormData();
      formData.append("message", messageContent);
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      const res = await fetch(`/api/admin/articles/${id}/message`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Manuscript correspondence dispatched to the lead author." });
        setMessageContent("");
        setFiles(null);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to dispatch correspondence.");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);
        if (data.doi) setDoi(data.doi);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  const handleDecision = async (decision: string) => {
    const confirmMsg = decision === "UNDER_REVIEW" 
      ? "Start formal peer review? This will notify the authors."
      : `Are you sure you want to ${decision.toLowerCase()} this manuscript? This will notify the author.`;
      
    if (!confirm(confirmMsg)) return;
    
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, status: decision })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Manuscript successfully moved to ${decision.toLowerCase()} status.` });
        setArticle({ ...article, status: decision });
      } else {
        throw new Error("Failed to record decision in registry.");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDoi = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}/metadata`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "DOI successfully registered in registry." });
        setArticle({ ...article, doi });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to update DOI" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loaderContainer}><Loader2 className={styles.spinner} /></div>;
  if (!article) return <div className={styles.errorState}>Manuscript entry not found in active registry.</div>;

  const averageScore = article.reviews?.length > 0 
    ? (article.reviews.reduce((acc: number, r: any) => acc + (r.originality + r.quality + r.importance + (r.rating || 0)) / 4, 0) / article.reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> Registry View
          </button>
          <div className={styles.titleBadge}>Scholarly Decision Hub</div>
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          <div className={styles.metaItem}><User size={14} /> {article.submitter?.name || "Lead Author"}</div>
          <div className={styles.metaItem}><Calendar size={14} /> Registered {new Date(article.createdAt).toLocaleDateString()}</div>
          <div className={`${styles.statusBadge} ${styles[article.status.toLowerCase()] || styles.screening}`}>
             {article.status.replace('_', ' ')}
          </div>
          {article.version > 1 && (
             <div style={{ background: '#2563eb', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Version {article.version}
             </div>
          )}
        </div>
      </header>

      {message && (
        <div className={styles.messageRow}>
           <div className={`${styles.alert} ${article.status === 'REJECTED' ? styles.reject : styles.accept}`} style={{ padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
             {message.text}
           </div>
        </div>
      )}

      <div className={styles.workspace}>
        {/* Left Side: Manuscript Abstract & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={20} /> Manuscript Abstract
            </div>
            <div className={styles.abstractContent}>
              {article.abstract || "The author has not provided a summary abstract for this entry."}
            </div>
            
            <div className={styles.downloadGrid}>
              {article.media && article.media.length > 0 ? (
                article.media.map((media: any) => (
                  <div key={media.id} className={styles.downloadCard}>
                     <div className={styles.downloadIcon}>
                        <FileText size={24} />
                     </div>
                     <div className={styles.downloadText}>
                        <h4>{media.section?.replace(/_/g, ' ') || 'Associated File'}</h4>
                        <p>Added {new Date(media.createdAt).toLocaleDateString()}</p>
                     </div>
                     <a href={media.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>View</a>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>No supplementary files registered.</div>
              )}
            </div>
          </section>

          <section className={styles.section}>
             <div className={styles.sectionHeader}>
                <Award size={20} /> Academic Integration Metadata
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                   <label style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'block' }}>CrossRef DOI Identifier</label>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        value={doi} 
                        onChange={(e) => setDoi(e.target.value)}
                        placeholder="10.36721/PJPS..."
                        style={{ flex: 1, padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.25rem', outline: 'none', fontWeight: 700 }}
                      />
                      <button onClick={handleUpdateDoi} disabled={submitting} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', cursor: 'pointer' }}>Register</button>
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <a href={`/api/admin/articles/${id}/export?format=xml`} download style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.25rem', textDecoration: 'none', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Export JATS XML</a>
                   <a href={`/api/admin/articles/${id}/export?format=json`} download style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.25rem', textDecoration: 'none', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Export JSON Archive</a>
                </div>
             </div>
          </section>
        </div>

        {/* Right Side: Peer Review Summary & Decision */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div>
            <div className={styles.statsGrid}>
               <div className={styles.statCard}>
                  <div className={styles.statLabel}>Expert Consistency</div>
                  <div className={styles.statValue}>{averageScore}</div>
                  <TrendingUp size={20} className={styles.statIcon} />
               </div>
               <div className={styles.statCard}>
                  <div className={styles.statLabel}>Review Pool</div>
                  <div className={styles.statValue}>{article.reviews?.length || 0}</div>
                  <Award size={20} className={styles.statIcon} />
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 className={styles.sectionHeader} style={{ fontSize: '1.1rem' }}><MessageSquare size={18} /> Review Scorecards</h3>
               <Link 
                 href={`/admin/articles/${id}/assign`}
                 style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '1.25rem', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s' }}
               >
                  Assign Expert
               </Link>
            </div>

            {article.reviews?.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '2rem', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>No expert reviews localized.</div>
            ) : (
              article.reviews.map((review: any) => (
                <div key={review.id} className={styles.reviewItem}>
                   <div className={styles.reviewHeader}>
                      <span className={styles.reviewerName}>Expert Referee MS-#{review.id.slice(-4)}</span>
                      <span className={styles.reviewRec}>{review.recommendation}</span>
                   </div>
                   
                   <div className={styles.scoreBox}>
                      <div className={styles.scoreItem}>
                         <div className={styles.scoreItemLabel}>Orig</div>
                         <div className={styles.scoreItemVal}>{review.originality}</div>
                      </div>
                      <div className={styles.scoreItem}>
                         <div className={styles.scoreItemLabel}>Qual</div>
                         <div className={styles.scoreItemVal}>{review.quality}</div>
                      </div>
                      <div className={styles.scoreItem}>
                         <div className={styles.scoreItemLabel}>Impact</div>
                         <div className={styles.scoreItemVal}>{review.importance}</div>
                      </div>
                      <div className={styles.scoreItem} style={{ background: '#eff6ff' }}>
                         <div className={styles.scoreItemLabel} style={{ color: '#3b82f6' }}>Rating</div>
                         <div className={styles.scoreItemVal} style={{ color: '#2563eb' }}>{review.rating || 0}</div>
                      </div>
                   </div>
                   
                   <div className={`${styles.feedbackPanel} ${styles.confidential}`}>
                      <div className={styles.panelHeader}><ShieldCheck size={14} color="#ef4444" /> Executive Disclosure (Editorial Only)</div>
                      <p className={styles.panelContent}>"{review.commentsToEditor || "No private remarks provided."}"</p>
                   </div>

                   <div className={`${styles.feedbackPanel} ${styles.public}`}>
                      <div className={styles.panelHeader}><MessageSquare size={14} color="#2563eb" /> Public Recommendation (Author)</div>
                      <p className={styles.panelContent}>"{review.commentsToAuthor || review.comments || "No author feedback provided."}"</p>
                   </div>
                </div>
              ))
            )}
          </div>

          <section className={styles.section} style={{ padding: '2.5rem' }}>
             <h3 className={styles.sectionHeader} style={{ fontSize: '1.1rem' }}><MessageSquare size={18} /> Editorial Dispatch</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <textarea 
                  style={{ width: '100%', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.5rem', fontSize: '0.85rem', fontWeight: 700, minHeight: '120px', outline: 'none' }}
                  placeholder="Draft a scholarly communication to the lead author..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={messaging}
                />
                <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '1.5rem', border: '1px solid #dbeafe' }}>
                   <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>Manuscript Attachments</label>
                   <input 
                     type="file" 
                     multiple 
                     onChange={(e) => setFiles(e.target.files)}
                     style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af' }}
                   />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={messaging || (!messageContent.trim() && (!files || files.length === 0))}
                  className={styles.actionBtn}
                  style={{ background: '#0f172a', padding: '1.25rem' }}
                >
                   {messaging ? <Loader2 className="animate-spin" size={16} /> : "Dispatch Correspondence"}
                </button>
             </div>
          </section>

          <section className={styles.section} style={{ padding: '2.5rem' }}>
             <h3 className={styles.sectionHeader} style={{ fontSize: '1.1rem' }}><CheckCircle size={18} /> Workflow Control</h3>
             
             <div className={styles.actionGrid}>
                {article.status === "SCREENING" && (
                   <button 
                     onClick={() => handleDecision("UNDER_REVIEW")}
                     disabled={submitting}
                     className={styles.actionBtn}
                     style={{ background: '#2563eb', marginBottom: '1rem' }}
                   >
                     Initiate Peer Review
                   </button>
                )}

                <button onClick={() => handleDecision("ACCEPTED")} disabled={submitting} className={`${styles.actionBtn} ${styles.accept}`}>Accept Manuscript</button>
                <button onClick={() => handleDecision("REVISION")} disabled={submitting} className={`${styles.actionBtn} ${styles.revision}`}>Request Revision</button>
                <button onClick={() => handleDecision("REJECTED")} disabled={submitting} className={`${styles.actionBtn} ${styles.reject}`}>Reject Manuscript</button>
             </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
