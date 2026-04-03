'use client';

import { useState } from 'react';
import { 
  Search, FileText, Clock, CheckCircle, 
  AlertCircle, BookOpen, ChevronRight, Loader2,
  Calendar, Globe, Bookmark, ShieldCheck,
  Activity, ArrowUpRight, Inbox, ClipboardCheck,
  FileSearch, PenTool, Layout
} from 'lucide-react';
import styles from './tracking.module.css';

const STEPS = [
  { 
    id: 'SUBMITTED', 
    label: 'Initial Screening', 
    desc: 'Manuscript is undergoing institutional technical and editorial screening.',
    icon: <Inbox size={18} />
  },
  { 
    id: 'IN_REVIEW', 
    label: 'Peer Review Hub', 
    desc: 'Expert evaluations and scholarly peer-review in active progress.',
    icon: <ClipboardCheck size={18} />
  },
  { 
    id: 'REVISION', 
    label: 'Editorial Revision', 
    desc: 'Author is refining the manuscript based on expert scholarly feedback.',
    icon: <PenTool size={18} />,
    isConditional: true
  },
  { 
    id: 'ACCEPTED', 
    label: 'Scholarly Acceptance', 
    desc: 'Manuscript approved for publication in the upcoming PJPS issue.',
    icon: <ShieldCheck size={18} />
  },
  { 
    id: 'PUBLISHED', 
    label: 'Final Publication', 
    desc: 'Article is live and archived in the global scholarly repository.',
    icon: <Layout size={18} />
  }
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
        throw new Error(data.error || 'Manuscript reference not found in digital registry');
      }

      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    if (status === 'DRAFT') return -0.5;
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="container section-padding max-w-5xl">
      <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-blue-100">
           <Activity size={14} className="animate-pulse" /> Live Tracking Gateway
        </div>
        <h1 className="text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight">Manuscript Registry</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed italic">
          "Ensuring scholarly transparency through real-time editorial lifecycle monitoring."
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Search & Article Info */}
        <div className="lg:col-span-12 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-premium p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5">
               <FileSearch size={160} strokeWidth={1} />
             </div>
             
             <form onSubmit={handleSearch} className="relative z-10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={22} />
                  <input 
                    type="text" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-900"
                    placeholder="Reference ID (e.g., clm7...)"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                  />
                </div>
                <button type="submit" className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>Analyze Status <ArrowUpRight size={18} /></>
                  )}
                </button>
             </form>

             {error && (
               <div className="mt-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-4 animate-in shake-in">
                 <AlertCircle size={24} />
                 <span className="font-bold text-sm tracking-wide uppercase">{error}</span>
               </div>
             )}
          </div>

          {!article && !loading && !error && (
            <div className="text-center py-20 px-10 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem]">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
                 <Bookmark size={40} />
               </div>
               <h3 className="text-xl font-serif font-bold text-slate-400 mb-2">Registry Entry Missing</h3>
               <p className="text-slate-400 font-medium max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">
                 Please provide your unique digital reference ID provided during post-screening cataloging.
               </p>
            </div>
          )}

          {article && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* Manuscript Details */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-premium-sm p-12 animate-in fade-in duration-1000">
                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] block mb-4">Academic Registry Profile</span>
                     <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight mb-8">
                        {article.title}
                     </h2>
                     <div className="flex flex-wrap gap-4 pb-10 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest mb-10">
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl">
                          <Calendar size={14} /> Submitted: {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl">
                          <ShieldCheck size={14} /> {article.reviewType} REVIEW
                        </div>
                        {article.status === 'REJECTED' && (
                           <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl">
                             <AlertCircle size={14} /> Status: REJECTED
                           </div>
                        )}
                     </div>

                     {/* Status Timeline */}
                     {article.status !== 'REJECTED' && (
                        <div className="space-y-12">
                           <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editorial Lifecycle Phases</h3>
                              <div className="h-0.5 flex-1 bg-slate-50 mx-6" />
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">Live Status</span>
                           </div>
                           
                           <div className="space-y-6">
                              {STEPS.map((step, idx) => {
                                const currentIdx = getCurrentStepIndex(article.status);
                                const isCompleted = idx <= currentIdx;
                                const isActive = idx === Math.floor(currentIdx);

                                return (
                                  <div key={step.id} className={`p-8 rounded-[2rem] border transition-all duration-700 flex gap-6 group relative overflow-hidden ${
                                    isActive ? 'bg-blue-600 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] text-white shadow-2xl scale-[1.02] border-blue-500' : 
                                    isCompleted ? 'bg-white border-slate-100 opacity-90 grayscale-[0.5]' :
                                    'bg-slate-50/50 border-slate-50 opacity-40 grayscale'
                                  }`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                                      isCompleted ? 'bg-white text-blue-600 shadow-lg' : 'bg-white text-slate-200'
                                    }`}>
                                      {isCompleted ? <CheckCircle size={24} /> : step.icon}
                                    </div>
                                    <div className="flex-1">
                                       <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                          Phase {idx + 1} {isActive && "• Currently Active"}
                                       </div>
                                       <h4 className="text-xl font-bold tracking-tight mb-2">{step.label}</h4>
                                       <p className={`text-sm font-medium leading-relaxed max-w-md ${isActive ? 'text-blue-50' : 'text-slate-500'}`}>
                                          {step.desc}
                                       </p>
                                    </div>
                                    {isActive && <Activity size={80} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />}
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Sidebar: Publication & Stats */}
               <div className="space-y-8">
                  {(article.status === 'ACCEPTED' || article.status === 'PUBLISHED') && article.issue && (
                     <div className="bg-emerald-600 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <BookOpen size={100} className="absolute -bottom-6 -right-6 text-white/10 group-hover:rotate-12 transition-transform" />
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-10 pb-4 border-b border-white/10">Digital Publication</h3>
                        <div className="space-y-6 relative z-10">
                           <div>
                              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-[0.3em] mb-2">Volume Archive</p>
                              <p className="text-3xl font-serif font-black tracking-tight">Volume {article.issue.volume.number}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-[0.3em] mb-2">Catalog Detail</p>
                              <p className="text-2xl font-serif font-bold">Issue {article.issue.number}</p>
                           </div>
                           <div className="pt-6">
                              <span className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                                 {article.issue.month} {article.issue.volume.year}
                              </span>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl space-y-8">
                     <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Editorial Support</h3>
                     <div className="space-y-6">
                        <div className="flex gap-4">
                           <div className="p-3 bg-white/5 rounded-2xl text-blue-400 h-fit">
                              <Globe size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-bold">International Indexing</p>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Your research will be cataloged in leading scholarly databases.</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="p-3 bg-white/5 rounded-2xl text-emerald-400 h-fit">
                              <ShieldCheck size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-bold">Ethics Compliance</p>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Manuscript adheres to COPE international guidelines.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
