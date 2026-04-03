"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Landmark, BookOpen, GraduationCap, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orcid: "",
    affiliation: "",
    biography: "",
    interests: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            orcid: data.orcid || "",
            affiliation: data.affiliation || "",
            biography: data.biography || "",
            interests: data.interests || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Profile updated successfully!" });
        await update(); // Refresh session
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="container section-padding max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Professional Profile</h1>
        <p className="text-slate-500">Manage your academic identity and institutional affiliations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-serif font-bold">
              {formData.name.charAt(0) || "U"}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{formData.name}</h2>
            <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider font-bold">{session?.user?.role}</p>
            <div className="text-left space-y-4 pt-6 border-t border-slate-200">
               <div className="flex items-center gap-3 text-sm text-slate-600">
                 <Mail size={16} className="text-slate-400" />
                 <span>{formData.email}</span>
               </div>
               {formData.orcid && (
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                   <Globe size={16} className="text-emerald-500" />
                   <span className="font-medium">{formData.orcid}</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.input}
                  placeholder="Your full academic name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={styles.formGroup}>
                <label className={styles.label}>ORCID ID</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600">iD</span>
                  <input 
                    type="text" 
                    value={formData.orcid} 
                    onChange={(e) => setFormData({...formData, orcid: e.target.value})}
                    className={styles.input}
                    placeholder="0000-0000-0000-0000"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Institutional Affiliation</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.affiliation} 
                    onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                    className={styles.input}
                    placeholder="University / Department"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Research Interests / Expertise</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea 
                  value={formData.interests} 
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className={styles.textarea}
                  rows={2}
                  placeholder="e.g. Pharmacology, Pharmaceutics, Clinical Trials..."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Short Biography</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea 
                  value={formData.biography} 
                  onChange={(e) => setFormData({...formData, biography: e.target.value})}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Professional background and academic achievements..."
                />
              </div>
            </div>

            <button disabled={saving} type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Professional Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Minimal icons for the sidebar
function Globe({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
