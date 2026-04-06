"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  Search, BookOpen, Layers,
  PlusCircle, ShieldCheck, Loader2
} from "lucide-react";
import { format } from "date-fns";
import styles from "./Submissions.module.css";

export default function AuthorSubmissionsPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/articles/my");
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusStyles = (status: string) => {
     const st = status.toUpperCase();
     if (st === 'PUBLISHED') return { color: '#059669', bg: '#f0fdf4', border: '#bcf0da', label: 'Accepted & Published' };
     if (st === 'UNDER_REVIEW') return { color: '#2563eb', bg: '#eff6ff', border: '#dbeafe', label: 'Peer Review Phase' };
     if (st === 'SCREENING' || st === 'TECHNICAL_CHECK') return { color: '#d97706', bg: '#fffbeb', border: '#fef3c7', label: 'Editorial Screening' };
     if (st.includes('REVISION')) return { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'Revision Required' };
     if (st === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', label: 'Declined' };
     return { color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb', label: st.replace(/_/g, ' ') };
  };

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Manuscript Registry...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Institutional Hero Banner */}
      <div className={styles.hero}>
         <div className={styles.heroGlow} />
         <div className={styles.heroContent}>
            <div className="max-w-2xl">
                <div className={styles.heroBadge}>
                   <ShieldCheck size={14} /> Global Scholarly Archive
                </div>
                <h1 className={styles.heroTitle}>Historical Research Portfolio</h1>
                <p className={styles.heroDesc}>
                   Manage your authenticated manuscript submissions within the PJPS scholarly registry. Access tracking metadata, reviewer feedback, and final publication repositories.
                </p>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[320px] w-full md:w-auto">
               <div className={styles.searchBox}>
                  <Search size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search my registry..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Link 
                  href="/submission"
                  className="btn btn-primary bg-white !text-blue-900 border-none hover:bg-slate-100 flex items-center justify-center gap-3 w-full py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
               >
                  <PlusCircle size={20} /> Initiate New Submission
               </Link>
            </div>
         </div>
      </div>

      {/* Manuscript Registry Table */}
      <div className={styles.registryCard}>
        <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
               <FileText className="text-blue-600" size={32} /> Scholarship History
            </h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-5 py-2.5 rounded-full border border-slate-100 italic shadow-sm">
               Institutional Record v3.0
            </div>
        </div>

        <div className={styles.tableWrapper}>
          {filteredArticles.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                <Layers size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Registry Unpopulated</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                {searchQuery ? "No manuscripts match your search criteria." : "Your scholarly research history is currently empty. PJPS welcomes original pharmaceutical inquiries, clinical reviews, and biomedical findings."}
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Manuscript ID</th>
                  <th>Research Title</th>
                  <th className="text-center">Lifecycle Status Tracking</th>
                  <th>Log Date</th>
                  <th className="text-right">Monitoring</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => {
                  const st = getStatusStyles(art.status);
                  return (
                    <tr key={art.id} className={styles.row} onClick={() => window.location.href = `/tracking?id=${art.id}`}>
                      <td>
                        <div className={styles.idBadge}>#{art.id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td style={{ maxWidth: '450px' }}>
                        <div className={styles.articleTitle}>{art.title}</div>
                        <div className={styles.articleMeta}>
                           <BookOpen size={14} className="text-blue-400" />
                           <span>{art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Formal Screening Phase'}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className={styles.statusWrapper}>
                           <span 
                             className={styles.statusBadge}
                             style={{ 
                               color: st.color, 
                               backgroundColor: st.bg, 
                               borderColor: st.border 
                             }}
                           >
                             {st.label}
                           </span>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
                              Verified Status
                           </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                          {format(new Date(art.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className={styles.monitoringIcon}>
                           <ChevronRight size={20} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Institutional Support Grid */}
      <div className={styles.supportGrid}>
        {[
           { 
             title: 'Verified Publication', 
             desc: 'Global indexing and official DOI assignment for accepted scholarly works.',
             icon: CheckCircle2,
             color: '#059669',
             bg: '#ecfdf5'
           },
           { 
             title: 'Live Peer Tracking', 
             desc: 'Monitor real-time lifecycle analysis from screening to final acceptance.',
             icon: Layers,
             color: '#2563eb',
             bg: '#eff6ff'
           },
           { 
             title: 'Scholarly Protection', 
             desc: 'Institutional-grade manuscript security and plagiarism verification standards.',
             icon: ShieldCheck,
             color: 'var(--primary-navy)',
             bg: '#f1f5f9'
           }
        ].map((item, i) => (
           <div key={i} className={styles.supportCard}>
              <div className={styles.supportHeader}>
                 <div className={styles.supportIcon} style={{ background: item.bg, color: item.color }}>
                    <item.icon size={28} />
                 </div>
                 <h4 className={styles.supportTitle}>{item.title}</h4>
              </div>
              <p className={styles.supportDesc}>{item.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-t border-slate-50 pt-6">
                 Protocol Information <ChevronRight size={14} />
              </div>
           </div>
        ))}
      </div>

    </div>
  );
}

