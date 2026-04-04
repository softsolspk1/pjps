"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileText, Download, Star, CheckCircle2, AlertCircle, ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scorecard State
  const [originality, setOriginality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [importance, setImportance] = useState(5);
  const [rating, setRating] = useState(5); // 1-10 overall
  
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [commentsToEditor, setCommentsToEditor] = useState("");
  const [recommendation, setRecommendation] = useState("MINOR");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

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

  if (loading) return <div className="flex justify-center items-center h-[60vh] font-bold text-slate-400">Loading Manuscript Data...</div>;

  const manuscriptMedia = article?.media?.find((m: any) => m.section === "MANUSCRIPT");

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold uppercase tracking-widest text-xs transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 gap-10">
        <div className="space-y-10">
          <section className="bg-slate-900 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <span className="inline-block px-4 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] uppercase font-black mb-4 tracking-widest border border-blue-500/20">Peer Review Assignment</span>
              <h1 className="text-3xl font-serif font-bold mb-4 leading-tight">{article?.title}</h1>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed line-clamp-3">{article?.abstract}</p>
              
              {manuscriptMedia && (
                <a 
                  href={manuscriptMedia.secureUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95"
                >
                  <Download size={20} /> Download Manuscript PDF
                </a>
              )}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-10 rounded-3xl shadow-premium space-y-12">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} />
                <span className="font-bold text-sm">{error}</span>
              </div>
            )}

            {/* Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: "Originality", val: originality, set: setOriginality },
                { label: "Scientific Quality", val: quality, set: setQuality },
                { label: "Significance", val: importance, set: setImportance },
                { label: "Overall Score", val: rating, set: setRating },
              ].map((s) => (
                <div key={s.label}>
                  <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">{s.label}</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => s.set(num)}
                        className={`w-9 h-9 border rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                          s.val === num ? "bg-blue-600 text-white border-blue-600 shadow-md scale-110" : "border-slate-100 text-slate-400 hover:bg-slate-50"
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
              {/* Public Feedback */}
              <div className="p-8 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare size={20} className="text-blue-600" />
                  <label className="block text-xs font-black text-blue-900 uppercase tracking-widest">Public Comments to Author</label>
                </div>
                <textarea 
                  required 
                  value={commentsToAuthor} 
                  onChange={(e) => setCommentsToAuthor(e.target.value)}
                  className="w-full p-6 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-48 text-md bg-white transition-all"
                  placeholder="Provide structured feedback for the author to improve their manuscript..."
                />
                <p className="mt-4 text-[11px] text-slate-400 font-medium italic">This feedback will be shared with the authors during decision communication.</p>
              </div>

              {/* Private Feedback */}
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={20} className="text-slate-600" />
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest">Confidential Comments to Editor</label>
                </div>
                <textarea 
                  value={commentsToEditor} 
                  onChange={(e) => setCommentsToEditor(e.target.value)}
                  className="w-full p-6 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-400 outline-none h-40 text-md bg-white transition-all"
                  placeholder="Private remarks for the editorial board only..."
                />
                <p className="mt-4 text-[11px] text-slate-400 font-medium italic">These comments are strictly confidential and will NOT be seen by the authors.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Final Recommendation</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: "ACCEPT", label: "Accept", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                  { id: "MINOR", label: "Minor Revision", color: "text-blue-700 bg-blue-50 border-blue-100" },
                  { id: "MAJOR", label: "Major Revision", color: "text-amber-700 bg-amber-50 border-amber-100" },
                  { id: "REJECT", label: "Reject", color: "text-red-700 bg-red-50 border-red-100" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRecommendation(r.id)}
                    className={`p-5 border rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all ${
                      recommendation === r.id ? `${r.color} shadow-lg scale-105 border-2` : "border-slate-100 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="inline-flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Finalizing Professional Review..." : <><CheckCircle2 size={24} /> Submit Confidential Review</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
