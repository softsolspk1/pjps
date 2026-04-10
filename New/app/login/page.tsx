"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Lock, Building2, 
  ArrowRight, CheckCircle, AlertCircle,
  ShieldCheck, Loader2
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username: email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid scholarly credentials. Please verify your email and password.");
      setLoading(false);
    } else {
      router.push("/submission");
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== verifyPassword) return setError("Passwords do not match.");
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, affiliation: institution }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setSuccess(true);
      setTimeout(() => {
        setMode("LOGIN");
        setSuccess(false);
      }, 2000);
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
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">PJPS Scholar Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Official identity gateway for Pakistan Journal of Pharmaceutical Sciences</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-premium p-10">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button 
              onClick={() => setMode("LOGIN")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === "LOGIN" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode("SIGNUP")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === "SIGNUP" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake-in">
              <AlertCircle size={18} />
              <span className="text-xs font-bold leading-tight">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 animate-in zoom-in">
              <CheckCircle size={18} />
              <span className="text-xs font-bold leading-tight">Account created successfully. Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={mode === "LOGIN" ? handleLogin : handleSignUp} className="space-y-6">
            {mode === "SIGNUP" && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Author Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                      placeholder="Principal Investigator Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Institution Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                      placeholder="University or Research Center"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="scholar@university.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Password</label>
                {mode === "LOGIN" && (
                  <Link href="/forgot-password" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {mode === "SIGNUP" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Verify Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" required value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {mode === "LOGIN" ? "Continue to Submission" : "Register Scholar Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300 grayscale opacity-50">
             <ShieldCheck size={16} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Academic Identity</span>
          </div>
        </div>

        {/* Demo Credentials Table */}
        <div className="mt-6 bg-[#f4f2e6] rounded-xl overflow-hidden border border-[#dcd8c9] shadow-sm">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-[#e3e1d1] text-slate-500 font-semibold tracking-wide border-b border-[#dcd8c9]">
              <tr>
                <th className="px-4 py-3 border-r border-[#dcd8c9]">Institutional Identity</th>
                <th className="px-4 py-3 border-r border-[#dcd8c9]">Role Sovereignty</th>
                <th className="px-4 py-3">Access Key</th>
              </tr>
            </thead>
            <tbody>
              {[
                { email: "eic@pjps.pk", role: "Editor-in-Chief" },
                { email: "finance@pjps.pk", role: "Finance Admin" },
                { email: "editor@pjps.pk", role: "Associate Editor" },
                { email: "reviewer@pjps.pk", role: "Peer Reviewer" },
                { email: "author@pjps.pk", role: "Scholarly Author" },
              ].map((demo, idx) => (
                <tr key={idx} className="border-b border-[#dcd8c9] last:border-0 hover:bg-[#ebe8db] transition-colors">
                  <td className="px-4 py-2.5 border-r border-[#dcd8c9]">
                    <span className="px-2 py-1 bg-[#dcdad0] text-[#ba2a2a] rounded-md font-mono text-[12px] tracking-tight">
                      {demo.email}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-[#dcd8c9] font-bold text-slate-600">
                    {demo.role}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-1 bg-[#dcdad0] text-[#ba2a2a] rounded-md font-mono text-[12px] tracking-tight">
                      Softsols@123
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
