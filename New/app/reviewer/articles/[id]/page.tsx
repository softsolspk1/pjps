"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  FileText, Download, Star, CheckCircle2, 
  AlertCircle, ArrowLeft, MessageSquare, ShieldCheck,
  Award, BookOpen, Clock, Layers
} from "lucide-react";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scorecard State
  const [originality, setOriginality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [importance, setImportance] = useState(5);
  const [rating, setRating] = useState(5); 
  
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [commentsToEditor, setCommentsToEditor] = useState("");
  const [recommendation, setRecommendation] = useState("MINOR");

  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);

        const reviewRes = await fetch("/api/reviewer/assignments");
        const reviewData = await reviewRes.json();
        const currentReview = reviewData.reviews?.find((r: any) => r.articleId === id);
        setReview(currentReview);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleResponse = async (response: 'ACCEPTED' | 'DECLINED') => {
    if (!review) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviewer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, response })
      });
      if (res.ok) {
        if (response === 'DECLINED') {
          router.push("/reviewer/dashboard");
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Response error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviewer/submit-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          articleId: id,
          originality, 
          quality, 
          importance,
          rating,
          commentsToAuthor,
          commentsToEditor, 
          recommendation 
        }),
      });

      if (res.ok) {
        router.push("/reviewer/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Manuscript Data...</p>
      </div>
    );
  }

  const manuscriptMedia = article?.media?.find((m: any) => m.section === "MANUSCRIPT");
  const isInvited = review?.status === "INVITED";

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-2 font-black uppercase tracking-widest text-[10px] transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translateX-1 transition-transform" /> Back to Workspace
        </button>
        <div className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">
           Expert Scorecard v1.0
        </div>
      </div>

      {/* Manuscript Brief */}
      <section className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
               <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 italic">MS-#{id.slice(-6).toUpperCase()}</span>
               <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} /> Platinum Double-Blind Protocol
               </div>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-6 leading-tight max-w-4xl">{article?.title}</h1>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm mb-10">
               <div className="flex items-center gap-3 mb-4 text-blue-400 uppercase tracking-widest text-[10px] font-black">
                  <BookOpen size={16} /> Research Abstract
               </div>
               <p className="text-slate-400 text-lg leading-relaxed italic">{article?.abstract}</p>
            </div>
            
            {!isInvited && manuscriptMedia && (
               <a 
                 href={manuscriptMedia.secureUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 active:scale-95"
               >
                 <Download size={20} /> Access Research Manuscript (PDF)
               </a>
            )}

            {isInvited && (
               <div className="flex flex-col gap-6 p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl backdrop-blur-md mt-6">
                  <div className="flex items-center gap-4 text-blue-400">
                     <ShieldCheck size={24} />
                     <p className="text-sm font-black uppercase tracking-widest">Invitation Response Mandatory</p>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed">
                     Please verify your technical expertise and absence of any institutional conflict for this manuscript before accepting.
                  </p>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleResponse('ACCEPTED')}
                       className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95"
                     >
                        <CheckCircle2 size={18} /> Accept Invitation
                     </button>
                     <button 
                       onClick={() => handleResponse('DECLINED')}
                       className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-white/10 transition-all flex items-center gap-3 active:scale-95"
                     >
                        Decline
                     </button>
                  </div>
               </div>
            )}
         </div>
      </section>

      {!isInvited && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-premium space-y-12">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
                      <AlertCircle size={20} />
                      <span className="font-bold text-sm uppercase tracking-tight">{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { label: "Originality & Novelty", val: originality, set: setOriginality, icon: Star },
                      { label: "Technical Soundness", val: quality, set: setQuality, icon: ShieldCheck },
                      { label: "Scientific Importance", val: importance, set: setImportance, icon: Award },
                      { label: "Overall Quality Rating", val: rating, set: setRating, icon: Layers },
                    ].map((s) => (
                      <div key={s.label} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest">
                           <s.icon size={14} className="text-blue-500" /> {s.label}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => s.set(num)}
                              className={`w-9 h-9 border rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                                s.val === num ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110" : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-10">
                    <div className="p-10 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 relative overflow-hidden">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                            <MessageSquare size={20} />
                         </div>
                         <label className="block text-xs font-black text-blue-900 uppercase tracking-widest">Formal Feedback for Authors</label>
                       </div>
                       <textarea 
                         required 
                         value={commentsToAuthor} 
                         onChange={(e) => setCommentsToAuthor(e.target.value)}
                         className="w-full p-8 border border-blue-100 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none h-60 text-md bg-white transition-all shadow-inner"
                         placeholder="Provide constructive, professional feedback for authors (will be shared during decision)..."
                       />
                       <p className="mt-4 text-[10px] text-blue-500/60 font-black uppercase tracking-widest">Visible to authors after review aggregation</p>
                    </div>

                    <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-200 relative">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xl">
                            <ShieldCheck size={20} />
                         </div>
                         <label className="block text-xs font-black text-slate-900 uppercase tracking-widest">Privileged Comments for Editorial Office</label>
                       </div>
                       <textarea 
                         value={commentsToEditor} 
                         onChange={(e) => setCommentsToEditor(e.target.value)}
                         className="w-full p-8 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-slate-900/5 outline-none h-40 text-md bg-white transition-all shadow-inner"
                         placeholder="Confidential remarks for the PJPS editor board only..."
                       />
                       <p className="mt-4 text-[10px] text-red-500/60 font-black uppercase tracking-widest italic">Strictly Confidential — NOT visible to authors</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <label className="block text-xs font-black text-slate-400 mb-8 uppercase tracking-widest text-center">Expert Recommendation</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: "ACCEPT", label: "Accept", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                        { id: "MINOR", label: "Minor revision", color: "text-blue-700 bg-blue-50 border-blue-200" },
                        { id: "MAJOR", label: "Major revision", color: "text-amber-700 bg-amber-50 border-amber-200" },
                        { id: "REJECT", label: "Recommend Reject", color: "text-red-700 bg-red-50 border-red-200" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRecommendation(r.id)}
                          className={`p-5 border rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center text-center transition-all ${
                            recommendation === r.id ? `${r.color} shadow-lg scale-105 border-2` : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 flex justify-center">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="inline-flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-16 py-5 rounded-[2rem] font-bold uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? "Processing Scholarly Record..." : <><CheckCircle2 size={24} /> Submit Confidential Scorecard</>}
                    </button>
                  </div>
               </form>
            </div>

            <div className="space-y-8">
               <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-10">
                  <h3 className="text-lg font-serif font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                     <ShieldCheck className="text-blue-600" /> Referee Ethics
                  </h3>
                  <div className="space-y-6">
                     {[
                        "Feedback must be professional, objective, and constructive.",
                        "Direct criticism of authors personally is strictly prohibited.",
                        "Confidentiality of the manuscript must be maintained.",
                        "Declare any conflicts as soon as they are identified."
                     ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-start">
                           <div className="w-6 h-6 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0">{i+1}</div>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed">{item}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                  <h3 className="text-lg font-serif font-bold mb-4">Certification Audit</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                     Every review submitted contributes to the institutional expertise index of the PJPS editorial board.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 text-center">
                     Verified Peer Reviewer 
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
