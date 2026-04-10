"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Landmark, BookOpen, GraduationCap, Save, Loader2, CheckCircle, AlertCircle, Globe, ShieldCheck } from "lucide-react";
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
        setMessage({ type: 'success', text: "Institutional profile updated successfully!" });
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Scholar Identity...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        
        {/* Left Side: Scholar Summary */}
        <div className={styles.sidebar}>
          <div className={styles.avatar}>
            {formData.name.charAt(0) || "U"}
          </div>
          <h2 className={styles.userName}>{formData.name}</h2>
          <p className={styles.userRole}>Verified {session?.user?.role || "Author"}</p>
          
          <div className={styles.infoList}>
             <div className={styles.infoItem}>
                <Mail size={16} className={styles.infoIcon} />
                <span>{formData.email}</span>
             </div>
             {formData.orcid && (
               <div className={styles.infoItem}>
                  <Globe size={16} className="text-emerald-500" />
                  <span className="font-bold text-emerald-600">{formData.orcid}</span>
               </div>
             )}
             <div className={styles.infoItem}>
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Platinum Integrity Verified</span>
             </div>
          </div>
        </div>

        {/* Right Side: Professional Identity Form */}
        <div className={styles.formArea}>
          <div className={styles.formHeader}>
             <h1 className={styles.formTitle}>Professional Identity</h1>
             <p className={styles.formDesc}>Manage your academic credentials and institutional affiliations recorded within the PJPS registry.</p>
          </div>

          {message && (
            <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formGroup}>
               <label className={styles.label}>Full Academic Name</label>
               <div className={styles.inputWrapper}>
                  <User className={styles.fieldIcon} size={18} />
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={styles.input}
                    placeholder="Your legal scholarly name"
                  />
               </div>
            </div>

            <div className={styles.formGroup}>
               <label className={styles.label}>ORCID ID</label>
               <div className={styles.inputWrapper}>
                  <Globe className={styles.fieldIcon} size={18} />
                  <input 
                    type="text" 
                    value={formData.orcid} 
                    onChange={(e) => setFormData({...formData, orcid: e.target.value})}
                    className={styles.input}
                    placeholder="0000-0000-0000-0000"
                  />
               </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
               <label className={styles.label}>Institutional Affiliation</label>
               <div className={styles.inputWrapper}>
                  <Landmark className={styles.fieldIcon} size={18} />
                  <input 
                    type="text" 
                    value={formData.affiliation} 
                    onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                    className={styles.input}
                    placeholder="University Faculty, Department, or Research Institute"
                  />
               </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
               <label className={styles.label}>Research Expertise / Interests</label>
               <div className={styles.inputWrapper}>
                  <GraduationCap className={styles.areaIcon} size={18} />
                  <textarea 
                    value={formData.interests} 
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className={styles.textarea}
                    placeholder="e.g. Clinical Pharmacology, Biomedical Engineering, Neurosciences..."
                  />
               </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
               <label className={styles.label}>Professional Biography</label>
               <div className={styles.inputWrapper}>
                  <BookOpen className={styles.areaIcon} size={18} />
                  <textarea 
                    value={formData.biography} 
                    onChange={(e) => setFormData({...formData, biography: e.target.value})}
                    className={styles.textarea}
                    placeholder="Brief overview of your academic background and scholarly contributions..."
                  />
               </div>
            </div>

            <div className={styles.fullRow}>
               <button disabled={saving} type="submit" className={styles.submitBtn}>
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Authenticate & Save Profile</>}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

