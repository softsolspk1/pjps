"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  Search, Filter, BookOpen, Layers,
  Calendar, CheckCircle, AlertCircle, PlusCircle,
  ShieldCheck, Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function AuthorSubmissionsPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/articles/my");
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
     if (status === 'PUBLISHED') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
     if (status === 'SCREENING' || status === 'UNDER_REVIEW') return 'text-amber-600 bg-amber-50 border-amber-200';
     if (status === 'REVISIONS_REQUIRED' || status === 'MAJOR_REVISION' || status === 'MINOR_REVISION') return 'text-blue-600 bg-blue-50 border-blue-200';
     if (status === 'REJECTED') return 'text-red-600 bg-red-50 border-red-200';
     return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Manuscript Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">My Submissions</h1>
          <p className="text-slate-500 font-medium text-sm">Manage and track your research portfolio registered within the PJPS portal.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
             <Search size={16} className="text-slate-400" />
             <input type="text" placeholder="Search my research..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-48" />
           </div>
           <Link 
              href="/submission"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2 active:scale-95"
           >
              <PlusCircle size={14} /> New Submission
           </Link>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-50 overflow-x-auto">
          {articles.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <FileText size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Registry Empty</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                You haven't submitted any manuscripts to the PJPS portal yet.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuscript ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Title</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Logged</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="text-xs font-black text-slate-900 font-mono">#{art.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-xs mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{art.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Awaiting Publication'}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] border ${getStatusColor(art.status)}`}>
                        {art.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-slate-600">{format(new Date(art.createdAt), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/tracking?id=${art.id}`}
                        className="inline-flex items-center gap-2 p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95"
                      >
                         <Search size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                    <ShieldCheck size={24} />
                 </div>
                 <h3 className="text-2xl font-serif font-black tracking-tight">Scholarly Protection</h3>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-10">
                 The PJPS portal ensures the highest standards of manuscript security and plagiarism verification. All submissions undergo initial screening before entering the formal peer review sequence.
              </p>
              <div className="flex gap-4">
                 <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">Platinum Access</div>
                 <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Institutional Workspace</div>
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
           <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium flex items-center gap-6">
             <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex-shrink-0">
               <CheckCircle2 size={32} />
             </div>
             <div>
               <h4 className="text-lg font-serif font-black text-slate-900 tracking-tight">Verified Publication</h4>
               <p className="text-slate-500 text-sm font-medium">Once accepted, your research will be indexed and assigned an official DOI for global accessibility.</p>
             </div>
           </div>
           <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium flex items-center gap-6">
             <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] flex-shrink-0">
               <Layers size={32} />
             </div>
             <div>
               <h4 className="text-lg font-serif font-black text-slate-900 tracking-tight">Live Peer Tracking</h4>
               <p className="text-slate-500 text-sm font-medium">Monitor every lifecycle stage of your manuscript in real-time within the editorial workspace.</p>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}
