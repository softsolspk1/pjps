"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Bell, FileText, Clock, CheckCircle2, ChevronRight, 
  Search, Filter, BookOpen, Layers,
  ShieldCheck, AlertCircle, Award
} from "lucide-react";
import { format } from "date-fns";

export default function ReviewerInvitationsPage() {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        const assignments = data.reviews || [];
        // Filter to only show Invited assignments
        setInvitations(assignments.filter((r: any) => r.status === 'INVITED'));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleResponse(reviewId: string, response: 'ACCEPTED' | 'DECLINED') {
    if (!confirm(`Are you sure you want to ${response.toLowerCase()} this scholarly invitation?`)) return;
    try {
      const res = await fetch("/api/reviewer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, response })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Response error:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Expert Invitations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">Pending Invitations</h1>
          <p className="text-slate-500 font-medium text-sm">Review incoming scholarly requests and confirm your availability for expert peer review.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-black uppercase tracking-widest text-[10px]">
          <Bell size={14} className="animate-pulse" /> {invitations.length} New Requests
        </div>
      </div>

      {/* Registry Grid/List */}
      {invitations.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Pending Invitations</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            You are currently up-to-date with all scholarly requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-8 group hover:border-blue-200 transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">Action Required</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight font-mono">ID: #{inv.articleId.slice(-6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl font-serif font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {inv.article?.title}
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      Received {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {inv.article?.abstract || "Abstract not available in current snippet."}
                  </div>
                </div>
                
                <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[180px]">
                  <button 
                    onClick={() => handleResponse(inv.id, 'ACCEPTED')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/10 active:scale-95"
                  >
                    <CheckCircle2 size={18} /> Accept
                  </button>
                  <button 
                    onClick={() => handleResponse(inv.id, 'DECLINED')}
                    className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-slate-100 px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <AlertCircle size={18} /> Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role of Expert Note */}
      <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-2xl font-serif font-black tracking-tight">The Peer Review Mandate</h3>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed mb-0">
                  Expert peer review is the cornerstone of scholarly integrity at PJPS. By accepting an invitation, you agree to provide impartial, high-fidelity feedback within the specified institutional timeline. 
                  <br /><br />
                  If you have any conflict of interest (institutional or personal) regarding this research, please select <strong>Decline</strong> so an alternative expert referee can be invited.
               </p>
            </div>
            <div className="w-1 bg-white/5 self-stretch rounded-full" />
            <div className="flex flex-col gap-6">
               <div className="text-center">
                  <div className="text-4xl font-serif font-black text-blue-400 mb-1">14</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Days to Review</div>
               </div>
               <div className="text-center">
                  <div className="text-4xl font-serif font-black text-emerald-400 mb-1">Double</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Blind Protocol</div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
