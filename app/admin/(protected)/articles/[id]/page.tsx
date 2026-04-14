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
  ChevronRight, ExternalLink, PlusCircle, BookOpen,
  Trash2
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
  const [editors, setEditors] = useState<any[]>([]);
  const [selectedEditorId, setSelectedEditorId] = useState<string>("");
  const [internalRemarks, setInternalRemarks] = useState("");
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

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
        const [res, editorsRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch(`/api/admin/reviewers`)
        ]);
        const data = await res.json();
        const edData = await editorsRes.json();
        
        setArticle(data);
        if (data.doi) setDoi(data.doi);
        if (data.editorialRemarks) setInternalRemarks(data.editorialRemarks);
        
        if (data.status === 'SCREENING') setActiveStep(1);
        else setActiveStep(2);

        if (Array.isArray(edData)) {
           setEditors(edData.filter(u => u.role === 'EDITOR' || u.role === 'EDITOR_IN_CHIEF' || u.role === 'ASSOCIATE_EDITOR'));
        }
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

  const handleAssignEditor = async () => {
    if (!selectedEditorId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/assign-editor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, editorId: selectedEditorId })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: "Internal editor successfully assigned for peer review." });
        setArticle(data.article);
      } else {
        throw new Error("Failed to assign editor.");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRemarks = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}/remarks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: internalRemarks })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Internal peer review remarks successfully archived." });
        setArticle({ ...article, editorialRemarks: internalRemarks });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteManuscript = async () => {
    if (!confirm("Are you absolutely sure you want to PERMANENTLY purge this manuscript and all its associated data (reviews, media, etc.)? This cannot be undone.")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Manuscript purged successfully. Returning to registry...");
        router.push("/admin/articles");
      } else {
        alert("Failed to purge scholarly record.");
      }
    } catch (err) {
      alert("Network error occurred.");
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
          {article.assignedEditor && (
             <div className={styles.metaItem}><User size={14} /> Internal Editor: {article.assignedEditor?.name}</div>
          )}
          <div className={`${styles.statusBadge} ${styles[article.status.toLowerCase()] || styles.screening}`}>
             {article.status === 'SCREENING' ? 'INTERNAL PEER REVIEW' : 
              article.status === 'UNDER_REVIEW' ? 'SUBJECT EXPERT REVIEW' : 
              article.status.replace('_', ' ')}
          </div>
          <div style={{ padding: '0.4rem 1rem', background: '#f1f5f9', borderRadius: '2rem', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#475569' }}>
            TRACK: {article.submissionTrack || article.submissionType || 'REGULAR'}
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

          {/* Formatted Article View (New) */}
          <section className={styles.section} style={{ padding: '3rem', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
             <div className={styles.sectionHeader} style={{ marginBottom: '2rem' }}>
                <BookOpen size={24} className="text-blue-600" /> Formatted Manuscript Preview
             </div>
             
             <div style={{ fontFamily: "'Times New Roman', serif", color: 'black', padding: '2rem', border: '1px solid #f1f5f9', borderRadius: '1rem' }}>
                <p style={{ fontSize: '0.7rem', textAlign: 'right', marginBottom: '1rem' }}>{article.doi || 'doi.org/10.36721/PJPS...'}</p>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.2 }}>{article.title}</h1>
                
                <div style={{ marginBottom: '1.5rem' }}>
                   <p style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {article.authors?.map((a: any, i: number) => (
                        <span key={i}>{a.name}<sup>{i+1}</sup>{i < article.authors.length - 1 ? ', ' : ''}</span>
                      ))}
                   </p>
                   {article.authors?.map((a: any, i: number) => (
                      <p key={i} style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#4b5563' }}><sup>{i+1}</sup> {a.address}</p>
                   ))}
                </div>

                <div style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>
                   <p style={{ fontSize: '0.9rem' }}><strong>Abstract: </strong>{article.abstract}</p>
                </div>

                <div style={{ fontSize: '0.8rem', borderTop: '1px solid #000', paddingTop: '1rem' }}>
                   <p><strong>Keywords:</strong> {article.keywords || '---'}</p>
                   <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>Submitted: {new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
             </div>

             <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => window.open(`/api/admin/articles/${id}/export?format=pdf`, '_blank')}
                  className={styles.downloadBtn} 
                  style={{ background: '#0f172a', color: 'white', width: 'auto', padding: '0 2rem' }}
                >
                   <Download size={16} /> Online View (PDF)
                </button>
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
               <h3 className={styles.sectionHeader} style={{ fontSize: '1.1rem' }}>
                  {article.status === 'SCREENING' ? <Eye size={18} /> : <MessageSquare size={18} />} 
                  {article.status === 'SCREENING' ? ' Step 1: Internal Peer Review' : ' Step 2: Subject Expert Review'}
               </h3>
               <Link 
                 href={`/admin/articles/${id}/assign`}
                 style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '1.25rem', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', textDecoration: 'none', transition: '0.3s' }}
               >
                  {article.status === 'SCREENING' ? 'Peer Review - Assign Editor' : 'Subject Expert - Assign Reviewer'}
               </Link>
            </div>

            {article.status === 'SCREENING' ? (
               <div className={styles.reviewItem} style={{ borderLeft: '4px solid #2563eb', padding: '2rem' }}>
                  <div className={styles.reviewHeader}>
                     <span className={styles.reviewerName}>Internal Editorial Evaluation</span>
                     {article.assignedEditor && <span className={styles.reviewRec}>{article.assignedEditor.name}</span>}
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                     <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'block' }}>Journal Internal Remarks</label>
                     <textarea 
                        className={styles.abstractContent}
                        style={{ width: '100%', minHeight: '150px', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1rem', fontSize: '0.85rem', color: '#1e293b' }}
                        placeholder="Enter internal peer review findings, scientific merit check, and editorial recommendations..."
                        value={internalRemarks}
                        onChange={(e) => setInternalRemarks(e.target.value)}
                     />
                     <button 
                        onClick={handleSaveRemarks}
                        disabled={submitting}
                        className={styles.actionBtn}
                        style={{ marginTop: '1rem', background: '#0f172a', width: 'auto', padding: '0.75rem 2rem' }}
                     >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Save Internal Remarks'}
                     </button>
                  </div>
               </div>
            ) : (
              article.reviews?.length === 0 ? (
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
              )
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
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                       <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Internal Peer Review</label>
                       {article.editorId ? (
                          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            <CheckCircle size={16} className="inline mr-2 text-emerald-500" />
                            Assigned Editor: <span style={{ color: '#0f172a' }}>{article.assignedEditor?.name}</span>
                          </div>
                       ) : (
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #cbd5e1' }}>
                             <select 
                               value={selectedEditorId} 
                               onChange={(e) => setSelectedEditorId(e.target.value)}
                               style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.75rem', fontWeight: 'bold', color: '#334155' }}
                             >
                               <option value="">Select Internal Editor...</option>
                               {editors.map((ed: any) => <option key={ed.id} value={ed.id}>{ed.name}</option>)}
                             </select>
                             <button 
                               onClick={handleAssignEditor} 
                               disabled={submitting || !selectedEditorId}
                               style={{ background: '#0f172a', color: 'white', padding: '0 1.5rem', borderRadius: '0.75rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}
                             >
                               Assign
                             </button>
                          </div>
                       )}
                       <button 
                         onClick={() => handleDecision("UNDER_REVIEW")}
                         disabled={submitting}
                         className={styles.actionBtn}
                         style={{ background: '#2563eb', opacity: article.editorId ? 1 : 0.5, width: '100%' }}
                       >
                         {article.editorId ? 'Approve & Initiate Subject Expert Review' : 'Initiate Subject Expert Review (Overrule)'}
                       </button>
                    </div>
                 )}

                 <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Change Article Track</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {['REGULAR', 'FAST', 'ULTRAFAST'].map(track => (
                          <button 
                             key={track}
                             disabled={submitting}
                             onClick={async () => {
                                setSubmitting(true);
                                try {
                                   const res = await fetch(`/api/admin/articles/${id}/metadata`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ submissionTrack: track })
                                   });
                                   if (res.ok) {
                                      setArticle({ ...article, submissionTrack: track });
                                      setMessage({ type: 'success', text: `Track updated to ${track}.` });
                                   }
                                } finally { setSubmitting(false); }
                             }}
                             style={{ 
                                flex: 1, 
                                padding: '0.5rem', 
                                fontSize: '0.6rem', 
                                fontWeight: 800, 
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                background: (article.submissionTrack || article.submissionType) === track ? '#0f172a' : 'white',
                                color: (article.submissionTrack || article.submissionType) === track ? 'white' : '#475569',
                                cursor: 'pointer'
                             }}
                          >
                             {track}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button onClick={() => handleDecision("ACCEPTED")} disabled={submitting} className={`${styles.actionBtn} ${styles.accept}`}>Accept Manuscript</button>
                 <button onClick={() => handleDecision("REVISION")} disabled={submitting} className={`${styles.actionBtn} ${styles.revision}`}>Request Revision</button>
                 <button onClick={() => handleDecision("REJECTED")} disabled={submitting} className={`${styles.actionBtn} ${styles.reject}`}>Reject Manuscript</button>
                 
                 <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #edf2f7' }}>
                    <button 
                       onClick={handleDeleteManuscript} 
                       disabled={submitting} 
                       className={styles.actionBtn} 
                       style={{ background: 'white', color: '#ef4444', border: '1px solid #fee2e2', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                       <Trash2 size={16} /> Purge Scholarly Record
                    </button>
                 </div>
              </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
