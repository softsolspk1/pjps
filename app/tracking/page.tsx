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
    <div className="container py-20 max-w-4xl font-sans">
      <div className="mb-12 border-b pb-8 border-slate-200">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Manuscript Tracking</h1>
        <p className="text-slate-500 text-sm italic">Ensuring scholarly transparency through editorial monitoring.</p>
      </div>

      <div className="space-y-12">
        {/* Simple Search Field */}
        <section className="bg-white border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text" 
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-md outline-none focus:border-blue-600 transition-all text-sm font-medium"
              placeholder="Enter Reference ID"
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
            />
            <button type="submit" className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-sm transition-all flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>Analyze Status <ArrowUpRight size={16} /></>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-600 text-xs font-bold uppercase tracking-wide">
              {error}
            </div>
          )}
        </section>

        {!article && !loading && !error && (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
               Provide Reference ID to begin tracking.
             </p>
          </div>
        )}

        {article && (
          <div className="space-y-12 animate-in fade-in">
             {/* Article Header Info */}
             <div className="pb-8 border-b border-slate-100">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2 font-sans tracking-[0.2em]">Registry Entry</span>
                <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4">{article.title}</h2>
                <div className="flex gap-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                   <span>Submitted: {new Date(article.createdAt).toLocaleDateString()}</span>
                   <span className="text-blue-500">Mode: {article.reviewType} Review</span>
                </div>
             </div>

             {/* Minimalist Professional Timeline */}
             <div className="space-y-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Editorial Lifecycle</h3>
                <div className="space-y-0">
                   {STEPS.map((step, idx) => {
                     const currentIdx = getCurrentStepIndex(article.status);
                     const isCompleted = idx <= currentIdx;
                     const isActive = idx === currentIdx;

                     return (
                       <div key={step.id} className="relative flex gap-8">
                         {/* Simple Line Connector */}
                         {idx !== STEPS.length - 1 && (
                           <div className={`absolute left-[7px] top-[24px] w-0.5 h-full ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`} />
                         )}
                         
                         {/* Minimal Bullet */}
                         <div className={`z-10 w-4 h-4 rounded-full mt-1.5 transition-colors border-2 ${
                           isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                         }`} />
                         
                         <div className={`pb-8 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                           <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                              {step.label} {isActive && "— Active"}
                           </h4>
                           <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                         </div>
                       </div>
                     );
                   })}
                </div>
             </div>

             {article.status === 'REJECTED' && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-lg">
                   <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Editorial Decision: Rejected</p>
                </div>
             )}

             {/* Publication Info Table Style */}
             {(article.status === 'ACCEPTED' || article.status === 'PUBLISHED') && article.issue && (
                <div className="p-8 border border-slate-200 rounded-xl bg-slate-50">
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Publication Schedule</h3>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase">Volume</span>
                         <p className="font-serif font-bold text-lg">{article.issue.volume.number}</p>
                      </div>
                      <div>
                         <span className="text-[9px] font-black text-slate-400 uppercase">Issue</span>
                         <p className="font-serif font-bold text-lg">{article.issue.number}</p>
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
