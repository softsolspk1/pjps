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
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translateX-1 transition-transform" /> 
          Scholarly Registry / MS-#{id.slice(-6).toUpperCase()}
        </button>
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">E</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">A</div>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Version 2.0</span>
        </div>
      </div>

      {/* Hero Dossier Section */}
      <section className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group bg-slate-900">
         {/* Animated Background Layers */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-900 to-black pointer-events-none" />
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
         
         <div className="relative z-10 p-12 lg:p-16">
            <div className="flex flex-wrap items-center gap-4 mb-8">
               <div className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30">
                  Refereed Research
               </div>
               <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Double-Blind Integrity Verified
               </div>
               <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> 14-Day Cycle Active
               </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-black mb-10 leading-[1.15] text-white tracking-tight max-w-5xl">
               {article?.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
               {/* Abstract Card */}
               <div className="lg:col-span-8 p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md shadow-inner group/abs">
                  <div className="flex items-center gap-3 mb-6 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] opacity-80 group-hover/abs:opacity-100 transition-opacity">
                     <BookOpen size={18} /> Executive Abstract Summary
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed font-light italic opacity-90 first-letter:text-4xl first-letter:font-serif first-letter:mr-1">
                     {article?.abstract}
                  </p>
               </div>

               {/* Action Sidebar */}
               <div className="lg:col-span-4 space-y-6">
                  {!isInvited && manuscriptMedia && (
                     <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] shadow-xl shadow-blue-600/20 text-center space-y-6 transform hover:scale-[1.02] transition-transform">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-white shadow-inner">
                           <FileText size={32} />
                        </div>
                        <div>
                           <h4 className="font-black uppercase tracking-tight text-white mb-1">Full Manuscript</h4>
                           <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Protected Scholarly PDF</p>
                        </div>
                        <a 
                           href={manuscriptMedia.secureUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="w-full inline-flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all hover:bg-slate-50 active:scale-95 shadow-lg"
                        >
                           <Download size={18} /> Open Repository
                        </a>
                     </div>
                  )}

                  {isInvited && (
                     <div className="p-10 bg-white/5 border border-white/20 rounded-[2.5rem] backdrop-blur-xl space-y-8">
                        <div className="space-y-3">
                           <h4 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Mandatory Outcome</h4>
                           <h3 className="text-xl font-serif font-black text-white">Nominate Cooperation?</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           <button 
                              onClick={() => handleResponse('ACCEPTED')}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95"
                           >
                              <CheckCircle2 size={18} /> Accept Assignment
                           </button>
                           <button 
                              onClick={() => handleResponse('DECLINED')}
                              className="w-full bg-white/5 hover:bg-white/10 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all active:scale-95"
                           >
                              Decline Refereeship
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase text-center tracking-widest leading-relaxed">
                           Accepting will grant immediate access to technical data and scorecard systems.
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      {!isInvited && (
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Primary Scorecard Form */}
            <div className="lg:col-span-3">
               <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-100 p-12 rounded-[3.5rem] shadow-premium space-y-16">
                  {error && (
                    <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl flex items-center gap-4 animate-shake">
                      <AlertCircle size={24} />
                      <span className="font-black text-[11px] uppercase tracking-widest">{error}</span>
                    </div>
                  )}

                  {/* Quantitative Evaluation */}
                  <div className="space-y-10">
                     <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center">
                           <Layers size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-serif font-black text-slate-900">Expert Quantitative Scoring</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Peer Review Metric System</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {[
                        { label: "Originality & Novelty", val: originality, set: setOriginality, icon: Star, desc: "Significance of the research contribution" },
                        { label: "Technical Soundness", val: quality, set: setQuality, icon: ShieldCheck, desc: "Methodological rigour and validation" },
                        { label: "Scientific Importance", val: importance, set: setImportance, icon: Award, desc: "Impact on the pharmaceutical domain" },
                        { label: "Overall Quality Rating", val: rating, set: setRating, icon: Layers, desc: "Consolidated expertise rating" },
                        ].map((s) => (
                        <div key={s.label} className="p-8 bg-slate-50/70 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all duration-500 group">
                           <div className="flex justify-between items-start mb-6">
                              <label className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <s.icon size={14} className="group-hover:text-blue-600 transition-colors" /> {s.label}
                                 </span>
                                 <span className="text-[9px] font-bold text-slate-400 italic lowercase tracking-tight">{s.desc}</span>
                              </label>
                              <span className="text-2xl font-serif font-black text-blue-600/20 group-hover:text-blue-600 transition-colors">{s.val}/10</span>
                           </div>
                           <div className="flex gap-2 justify-between">
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                 key={num}
                                 type="button"
                                 onClick={() => s.set(num)}
                                 className={`w-8 h-8 xl:w-9 xl:h-9 border-2 rounded-xl font-black text-[10px] flex items-center justify-center transition-all ${
                                 s.val === num ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110" : "bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600"
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

                  {/* Qualitative Discourse */}
                  <div className="space-y-10">
                     <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center">
                           <MessageSquare size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-serif font-black text-slate-900">Qualitative Scholarly Discourse</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Formal Peer Commentary & Feedback</p>
                        </div>
                     </div>

                     <div className="space-y-12">
                        <div className="relative">
                           <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 group/txt focus-within:bg-white transition-all">
                              <label className="block text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-6">Communicated Remarks (Authors)</label>
                              <textarea 
                                 required 
                                 value={commentsToAuthor} 
                                 onChange={(e) => setCommentsToAuthor(e.target.value)}
                                 className="w-full p-8 border border-blue-100 rounded-3xl focus:ring-8 focus:ring-blue-500/10 outline-none h-64 text-md bg-white transition-all shadow-inner placeholder:italic placeholder:text-slate-300"
                                 placeholder="Provide rigorous, constructive expert evaluation to the authors..."
                              />
                           </div>
                           <div className="absolute top-8 right-8 flex items-center gap-2 text-[9px] font-black text-blue-600/40 uppercase tracking-widest">
                              <Globe size={12} /> External Feedback Loop
                           </div>
                        </div>

                        <div className="relative">
                           <div className="p-8 bg-slate-100 border border-slate-200 rounded-[2.5rem] focus-within:bg-white transition-all group/priv">
                              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                 <ShieldCheck size={14} className="text-red-500" /> Confidential Editorial Disclosure
                              </label>
                              <textarea 
                                 value={commentsToEditor} 
                                 onChange={(e) => setCommentsToEditor(e.target.value)}
                                 className="w-full p-8 border border-slate-200 rounded-3xl focus:ring-8 focus:ring-slate-900/5 outline-none h-44 text-md bg-white transition-all shadow-inner placeholder:italic placeholder:text-slate-300"
                                 placeholder="Sensitive remarks intended strictly for the Editorial Board..."
                              />
                              <p className="mt-4 text-[9px] font-black text-red-600/50 uppercase tracking-[0.2em] italic text-right px-4">
                                 Institutional Confidentiality Level: Critical
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Scientific Recommendation */}
                  <div className="space-y-10 pt-6">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Definitive Scholarly Recommendation</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {[
                         { id: "ACCEPT", label: "Accept", color: "text-emerald-700 bg-emerald-50 border-emerald-300 shadow-emerald-600/10" },
                         { id: "MINOR", label: "Minor revision", color: "text-blue-700 bg-blue-50 border-blue-300 shadow-blue-600/10" },
                         { id: "MAJOR", label: "Major revision", color: "text-amber-700 bg-amber-50 border-amber-300 shadow-amber-600/10" },
                         { id: "REJECT", label: "Reject", color: "text-red-700 bg-red-50 border-red-300 shadow-red-600/10" },
                       ].map((r) => (
                         <button
                           key={r.id}
                           type="button"
                           onClick={() => setRecommendation(r.id)}
                           className={`p-6 border-2 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center text-center transition-all ${
                             recommendation === r.id ? `${r.color} shadow-2xl scale-105 border-transparent` : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                           }`}
                         >
                           {r.label}
                         </button>
                       ))}
                     </div>
                  </div>

                  {/* Submission Submission */}
                  <div className="pt-12 flex flex-col items-center gap-6">
                     <button 
                       type="submit" 
                       disabled={submitting}
                       className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-20 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 disabled:opacity-50 overflow-hidden"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                        {submitting ? (
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Synchronizing Scholarly Registry
                           </div>
                        ) : (
                           <><CheckCircle2 size={24} className="text-emerald-400" /> Finalize Official Scorecard</>
                        )}
                     </button>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed text-center max-w-sm">
                        BY SUBMITTING, YOU CONFIRM THE PROFESSIONAL ACCURACY OF YOUR EVALUATION UNDER THE PJPS BOARD COVENANT.
                     </p>
                  </div>
               </form>
            </div>

            {/* Scholarly Context Sidebar */}
            <div className="space-y-8 no-print">
               <div className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl p-10 space-y-10 group hover:border-blue-100 transition-colors">
                  <div className="space-y-2">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" /> Referee Mandate
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Institutional Guidelines (v2.0)</p>
                  </div>
                  
                  <div className="space-y-8">
                     {[
                        { title: "Objectivity", text: "Evaluations must remain strictly technical and evidence-based." },
                        { title: "Confidentiality", text: "Manuscripts are privileged and must be purged post-review." },
                        { title: "Ethics", text: "Disclose conflicts immediately if scientific integrity is at risk." },
                        { title: "Punctuality", text: "Adhere to the 14-day turnaround to ensure rapid scholarly dissemination." }
                     ].map((item, i) => (
                        <div key={i} className="flex gap-4 group/item">
                           <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-[11px] font-black group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">{i+1}</div>
                           <div className="space-y-1">
                              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.title}</h5>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.text}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-[10px] text-slate-500 leading-relaxed text-center">
                     "The expert referee is the cornerstone of scholarly integrity."
                  </div>
               </div>

               <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                  <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />
                  
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3 text-blue-400">
                        <Award size={24} />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Institutional Credit</h4>
                     </div>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Every finalized scorecard contributes to your **Verified Scholar Coefficient** in the PJPS Institutional Registry.
                     </p>
                     <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Current Credential</span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Expert referee</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
