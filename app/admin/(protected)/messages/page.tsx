"use client";

import { useState, useEffect } from "react";
import { Send, Mail, UserCheck, Search, Filter, Sparkles, AlertCircle, ShieldCheck, Plus, X, Loader2 } from "lucide-react";
import styles from "./MessagesUpgrade.module.css";

type FilterType = "ALL" | "AUTHORS" | "REVIEWERS" | "SPECIFIC";

export default function MessagesPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchText, setUserSearchText] = useState("");

  useEffect(() => {
    if (filter === "SPECIFIC") {
      fetch("/api/admin/users")
        .then(res => res.json())
        .then(data => setAllUsers(Array.isArray(data) ? data : []))
        .catch(() => setAllUsers([]));
    }
  }, [filter]);

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearchText.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearchText.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("recipientFilter", filter);
      formData.append("specificEmail", specificEmail);
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }

      const res = await fetch("/api/admin/messages", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        setSubject("");
        setMessage("");
        setFiles(null);
        setSpecificEmail("");
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
                <Mail size={24} />
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Scholarly Draft Transmission</h2>
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

               <div className={styles.formGroup}>
                  <label className={styles.label}>Institutional Attachments</label>
                  <div className={styles.uploadZone}>
                     <Plus size={24} />
                     <div style={{ flex: 1 }}>
                        <input 
                          type="file" 
                          multiple 
                          onChange={(e) => setFiles(e.target.files)}
                          className={styles.fileInput}
                        />
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '0.1em' }}>PDF, DOCX, PNG or JPG (Max 10MB per file)</p>
                     </div>
                  </div>
               </div>

              <button 
                type="submit" 
                disabled={sending}
                className={styles.submitBtn}
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Send size={20} /> Finalize and Dispatch
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.filterCard}>
             <h3 className={styles.filterHeader}>
               <Filter size={18} /> Dispatch Target
             </h3>

             <div className={styles.filterList}>
               {[
                 { id: "ALL", label: "Global Presence (All)", icon: UserCheck },
                 { id: "AUTHORS", label: "Scholarly Authors", icon: Send },
                 { id: "REVIEWERS", label: "Reviewer Network", icon: ShieldCheck },
                 { id: "SPECIFIC", label: "Targeted Individual", icon: Mail },
               ].map((item) => (
                 <button 
                   key={item.id}
                   type="button"
                   onClick={() => setFilter(item.id as FilterType)}
                   className={`${styles.filterBtn} ${filter === item.id ? styles.filterBtnActive : ''}`}
                 >
                   <item.icon size={20} className={styles.btnIcon} />
                   <span>{item.label}</span>
                 </button>
               ))}
             </div>

             {filter === "SPECIFIC" && (
               <div className={styles.specificGroup}>
                 <label className={styles.label}>Search Participant</label>
                 <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={userSearchText || specificEmail} 
                      onChange={(e) => setUserSearchText(e.target.value)}
                      placeholder="Search by name or email..."
                      className={styles.input}
                      style={{ fontSize: '0.9rem', padding: '1.25rem' }}
                    />
                    {userSearchText && (
                       <div className={styles.resultsList}>
                          {filteredUsers.length > 0 ? (
                             filteredUsers.map(u => (
                                <button 
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                     setSpecificEmail(u.email);
                                     setUserSearchText("");
                                  }}
                                  className={styles.resultItem}
                                >
                                   <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a' }}>{u.name}</div>
                                   <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{u.email}</div>
                                </button>
                             ))
                          ) : (
                             <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>No scholars found</div>
                          )}
                       </div>
                    )}
                 </div>
                 {specificEmail && !userSearchText && (
                    <div className={styles.userBadge}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{specificEmail}</span>
                       <button onClick={() => setSpecificEmail("")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                 )}
               </div>
             )}

             <div className={styles.specificGroup}>
               <p className={styles.sidebarInfo}>
                 Editorial dispatches are archived for institutional transparency. Please ensure all communications adhere to PJP scholarly ethics and international anti-spam standards.
               </p>
             </div>
          </div>
        </div>
      </div>

      {result && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <Sparkles size={24} />
          <p>{result}</p>
        </div>
      )}

      {error && (
        <div className={`${styles.toast} ${styles.toastError}`}>
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
