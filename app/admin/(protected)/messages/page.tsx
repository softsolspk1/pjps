"use client";

import { useState, useEffect } from "react";
import { Send, Users, Mail, UserCheck, Search, Filter, Sparkles, AlertCircle, ShieldCheck, Plus, X, Loader2 } from "lucide-react";
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
  const [files, setFiles] = useState<FileList | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchText, setUserSearchText] = useState("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

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

               <div className={styles.formGroup}>
                  <label className={styles.label}>Institutional Attachments</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl transition-all hover:bg-white hover:border-blue-300 group">
                     <Plus size={20} className="text-slate-400 group-hover:text-blue-500" />
                     <div className="flex-1">
                        <input 
                          type="file" 
                          multiple 
                          onChange={(e) => setFiles(e.target.files)}
                          className="w-full text-[11px] font-bold text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-black cursor-pointer"
                        />
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">PDF, DOCX, PNG or JPG (Max 10MB per file)</p>
                     </div>
                  </div>
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
                 <label className={styles.label}>Search Participant</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      value={userSearchText || specificEmail} 
                      onChange={(e) => setUserSearchText(e.target.value)}
                      placeholder="Search by name or email..."
                      className={styles.input}
                      style={{ fontSize: '13px', padding: '12px 16px' }}
                    />
                    {userSearchText && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {filteredUsers.length > 0 ? (
                             filteredUsers.map(u => (
                                <button 
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                     setSpecificEmail(u.email);
                                     setUserSearchText("");
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5 border-bottom border-slate-100 last:border-0"
                                >
                                   <span className="text-xs font-black text-slate-800">{u.name}</span>
                                   <span className="text-[10px] font-bold text-slate-400">{u.email}</span>
                                </button>
                             ))
                          ) : (
                             <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No scholars found</div>
                          )}
                       </div>
                    )}
                 </div>
                 {specificEmail && !userSearchText && (
                    <div className="mt-3 p-3 bg-blue-600 text-white rounded-xl flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest truncate">{specificEmail}</span>
                       <button onClick={() => setSpecificEmail("")}><X size={14} /></button>
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
