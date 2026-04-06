'use client';

import { useState } from 'react';
import styles from './TrackingPage.module.css';
import { Search, FileText, CheckCircle, Clock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Info } from 'lucide-react';

const STEPS = [
  { id: 'SUBMITTED', label: 'Scholarly Submission', desc: 'Initial registration in the editorial registry.' },
  { id: 'SCREENING', label: 'Technical Screening', desc: 'Editorial verification of scholarly criteria.' },
  { id: 'UNDER_REVIEW', label: 'Peer Evaluation', desc: 'Expert scholarly assessment by referees.' },
  { id: 'REVISION', label: 'Editorial Revision', desc: 'Author responding to scholarly feedback.' },
  { id: 'ACCEPTED', label: 'Final Acceptance', desc: 'Formal approval for institutional publication.' },
  { id: 'PUBLISHED', label: 'Published Archive', desc: 'Live in the digital scholarly archive.' }
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
        throw new Error(data.error || 'Reference ID not found in scholarly registry.');
      }

      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    if (status === 'IN_REVIEW') return 2; // Mapping legacy status
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
         <div className={styles.badge}>Live Editorial Registry</div>
         <h1 className={styles.title}>Manuscript Monitoring</h1>
         <p className={styles.subtitle}>Tracking scholarly research through the PJPS editorial lifecycle.</p>
      </header>

      <section className={styles.searchSection}>
         <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputGroup}>
               <label className={styles.inputLabel}>Manuscript Reference Identifier</label>
               <div className="relative flex items-center">
                  <Search size={20} className="absolute left-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    className={styles.input}
                    style={{ paddingLeft: '50px' }}
                    placeholder="Enter your tracking hash (e.g. clm7c...)"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                  />
               </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Verifying...</div>
              ) : (
                "Query Registry"
              )}
            </button>
         </form>

         {error && (
           <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <AlertCircle size={20} />
              <div className="text-[11px] font-black uppercase tracking-widest">Search Failure: {error}</div>
           </div>
         )}
      </section>

      {!article && !loading && !error && (
        <div className={styles.emptyState}>
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FileText size={32} />
           </div>
           <p className={styles.emptyText}>
             Provide your scholarly reference identifier <br/> to monitor the editorial progress of your গবেষণা.
           </p>
        </div>
      )}

      {article && (
        <div className={styles.resultContainer}>
           <div className={styles.articleCard}>
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <span className={styles.articleBadge}>Institutional Registry Profile</span>
                    <h2 className={styles.articleTitle}>{article.title}</h2>
                 </div>
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    ID: {article.id.slice(0, 10)}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                    <span className={styles.metaLabel}><Clock size={12} /> Date Logged</span>
                    <p className={styles.metaValue}>{new Date(article.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                    <span className={styles.metaLabel}><Info size={12} /> Evaluation Type</span>
                    <p className={styles.metaValue}>{article.reviewType || 'Blind'} Peer Review</p>
                 </div>
                 <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                    <span className={styles.metaLabel}><ShieldCheck size={12} /> Editorial Status</span>
                    <p className={styles.metaValue} style={{ color: '#0061ff' }}>{article.status.replace('_', ' ')}</p>
                 </div>
              </div>
           </div>

           <div className={styles.timelineSection}>
              <div className="flex items-center justify-between mb-12">
                 <h3 className={styles.timelineHeading}>Editorial Lifecycle Analysis</h3>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <Clock size={14} /> Real-time Monitoring Active
                 </div>
              </div>
              
              <div className={styles.timeline}>
                 {STEPS.map((step, idx) => {
                   const currentIdx = getStatusIndex(article.status);
                   const isCompleted = idx < currentIdx;
                   const isActive = idx === currentIdx;
                   const isUpcoming = idx > currentIdx;

                   return (
                     <div key={step.id} className={styles.step}>
                        {idx !== STEPS.length - 1 && (
                          <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineActive : ''}`} />
                        )}
                        <div className={`
                          ${styles.bullet} 
                          ${isCompleted ? styles.bulletActive : ''} 
                          ${isActive ? 'bg-blue-600 border-blue-600 scale-125 !shadow-[0_0_0_6px_rgba(0,97,255,0.15)]' : ''}
                          ${isUpcoming ? 'opacity-20' : ''}
                        `}>
                           {isCompleted && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <div className={`${styles.stepContent} ${isUpcoming ? 'opacity-30' : ''}`}>
                           <h4 className={styles.stepLabel} style={isActive ? { color: '#0061ff', fontWeight: 900 } : {}}>
                              {step.label}
                              {isActive && <span className="ml-3 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Current Phase</span>}
                           </h4>
                           <p className={styles.stepDesc}>{step.desc}</p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {article.status === 'REJECTED' && (
              <div className="mt-12 p-10 bg-red-50 border border-red-100 rounded-[32px] text-center">
                 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                 </div>
                 <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-3">Registry Final Decision: Declined</h3>
                 <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">This manuscript has been determined to be outside the scoping technical criteria for the <strong>Pakistan Journal of Pharmaceutical Sciences</strong> following formal editorial review.</p>
              </div>
           )}
           
           <div className="mt-16 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Official PJPS Scholarly Portal</p>
              <div className="flex items-center justify-center gap-6">
                 <ShieldCheck size={20} className="text-slate-200" />
                 <Info size={20} className="text-slate-200" />
                 <FileText size={20} className="text-slate-200" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
