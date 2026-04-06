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
      <div className="relative p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl overflow-hidden group mb-10">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">Urgent Outreach</div>
               <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Pending Invitations</h1>
               <p className="text-slate-400 font-medium text-sm max-w-xl">You have been nominated as an expert referee for the following scholarly research. Please accept or decline the invitation below.</p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-blue-400 font-bold uppercase tracking-widest text-[10px] shadow-xl">
               <Bell size={16} className="animate-pulse" /> {invitations.length} Requests
            </div>
         </div>
      </div>

      {/* Invitations Feed */}
      {invitations.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Workspace Clear</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            You do not have any pending scholarly invitations at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-10 group hover:border-blue-200 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 w-4 h-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
               <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">Invitation Required</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">ID: #{inv.articleId.slice(-6).toUpperCase()}</span>
                     </div>
                     <h2 className="text-3xl font-serif font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {inv.article?.title}
                     </h2>
                     <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-amber-500" />
                           Outreach Sent: {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                        </div>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-600 text-sm leading-relaxed relative">
                        <div className="absolute top-4 left-4 text-slate-200"><BookOpen size={24} /></div>
                        <p className="line-clamp-3 pl-8">
                           {inv.article?.abstract || "Abstract content is finalizing in the editorial database."}
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[220px]">
                     <button 
                        onClick={() => handleResponse(inv.id, 'ACCEPTED')}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
                     >
                        <CheckCircle2 size={20} /> Accept & Review
                     </button>
                     <button 
                        onClick={() => handleResponse(inv.id, 'DECLINED')}
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-slate-100 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        <AlertCircle size={20} /> Decline Outreach
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Note */}
      <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-2xl font-serif font-black tracking-tight">Double-Blind protocol</h3>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed mb-0">
                  By accepting this scholarly invitation, you adhere to the PJPS dual-blind peer review integrity standards. 
                  All manuscripts are strictly confidential and must be discarded following scorecard finalization.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center border-l border-white/5 pl-10">
               <div>
                  <div className="text-5xl font-serif font-black text-blue-400">14</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Day Cycle</div>
               </div>
               <div>
                  <div className="text-5xl font-serif font-black text-emerald-400">Full</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Credit</div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
