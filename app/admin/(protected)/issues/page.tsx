"use client";

import { useEffect, useState } from "react";
import { 
  Library, Plus, Calendar, Save, Loader2, BookOpen, 
  CheckCircle, AlertCircle, Trash2, Globe, Layers 
} from "lucide-react";
import styles from "@/components/AdminTable.module.css";

export default function IssuesManagement() {
  const [volumes, setVolumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [newVolume, setNewVolume] = useState({ number: "", year: new Date().getFullYear().toString() });
  const [newIssue, setNewIssue] = useState({ volumeId: "", number: "", month: "June" });

  useEffect(() => {
    fetchVolumes();
  }, []);

  async function fetchVolumes() {
    try {
      const res = await fetch("/api/admin/volumes");
      const data = await res.json();
      if (Array.isArray(data)) setVolumes(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/volumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVolume)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Volume created successfully!" });
        setNewVolume({ number: "", year: new Date().getFullYear().toString() });
        fetchVolumes();
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to create volume" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIssue)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "Issue created successfully!" });
        setNewIssue({ volumeId: "", number: "", month: "June" });
        fetchVolumes();
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to create issue" });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (issueId: string, currentState: boolean) => {
    try {
      await fetch("/api/admin/issues", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: issueId, isPublished: !currentState })
      });
      fetchVolumes();
    } catch (err) {
       console.error("Status update failed");
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#a0aec0', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em' }}>
      Registry Initializing...
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Scholarly Catalog Management</p>
           <h1>Journal Archive Catalog</h1>
        </div>
      </header>

      {message && (
        <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '40px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fff5f5', color: message.type === 'success' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
           {volumes.map((vol) => (
             <div key={vol.id} style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #edf2f7', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ backgroundColor: '#1a202c', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 800, color: 'white' }}>Volume {vol.number}</h3>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>Academic Registry Year {vol.year}</p>
                   </div>
                   <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {vol.issues?.length || 0} Issues Cataloged
                   </div>
                </div>
                
                <div style={{ padding: '30px' }}>
                   {vol.issues?.length === 0 ? (
                     <p style={{ color: '#a0aec0', fontStyle: 'italic', fontSize: '13px' }}>No scholarly issues currently cataloged in this volume entry.</p>
                   ) : (
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {vol.issues.map((issue: any) => (
                          <div key={issue.id} style={{ padding: '24px', backgroundColor: '#fcfdfe', border: '1px solid #edf2f7', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                             <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Issue {issue.number}</div>
                                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1a202c' }}>{issue.month}</div>
                             </div>
                             <button 
                               onClick={() => handleTogglePublished(issue.id, issue.isPublished)}
                               style={{ 
                                 width: '100%',
                                 padding: '10px', 
                                 borderRadius: '10px', 
                                 border: 'none',
                                 fontSize: '10px', 
                                 fontWeight: 900, 
                                 textTransform: 'uppercase', 
                                 letterSpacing: '0.1em',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s ease',
                                 backgroundColor: issue.isPublished ? '#ecfdf5' : '#f7fafc',
                                 color: issue.isPublished ? '#10b981' : '#718096'
                               }}
                             >
                               {issue.isPublished ? 'Published' : 'Mark as Draft'}
                             </button>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
           <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#1a202c', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Plus size={18} color="#0061ff" /> New Volume Creation
              </h3>
              <form onSubmit={handleCreateVolume} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Volume Identifier</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '14px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '12px', outline: 'none', fontWeight: 700 }}
                      value={newVolume.number}
                      onChange={(e) => setNewVolume({...newVolume, number: e.target.value})}
                      required
                    />
                 </div>
                 <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Institutional Year</label>
                    <input 
                      type="number" 
                      style={{ width: '100%', padding: '14px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '12px', outline: 'none', fontWeight: 700 }}
                      value={newVolume.year}
                      onChange={(e) => setNewVolume({...newVolume, year: e.target.value})}
                      required
                    />
                 </div>
                 <button disabled={saving} style={{ width: '100%', padding: '16px', backgroundColor: '#0061ff', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <span>Catalog New Volume</span>}
                 </button>
              </form>
           </div>

           <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#1a202c', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <BookOpen size={18} color="#0061ff" /> Issue Onboarding
              </h3>
              <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Target Volume Registry</label>
                    <select 
                      style={{ width: '100%', padding: '14px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '12px', outline: 'none', fontWeight: 700 }}
                      value={newIssue.volumeId}
                      onChange={(e) => setNewIssue({...newIssue, volumeId: e.target.value})}
                      required
                    >
                      <option value="">Select Target Volume</option>
                      {volumes.map(v => <option key={v.id} value={v.id}>Volume {v.number} ({v.year})</option>)}
                    </select>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                       <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Issue No.</label>
                       <input 
                         type="number" 
                         style={{ width: '100%', padding: '14px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '12px', outline: 'none', fontWeight: 700 }}
                         value={newIssue.number}
                         onChange={(e) => setNewIssue({...newIssue, number: e.target.value})}
                         required
                       />
                    </div>
                    <div>
                       <label style={{ fontSize: '10px', fontWeight: 800, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Month</label>
                       <select 
                         style={{ width: '100%', padding: '14px', backgroundColor: '#f7fafc', border: '1px solid #edf2f7', borderRadius: '12px', outline: 'none', fontWeight: 700 }}
                         value={newIssue.month}
                         onChange={(e) => setNewIssue({...newIssue, month: e.target.value})}
                         required
                       >
                         {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                           <option key={m} value={m}>{m}</option>
                         ))}
                       </select>
                    </div>
                 </div>
                 <button disabled={saving} style={{ width: '100%', padding: '16px', border: '1px solid #edf2f7', backgroundColor: 'white', color: '#1a202c', marginTop: '10px', borderRadius: '12px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <span>Catalog New Issue</span>}
                 </button>
              </form>
           </div>
        </aside>
      </div>
    </div>
  );
}
