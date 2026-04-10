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

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-slate-400">ANALYTICS ENGINE INITIALIZING...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Performance & Impact Intelligence</p>
           <h1>Platform Analytics</h1>
        </div>
        <div className={styles.actions}>
           <button className="btn btn-primary flex items-center gap-2">
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
         <div className={dashboardStyles.wideCard}>
            <div className={dashboardStyles.wideCardTitle}>
               Submission Growth & Trends
               <span className={dashboardStyles.historyLink} style={{ marginLeft: 'auto' }}>6-MONTH WINDOW</span>
            </div>
            <div className="flex items-end gap-2 h-48 mt-10">
               {data.submissionTrend?.map((m: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600" 
                      style={{ height: `${(m.count / Math.max(...data.submissionTrend.map((st: any) => st.count))) * 100}%`, minHeight: '8px' }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{m.name}</span>
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
            <div className="mt-6 space-y-4">
               {data.topViews?.map((v: any, i: number) => (
                 <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <code className="text-[11px] font-bold text-slate-600">{v.path}</code>
                    <span className="text-xs font-black text-blue-600">{v.count} PV</span>
                 </div>
               ))}
               {(!data.topViews || data.topViews.length === 0) && (
                 <div className="text-center text-slate-300 font-bold italic py-10">INITIALIZING TRAFFIC AGGREGATOR...</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
