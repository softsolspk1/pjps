"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Search, ShieldCheck, Mail, CheckCircle2 } from "lucide-react";

export default function AssignReviewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleRes, reviewersRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch("/api/admin/users?role=REVIEWER"),
        ]);

        const articleData = await articleRes.json();
        const reviewersData = await reviewersRes.json();

        setArticle(articleData);
        setReviewers(reviewersData.users || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedReviewerId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/articles/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId: selectedReviewerId }),
      });

      if (res.ok) {
        router.push("/admin/articles");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviewers = reviewers.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-[60vh] font-bold text-slate-400">Loading Academic Registry...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 tracking-tight">Assign Peer Reviewer</h2>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
          <ShieldCheck className="text-blue-600 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 text-sm uppercase tracking-widest mb-1 italic">Selected Manuscript</h3>
            <p className="text-lg font-serif font-bold text-slate-700 leading-snug">{article?.title}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Reviewers by name or email..."
              className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredReviewers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic font-serif">No reviewers matching your search.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredReviewers.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedReviewerId(r.id)}
                  className={`p-6 flex justify-between items-center cursor-pointer transition-all ${
                    selectedReviewerId === r.id ? "bg-blue-50 border-x-4 border-blue-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      selectedReviewerId === r.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{r.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail size={12} /> {r.email}
                      </div>
                    </div>
                  </div>
                  {selectedReviewerId === r.id && <CheckCircle2 className="text-blue-600" size={24} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold uppercase tracking-widest text-slate-600 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            disabled={!selectedReviewerId || submitting}
            onClick={handleAssign}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign Reviewer"}
          </button>
        </div>
      </div>
    </div>
  );
}
