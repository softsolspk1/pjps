"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  PlusCircle, Loader2, ShieldCheck,
  Search, BookOpen, Layers, User,
  Globe
} from "lucide-react";
import { format } from "date-fns";
import styles from "./Dashboard.module.css";

export default function AuthorDashboard() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
     if (status === 'PUBLISHED') return { color: '#059669', bg: '#f0fdf4', border: '#bcf0da' };
     if (status.includes('REVIEW')) return { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' };
     if (status.includes('REVISION')) return { color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' };
     if (status === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' };
     return { color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
  };

  const getStatusLabel = (status: string) => {
     return status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Manuscript Registry...</p>
      </div>
    );
  }

  const published = articles.filter(a => a.status === 'PUBLISHED').length;
  const trackingCount = articles.filter(a => ['SCREENING', 'UNDER_REVIEW', 'TECHNICAL_CHECK', 'WAITING_FOR_REVISION'].includes(a.status)).length;
  const submittedCount = articles.length;

  return (
    <div className={styles.container}>
      
      {/* Institutional Hero */}
      <div className={styles.hero}>
         <div className={styles.heroGlow} />
         <div className="relative z-10">
            <div className={styles.heroBadge}>
               <ShieldCheck size={14} /> Platinum Scholar Verification
            </div>
            <h1 className={styles.heroTitle}>Research Management Dashboard</h1>
            <p className={styles.heroDesc}>
               Welcome back, <strong>{session?.user?.name}</strong>. Access your institutional manuscript historical records, real-time tracking, and verified submission gateways.
            </p>
            
            <div className={styles.heroActions}>
               <Link href="/submission" className="btn btn-primary bg-white !text-blue-900 border-none hover:bg-slate-100 flex items-center gap-3">
                  <PlusCircle size={18} /> Submit New Article
               </Link>
               <Link href="/profile" className="btn btn-outline border-white/20 text-white hover:bg-white/10 flex items-center gap-3">
                  <User size={18} /> Professional Profile
               </Link>
               <Link href="/" className="btn btn-outline border-white/20 text-white hover:bg-white/10 flex items-center gap-3">
                  <Globe size={18} /> Back to PJPS
               </Link>
            </div>
         </div>
      </div>

      {/* Core Scholarly Metrics */}
      <div className={styles.statsGrid}>
         {[
           { label: 'Submitted Articles', count: submittedCount, icon: Layers, color: 'var(--primary-navy)', bg: '#f1f5f9', desc: 'Total manuscripts in your registry' },
           { label: 'Published Articles', count: published, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', desc: 'Finalized and indexed scholarly works' },
           { label: 'Tracking - In Process', count: trackingCount, icon: Clock, color: '#d97706', bg: '#fffbeb', desc: 'Manuscripts under review or screening' },
         ].map((stat, i) => (
           <div key={i} className={styles.statCard}>
              <div className={styles.statHeader}>
                 <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                    <stat.icon size={28} />
                 </div>
                 <div className={styles.statValue}>{stat.count}</div>
              </div>
              <h3 className={styles.statLabel}>{stat.label}</h3>
              <p className={styles.statDesc}>{stat.desc}</p>
           </div>
         ))}
      </div>

      {/* Manuscript Registry Table */}
      <div className={styles.registrySection}>
         <div className={styles.registryHeader}>
            <h2 className={styles.registryTitle}>
               <FileText className="text-blue-600" size={32} /> Research Registry
            </h2>
            <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-2xl border border-slate-100 focus-within:border-blue-300 transition-all shadow-sm">
               <Search size={18} className="text-slate-400" />
               <input type="text" placeholder="Search registry..." className="bg-transparent border-none outline-none text-[11px] font-black uppercase text-slate-900 w-48 placeholder:text-slate-400" />
            </div>
         </div>

         {articles.length === 0 ? (
           <div className="p-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                 <Layers size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Scholarly History Empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                 You haven&apos;t initiated any manuscript submissions yet. PJPS welcomes original research, clinical reviews, and scholarly inquiries.
              </p>
           </div>
         ) : (
           <div className={styles.tableWrapper}>
              <table className={styles.table}>
                 <thead>
                    <tr>
                       <th>Manuscript ID</th>
                       <th>Research Title</th>
                       <th className="text-center">Lifecycle Status</th>
                       <th>Date Logged</th>
                       <th className="text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {articles.map((art) => {
                       const statusStyles = getStatusStyles(art.status);
                       return (
                          <tr key={art.id} className={styles.row} onClick={() => window.location.href = `/author/submissions`}>
                             <td>
                                <div className={styles.idBadge}>#{art.id.slice(-6).toUpperCase()}</div>
                             </td>
                             <td style={{ maxWidth: '400px' }}>
                                <div className={styles.articleTitle}>{art.title}</div>
                                <div className={styles.articleMeta}>
                                   <BookOpen size={13} className="text-blue-400" /> 
                                   <span className="uppercase tracking-wider">
                                     {art.issue ? `${art.issue.volume.title}, Issue ${art.issue.number}` : 'Submitted for Screening'}
                                   </span>
                                </div>
                             </td>
                             <td className="text-center">
                                <span 
                                  className={styles.statusBadge}
                                  style={{ 
                                    color: statusStyles.color, 
                                    backgroundColor: statusStyles.bg, 
                                    borderColor: statusStyles.border 
                                  }}
                                >
                                   {getStatusLabel(art.status)}
                                </span>
                             </td>
                             <td>
                                <div className="text-[11px] font-bold text-slate-600 uppercase">
                                  {format(new Date(art.createdAt), 'MMM dd, yyyy')}
                                </div>
                             </td>
                             <td className="text-right">
                                <div className={styles.actionBtn}>
                                   <ChevronRight size={18} />
                                </div>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
         )}
         
         <div className="p-10 bg-slate-50/50 text-center border-t border-slate-50">
            <Link href="/author/submissions" className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center justify-center gap-2">
               Access Comprehensive Scholarly Archive <ChevronRight size={14} />
            </Link>
         </div>
      </div>
    </div>
  );
}

