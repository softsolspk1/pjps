"use client";

import { useEffect, useState } from "react";
import styles from "@/components/AdminTable.module.css";
import dashboardStyles from "../dashboard/DashboardModern.module.css";
import { 
  BarChart3, TrendingUp, Download, 
  Calendar, FileText, Users, Globe, 
  Percent, Zap, MousePointer2 
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PJPS_Intelligence_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-slate-400">ANALYTICS ENGINE INITIALIZING...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Performance & Impact Intelligence</p>
           <h1>Platform Analytics</h1>
        </div>
        <div className={styles.actions}>
           <button 
             onClick={handleExport}
             className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
           >
             <Download size={16} /> Export Intelligence Report
           </button>
        </div>
      </header>

      {/* Modern Stats Grid */}
      <div className={dashboardStyles.grid}>
        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#ebf4ff', color: '#0061ff' }}>
              <FileText size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Manuscripts Registry</div>
           <div className={dashboardStyles.cardValue}>{data.articleCount}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
              <Percent size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Acceptance Rate</div>
           <div className={dashboardStyles.cardValue}>{data.acceptanceRate}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
              <Zap size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Avg. Review velocity</div>
           <div className={dashboardStyles.cardValue}>{data.reviewVelocity}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <MousePointer2 size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Total Page Views</div>
           <div className={dashboardStyles.cardValue}>{data.totalPageViews || "---"}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginTop: '40px' }}>
         <div className={dashboardStyles.wideCard} style={{ background: 'linear-gradient(to bottom, white, #f8fafc)' }}>
            <div className={dashboardStyles.wideCardTitle}>
               Submission Growth & Trends
               <span className={dashboardStyles.historyLink} style={{ marginLeft: 'auto' }}>6-MONTH WINDOW</span>
            </div>
            <div className="flex items-end gap-3 h-56 mt-10 p-6 border-b border-slate-100">
               {data.submissionTrend?.map((m: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex flex-col items-center">
                       <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-xl transition-all">
                          {m.count}
                       </span>
                       <div 
                         className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-lg transition-all group-hover:from-blue-700 group-hover:to-blue-500 shadow-sm" 
                         style={{ height: `${(m.count / Math.max(...data.submissionTrend.map((st: any) => st.count), 1)) * 140}px`, minHeight: '4px' }}
                       ></div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                 </div>
               ))}
               {(!data.submissionTrend || data.submissionTrend.length === 0) && (
                 <div className="w-full text-center text-slate-300 font-bold italic py-20">NO TREND DATA AVAILABLE YET</div>
               )}
            </div>
         </div>

         <div className={dashboardStyles.wideCard}>
            <div className={dashboardStyles.wideCardTitle}>
               Traffic Analytics
               <span className={dashboardStyles.historyLink} style={{ marginLeft: 'auto' }}>TOP ENTRIES</span>
            </div>
            <div className="mt-8 space-y-5">
               {data.topViews?.map((v: any, i: number) => {
                 const maxCount = Math.max(...data.topViews.map((tv: any) => tv.count), 1);
                 return (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                         <code className="text-[10px] font-black text-slate-500 tracking-tight">{v.path}</code>
                         <span className="text-[10px] font-black text-blue-600 uppercase">{v.count} PV</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                           style={{ width: `${(v.count / maxCount) * 100}%` }}
                         ></div>
                      </div>
                   </div>
                 );
               })}
               {(!data.topViews || data.topViews.length === 0) && (
                 <div className="text-center text-slate-300 font-bold italic py-10">INITIALIZING TRAFFIC AGGREGATOR...</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
