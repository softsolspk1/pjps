"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  Search, Filter, BookOpen, Layers,
  Calendar, Award, MessageSquare, AlertCircle, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";

export default function ReviewerArticlesPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        const assignments = data.reviews || [];
        setReviews(assignments.filter((r: any) => r.status !== 'INVITED'));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
     if (status === 'COMPLETED') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
     if (status === 'ACCEPTED') return 'text-amber-600 bg-amber-50 border-amber-200';
     return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Expert Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="relative p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl overflow-hidden group mb-10">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">Institutional Workspace</div>
               <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Assigned Manuscripts</h1>
               <p className="text-slate-400 font-medium text-sm max-w-xl">Manage your active peer review assignments and finalize expert scholarly feedback within the unified PJPS portal.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl">
                  <Search size={16} className="text-blue-400" />
                  <input type="text" placeholder="Search my reviews..." className="bg-transparent border-none outline-none text-xs font-bold text-white w-48 placeholder:text-slate-500" />
               </div>
            </div>
         </div>
      </div>

      {/* Registry Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <FileText size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Registry Empty</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            You do not have any active or completed peer review assignments at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-8 group hover:border-blue-200 transition-all">
               <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-4">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(review.status)}`}>
                           {review.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">MS-#{review.articleId.slice(-6).toUpperCase()}</span>
                     </div>
                     <h2 className="text-2xl font-serif font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {review.article?.title}
                     </h2>
                     <div className="flex flex-wrap gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} className="text-blue-500" />
                           Assigned: {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </div>
                        {review.recommendation && (
                           <div className="flex items-center gap-2 text-emerald-600">
                              <CheckCircle2 size={14} />
                              Recommendation: {review.recommendation}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="flex flex-col justify-center min-w-[200px]">
                    {review.status === 'ACCEPTED' ? (
                       <Link 
                         href={`/reviewer/articles/${review.articleId}`}
                         className="w-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
                       >
                         Fill Scorecard <ChevronRight size={18} />
                       </Link>
                    ) : (
                       <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peer Review Complete</p>
                          <div className="text-emerald-600 font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2">
                             <Award size={16} /> Archive Logged
                          </div>
                       </div>
                    )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Recognition Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
         <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm flex-shrink-0">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h4 className="text-lg font-serif font-bold text-slate-900 tracking-tight">Expert Verification</h4>
               <p className="text-slate-500 text-sm font-medium">Your expert reviews are verified and credited toward your institutional scholarly credentials.</p>
            </div>
         </div>
         <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm flex-shrink-0">
               <Award size={32} />
            </div>
            <div>
               <h4 className="text-lg font-serif font-bold text-slate-900 tracking-tight">Reviewer Rewards</h4>
               <p className="text-slate-500 text-sm font-medium">Earn Recognition Certificates and Eligibility for Annual PJPS Reviewer Awards upon scorecard finalization.</p>
            </div>
         </div>
      </div>

    </div>
  );
}
