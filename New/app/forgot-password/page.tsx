"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recovery request failed");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 text-white font-serif font-bold text-2xl">
            P
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Recover Scholarly Identity</h1>
          <p className="text-slate-500 mt-2 font-medium">Verify your registered institutional email to receive a recovery link.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-premium p-10">
          {success ? (
            <div className="text-center animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={40} />
               </div>
               <h2 className="text-xl font-bold text-slate-900 mb-2">Institutional Link Dispatched</h2>
               <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                 A secure password recovery link has been sent to <strong>{email}</strong>. Please check your scholarly inbox.
               </p>
               <Link 
                 href="/login"
                 className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all"
               >
                 <ArrowLeft size={16} /> Return to Login
               </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake-in">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold leading-tight">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                    placeholder="scholar@university.edu"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Request Recovery Link
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <Link 
                  href="/login"
                  className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300 grayscale opacity-50">
             <ShieldCheck size={16} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Security Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
