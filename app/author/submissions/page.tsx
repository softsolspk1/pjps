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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Institutional Hero Banner */}
      <div className="relative p-12 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="px-5 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Institutional Registry</div>
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                       <ShieldCheck size={14} /> Global Scholarly Archive
                    </div>
                </div>
                <h1 className="text-5xl font-serif font-black mb-4 tracking-tight leading-tight">Historical Research Portfolio</h1>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                   Manage your authenticated manuscript submissions within the PJPS scholarly registry. Access tracking metadata, reviewer feedback, and final publication repositories.
                </p>
            </div>
            <div className="flex flex-col gap-4 min-w-[280px]">
               <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-3xl">
                  <Search size={20} className="text-slate-500" />
                  <input type="text" placeholder="Search my registry..." className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-white w-full placeholder:text-slate-600 focus:placeholder:text-slate-400 transition-all" />
               </div>
               <Link 
                  href="/submission"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
               >
                  <PlusCircle size={18} /> Initiate New Submission
               </Link>
            </div>
         </div>
      </div>

      {/* Manuscript Registry Registry Table */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-4">
               <FileText className="text-blue-600" /> Scholarship History
            </h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100 italic">Institutional Record</div>
        </div>

        <div className="overflow-x-auto">
          {articles.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                <Layers size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Registry Unpopulated</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                Your scholarly research history is currently empty. PJPS welcomes original pharmaceutical inquiries, clinical reviews, and biomedical findings.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Manuscript ID</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Research Title</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Lifecycle Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Log Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Monitoring</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/tracking?id=${art.id}`}>
                    <td className="px-10 py-8">
                      <div className="text-[11px] font-black text-slate-900 font-mono bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg inline-block shadow-sm">#{art.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-slate-900 text-[13px] mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">{art.title}</div>
                      <div className="flex items-center gap-2">
                         <BookOpen size={12} className="text-blue-400" />
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Formal Screening Phase'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(art.status)}`}>
                        {art.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-xs font-black text-slate-700 uppercase tracking-tighter">{format(new Date(art.createdAt), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="inline-flex items-center justify-center w-12 h-12 border border-slate-100 rounded-2xl text-slate-400 group-hover:border-blue-600 group-hover:text-blue-600 transition-all bg-white shadow-sm">
                         <ChevronRight size={24} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Institutional Support Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
           { 
             title: 'Verified Publication', 
             desc: 'Global indexing and official DOI assignment for accepted scholarly works.',
             icon: CheckCircle2,
             color: 'text-emerald-600',
             bg: 'bg-emerald-50'
           },
           { 
             title: 'Live Peer Tracking', 
             desc: 'Monitor real-time lifecycle analysis from screening to final acceptance.',
             icon: Layers,
             color: 'text-blue-600',
             bg: 'bg-blue-50'
           },
           { 
             title: 'Scholarly Protection', 
             desc: 'Institutional-grade manuscript security and plagiarism verification standards.',
             icon: ShieldCheck,
             color: 'text-slate-900',
             bg: 'bg-slate-100'
           }
        ].map((item, i) => (
           <div key={i} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-premium hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="flex items-center gap-6 mb-8">
                 <div className={`p-4 ${item.bg} ${item.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <item.icon size={28} />
                 </div>
                 <h4 className="text-xl font-serif font-black text-slate-900 tracking-tight">{item.title}</h4>
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">{item.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                 Learn More <ChevronRight size={14} />
              </div>
           </div>
        ))}
      </div>

    </div>
  );
}
