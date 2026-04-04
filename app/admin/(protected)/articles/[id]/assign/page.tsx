"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { User, Search, UserPlus, ArrowLeft, Loader2, CheckCircle, AlertCircle, Building, BookOpen, ShieldCheck } from "lucide-react";
import styles from "./assign.module.css";

export default function AssignReviewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [article, setArticle] = useState<any>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleRes, reviewersRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch(`/api/admin/reviewers`)
        ]);
        
        const articleData = await articleRes.json();
        const reviewersData = await reviewersRes.json();
        
        setArticle(articleData);
        setReviewers(Array.isArray(reviewersData) ? reviewersData : []);
        setFilteredReviewers(Array.isArray(reviewersData) ? reviewersData : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    const results = reviewers.filter(r => 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.interests?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.affiliation?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredReviewers(results);
  }, [search, reviewers]);

  const handleAssign = async (reviewerId: string) => {
    setAssigning(reviewerId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, reviewerId })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: "Reviewer assigned successfully! Notification dispatched." });
        // Refresh local data to show the new assignment
        const articleRes = await fetch(`/api/articles/${id}`);
        const updatedArticle = await articleRes.json();
        setArticle(updatedArticle);
        router.refresh();
      } else {
        throw new Error(data.error || "Assignment failed");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setAssigning(null);
    }
  };

  const isAlreadyAssigned = (reviewerId: string) => {
    return article?.reviews?.some((r: any) => r.reviewerId === reviewerId);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-6">
      <Loader2 className="animate-spin text-slate-200" size={48} />
      <div className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] font-serif">Faculty Registry Initializing...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-24">
      <div style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 mb-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Manuscript Registry
        </button>

        <div className="mb-16 border-b border-slate-200/60 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight leading-tight">Assign Peer Reviewers</h1>
              <div className="flex flex-wrap items-center gap-4">
                 <div className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200/50">Scholarly Selection</div>
                 <p className="text-slate-500 font-serif text-2xl italic">"{article?.title || "Retrieving metadata..."}"</p>
              </div>
            </div>
            
            {article?.reviews && article.reviews.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Currently Assigned</p>
                  <div className="flex -space-x-3">
                    {article.reviews.map((r: any, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm" title={r.reviewer.name}>
                        {r.reviewer.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <p className="text-2xl font-serif font-bold text-slate-900">{article.reviews.length}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Referees Active</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[48px] shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-12 border-b border-slate-100 bg-[#fdfbf7]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 block">Expert Faculty Search Engine</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                  <input 
                    type="text" 
                    placeholder="Search by name, institutional affiliation, or research keywords..."
                    className="w-full pl-20 pr-10 py-8 bg-white border-2 border-slate-100 rounded-[32px] outline-none focus:border-blue-500/50 focus:shadow-xl focus:shadow-blue-500/5 transition-all font-serif text-2xl placeholder:text-slate-200 placeholder:italic"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 flex-1">
            {message && (
               <div className={`p-8 rounded-[32px] flex items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-6 duration-700 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                 </div>
                 <div className="flex-1">
                    <p className="font-black text-xs uppercase tracking-widest mb-1">{message.type === 'success' ? 'Assignment Finalized' : 'System Exception'}</p>
                    <p className="font-serif text-lg italic opacity-80">{message.text}</p>
                 </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredReviewers.length === 0 ? (
                <div className="col-span-full py-48 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                    <Search size={48} className="text-slate-100" />
                  </div>
                  <p className="text-slate-300 font-serif italic text-3xl mb-4">No experts match your scholarly criteria</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Adjust keywords or clear filters</p>
                </div>
              ) : (
                filteredReviewers.map((reviewer) => {
                  const assigned = isAlreadyAssigned(reviewer.id);
                  return (
                    <div key={reviewer.id} className={`group relative transition-all duration-500 ${assigned ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                      <div className={`flex flex-col p-10 bg-white border border-slate-100 rounded-[40px] hover:border-blue-500/40 hover:shadow-[0_32px_64px_-16px_rgba(37,99,235,0.12)] transition-all duration-700 relative z-10 overflow-hidden h-full ${assigned ? 'bg-slate-50/50' : ''}`}>
                         
                         {/* Card Decorative Background */}
                         <div className="absolute -right-8 -top-8 w-48 h-48 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                         <div className="flex justify-between items-start mb-10 relative z-20">
                            <div className="flex items-center gap-5">
                               <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[20px] flex items-center justify-center text-slate-800 font-black text-2xl shadow-inner uppercase font-serif">
                                  {reviewer.name?.charAt(0)}
                               </div>
                               <div>
                                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-[0.15em] text-xs mb-1">{reviewer.name}</h3>
                                  <p className="text-[10px] font-medium text-slate-400 tracking-tighter">{reviewer.email}</p>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6 mb-10 relative z-20 flex-1">
                            <div className="flex items-start gap-4 text-slate-500 text-[11px] font-bold leading-relaxed">
                               <Building className="flex-shrink-0 mt-0.5 text-slate-300" size={18} />
                               <span className="opacity-80 italic font-serif text-sm">{reviewer.affiliation || "Independent Scholar"}</span>
                            </div>

                            <div className="flex items-start gap-4 text-slate-600 text-[11px] font-bold">
                               <BookOpen className="mt-1 flex-shrink-0 text-blue-300" size={18} />
                               <div className="flex flex-wrap gap-2">
                                  {reviewer.interests ? reviewer.interests.split(';').map((int: string, i: number) => (
                                    <span key={i} className="bg-white border border-slate-100 text-slate-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm">{int.trim()}</span>
                                  )) : <span className="italic text-slate-300 font-serif">No specified research interests</span>}
                               </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                               <div className="flex items-center gap-2 group/workload">
                                  <ShieldCheck size={18} className={reviewer._count?.reviewsGiven > 2 ? 'text-amber-400' : 'text-emerald-400'} />
                                  <div>
                                     <p className="text-[18px] font-serif font-black text-slate-900 leading-none">{reviewer._count?.reviewsGiven || 0}</p>
                                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pending Loads</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-colors ${
                                    reviewer.role === 'EDITOR' || reviewer.role === 'EDITOR_IN_CHIEF' 
                                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                      : 'bg-slate-50 text-slate-500 border-slate-100'
                                  }`}>
                                     {reviewer.role?.replace('_', ' ')}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <button 
                           onClick={() => handleAssign(reviewer.id)}
                           disabled={assigning === reviewer.id || assigned}
                           className={`w-full relative flex items-center justify-center gap-4 px-10 py-6 rounded-[24px] font-black uppercase tracking-[0.25em] text-[10px] transition-all duration-500 overflow-hidden ${
                             assigned 
                               ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                               : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.96] disabled:opacity-50'
                           }`}
                         >
                           {assigning === reviewer.id ? (
                             <Loader2 className="animate-spin" size={20} />
                           ) : assigned ? (
                             <>
                               <CheckCircle size={20} />
                               Active on Manuscript
                             </>
                           ) : (
                             <>
                               <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                               Execute Assignment
                             </>
                           )}
                           {!assigned && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
                         </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center gap-3">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Integrity Check</span>
           </div>
           <div className="w-1 h-1 bg-slate-300 rounded-full" />
           <div className="flex items-center gap-3">
              <BookOpen size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Double-Blind Peer Review</span>
           </div>
        </div>
      </div>
    </div>
  );
}
