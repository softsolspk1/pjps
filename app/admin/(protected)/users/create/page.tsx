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
import styles from "@/components/AdminTable.module.css";

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
    <div className={styles.container} style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Expert Registry
        </Link>
      </div>

      <header className={styles.header} style={{ backgroundColor: '#1a202c', padding: '60px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'white' }}>
          <UserPlus size={180} />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
           <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Expert Provisioning</h1>
           <p style={{ color: '#718096', fontWeight: 600, fontSize: '14px' }}>Authorize and enroll new institutional contributors into the editorial ecosystem.</p>
        </div>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #edf2f7', padding: '60px', marginTop: '40px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        {error && (
          <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '40px', backgroundColor: '#fff5f5', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '40px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
            <CheckCircle size={20} /> Scholarly account provisioning complete.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>Full Identity Name</label>
            <div style={{ position: 'relative' }}>
               <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} size={18} />
               <input 
                 type="text" required 
                 value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                 style={{ width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '14px', outline: 'none', fontWeight: 600, fontSize: '14px' }}
                 placeholder="e.g. Dr. Ahmed Khan"
               />
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>Institutional Email</label>
            <div style={{ position: 'relative' }}>
               <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} size={18} />
               <input 
                 type="email" required 
                 value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                 style={{ width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '14px', outline: 'none', fontWeight: 600, fontSize: '14px' }}
                 placeholder="name@university.edu.pk"
               />
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>Registry Password</label>
            <div style={{ position: 'relative' }}>
               <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} size={18} />
               <input 
                 type="password" required 
                 value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                 style={{ width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '14px', outline: 'none', fontWeight: 600, fontSize: '14px' }}
                 placeholder="••••••••••••"
               />
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>System Access Role</label>
            <div style={{ position: 'relative' }}>
               <Shield style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} size={18} />
               <select 
                 value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                 style={{ width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '14px', outline: 'none', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', appearance: 'none' }}
               >
                 <option value="SECTION_EDITOR">SECTION EDITOR</option>
                 <option value="REVIEWER">PEER REVIEWER</option>
                 <option value="ADMIN">ADMINISTRATOR</option>
                 <option value="AUTHOR">AUTHOR</option>
               </select>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>Primary Institutional Affiliation</label>
            <div style={{ position: 'relative' }}>
               <Building2 style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} size={18} />
               <input 
                 type="text" required 
                 value={formData.affiliation} onChange={(e) => setFormData({...formData, affiliation: e.target.value})}
                 style={{ width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '14px', outline: 'none', fontWeight: 600, fontSize: '14px' }}
                 placeholder="University / Research Institute"
               />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #edf2f7' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '18px 40px', backgroundColor: '#0061ff', color: 'white', borderRadius: '14px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0, 97, 255, 0.2)' }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Authorize & Provision Expert <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
