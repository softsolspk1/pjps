"use client";

import { useState } from "react";
import { Send, Users, Mail, UserCheck, Search, Filter, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
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
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Editorial Dispatch Center</h1>
        <p className={styles.subtitle}>Execute officially branded communications with authors, reviewers, and global scholarly participants.</p>
      </header>

      <div className={styles.grid}>
        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerTitle}>
                <Mail size={18} color="#60a5fa" />
                <h2 style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em' }}>Scholarly Draft Transmission</h2>
              </div>
              <span className={styles.headerLabel}>Institutional Official</span>
            </div>

            <form onSubmit={handleSend} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Communication Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required
                  placeholder="e.g. Call for Papers - Special Scholarly Issue"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Scholarly Body Content</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required
                  placeholder="Compose your editorial message here. Official salutations and institutional footers will be appended automatically."
                  className={styles.textarea}
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className={styles.submitBtn}
              >
                {sending ? (
                   <div className={styles.loader}>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      Finalizing Dispatch...
                   </div>
                ) : (
                  <>
                    <Send size={16} /> Finalize and Dispatch
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.filterCard}>
             <h3 className={styles.filterHeader}>
               <Filter size={14} color="#0061ff" /> Dispatch Target
             </h3>

             <div className={styles.filterList}>
               {[
                 { id: "ALL", label: "Global Presence (All)", icon: Users },
                 { id: "AUTHORS", label: "Scholarly Authors", icon: Search },
                 { id: "REVIEWERS", label: "Reviewer Network", icon: UserCheck },
                 { id: "SPECIFIC", label: "Targeted Individual", icon: Mail },
               ].map((item) => (
                 <button 
                   key={item.id}
                   type="button"
                   onClick={() => setFilter(item.id as FilterType)}
                   className={`${styles.filterBtn} ${filter === item.id ? styles.filterBtnActive : ''}`}
                 >
                   <item.icon size={16} className={styles.btnIcon} />
                   <span className={styles.btnText}>{item.label}</span>
                 </button>
               ))}
             </div>

             {filter === "SPECIFIC" && (
               <div className={styles.specificGroup}>
                 <label className={styles.label}>Participant Email</label>
                 <input 
                   type="email" 
                   value={specificEmail} 
                   onChange={(e) => setSpecificEmail(e.target.value)}
                   placeholder="scholar@organization.edu"
                   className={styles.input}
                   style={{ fontSize: '13px', padding: '12px 16px' }}
                 />
               </div>
             )}

             <div className={styles.specificGroup}>
               <p className={styles.sidebarInfo}>
                 Editorial dispatches are archived for institutional transparency. Please ensure all communications adhere to PJP scholarly ethics and international anti-spam standards.
               </p>
             </div>
          </div>

          <div className={styles.filterCard} style={{ backgroundColor: '#fcfdfe', border: '1px solid #edf2f7' }}>
             <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#1a202c', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="#0061ff" /> Data Sovereignty
             </h4>
             <p style={{ fontSize: '11px', color: '#718096', lineHeight: 1.6, fontWeight: 500 }}>
                This channel utilizes the secure Softsols SMTP registry. Tracking is enabled for all institutional official correspondences.
             </p>
          </div>
        </div>
      </div>

      {result && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <Sparkles size={24} color="#34d399" />
          <p style={{ fontWeight: 800, fontSize: '14px' }}>{result}</p>
        </div>
      )}

      {error && (
        <div className={`${styles.toast} ${styles.toastError}`}>
          <AlertCircle size={24} color="#f87171" />
          <p style={{ fontWeight: 800, fontSize: '14px' }}>{error}</p>
        </div>
      )}
    </div>
  );
}
