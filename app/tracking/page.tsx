'use client';

import { useState } from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';

const STEPS = [
  { id: 'SUBMITTED', label: 'Initial Screening', desc: 'Technical & editorial screening.' },
  { id: 'IN_REVIEW', label: 'Peer Review', desc: 'Expert scholarly evaluations.' },
  { id: 'REVISION', label: 'Revision Phase', desc: 'Author response to feedback.' },
  { id: 'ACCEPTED', label: 'Accepted', desc: 'Approved for publication.' },
  { id: 'PUBLISHED', label: 'Published', desc: 'Live in journal archive.' }
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
        throw new Error(data.error || 'Reference ID not found.');
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
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="container mt-[140px] mb-20 max-w-4xl font-sans">
      <div className="mb-10 border-b pb-6 border-slate-200">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Manuscript Tracking</h1>
        <p className="text-slate-500 text-sm font-medium italic">Ensuring scholarly transparency through editorial monitoring.</p>
      </div>

      <div className="space-y-12">
        {/* Simple Professional Search Field */}
        <section className="bg-white border p-12 rounded-2xl shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-row gap-4 items-center">
            <div className="flex-1">
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 transition-all text-sm font-bold placeholder:text-slate-300"
                placeholder="Enter unique digital reference ID (e.g. clm7...)"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
              />
            </div>
            <button type="submit" className="px-12 py-4 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Status"}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}
        </section>

        {!article && !loading && !error && (
          <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center">
             <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest text-center leading-loose">
               Provide your unique digital reference ID <br/> to begin editorial tracking.
             </p>
          </div>
        )}

        {article && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
             {/* Article Header Info */}
             <div className="pb-8 border-b border-slate-100">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-2">Academic Registry Entry</span>
                <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4">{article.title}</h2>
                <div className="flex gap-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                   <span>Submitted: {new Date(article.createdAt).toLocaleDateString()}</span>
                   <span className="text-blue-500">Mode: {article.reviewType} Review</span>
                </div>
             </div>

             {/* Minimalist Professional Timeline */}
             <div className="space-y-12">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Editorial Lifecycle</h3>
                <div className="space-y-0">
                   {STEPS.map((step, idx) => {
                     const currentIdx = getCurrentStepIndex(article.status);
                     const isCompleted = idx <= currentIdx;
                     const isActive = idx === currentIdx;

                     return (
                       <div key={step.id} className="relative flex gap-10">
                         {/* Simple Line Connector */}
                         {idx !== STEPS.length - 1 && (
                           <div className={`absolute left-[7px] top-[28px] w-0.5 h-full ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`} />
                         )}
                         
                         {/* Minimal Bullet */}
                         <div className={`z-10 w-4 h-4 rounded-full mt-2 transition-colors border-2 shadow-sm ${
                           isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                         }`} />
                         
                         <div className={`pb-12 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                           <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                              {step.label} {isActive && "• Live"}
                           </h4>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{step.desc}</p>
                         </div>
                       </div>
                     );
                   })}
                </div>
             </div>

             {article.status === 'REJECTED' && (
                <div className="p-8 bg-red-50 border border-red-100 rounded-xl">
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Editorial Decision: Rejected</p>
                   <p className="text-xs text-red-500 mt-2">The manuscript does not meet the current scoping criteria for PJPS.</p>
                </div>
             )}

             {/* Publication Info */}
             {(article.status === 'ACCEPTED' || article.status === 'PUBLISHED') && article.issue && (
                <div className="p-10 border border-slate-200 rounded-2xl bg-slate-50">
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Metadata & Archive</h3>
                   <div className="grid grid-cols-2 gap-10">
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Volume</span>
                         <p className="font-serif font-bold text-2xl text-slate-900 mt-1">{article.issue.volume.number}</p>
                      </div>
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issue</span>
                         <p className="font-serif font-bold text-2xl text-slate-900 mt-1">{article.issue.number}</p>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
