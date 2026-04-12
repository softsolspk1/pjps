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

      {/* Modern Scholarly Stats Grid */}
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
              <TrendingUp size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Scholarly Growth</div>
           <div className={dashboardStyles.cardValue}>+8.4%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 print-safe">
         {/* Submission Trajectory Line Chart */}
         <div className="bg-white rounded-[2rem] border-2 border-slate-50 p-10 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Submission Trajectory</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Scholarly Ingress Over 6 Months</p>
               </div>
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} />
               </div>
            </div>

            <div className="relative h-48 w-full group/chart">
               {/* Grid Lines */}
               <div className="absolute inset-0 flex flex-col justify-between opacity-[0.05]">
                  {[0, 1, 2, 3].map(i => <div key={i} className="w-full h-px bg-slate-900" />)}
               </div>

               <svg viewBox="0 0 500 100" className="w-full h-full preserve-3d overflow-visible">
                  <defs>
                     <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                     </linearGradient>
                  </defs>
                  
                  {/* Area */}
                  <path 
                     d={`M ${data.submissionTrend?.map((m: any, i: number) => 
                        `${(i * 100)} ${100 - (m.count / maxTrend) * 80}`
                     ).join(' L ')} V 100 H 0 Z`}
                     fill="url(#lineGrad)"
                  />

                  {/* Line */}
                  <path 
                     d={`M ${data.submissionTrend?.map((m: any, i: number) => 
                        `${(i * 100)} ${100 - (m.count / maxTrend) * 80}`
                     ).join(' L ')}`}
                     fill="none"
                     stroke="#2563eb"
                     strokeWidth="3"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="animate-draw"
                     style={{ 
                        filter: 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.3))'
                     }}
                  />

                  {/* Points */}
                  {data.submissionTrend?.map((m: any, i: number) => (
                     <circle 
                        key={i}
                        cx={i * 100} 
                        cy={100 - (m.count / maxTrend) * 80} 
                        r="4" 
                        fill="white" 
                        stroke="#2563eb" 
                        strokeWidth="2"
                        className="transition-all duration-300 hover:r-6 cursor-pointer"
                     />
                  ))}
               </svg>

               <div className="flex justify-between mt-8">
                  {data.submissionTrend?.map((m: any, i: number) => (
                     <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.name.slice(0, 3)}</span>
                  ))}
               </div>
            </div>
         </div>

         {/* Status Distribution Pie Chart */}
         <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex h-full">
               <div className="w-1/2 flex flex-col justify-between">
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Registry Composition</h3>
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">Manuscript Lifecycle Status Distribution</p>
                  </div>
                  
                  <div className="space-y-4 pt-10">
                     {data.statusDistribution?.slice(0, 4).map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i] }} />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.status}: <span className="text-white">{s._count.id}</span></span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="w-1/2 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                     {data.statusDistribution?.reduce((acc: any, s: any, i: number) => {
                        const percent = (s._count.id / data.articleCount) * 100;
                        const dashArray = `${percent} ${100 - percent}`;
                        const dashOffset = -acc.offset;
                        acc.elements.push(
                           <circle
                              key={i}
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4]}
                              strokeWidth="12"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              strokeLinecap={percent > 2 ? "round" : "butt"}
                              className="transition-all duration-1000 ease-out"
                           />
                        );
                        acc.offset += percent;
                        return acc;
                     }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-xl font-black text-white">{data.articleCount}</span>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                  </div>
               </div>
            </div>
         </div>
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
