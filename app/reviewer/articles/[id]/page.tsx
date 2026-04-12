"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  FileText, Download, Star, CheckCircle2, 
  AlertCircle, ArrowLeft, MessageSquare, ShieldCheck,
  Award, BookOpen, Clock, Layers, Globe, Loader2
} from "lucide-react";
import styles from "./ReviewerDetail.module.css";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scorecard State
  const [originality, setOriginality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [importance, setImportance] = useState(5);
  const [rating, setRating] = useState(5); 
  
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [commentsToEditor, setCommentsToEditor] = useState("");
  const [recommendation, setRecommendation] = useState("MINOR");

  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);

        const reviewRes = await fetch("/api/reviewer/assignments");
        const reviewData = await reviewRes.json();
        const currentReview = reviewData.reviews?.find((r: any) => r.articleId === id);
        setReview(currentReview);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleResponse = async (response: 'ACCEPTED' | 'DECLINED') => {
    if (!review) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviewer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, response })
      });
      if (res.ok) {
        if (response === 'DECLINED') {
          router.push("/reviewer/dashboard");
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Response error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviewer/submit-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          articleId: id,
          originality, 
          quality, 
          importance,
          rating,
          commentsToAuthor,
          commentsToEditor, 
          recommendation 
        }),
      });

      if (res.ok) {
        router.push("/reviewer/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="#0061ff" />
        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Retrieving Manuscript Data...
        </p>
      </div>
    );
  }

  const manuscriptMedia = article?.media?.find((m: any) => m.section === "MANUSCRIPT");
  const isInvited = review?.status === "PENDING";

  return (
    <div className={styles.container}>
      
      {/* Dynamic Institutional Breadcrumbs */}
      <div className={`${styles.breadcrumbRow} no-print`}>
        <button 
          onClick={() => router.back()} 
          className={styles.backBtn}
        >
          <ArrowLeft size={16} /> 
          Institutional Registry / MS-#{id.slice(-6).toUpperCase()}
        </button>
        <div className={styles.institutionalBadge}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid #e2e8f0', paddingRight: '1.5rem' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Journal Tier</span>
              <span className={styles.badge} style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }}>Q1 PHARMACOLOGY</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#475569' }}>PJ</div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PJPS Core v3.1</span>
           </div>
        </div>
      </div>

      {/* Hero Dossier Header */}
      <section className={styles.hero}>
         <div className={styles.heroContent}>
            <div className={styles.badgeRow}>
               <div className={`${styles.badge} ${styles.badgeNavy}`}>
                  <ShieldCheck size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Referee Mandate
               </div>
               <div className={styles.badge}>
                  Scientific Version v{article?.version || 1}
               </div>
               <div className={`${styles.badge} ${styles.badgeEmerald}`}>
                  Indexed Repository
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <h1 className={styles.articleTitle}>
                  {article?.title}
               </h1>
               <div className={styles.metaRow}>
                  <span>Submission Origin: {article?.origin || 'Pakistan'}</span>
                  <div className={styles.metaDot} />
                  <span>Tracking: {article?.trackingType || 'Regular'}</span>
                  <div className={styles.metaDot} />
                  <span>DOI: {article?.doi || 'PENDING'}</span>
               </div>
            </div>

            <div className={styles.abstractCard}>
               <p className={styles.abstractText}>
                  "{article?.abstract}"
               </p>
            </div>
         </div>

         <div className={styles.actionSidebar}>
            {!isInvited && (
               <div className={styles.dossierCard}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                     <div className={styles.fileIconBox}>
                        <FileText size={32} />
                     </div>
                     <div style={{ textAlign: 'center' }}>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f172a' }}>Manuscript File</h4>
                        <p style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>Reviewer Access Only</p>
                     </div>
                  </div>
                  
                  {article?.media?.map((m: any, index: number) => (
                     <a 
                        key={m.id || index}
                        href={m.secureUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.downloadBtn}
                        style={{ marginBottom: '0.5rem' }}
                     >
                        <Download size={18} /> {m.section?.replace('_', ' ') || 'Document'} {index + 1}
                     </a>
                  ))}

                  <div className={styles.deadlineBox}>
                     <div className={styles.deadlineHeader}>
                        <span>Review Deadline</span>
                        <span style={{ color: '#ef4444' }}>14 Days Remaining</span>
                     </div>
                     <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: '25%' }} />
                     </div>
                  </div>
               </div>
            )}

            {isInvited && (
               <div className={styles.invitationCard}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <h4 style={{ color: '#60a5fa', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inquiry Protocol</h4>
                     <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', fontWeight: 900 }}>Accept Invitation?</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     <button 
                        onClick={() => handleResponse('ACCEPTED')}
                        className={styles.acceptBtn}
                     >
                        <CheckCircle2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Confirm Access
                     </button>
                     <button 
                        onClick={() => handleResponse('DECLINED')}
                        className={styles.declineBtn}
                     >
                        Decline
                     </button>
                  </div>
               </div>
            )}
         </div>
      </section>

      {!isInvited && (
         <div className={styles.mainGrid}>
            {/* Main Scorecard Workflow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
               <form onSubmit={handleSubmit} className={styles.formSection}>
                  {error && (
                    <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <AlertCircle size={24} />
                      <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{error}</span>
                    </div>
                  )}

                  {/* Criteria Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                     <div className={styles.sectionHeader}>
                        <div className={styles.iconBox}>
                           <Award size={28} />
                        </div>
                        <div>
                           <h2 className={styles.sectionTitle}>Evaluation Matrix</h2>
                           <p className={styles.sectionSub}>Quantitative Scholarly Benchmarking</p>
                        </div>
                     </div>

                     <div className={styles.matrixGrid}>
                        {[
                        { label: "Originality", val: originality, set: setOriginality, icon: Star, desc: "Novelty of research contribution" },
                        { label: "Refinement", val: quality, set: setQuality, icon: ShieldCheck, desc: "Technical & methodological rigor" },
                        { label: "Domain Impact", val: importance, set: setImportance, icon: Globe, desc: "Influence on pharmaceutical science" },
                        { label: "Expert Rating", val: rating, set: setRating, icon: Layers, desc: "Consolidated scientific assessment" },
                        ].map((s) => (
                        <div key={s.label} className={styles.scoreItem}>
                           <div className={styles.scoreHeader}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                 <span className={styles.scoreLabel}>
                                    <s.icon size={14} /> {s.label}
                                 </span>
                                 <span className={styles.scoreDesc}>{s.desc}</span>
                              </div>
                              <span className={styles.scoreVal}>{s.val}</span>
                           </div>
                           <div className={styles.ratingRow}>
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                 key={num}
                                 type="button"
                                 onClick={() => s.set(num)}
                                 className={`${styles.rateBtn} ${s.val === num ? styles.rateBtnActive : ''}`}
                              >
                                 {num}
                              </button>
                           ))}
                           </div>
                        </div>
                        ))}
                     </div>
                  </div>

                  {/* Discursive Feedback Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                     <div className={styles.sectionHeader}>
                        <div className={`${styles.iconBox}`} style={{ background: '#2563eb' }}>
                           <MessageSquare size={28} />
                        </div>
                        <div>
                           <h2 className={styles.sectionTitle}>Qualitative Registry</h2>
                           <p className={styles.sectionSub}>Refined Discursive Feedback Loop</p>
                        </div>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className={styles.textareaGroup}>
                           <label className={styles.labelRow}>Official Recommendations (Authors)</label>
                           <textarea 
                              required 
                              value={commentsToAuthor} 
                              onChange={(e) => setCommentsToAuthor(e.target.value)}
                              className={styles.feedbackTextarea}
                              placeholder="Draft rigorous, constructive critique for the authors..."
                           />
                        </div>

                        <div className={styles.textareaGroup}>
                           <label className={styles.labelRow} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <ShieldCheck size={14} style={{ color: '#ef4444' }} /> Executive Disclosure (Editorial)
                           </label>
                           <textarea 
                              value={commentsToEditor} 
                              onChange={(e) => setCommentsToEditor(e.target.value)}
                              className={`${styles.feedbackTextarea} ${styles.confidentialTextarea}`}
                              placeholder="Sensitive remarks for the Editorial Board..."
                           />
                           <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'right', padding: '0 1rem' }}>Confidentiality Protocol Active</p>
                        </div>
                     </div>
                  </div>

                  {/* Outcome Decision Section */}
                  <div style={{ paddingTop: '2.5rem', borderTop: '2px solid #f8fafc' }}>
                     <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Institutional Recommendation</h4>
                     </div>
                     <div className={styles.recommendationGrid}>
                        {[
                          { id: "ACCEPT", label: "Accept", active: styles.activeAccept },
                          { id: "MINOR", label: "Minor Revision", active: styles.activeMinor },
                          { id: "MAJOR", label: "Major Revision", active: styles.activeMajor },
                          { id: "REJECT", label: "Reject", active: styles.activeReject },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRecommendation(r.id)}
                            className={`${styles.choiceBtn} ${recommendation === r.id ? `${styles.choiceActive} ${r.active}` : ''}`}
                          >
                            {r.label}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className={styles.submitContainer}>
                     <button 
                       type="submit" 
                       disabled={submitting}
                       className={styles.finalizeBtn}
                     >
                        {submitting ? (
                           <><Loader2 className="animate-spin" size={20} /> Registry Sync</>
                        ) : (
                           <><CheckCircle2 size={24} style={{ color: '#60a5fa' }} /> Finalize Official Dossier</>
                        )}
                     </button>
                     <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>By finalizing, you verify this peer assessment fulfills PJPS Standards.</p>
                  </div>
               </form>
            </div>

            {/* Institutional Sidebar */}
            <div className={styles.sideContainer}>
               <div className={styles.rubricCard}>
                  <div className={styles.rubricTitleRow}>
                     <ShieldCheck size={20} /> Scoring Rubric
                  </div>
                  
                  <div className={styles.rubricList}>
                     {[
                        { title: "Score 9-10 (Exceptional)", desc: "Groundbreaking research with zero technical flaws and immediate impact.", class: styles.rubricGreen },
                        { title: "Score 7-8 (Strong)", desc: "Relevant, high-quality work with minor methodological polish required.", class: styles.rubricBlue },
                        { title: "Score 5-6 (Average)", desc: "Standard academic contribution. Requires significant revisions to satisfy PJPS.", class: styles.rubricAmber },
                        { title: "Score 1-4 (Insufficient)", desc: "Limited scholarly novelty or fundamental procedural failures.", class: styles.rubricRed }
                     ].map((item, i) => (
                        <div key={i} className={`${styles.rubricItem} ${item.class}`}>
                           <h5 className={styles.rubricItemTitle}>{item.title}</h5>
                           <p className={styles.rubricItemDesc}>{item.desc}</p>
                        </div>
                     ))}
                  </div>

                  <div style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <h6 style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PJPS Recognition</h6>
                     <p style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Your Expertise Coefficient</p>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', marginLeft: '5px' }}>
                           {[1, 2, 3].map(i => <div key={i} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#dbeafe', border: '2px solid white', marginLeft: '-5px' }} />)}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>+120 Points</span>
                     </div>
                  </div>
               </div>

               <div className={styles.ethicsCard}>
                  <div className={styles.ethicsTitle}>
                     <BookOpen size={20} style={{ color: '#2563eb' }} /> Referee Ethics
                  </div>
                  <p className={styles.ethicsText}>
                     Every evaluation is double-blinded. You must not attempt to de-anonymize the authors. If you suspect a conflict of interest, please utilize the confidential editorial disclosure field.
                  </p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
