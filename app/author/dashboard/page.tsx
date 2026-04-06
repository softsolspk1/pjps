"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  PlusCircle, Loader2, AlertCircle, ShieldCheck,
  Search, Filter, BookOpen, Layers, User,
  ArrowLeft, LayoutDashboard, Globe
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
  const trackingCount = articles.filter(a => ['SCREENING', 'UNDER_REVIEW', 'TECHNICAL_CHECK', 'WAITING_FOR_REVISION'].includes(a.status)).length;
  const submittedCount = articles.length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Institutional Hero */}
      <div className="relative p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">PJPS Scholar Workspace</div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                   <ShieldCheck size={14} /> Platinum Verification
                </div>
            </div>
            <h1 className="text-4xl font-serif font-black mb-3 tracking-tight">Research Management Dashboard</h1>
            <p className="text-slate-400 font-medium mb-10 max-w-2xl leading-relaxed">
               Logged in as <strong>{session?.user?.name}</strong>. Access your institutional manuscript historical records, real-time tracking, and submission gateways.
            </p>
            
            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap gap-4">
               <Link href="/submission" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95">
                  <PlusCircle size={20} /> Submit New Article
               </Link>
               <Link href="/profile" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-3 active:scale-95 border border-white/10">
                  <User size={20} /> Public Profile
               </Link>
               <Link href="/" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-3 active:scale-95 border border-white/10">
                  <Globe size={20} /> Back to PJPS
               </Link>
            </div>
         </div>
      </div>

      {/* Core Scholarly Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Submitted Articles', count: submittedCount, icon: Layers, color: 'text-slate-900', bg: 'bg-white', desc: 'Total manuscripts in your registry' },
           { label: 'Published Articles', count: published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Finalized and indexed scholarly works' },
           { label: 'Tracking - In Process', count: trackingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Manuscripts under review or screening' },
         ].map((stat, i) => (
           <div key={i} className={`p-8 ${stat.bg} border border-slate-100 rounded-[2rem] shadow-premium hover:shadow-lg transition-all group`}>
              <div className="flex items-center justify-between mb-6">
                 <div className={`p-4 rounded-2xl ${stat.bg === 'bg-white' ? 'bg-slate-50' : 'bg-white'} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} />
                 </div>
                 <div className="text-4xl font-serif font-black text-slate-900 tracking-tight">{stat.count}</div>
              </div>
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">{stat.desc}</p>
           </div>
         ))}
      </div>

      {/* Manuscript Registry Table */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-premium overflow-hidden">
         <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-4">
               <FileText className="text-blue-600" /> Research Registry
            </h2>
            <div className="flex gap-3">
               <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-300 transition-all">
                  <Search size={18} className="text-slate-400" />
                  <input type="text" placeholder="Search my research..." className="bg-transparent border-none outline-none text-[11px] font-black uppercase text-slate-900 w-48 placeholder:text-slate-400" />
               </div>
            </div>
         </div>

         {articles.length === 0 ? (
           <div className="p-24 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                 <Layers size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Scholarly History Empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                 You haven't initiated any manuscript submissions yet. PJPS welcomes original research, clinical reviews, and scholarly inquiries.
              </p>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuscript ID</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Research Title</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Tracking</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Logged</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {articles.map((art) => (
                       <tr key={art.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/author/submissions`}>
                          <td className="px-10 py-8">
                             <div className="text-xs font-black text-slate-900 font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 inline-block">#{art.id.slice(-6).toUpperCase()}</div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="font-black text-slate-900 text-[13px] mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{art.title}</div>
                             <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} className="text-blue-400" /> {art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Submitted for Screening'}
                             </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(art.status)} shadow-sm`}>
                                {getStatusLabel(art.status)}
                             </span>
                          </td>
                          <td className="px-10 py-8">
                             <div className="text-xs font-black text-slate-600 uppercase tracking-tighter">{format(new Date(art.createdAt), 'MMM dd, yyyy')}</div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="inline-flex items-center justify-center w-10 h-10 border border-slate-100 rounded-xl text-slate-400 group-hover:border-blue-600 group-hover:text-blue-600 transition-all bg-white shadow-sm">
                                <ChevronRight size={20} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
         
         <div className="p-8 bg-slate-50 text-center">
            <Link href="/author/submissions" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-500 transition-colors">
               View Comprehensive Manuscript Registry →
            </Link>
         </div>
      </div>
    </div>
  );
}
