"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserPlus, Mail, Shield, 
  CheckCircle, AlertCircle, ChevronLeft,
  Building2, User, Lock, ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    affiliation: "",
    role: "REVIEWER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to provision account");

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/users");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link href="/admin/users" className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
        </Link>
      </div>

      <header className="bg-slate-900 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-blue-500/20">
          <UserPlus size={120} strokeWidth={1} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-2">Expert Provisioning</h2>
          <p className="text-blue-300 font-medium">Create and authorize scholarly accounts for editors and peer reviewers.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-premium p-12 space-y-10">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in shake-in">
            <AlertCircle size={20} />
            <span className="text-sm font-bold tracking-wide">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 animate-in zoom-in">
            <CheckCircle size={20} />
            <span className="text-sm font-bold tracking-wide">Scholarly account provisioning complete. Access granted.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">Full Identity Name</label>
             <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="e.g. Prof. Dr. Ahmed Khan"
                />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">Institutional Email</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required 
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="name@university.edu.pk"
                />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">System Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required 
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="Temporary password..."
                />
             </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">System Access Role</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold uppercase tracking-widest appearance-none"
                >
                  <option value="EDITOR">SECTION EDITOR</option>
                  <option value="REVIEWER">PEER REVIEWER</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                  <option value="AUTHOR">AUTHOR</option>
                </select>
              </div>
           </div>

           <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">Primary Institutional Affiliation</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required 
                  value={formData.affiliation} onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="University Department / Research Center"
                />
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
           <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
             An official invitation and credential notice will be generated for the expert upon successful provisioning.
           </p>
           <button 
             type="submit" 
             disabled={loading}
             className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 active:scale-95 disabled:grayscale"
           >
             {loading ? <Loader2 className="animate-spin" size={18} /> : (
               <>Authorize & Create Profile <ArrowRight size={18} /></>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
