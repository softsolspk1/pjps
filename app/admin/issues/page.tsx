"use client";

import { useEffect, useState } from "react";
import { 
  Library, Plus, Calendar, Save, Loader2, BookOpen, 
  CheckCircle, AlertCircle, Trash2, Globe, Layers 
} from "lucide-react";
import styles from "./issues.module.css";

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
       console.error("Link update failed");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh] font-bold text-slate-400 uppercase tracking-widest text-xs">Registry Initializing...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Editorial Administration</h1>
        <p className="text-slate-500 font-medium">Manage scholarly volumes, issues, and continuous publishing cycles.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Library className="text-blue-600" size={24} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Publication Registry</h2>
            </div>

            <div className="space-y-6">
              {volumes.map((vol) => (
                <div key={vol.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-premium transition-all">
                  <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-serif font-bold">Volume {vol.number}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Year {vol.year}</p>
                    </div>
                    <div className="bg-blue-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                       {vol.issues?.length || 0} Issues
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {vol.issues?.length === 0 ? (
                      <p className="text-sm text-slate-400 italic font-serif">No issues currently cataloged in this volume.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vol.issues.map((issue: any) => (
                          <div key={issue.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Issue {issue.number}</div>
                              <div className="font-bold text-slate-800">{issue.month || "N/A"}</div>
                            </div>
                            <button 
                              onClick={() => handleTogglePublished(issue.id, issue.isPublished)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                issue.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {issue.isPublished ? 'Published' : 'Draft'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" /> New Volume
            </h3>
            <form onSubmit={handleCreateVolume} className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Volume Number</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    value={newVolume.number}
                    onChange={(e) => setNewVolume({...newVolume, number: e.target.value})}
                    required
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Academic Year</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    value={newVolume.year}
                    onChange={(e) => setNewVolume({...newVolume, year: e.target.value})}
                    required
                  />
               </div>
               <button disabled={saving} className="btn btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2">
                 {saving ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Create Volume</>}
               </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" /> Catalog New Issue
            </h3>
            <form onSubmit={handleCreateIssue} className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Volume</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    value={newIssue.volumeId}
                    onChange={(e) => setNewIssue({...newIssue, volumeId: e.target.value})}
                    required
                  >
                    <option value="">Select Volume</option>
                    {volumes.map(v => <option key={v.id} value={v.id}>Volume {v.number} ({v.year})</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Issue No.</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                      value={newIssue.number}
                      onChange={(e) => setNewIssue({...newIssue, number: e.target.value})}
                      required
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Month</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
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
               <button disabled={saving} className="btn btn-outline w-full py-4 mt-4 flex items-center justify-center gap-2">
                 {saving ? <Loader2 className="animate-spin" size={18} /> : <><Layers size={18} /> Catalog Issue</>}
               </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
