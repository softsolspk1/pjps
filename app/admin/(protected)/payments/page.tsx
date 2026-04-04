"use client";

import { useState, useEffect } from "react";
import { CreditCard, ExternalLink, CheckCircle, XCircle, Clock, Search, AlertCircle, FileText, User } from "lucide-react";
import styles from "./Payments.module.css";

export default function PaymentsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId("");
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.authors[0]?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-serif">Loading Scholarly Payment Registry...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 text-blue-600 mb-2">
              <CreditCard size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Institutional Finance</span>
           </div>
           <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight italic">Fee Verification Dashboard</h1>
           <p className="text-slate-500 mt-2 font-medium">Review and cross-reference processing and publication fees for global submissions.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by manuscript title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-sm"
          />
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuscript Details</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Track</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Origin</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Link</th>
               <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredArticles.map((article: any) => (
              <tr key={article.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-6 max-w-sm">
                  <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">{article.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <User size={12} />
                    <span>{article.authors[0]?.name || "Anonymous Scholar"}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    article.trackingType === 'FAST' ? 'bg-amber-100 text-amber-700' : 
                    article.trackingType === 'ULTRA_FAST' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {article.trackingType}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                    <span className={article.origin === 'PAKISTANI' ? 'text-emerald-600' : 'text-blue-600'}>{article.origin}</span>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center">
                    {article.paymentStatus === 'PAID' ? (
                       <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><CheckCircle size={14} /> Verified</span>
                    ) : article.paymentStatus === 'PENDING' ? (
                       <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs animate-pulse"><Clock size={14} /> Screening</span>
                    ) : (
                       <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xs"><AlertCircle size={14} /> UNPAID</span>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  {article.paymentProofUrl ? (
                    <a 
                      href={article.paymentProofUrl} 
                      target="_blank" 
                      className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                    >
                      <FileText size={14} /> View Artifact <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium italic">No proof uploaded</span>
                  )}
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {article.paymentStatus !== 'PAID' && (
                      <button 
                        onClick={() => updateStatus(article.id, 'PAID')}
                        disabled={updatingId === article.id}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                        title="Approve Payment"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {article.paymentStatus !== 'REJECTED' && (
                      <button 
                        onClick={() => updateStatus(article.id, 'REJECTED')}
                        disabled={updatingId === article.id}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                        title="Reject Payment"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-slate-50/30">
             <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
               <Search size={32} />
             </div>
             <p className="text-slate-400 font-serif text-lg italic italic">No scholarly payment records found matching your filters.</p>
          </div>
        )}
      </div>

      <div className="mt-10 p-6 bg-slate-900 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/10 rounded-xl text-blue-400">
             <CreditCard size={20} />
           </div>
           <div>
              <h4 className="font-bold text-sm">Policy Reminder</h4>
              <p className="text-xs text-slate-400 mt-1">Submission fees are non-refundable. Marking an article as "Verified" will allow authors to proceed to the peer-review phase.</p>
           </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          PJPS Administrative Protocol
        </div>
      </div>
    </div>
  );
}
