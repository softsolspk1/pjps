"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  PlusCircle, Loader2, AlertCircle, ShieldCheck,
  Search, Filter, BookOpen, Layers
} from "lucide-react";
import { format } from "date-fns";

export default function AuthorDashboard() {
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
     if (status.includes('REVIEW')) return 'text-amber-600 bg-amber-50 border-amber-200';
     if (status.includes('REVISION')) return 'text-blue-600 bg-blue-50 border-blue-200';
     if (status === 'REJECTED') return 'text-red-600 bg-red-50 border-red-200';
     return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const getStatusLabel = (status: string) => {
     return status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Manuscript Registry...</p>
      </div>
    );
  }

  const published = articles.filter(a => a.status === 'PUBLISHED').length;
  const trackingCount = articles.filter(a => ['SCREENING', 'UNDER_REVIEW', 'TECHNICAL_CHECK'].includes(a.status)).length;
  const actionRequired = articles.filter(a => ['REVISIONS_REQUIRED', 'PAYMENT_PENDING', 'MAJOR_REVISION', 'MINOR_REVISION'].includes(a.status)).length;
  const submittedCount = articles.length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Scholarly Workspace</div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                   <ShieldCheck size={14} /> Platinum Portal Access
                </div>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-3 tracking-tight">Expert Research Portal</h1>
            <p className="text-slate-400 font-medium mb-10 max-w-2xl leading-relaxed">
               Welcome back, <strong>{session?.user?.name}</strong>. Manage your manuscript submissions, tracking real-time peer-review progress and publication status within the institutional framework.
            </p>
            <div className="flex gap-4">
               <Link href="/submission" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95">
                  <PlusCircle size={18} /> New Manuscript Submission
               </Link>
               <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 active:scale-95">
                  <BookOpen size={18} /> Editorial Guidelines
               </button>
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Submitted Articles', count: submittedCount, icon: Layers, color: 'text-slate-900', bg: 'bg-white' },
           { label: 'Manuscript Tracking', count: trackingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Published Works', count: published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Action Required', count: actionRequired, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
         ].map((stat, i) => (
           <div key={i} className={`p-8 ${stat.bg} border border-slate-100 rounded-3xl shadow-premium hover:shadow-md transition-all active:scale-95 cursor-default`}>
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl ${stat.bg === 'bg-white' ? 'bg-slate-50' : 'bg-white'} ${stat.color}`}>
                    <stat.icon size={24} />
                 </div>
                 <div className="text-3xl font-serif font-black text-slate-900 tracking-tight">{stat.count}</div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
           </div>
         ))}
      </div>

      {/* Main Content Registry */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-3">
               <FileText className="text-blue-600" /> Manuscript Registry
            </h2>
            <div className="flex gap-2">
               <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Search size={16} className="text-slate-400" />
                  <input type="text" placeholder="Search my research..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-48" />
               </div>
               <button className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         {articles.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                 <FileText size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Registry Empty</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                 You haven't submitted any manuscripts to the PJPS portal yet. Start your journey by submitting a new research article.
              </p>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuscript ID</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Title</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Tracking</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Logged</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">View Actions</th>
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
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Submitted for Screening'}</div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] border ${getStatusColor(art.status)}`}>
                                {getStatusLabel(art.status)}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="text-xs font-bold text-slate-600">{format(new Date(art.createdAt), 'MMM dd, yyyy')}</div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                                <ChevronRight size={18} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>
    </div>
  );
}
