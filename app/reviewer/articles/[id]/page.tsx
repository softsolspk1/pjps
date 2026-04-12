"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  FileText, Download, Star, CheckCircle2, 
  AlertCircle, ArrowLeft, MessageSquare, ShieldCheck,
  Award, BookOpen, Clock, Layers, Globe
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
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
      
      {/* Dynamic Institutional Breadcrumbs */}
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translateX-1 transition-transform" /> 
          Institutional Registry / MS-#{id.slice(-6).toUpperCase()}
        </button>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Journal Tier</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-black rounded-md border border-blue-100">Q1 PHARMACOLOGY</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase shadow-sm">PJ</div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PJPS Core v3.1</span>
           </div>
        </div>
      </div>

      {/* Hero Dossier Header */}
      <section className="relative rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-slate-100 group bg-white">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
         
         <div className="relative z-10 p-12 lg:p-16 flex flex-col lg:flex-row gap-16">
            <div className="flex-1 space-y-10">
               <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                     <ShieldCheck size={12} className="text-blue-400" /> Referee Mandate
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                     Scientific Version v{article?.version || 1}
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                     Indexed Repository
                  </div>
               </div>

               <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-serif font-black leading-[1.1] text-slate-900 tracking-tight">
                     {article?.title}
                  </h1>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Submission Origin: {article?.origin || 'Pakistan'}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full" />
                     <span>Tracking: {article?.trackingType || 'Regular'}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full" />
                     <span>DOI: {article?.doi || 'PENDING'}</span>
                  </div>
               </div>

               <div className="p-1 top-0 relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
                  <p className="text-slate-600 text-lg leading-relaxed font-medium italic pl-4 opacity-100">
                     "{article?.abstract}"
                  </p>
               </div>
            </div>

            <div className="lg:w-80 space-y-6">
               {!isInvited && (
                  <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-8 shadow-inner">
                     <div className="flex flex-col items-center gap-4 pt-2">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-blue-50">
                           <FileText size={32} />
                        </div>
                        <div className="text-center">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Manuscript File</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Reviewer Access Only</p>
                        </div>
                     </div>
                     
                     {manuscriptMedia && (
                        <a 
                           href={manuscriptMedia.secureUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="w-full flex items-center justify-center gap-3 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-100 p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm active:scale-95 group/down"
                        >
                           <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Download PDF
                        </a>
                     )}

                     <div className="p-4 bg-white/50 rounded-xl border border-slate-200/50 space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                           <span>Review Deadline</span>
                           <span className="text-red-500">14 Days Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 w-1/4" />
                        </div>
                     </div>
                  </div>
               )}

               {isInvited && (
                  <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={64} /></div>
                     <div className="space-y-2 relative z-10">
                        <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Inquiry Protocol</h4>
                        <h3 className="text-xl font-serif font-black">Accept Invitation?</h3>
                     </div>
                     <div className="grid grid-cols-1 gap-3 relative z-10">
                        <button 
                           onClick={() => handleResponse('ACCEPTED')}
                           className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                           <CheckCircle2 size={18} /> Confirm Access
                        </button>
                        <button 
                           onClick={() => handleResponse('DECLINED')}
                           className="w-full bg-white/5 hover:bg-white/10 text-slate-400 p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                        >
                           Decline
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>

      {!isInvited && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Main Scorecard Workflow */}
            <div className="lg:col-span-8">
               <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-50 p-12 rounded-[3.5rem] shadow-xl space-y-20">
                  {error && (
                    <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl flex items-center gap-4 animate-shake">
                      <AlertCircle size={24} />
                      <span className="font-black text-[11px] uppercase tracking-widest">{error}</span>
                    </div>
                  )}

                  {/* Criteria Section */}
                  <div className="space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.2rem] shadow-xl flex items-center justify-center">
                           <Award size={28} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-serif font-black text-slate-900">Evaluation Matrix</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Quantitative Scholarly Benchmarking</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                        { label: "Originality", val: originality, set: setOriginality, icon: Star, desc: "Novelty of research contribution" },
                        { label: "Refinement", val: quality, set: setQuality, icon: ShieldCheck, desc: "Technical & methodological rigor" },
                        { label: "Domain Impact", val: importance, set: setImportance, icon: Globe, desc: "Influence on pharmaceutical science" },
                        { label: "Expert Rating", val: rating, set: setRating, icon: Layers, desc: "Consolidated scientific assessment" },
                        ].map((s) => (
                        <div key={s.label} className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                           <div className="flex justify-between items-start mb-8">
                              <div className="space-y-1">
                                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <s.icon size={14} /> {s.label}
                                 </span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.desc}</span>
                              </div>
                              <span className="text-3xl font-serif font-black text-slate-200 group-hover:text-blue-600/10 transition-colors">{s.val}</span>
                           </div>
                           <div className="flex gap-1 justify-between">
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                 key={num}
                                 type="button"
                                 onClick={() => s.set(num)}
                                 className={`w-7 h-7 xl:w-8 xl:h-8 rounded-lg font-black text-[9px] flex items-center justify-center transition-all ${
                                 s.val === num ? "bg-slate-900 text-white shadow-xl scale-110" : "bg-white text-slate-300 border border-slate-100 hover:text-slate-900 hover:border-slate-300"
                                 }`}
                              >
                                 {num}
                              </button>
                           ))}
                           </div>
                        </div>
                        ))}
                     </div>
                  </div>

                  {/* Discursive Feedback Section */}
                  <div className="space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.2rem] shadow-xl flex items-center justify-center">
                           <MessageSquare size={28} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-serif font-black text-slate-900">Qualitative Registry</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Refined Discursive Feedback Loop</p>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-2">Official Recommendations (Authors)</label>
                           <textarea 
                              required 
                              value={commentsToAuthor} 
                              onChange={(e) => setCommentsToAuthor(e.target.value)}
                              className="w-full p-10 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:bg-white focus:border-blue-600 focus:ring-0 outline-none h-64 text-md text-slate-900 leading-relaxed transition-all placeholder:text-slate-300 placeholder:italic"
                              placeholder="Draft rigorous, constructive critique for the authors..."
                           />
                        </div>

                        <div className="space-y-4 group">
                           <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-2 flex items-center gap-2">
                              <ShieldCheck size={14} className="text-red-500" /> Executive Disclosure (Editorial)
                           </label>
                           <textarea 
                              value={commentsToEditor} 
                              onChange={(e) => setCommentsToEditor(e.target.value)}
                              className="w-full p-8 bg-slate-900 text-slate-100 border-2 border-slate-900 rounded-[2.5rem] focus:placeholder:opacity-30 outline-none h-40 text-md transition-all placeholder:text-slate-700"
                              placeholder="Sensitive remarks for the Editorial Board..."
                           />
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right px-6">Confidentiality Protocol Active</p>
                        </div>
                     </div>
                  </div>

                  {/* Outcome Decision Section */}
                  <div className="pt-10 border-t-2 border-slate-50">
                     <div className="text-center mb-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Recommendation</h4>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: "ACCEPT", label: "Accept", class: "hover:bg-emerald-50 hover:text-emerald-700 border-emerald-100", active: "bg-emerald-600 text-white scale-105 shadow-emerald-200" },
                          { id: "MINOR", label: "Minor Revision", class: "hover:bg-blue-50 hover:text-blue-700 border-blue-100", active: "bg-blue-600 text-white scale-105 shadow-blue-200" },
                          { id: "MAJOR", label: "Major Revision", class: "hover:bg-amber-50 hover:text-amber-700 border-amber-100", active: "bg-amber-600 text-white scale-105 shadow-amber-200" },
                          { id: "REJECT", label: "Reject", class: "hover:bg-red-50 hover:text-red-700 border-red-100", active: "bg-red-600 text-white scale-105 shadow-red-200" },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRecommendation(r.id)}
                            className={`p-6 border-2 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center text-center shadow-sm ${
                              recommendation === r.id ? r.active : `bg-white text-slate-400 ${r.class}`
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="pt-10 flex flex-col items-center gap-6">
                     <button 
                       type="submit" 
                       disabled={submitting}
                       className="group relative inline-flex items-center gap-4 bg-slate-900 text-white px-20 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                     >
                        {submitting ? (
                           <div className="flex items-center gap-3"><Loader2 className="animate-spin" size={20} /> Registry Sync In Progress</div>
                        ) : (
                           <><CheckCircle2 size={24} className="text-blue-400" /> Finalize Official Dossier</>
                        )}
                     </button>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">By finalizing, you verify this peer assessment fulfills PJPS Standards.</p>
                  </div>
               </form>
            </div>

            {/* Institutional Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 space-y-12">
                  <div className="space-y-4">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={20} /> Scoring Rubric
                     </h3>
                     <div className="h-1 w-12 bg-blue-600 rounded-full" />
                  </div>

                  <div className="space-y-10">
                     {[
                        { title: "Score 9-10 (Exceptional)", desc: "Groundbreaking research with zero technical flaws and immediate impact.", color: "bg-emerald-500" },
                        { title: "Score 7-8 (Strong)", desc: "Relevant, high-quality work with minor methodological polish required.", color: "bg-blue-500" },
                        { title: "Score 5-6 (Average)", desc: "Standard academic contribution. Requires significant revisions to satisfy PJPS.", color: "bg-amber-500" },
                        { title: "Score 1-4 (Insufficient)", desc: "Limited scholarly novelty or fundamental procedural failures.", color: "bg-red-500" }
                     ].map((item, i) => (
                        <div key={i} className="relative pl-6 space-y-1 group">
                           <div className={`absolute left-0 top-1 bottom-1 w-1 ${item.color} rounded-full opacity-40 group-hover:opacity-100 transition-opacity`} />
                           <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.title}</h5>
                           <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                     ))}
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                     <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PJPS Recognition</h6>
                     <p className="text-[11px] font-bold text-slate-900">Your Expertise Coefficient</p>
                     <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-1">
                           {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-white bg-blue-100" />)}
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase">+120 Points</span>
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-lg space-y-6">
                  <div className="flex items-center gap-3 text-slate-900">
                     <BookOpen size={20} className="text-blue-600" />
                     <h4 className="text-[11px] font-black uppercase tracking-widest">Referee Ethics</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                     Every evaluation is double-blinded. You must not attempt to de-anonymize the authors. If you suspect a conflict of interest, please utilize the confidential editorial disclosure field.
                  </p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
