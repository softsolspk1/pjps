"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Search, FileText, CheckCircle, Clock, 
  AlertCircle, Loader2, ShieldCheck, 
  Info, ChevronRight, Globe,
  Layers, MessageSquare, RotateCcw
} from "lucide-react";
import RoleLayout from "@/components/RoleLayout";
import HeaderWrapper from "@/components/HeaderWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import styles from "./Tracking.module.css";

const STEPS = [
  { id: 'SUBMITTED', label: 'Scholarly Submission', desc: 'Initial registration in the editorial registry.' },
  { id: 'SCREENING', label: 'Technical Screening', desc: 'Editorial verification of scholarly criteria.' },
  { id: 'UNDER_REVIEW', label: 'Peer Evaluation', desc: 'Expert scholarly assessment by referees.' },
  { id: 'REVISION', label: 'Editorial Revision', desc: 'Author responding to scholarly feedback.' },
  { id: 'ACCEPTED', label: 'Final Acceptance', desc: 'Formal approval for institutional publication.' },
  { id: 'PUBLISHED', label: 'Published Archive', desc: 'Live in the digital scholarly archive.' }
];

export default function TrackingPage() {
  const { data: session } = useSession();
  const [refId, setRefId] = useState("");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setRefId(id);
      performSearch(id);
    }
  }, []);

  const performSearch = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setArticle(null);

    try {
      const res = await fetch(`/api/tracking?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reference ID not found.");
      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;
    performSearch(refId);
  };

  const getStatusIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    if (status === 'IN_REVIEW' || status === 'UNDER_REVIEW') return 2;
    if (status === 'MAJOR_REVISION' || status === 'MINOR_REVISION' || status === 'REVISION') return 3;
    return STEPS.findIndex(s => s.id === status);
  };

  const TrackingContent = (
    <div className={styles.container}>
      
      {/* Platinum Hero Banner */}
      <div className={styles.hero}>
         <div className={styles.heroGlow} />
         <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
               <ShieldCheck size={14} /> Peer-Review Integrity Verified
            </div>
            <h1 className={styles.heroTitle}>Manuscript Lifecycle Analysis</h1>
            <p className={styles.heroDesc}>
               Monitor the real-time editorial progress of your scholarly contribution. Access institutional metadata and current phase evaluation analysis.
            </p>
            
            <form onSubmit={handleSearch} className={styles.searchForm}>
               <div className={styles.inputWrapper}>
                  <Search size={20} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Enter Reference ID (e.g. clm7c...)" 
                    className={styles.input}
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                  />
               </div>
               <button type="submit" disabled={loading} className={styles.searchBtn}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Query Registry"}
               </button>
            </form>
         </div>
      </div>

      {error && (
         <div className="flex items-center gap-4 p-8 bg-red-50 border border-red-100 rounded-[2rem] animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={28} className="text-red-600" />
            <div className="text-red-900 font-black text-[11px] uppercase tracking-widest leading-relaxed">
               Inquiry Failure: {error}. Please verify your institutional reference token.
            </div>
         </div>
      )}

      {article ? (
        <div className={styles.resultSection}>
           {/* Article Insight Card */}
           <div className={styles.articleInsight}>
              <div className={styles.insightHeader}>
                 <div className={styles.articleInfo}>
                    <div className={styles.idBadge}>ID: {article.id.slice(0, 12).toUpperCase()}</div>
                    <h2 className={styles.articleTitle}>{article.title}</h2>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Authenticated Entry Date</div>
                    <div className="text-sm font-black text-slate-900">{new Date(article.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                 </div>
              </div>
              
              <div className={styles.metaGrid}>
                 {[
                   { label: 'Evaluation Protocol', value: `${article.reviewType || 'Blind'} Peer Review`, icon: ShieldCheck },
                   { label: 'Editorial Authority', value: 'PJPS Research Council', icon: Info },
                   { label: 'Legacy Status', value: article.status.replace(/_/g, ' '), icon: FileText }
                 ].map((stat, i) => (
                   <div key={i} className={styles.metaCard}>
                      <div className={styles.metaHeader}>
                         <stat.icon size={16} className={styles.metaIcon} />
                         <span className={styles.metaLabel}>{stat.label}</span>
                      </div>
                      <p className={styles.metaValue}>{stat.value}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Dynamic Timeline Analysis */}
           <div className={styles.timelineCard}>
              <div className={styles.timelineTitle}>
                 Lifecycle Progression Analysis
                 <div className={styles.liveBadge}>
                    <Clock size={16} className="animate-pulse" /> Real-time Synchronized
                 </div>
              </div>

              <div className={styles.timelineGrid}>
                 {STEPS.map((step, idx) => {
                    const currentIdx = getStatusIndex(article.status);
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div 
                        key={step.id} 
                        className={`${styles.stepCard} ${isActive ? styles.stepActive : ""} ${isCompleted ? styles.stepCompleted : ""}`}
                      >
                         <div className={styles.stepIcon}>
                            {isCompleted ? <CheckCircle size={28} /> : <span className="text-xl font-black">{idx + 1}</span>}
                         </div>
                         <h4 className={styles.stepTitle}>{step.label}</h4>
                         <p className={styles.stepDesc}>{step.desc}</p>
                      </div>
                    );
                 })}
              </div>
           </div>

           {/* Review Feedback Registry (Visible once review cycle has started or completed) */}
           {article.reviews && article.reviews.length > 0 && (
              <div className={styles.feedbackSection}>
                 <div className={styles.feedbackHeader}>
                    <h3 className={styles.feedbackTitle}><MessageSquare size={24} color="#0061ff" /> Scholarly Feedback Registry</h3>
                    <div className={styles.feedbackBadge}>Authenticated Peer Reports</div>
                  </div>

                 <div className={styles.reviewGrid}>
                    {article.reviews
                      .filter((r: any) => r.status === 'COMPLETED' || r.commentsToAuthor)
                      .map((review: any, idx: number) => (
                        <div key={review.id} className={styles.reviewCard}>
                           <div className={styles.reviewHead}>
                              <div className={styles.refereeLabel}>Expert Referee #0{idx + 1} Assessment</div>
                              <div className={styles.recLabel}>{review.recommendation}</div>
                           </div>
                           <div className={styles.reviewContent}>
                              "{review.commentsToAuthor || "No specific feedback provided by this referee."}"
                           </div>
                           <div className="mt-6 flex items-center justify-between">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Date Logged: {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                 <ShieldCheck size={12} /> Verified Report
                              </div>
                           </div>
                        </div>
                      ))}
                 </div>

                 <div className={styles.confidentialNotice}>
                    <Info size={20} className="text-blue-500" />
                    <p className={styles.noticeText}>
                       Referees provide these assessments to improve scholarly rigor. These remarks are de-identified to maintain peer-review integrity. Direct correspondence with referees is restricted by institutional protocol.
                    </p>
                 </div>
              </div>
           )}

            {/* Scientific Revision Action Call */}
            {article.status === "REVISION" && (
              <div className={styles.revisionActionBox}>
                 <div style={{ width: '80px', height: '80px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', margin: '0 auto', justifyContent: 'center', color: '#d97706' }}>
                    <RotateCcw size={40} />
                 </div>
                 <h2 className={styles.revisionTitle}>Scientific Revision Required</h2>
                 <p className={styles.revisionDesc}>
                    The editorial board has requested revisions for your manuscript. Please address the referee feedback provided above and submit your revised manuscript (v{article.version + 1}) to proceed.
                 </p>
                 <Link 
                   href={`/submission?parentId=${article.id}&revisionOf=${article.id}&v=${article.version}`}
                   className={styles.revisionBtn}
                 >
                    <FileText size={20} /> Submit Revised Manuscript
                 </Link>
              </div>
            )}
         </div>
      ) : !loading && (
        <div className={styles.emptyState}>
           <div className={styles.emptyIcon}>
              <FileText size={48} />
           </div>
           <p className={styles.emptyText}>
              Input your unique scholarly reference hash above to initiate a real-time monitor of the editorial registry.
           </p>
           
           <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                 <ShieldCheck size={20} />
                 <span className={styles.trustLabel}>Institutional Integrity</span>
              </div>
              <div className={styles.trustBadge}>
                 <Globe size={20} />
                 <span className={styles.trustLabel}>Cope Compliant</span>
              </div>
              <div className={styles.trustBadge}>
                 <Layers size={20} />
                 <span className={styles.trustLabel}>Real-time Tracking</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const isAuthor = (session?.user as any)?.role === 'AUTHOR';

  if (isAuthor) {
    return (
      <RoleLayout role="AUTHOR">
        {TrackingContent}
      </RoleLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <HeaderWrapper />
       <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12" style={{ paddingTop: '100px' }}>
          {TrackingContent}
       </div>
       <FooterWrapper />
    </div>
  );
}

