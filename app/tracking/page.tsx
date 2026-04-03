'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'SUBMITTED', label: 'Screening', desc: 'Initial technical and editorial screening.' },
  { id: 'IN_REVIEW', label: 'Peer Review', desc: 'Expert evaluation in progress.' },
  { id: 'REVISION', label: 'Revision', desc: 'Author responded to scholarly feedback.' },
  { id: 'ACCEPTED', label: 'Accepted', desc: 'Manuscript approved for publication.' },
  { id: 'PUBLISHED', label: 'Published', desc: 'Live in journal repository.' }
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
    <div className="flex-1 w-full bg-white font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Dynamic Header Spacer for Fixed Nav */}
      <div className="h-[140px] w-full bg-white" />

      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-12 border-b-2 border-slate-100 pb-8">
           <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             Editorial Portal
           </div>
           <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight mb-2">Manuscript Registry</h1>
           <p className="text-slate-500 font-medium italic text-sm">Real-time lifecycle monitoring and scholarly status analysis.</p>
        </header>

        {/* Global Search Interface */}
        <section className="bg-white border-2 border-slate-100 p-12 rounded-[2rem] shadow-sm mb-12">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-stretch">
               <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Registry Reference ID</label>
                 <input 
                   type="text" 
                   required
                   value={refId} 
                   onChange={(e) => setRefId(e.target.value)}
                   className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-sm tracking-wide"
                   placeholder="e.g. clm7p3a9..."
                 />
               </div>
               <div className="flex flex-col justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:grayscale"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Analyze Status"}
                  </button>
               </div>
            </form>

            {error && (
              <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest animate-in fade-in zoom-in">
                Error Identification: {error}
              </div>
            )}
        </section>

        {!article && !loading && !error && (
          <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center text-center opacity-60">
             <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] leading-loose">
               Provide your scholarly reference ID <br/> to access real-time registry status.
             </p>
          </div>
        )}

        {article && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {/* Registry Identity Overview */}
             <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 mix-blend-multiply flex flex-col items-end">
                   <div className="text-9xl font-black">{article.reviewType?.charAt(0)}</div>
                </div>
                
                <div className="relative z-10">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-3">Registry Profile</span>
                   <h2 className="text-2xl font-serif font-bold text-slate-800 leading-tight max-w-xl">{article.title}</h2>
                   <div className="flex gap-6 mt-6">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         Submitted: <span className="text-slate-600 font-black">{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         Protocol: <span className="text-blue-600 font-black">{article.reviewType} REVIEW</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Dynamic Editorial Timeline */}
             {article.status !== 'REJECTED' && (
                <div className="p-12 bg-white border border-slate-200 rounded-[3rem] shadow-premium-sm relative overflow-hidden">
                   <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12">Lifecycle Lifecycle Monitoring</h3>
                   
                   <div className="space-y-0">
                      {STEPS.map((step, idx) => {
                        const currentIdx = getCurrentStepIndex(article.status);
                        const isCompleted = idx <= currentIdx;
                        const isActive = idx === currentIdx;

                        return (
                          <div key={step.id} className="relative flex gap-10">
                             {/* Connector Line */}
                             {idx !== STEPS.length - 1 && (
                               <div className={`absolute left-[9px] top-[40px] w-0.5 h-full transition-all duration-1000 ${isCompleted ? 'bg-blue-600' : 'bg-slate-100 underline-offset-4'}`} />
                             )}
                             
                             {/* Status Marker */}
                             <div className={`z-10 w-5 h-5 rounded-full mt-2 transition-all duration-1000 border-2 ${
                               isActive ? 'bg-blue-600 border-blue-100 ring-8 ring-blue-50 shadow-lg' : 
                               isCompleted ? 'bg-blue-600 border-blue-600' : 
                               'bg-white border-slate-200'
                             }`} />
                             
                             <div className={`pb-12 transition-all duration-1000 ${isCompleted ? 'opacity-100' : 'opacity-30 blur-[0.5px]'}`}>
                                <h4 className={`text-md font-bold uppercase tracking-widest mb-1 ${isActive ? 'text-blue-700' : 'text-slate-900'}`}>
                                   {step.label} {isActive && "• Live"}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{step.desc}</p>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
             )}

             {article.status === 'REJECTED' && (
                <div className="p-10 border-2 border-red-100 bg-red-50/50 rounded-[2.5rem] flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black mb-6">X</div>
                   <h3 className="text-red-700 font-bold uppercase tracking-widest text-sm mb-2">Registry Decision: Final Rejection</h3>
                   <p className="text-red-500 text-xs font-medium max-w-md italic">This manuscript has been determined to be outside the scoping technical criteria for PJPS in the current editorial cycle.</p>
                </div>
             )}

             {/* Scholarly Archival Metadata */}
             {(article.status === 'ACCEPTED' || article.status === 'PUBLISHED') && article.issue && (
                <div className="p-12 border-2 border-slate-900 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 text-white/5 font-serif font-black text-9xl leading-none">A</div>
                   
                   <div className="relative z-10 text-center md:text-left">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-10 pb-6 border-b border-white/10">Archive & Dissemination Metadata</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                         <MetadataItem label="Volumes Archive" value={`Volume ${article.issue.volume.number}`} />
                         <MetadataItem label="Catalog Target" value={`Issue ${article.issue.number}`} />
                         <MetadataItem label="Digital Release" value={`${article.issue.month} ${article.issue.volume.year}`} />
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

function MetadataItem({ label, value }: any) {
  return (
    <div>
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{label}</div>
      <div className="font-serif font-bold text-3xl tracking-tight text-white">{value}</div>
    </div>
  );
}
