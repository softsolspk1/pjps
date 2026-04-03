"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { User, Search, UserPlus, ArrowLeft, Loader2, CheckCircle, AlertCircle, Building, BookOpen } from "lucide-react";
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
      r.email?.toLowerCase().includes(search.toLowerCase())
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
        setMessage({ type: 'success', text: "Reviewer assigned successfully!" });
        // Refresh local assignments if we had them in the article object
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

  if (loading) return <div className="flex justify-center items-center h-[60vh] text-slate-400 font-bold uppercase tracking-widest text-xs font-serif">Registry Initializing...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold uppercase tracking-widest text-xs transition-colors">
        <ArrowLeft size={16} /> Back to Manuscript
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Assign Peer Reviewers</h1>
        <p className="text-slate-500 font-medium italic">Manuscript: {article?.title}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reviewers by name, expertise, or institution..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-8">
          {message && (
             <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
               {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
               <span className="font-bold text-sm">{message.text}</span>
             </div>
          )}

          <div className="space-y-6">
            {filteredReviewers.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-serif italic">
                No experts found matching your criteria.
              </div>
            ) : (
              filteredReviewers.map((reviewer) => (
                <div key={reviewer.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-widest text-sm">{reviewer.name} {reviewer.role === 'EDITOR' ? '(Section Editor)' : ''}</h3>
                        <p className="text-sm text-slate-400">{reviewer.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                       {reviewer.affiliation && (
                         <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                           <Building size={14} /> {reviewer.affiliation}
                         </div>
                       )}
                       {reviewer.interests && (
                         <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                           <BookOpen size={14} /> {reviewer.interests}
                         </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-0 md:ml-8">
                    <button 
                      onClick={() => handleAssign(reviewer.id)}
                      disabled={assigning === reviewer.id}
                      className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {assigning === reviewer.id ? <Loader2 className="animate-spin" size={16} /> : <><UserPlus size={16} /> Proceed with Assignment</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
