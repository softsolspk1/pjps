"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Shield, Mail, Building2, 
  ArrowLeft, Loader2, CheckCircle, 
  AlertCircle, ShieldCheck, Save
} from "lucide-react";
import Link from "next/link";
import styles from "./UserEdit.module.css";

const ROLES = [
  "ADMIN", 
  "EDITOR_IN_CHIEF", 
  "ASSOCIATE_EDITOR", 
  "FINANCE_ADMIN", 
  "REVIEWER", 
  "AUTHOR",
  "DESIGNER"
];

export default function UserEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [affiliation, setAffiliation] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user");
      setUser(data);
      setRole(data.role);
      setAffiliation(data.affiliation || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, affiliation }),
      });

      if (!res.ok) throw new Error("Failed to update institutional role");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loader}><Loader2 className="animate-spin" size={40} color="#0061ff" /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/users" className={styles.backBtn}>
           <ArrowLeft size={16} /> User Registry
        </Link>
        <div className={styles.titleGroup}>
           <div className={styles.badge}>Institutional Identity</div>
           <h1 className={styles.title}>Calibrate Expert Role</h1>
           <p className={styles.subtitle}>Modify the administrative permissions and institutional affiliation for **{user?.name}**.</p>
        </div>
      </header>

      <div className={styles.grid}>
         <div className={styles.mainCard}>
            <form onSubmit={handleUpdate} className={styles.form}>
               {error && (
                 <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                 </div>
               )}
               
               {success && (
                 <div className={styles.successBanner}>
                    <CheckCircle size={18} />
                    <span>Institutional role updated successfully.</span>
                 </div>
               )}

               <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name (Read Only)</label>
                  <div className={styles.readonlyField}>
                     <User size={16} color="#a0aec0" />
                     <span>{user?.name}</span>
                  </div>
               </div>

               <div className={styles.formGroup}>
                  <label className={styles.label}>Electronic Mail (Read Only)</label>
                  <div className={styles.readonlyField}>
                     <Mail size={16} color="#a0aec0" />
                     <span>{user?.email}</span>
                  </div>
               </div>

               <div className={styles.formGroup}>
                  <label className={styles.label}>Institutional Role</label>
                  <div className={styles.inputWrapper}>
                     <Shield className={styles.inputIcon} size={18} />
                     <select 
                       value={role} 
                       onChange={(e) => setRole(e.target.value)}
                       className={styles.select}
                     >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className={styles.formGroup}>
                  <label className={styles.label}>Faculty Affiliation</label>
                  <div className={styles.inputWrapper}>
                     <Building2 className={styles.inputIcon} size={18} />
                     <input 
                       type="text" 
                       value={affiliation} 
                       onChange={(e) => setAffiliation(e.target.value)}
                       className={styles.input}
                       placeholder="e.g. University of Karachi"
                     />
                  </div>
               </div>

               <button type="submit" disabled={saving} className={styles.submitBtn}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Save size={18} /> Update User Identity
                    </>
                  )}
               </button>
            </form>
         </div>

         <div className={styles.sidebar}>
            <div className={styles.infoCard}>
               <h3 className={styles.infoTitle}>Role Glossary</h3>
               <div className={styles.roleList}>
                  <div className={styles.roleItem}>
                     <strong>EDITOR IN CHIEF</strong>
                     <p>Full administrative and fiscal sovereignty across the PJPS portal.</p>
                  </div>
                  <div className={styles.roleItem}>
                     <strong>ASSOCIATE EDITOR</strong>
                     <p>Authorized for reviewer assignments and manuscript screenings.</p>
                  </div>
                  <div className={styles.roleItem}>
                     <strong>FINANCE ADMIN</strong>
                     <p>Exclusive access to pricing schema and payment verifications.</p>
                  </div>
               </div>
            </div>

            <div className={styles.securityCard}>
               <ShieldCheck size={24} color="#0061ff" />
               <p>Role modifications are logged for institutional audit purposes. Ensure changes align with current faculty mandates.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
