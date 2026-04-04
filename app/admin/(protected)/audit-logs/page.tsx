"use client";

import { useEffect, useState } from "react";
import styles from "@/components/AdminTable.module.css";
import { 
  ClipboardList, Search, User, 
  Calendar, Info, AlertTriangle, 
  CheckCircle, RefreshCcw 
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes("STATUS")) return "#0061ff";
    if (action.includes("DOI")) return "#8b5cf6";
    if (action.includes("LOGIN")) return "#10b981";
    return "#64748b";
  };

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-slate-400">TRACE LOGS INITIALIZING...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Immutable Activity Registry (30-Day Window)</p>
           <h1>System Audit Logs</h1>
        </div>
        <div className={styles.actions}>
           <button onClick={() => window.location.reload()} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
              <RefreshCcw size={18} className="text-slate-600" />
           </button>
        </div>
      </header>

      <div className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
               <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Timestamp</th>
               <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Action</th>
               <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Actor</th>
               <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Entity</th>
               <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                 <td className="p-6">
                    <div className="text-[11px] font-bold text-slate-800">{new Date(log.createdAt).toLocaleString()}</div>
                 </td>
                 <td className="p-6">
                    <span 
                      className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase"
                      style={{ backgroundColor: `${getActionColor(log.action)}15`, color: getActionColor(log.action) }}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                 </td>
                 <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {log.user?.name?.charAt(0) || <User size={10} />}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-slate-700">{log.user?.name || "System"}</p>
                          <p className="text-[9px] text-slate-400">{log.user?.email || "internal@pjps.pk"}</p>
                       </div>
                    </div>
                 </td>
                 <td className="p-6">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                       {log.entityType} <span className="text-slate-300 ml-1">#{log.entityId?.slice(-6)}</span>
                    </div>
                 </td>
                 <td className="p-6 text-right">
                    <Info size={14} className="ml-auto text-slate-300 cursor-help" />
                 </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center font-bold italic text-slate-300">
                   NO RECENT ACTIVITIES CAPTURED IN THE CURRENT REGISTRY PREVIEW
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
