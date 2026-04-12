"use client";

import { useEffect, useState } from "react";
import styles from "@/components/AdminTable.module.css";
import dashboardStyles from "../dashboard/DashboardModern.module.css";
import { 
  BarChart3, TrendingUp, Download, 
  Calendar, FileText, Users, Globe, 
  Percent, Zap, MousePointer2, Loader2
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

  const handleExportCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Manuscripts Registry,${data.articleCount}\n`;
    csvContent += `Acceptance Rate,${data.acceptanceRate}\n`;
    csvContent += `Avg. Review Velocity,${data.reviewVelocity}\n`;
    csvContent += `Total Page Views,${data.totalPageViews || 0}\n\n`;
    
    csvContent += "Submission Trend (Month),Submissions\n";
    data.submissionTrend?.forEach((m: any) => {
      csvContent += `${m.name},${m.count}\n`;
    });
    
    csvContent += "\nManuscript Status Distribution,Count\n";
    data.statusDistribution?.forEach((s: any) => {
      csvContent += `${s.status},${s._count.id}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PJPS_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
       <Loader2 size={48} className="text-blue-600 animate-spin" />
       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Scholarly Intelligence Engine</p>
    </div>
  );

  const maxTrend = Math.max(...(data.submissionTrend?.map((st: any) => st.count) || [1]), 1);

  return (
    <div className={`${styles.container} print:p-0`}>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, aside, header, .no-print, .actions { display: none !important; }
          body, html { background: white !important; }
          .print-safe { width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <header className={`${styles.header} no-print`}>
        <div className={styles.titleGroup}>
           <p className="font-black text-blue-600 tracking-widest text-[10px] uppercase mb-1">Performance & Impact Intelligence</p>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleExportCSV}
             className="bg-white border-2 border-slate-100 hover:border-blue-200 text-slate-800 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-sm"
           >
             <TrendingUp size={14} className="text-blue-500" /> Excel Export
           </button>
           <button 
             onClick={handlePrintPDF}
             className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
           >
             <Download size={14} /> PDF Report
           </button>
        </div>
      </header>

      {/* Modern Stats Grid */}
      <div className={`${dashboardStyles.grid} print-safe`}>
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
           <div className={dashboardStyles.cardLabel}>Avg. Review Velocity</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 print-safe">
         {/* Enhanced SVG Growth Chart */}
         <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Submission Growth</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">REAL-TIME INGRESS METRICS</p>
               </div>
               <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">6-Month Window</div>
            </div>

            <div className="relative h-64 w-full flex items-end justify-between px-4 pb-4">
               {/* SVG Background Grid */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.5" />
               </svg>

               {data.submissionTrend?.map((m: any, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end">
                    <div className="relative w-full flex flex-col items-center">
                       {/* Floating Tooltip */}
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-10 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
                          <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                             {m.count} ARTICLES
                          </div>
                          <div className="w-2 h-2 bg-slate-900 mx-auto rotate-45 -mt-1"></div>
                       </div>
                       
                       {/* SVG Bar */}
                       <div className="w-8 xl:w-12 transition-all duration-700 ease-out origin-bottom" style={{ height: `${(m.count / maxTrend) * 180}px` }}>
                          <svg width="100%" height="100%" viewBox="0 0 40 100" preserveAspectRatio="none">
                             <defs>
                                <linearGradient id={`barGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                   <stop offset="0%" stopColor="#3b82f6" />
                                   <stop offset="100%" stopColor="#2563eb" />
                                </linearGradient>
                             </defs>
                             <rect width="40" height="0" x="0" y="100" fill={`url(#barGrad-${i})`} rx="4">
                                <animate attributeName="height" from="0" to="100" dur="1s" fill="freeze" begin={`${i * 0.1}s`} />
                                <animate attributeName="y" from="100" to="0" dur="1s" fill="freeze" begin={`${i * 0.1}s`} />
                             </rect>
                          </svg>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* New Status Distribution Hub (Replacing Traffic Hub) */}
         <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black uppercase tracking-widest">Status Registry</h3>
                  <BarChart3 size={18} className="text-blue-400" />
               </div>

               <div className="flex-1 space-y-6">
                  {data.statusDistribution?.map((s: any, i: number) => {
                    const totalArticles = data.articleCount || 1;
                    const percentage = (s._count.id / totalArticles) * 100;
                    return (
                      <div key={i} className="space-y-3 group">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-tight group-hover:text-white transition-colors uppercase">{s.status}</span>
                            <span className="text-[10px] font-black text-blue-400">{s._count.id} ITEMS</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-in-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                         </div>
                      </div>
                    );
                  })}
               </div>

               <div className="mt-12 pt-8 border-t border-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                     SYSTEMS SYNCED WITH SCHOLARLY LIFECYCLE EVENTS. UPDATES PERSIST TO THE GLOBAL REPOSITORY.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
