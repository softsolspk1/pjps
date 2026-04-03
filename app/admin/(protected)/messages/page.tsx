"use client";

import { useState } from "react";
import { Send, Users, Mail, UserCheck, Search, Filter, Sparkles, AlertCircle } from "lucide-react";
import styles from "./Messages.module.css";

type FilterType = "ALL" | "AUTHORS" | "REVIEWERS" | "SPECIFIC";

export default function MessagesPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, recipientFilter: filter, specificEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        setSubject("");
        setMessage("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("An unexpected scholarly dispatch error occurred.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-serif font-black text-slate-900 mb-2 italic">Scholarly Dispatch Center</h1>
        <p className="text-slate-500">Communicate directly with authors, reviewers, and global participants through officially branded PJPS emails.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Mail size={18} className="text-blue-400" />
                <h2 className="font-bold tracking-tight">Draft Communication</h2>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded">Editorial Official</span>
            </div>

            <form onSubmit={handleSend} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Communication Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required
                  placeholder="e.g. Call for Papers - Special Issue on Pharmacognosy"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-serif italic text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Scholarly Body Content</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required
                  placeholder="Compose your scholarly message here. Standard salutations and footers will be added automatically."
                  rows={8}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {sending ? (
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></div>
                        Dispatching Scholarly Messages...
                     </div>
                  ) : (
                    <>
                      <Send size={16} /> Finalize and Dispatch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
             <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Filter size={14} className="text-blue-600" /> Dispatch Filters
             </h3>

             <div className="space-y-3">
               {[
                 { id: "ALL", label: "Global Reach (All)", icon: Users },
                 { id: "AUTHORS", label: "Scholarly Authors", icon: Search },
                 { id: "REVIEWERS", label: "Reviewer Network", icon: UserCheck },
                 { id: "SPECIFIC", label: "Targeted Individual", icon: Mail },
               ].map((item) => (
                 <button 
                   key={item.id}
                   type="button"
                   onClick={() => setFilter(item.id as FilterType)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${filter === item.id ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                 >
                   <item.icon size={16} className={filter === item.id ? 'text-blue-600' : 'text-slate-400'} />
                   <span className="text-sm">{item.label}</span>
                 </button>
               ))}
             </div>

             {filter === "SPECIFIC" && (
               <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 animate-in zoom-in-95 duration-200">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Participant Email</label>
                 <input 
                   type="email" 
                   value={specificEmail} 
                   onChange={(e) => setSpecificEmail(e.target.value)}
                   placeholder="e.g. scholar@domain.com"
                   className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
             )}

             <div className="mt-10 pt-10 border-t border-slate-100 italic text-[11px] text-slate-400 leading-relaxed">
               <p>Messages dispatched through this portal are officially recorded. Please ensure compliance with international anti-spam ethics and data privacy standards.</p>
             </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="fixed bottom-8 right-8 bg-emerald-900 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-500 border-l-8 border-emerald-400 z-50 max-w-md">
          <Sparkles size={24} className="text-emerald-400 flex-shrink-0" />
          <p className="font-bold text-sm">{result}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-900 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-500 border-l-8 border-red-400 z-50 max-w-md">
          <AlertCircle size={24} className="text-red-400 flex-shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
