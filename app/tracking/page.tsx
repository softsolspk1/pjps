'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RoleLayout from '@/components/RoleLayout';
import { 
  Search, FileText, CheckCircle, Clock, 
  AlertCircle, Loader2, ShieldCheck, 
  Info, ChevronRight, Globe,
  Layers, Radio
} from 'lucide-react';

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
  const [refId, setRefId] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setRefId(id);
      performSearch(id);
    }
  }, []);

  const performSearch = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError('');
    setArticle(null);

    try {
      const res = await fetch(`/api/tracking?id=${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reference ID not found.');
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
    if (status === 'IN_REVIEW') return 2;
    return STEPS.findIndex(s => s.id === status);
  };

  const TrackingContent = (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Platinum Hero Banner */}
      <div className="relative p-12 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl overflow-hidden group border border-white/5">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="px-5 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Live Monitoring Service</div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                   <ShieldCheck size={14} /> Peer-Review Integrity Verified
                </div>
            </div>
            <h1 className="text-5xl font-serif font-black mb-4 tracking-tight leading-tight">Manuscript Lifecycle Analysis</h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl mb-10">
               Monitor the real-time editorial progress of your scholarly contribution. Access institutional metadata and current phase evaluation analysis.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-xl">
               <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus-within:border-blue-500 transition-all">
                  <Search size={20} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Enter Reference ID (e.g. clm7c...)" 
                    className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-white w-full placeholder:text-slate-600"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                  />
               </div>
               <button type="submit" disabled={loading} className="px-10 py-4 bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                  {loading ? 'Consulting Registry...' : 'Query Registry'}
               </button>
            </form>
         </div>
      </div>

      {error && (
         <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-shake">
            <AlertCircle size={24} className="text-red-600" />
            <div className="text-red-900 font-black text-[11px] uppercase tracking-widest">Inquiry Failure: {error}</div>
         </div>
      )}

      {article ? (
        <div className="space-y-12">
           {/* Article Insight Card */}
           <div className="bg-white border border-slate-100 rounded-[3rem] shadow-premium p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 flex flex-col items-end gap-2">
                 <div className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">ID: {article.id.slice(0, 12).toUpperCase()}</div>
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(article.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
              </div>
              
              <div className="max-w-3xl mb-12">
                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">Institutional Registry Profile</span>
                 <h2 className="text-3xl font-serif font-black text-slate-900 leading-tight tracking-tight uppercase">{article.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Evaluation Protocol', value: `${article.reviewType || 'Blind'} Peer Review`, icon: ShieldCheck, color: 'text-blue-600' },
                   { label: 'Submitter Role', value: 'Primary Corresponding Author', icon: Info, color: 'text-slate-400' },
                   { label: 'Editorial Status', value: article.status.replace(/_/g, ' '), icon: FileText, color: 'text-emerald-600' }
                 ].map((stat, i) => (
                   <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-blue-200 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                         <stat.icon size={16} className={stat.color} />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{stat.value}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Dynamic Timeline */}
           <div className="bg-white border border-slate-100 rounded-[3rem] shadow-premium p-12">
              <div className="flex items-center justify-between mb-16 px-4">
                 <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Lifecycle Progression Analysis</h3>
                 <div className="flex items-center gap-3 text-[10px] font-black text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full uppercase tracking-widest">
                    <Clock size={16} /> Real-time Synchronized
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {STEPS.map((step, idx) => {
                    const currentIdx = getStatusIndex(article.status);
                    const isCompleted = idx < currentIdx;
                    const isActive = idx === currentIdx;
                    const isUpcoming = idx > currentIdx;

                    return (
                      <div key={step.id} className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-105 z-10' : 'bg-slate-50 border-slate-100'}`}>
                         <div className="flex items-start justify-between mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isActive ? 'bg-white/20 border-white/20 text-white' : isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                               {isCompleted ? <CheckCircle size={24} /> : <span className="text-lg font-black">{idx + 1}</span>}
                            </div>
                            {isActive && <div className="px-3 py-1 bg-white text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg">Current Phase</div>}
                         </div>
                         <h4 className={`text-base font-black uppercase tracking-tight mb-2 ${isActive ? 'text-white' : 'text-slate-900'}`}>{step.label}</h4>
                         <p className={`text-xs font-medium leading-relaxed ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{step.desc}</p>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      ) : !loading && (
        <div className="py-20 text-center">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-200">
              <FileText size={48} />
           </div>
           <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md mx-auto italic">
              Input your unique scholarly reference hash to initiate a real-time monitor of the editorial registry.
           </p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="pt-10 flex flex-wrap justify-center items-center gap-12 text-slate-300 grayscale opacity-40">
         <div className="flex items-center gap-3">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Integrity</span>
         </div>
         <div className="flex items-center gap-3">
            <Globe size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cope Compliant</span>
         </div>
         <div className="flex items-center gap-3">
            <Layers size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Tracking</span>
         </div>
      </div>
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
    <div className="min-h-screen bg-slate-50">
       {TrackingContent}
    </div>
  );
}
