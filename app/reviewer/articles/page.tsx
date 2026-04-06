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
        // Filter to only show Accepted or Completed (History)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">Assigned Manuscripts</h1>
          <p className="text-slate-500 font-medium text-sm">Manage your active peer review assignments and historical scholarly feedback.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-6 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search assignments..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-48" />
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-50 overflow-x-auto">
          {reviews.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <FileText size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Assignments Found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                You do not have any active or completed peer review assignments at this time.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Title</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned On</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Your Recommendation</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-xs mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{review.article?.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                        <FileText size={10} /> Manuscript ID: #{review.articleId.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] border ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Calendar size={12} className="text-slate-400" />
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {review.recommendation ? (
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                          {review.recommendation}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-slate-400">Waiting for Scorecard</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {review.status === 'ACCEPTED' ? (
                        <Link 
                          href={`/reviewer/articles/${review.articleId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95"
                        >
                          Fill Scorecard <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                          <BookOpen size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-white/5 rounded-xl text-blue-400">
                    <ShieldCheck size={20} />
                 </div>
                 <h3 className="text-lg font-serif font-black tracking-tight">Confidentiality Protocol</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-0">
                 All manuscripts and reviews under your registry are strictly confidential. Expert feedback should be impartial, constructive, and finalized within the institutional timeline of 14 days.
              </p>
           </div>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-50 rounded-xl text-emerald-600">
                 <Award size={20} />
              </div>
              <h3 className="text-lg font-serif font-black text-slate-900 tracking-tight">Reviewer Recognition</h3>
           </div>
           <p className="text-slate-500 text-sm leading-relaxed mb-0">
              Your scholarly contribution is acknowledged by the PJPS Editorial Board. Expert reviews contribute to the "Expertise Score" in your public profile and eligibility for annual reviewer awards.
           </p>
        </div>
      </div>

    </div>
  );
}
