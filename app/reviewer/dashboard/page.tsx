"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileText, Clock, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function ReviewerDashboard() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[60vh] font-bold text-slate-400">Loading Manuscript Registry...</div>;

  const pendingReviews = reviews.filter(r => r.status === "PENDING");
  const completedReviews = reviews.filter(r => r.status === "COMPLETED");

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Reviewer Portal</h1>
        <p className="text-slate-500 font-medium">Welcome back, {session?.user?.name}. Manage your assigned peer reviews.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest text-sm">Action Required</h2>
            </div>
            
            {pendingReviews.length === 0 ? (
              <div className="p-10 bg-slate-50 border border-slate-200 rounded-2xl text-center italic text-slate-400 font-serif">
                No manuscripts currently awaiting your review.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <Link 
                    key={review.id} 
                    href={`/reviewer/articles/${review.articleId}`}
                    className="block bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-500 hover:shadow-premium transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">{review.article?.id}</div>
                        <h3 className="text-xl font-serif font-bold text-slate-800 group-hover:text-blue-700 leading-snug">{review.article?.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 max-w-2xl">{review.article?.abstract}</p>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500 mt-2" size={20} />
                    </div>
                    <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide border-t border-slate-50 pt-4">
                      <span className="flex items-center gap-1"><FileText size={14} /> Full Manuscript PDF</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> Assigned: {format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {completedReviews.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-emerald-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest text-sm">Completed Reviews</h2>
              </div>
              <div className="space-y-4 opacity-70">
                {completedReviews.map((review) => (
                  <div key={review.id} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                    <h3 className="text-lg font-serif font-bold text-slate-600 line-clamp-1">{review.article?.title}</h3>
                    <div className="mt-2 flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                      <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> Recommendation: {review.recommendation}</span>
                      <span>Date: {format(new Date(review.updatedAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-serif font-bold mb-4 text-blue-400 uppercase tracking-widest text-xs">Reviewer Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-400 font-medium">Assigned</span>
                <span className="text-2xl font-bold ">{reviews.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-400 font-medium">Pending</span>
                <span className="text-2xl font-bold text-amber-400">{pendingReviews.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-medium">Finalized</span>
                <span className="text-2xl font-bold text-emerald-400">{completedReviews.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-4">Guidelines</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
                <BookOpen className="text-blue-600 shrink-0 mt-1" size={16} />
                Maintain strict confidentiality throughout the review process.
              </li>
              <li className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
                <BookOpen className="text-blue-600 shrink-0 mt-1" size={16} />
                Evaluate originality, methodology, and scientific impact.
              </li>
              <li className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
                <BookOpen className="text-blue-600 shrink-0 mt-1" size={16} />
                Submit finalized reviews within 14 days of assignment.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
