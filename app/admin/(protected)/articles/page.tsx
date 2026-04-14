"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import styles from "@/components/AdminTable.module.css";
import { Edit2, UserCheck, Plus, FileText, Search, Filter, Loader2, Trash2, AlertTriangle } from "lucide-react";

export default function AdminArticlesList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you absolutely sure you want to purge the manuscript: "${title}"?\n\nThis will permanently delete it along with all reviews and formatting metadata.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const updated = articles.filter(a => a.id !== id);
        setArticles(updated);
        setFilteredArticles(updated);
      } else {
        alert("Failed to purge scholarly record.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles"); // Using public API for list
        const data = await res.json();
        setArticles(data);
        setFilteredArticles(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  useEffect(() => {
    let results = articles;
    
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.authors?.some((author: any) => author.name?.toLowerCase().includes(q))
      );
    }
    
    if (statusFilter !== "ALL") {
      results = results.filter(a => a.status === statusFilter);
    }
    
    setFilteredArticles(results);
  }, [search, statusFilter, articles]);

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Editorial Management</p>
           <h1>Manuscript Registry</h1>
        </div>
        <div className={styles.actions}>
           <Link href="/admin/articles/create" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0061ff', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', transition: 'all 0.2s ease' }}>
             <Plus size={16} /> New Manuscript
           </Link>
        </div>
      </header>

      {/* Registry Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
         <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px', height: '54px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Search size={18} color="#a0aec0" />
            <input 
              type="text" 
              placeholder="Filter registry by title or author identifier..." 
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: '#1a202c' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 40px 0 20px', appearance: 'none', height: '54px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', color: '#718096', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
            >
               <option value="ALL">All Statuses</option>
               <option value="SUBMITTED">Submitted</option>
               <option value="SCREENING">Screening</option>
               <option value="UNDER_REVIEW">Under Review</option>
               <option value="REVISION">Revision</option>
               <option value="ACCEPTED">Accepted</option>
               <option value="REJECTED">Rejected</option>
               <option value="PUBLISHED">Published</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', right: '15px', pointerEvents: 'none', color: '#a0aec0' }} />
         </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Manuscript Identity</th>
              <th>Status</th>
              <th>Registry Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#a0aec0', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  No scholarly entries matches your criteria.
                </td>
              </tr>
            )}
            {filteredArticles.map((article) => (
              <tr key={article.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f7fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0061ff', flexShrink: 0 }}>
                       <FileText size={20} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, color: '#1a202c', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>{article.title}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#718096', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        {article.authors?.map((a: any) => a.name).join(", ") || "Institutional Participant Unassigned"}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${
                    article.status === "PUBLISHED" ? styles.badgeSuccess :
                    article.status === "REJECTED" ? styles.badgeError :
                    article.status === "SUBMITTED" ? styles.badgePending :
                    styles.badgeInfo
                  }`}>
                    {article.status}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#4a5568' }}>
                    {format(new Date(article.createdAt), "MMM dd, yyyy")}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#a0aec0', marginTop: '2px' }}>
                    {format(new Date(article.createdAt), "HH:mm:ss")}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                     <Link href={`/admin/articles/${article.id}`} className={styles.actionBtn} title="Editorial Decision Hub">
                        <Edit2 size={16} />
                     </Link>
                     {(article.status === "SUBMITTED" || article.status === "SCREENING") && (
                       <Link href={`/admin/articles/${article.id}/assign`} className={styles.actionBtn} style={{ color: '#f59e0b', borderColor: '#ffedd5' }} title="Assign Peer Reviewer">
                          <UserCheck size={16} />
                       </Link>
                     )}
                     <button 
                        onClick={() => handleDelete(article.id, article.title)}
                        className={styles.actionBtn} 
                        style={{ color: '#ef4444', borderColor: '#fee2e2' }} 
                        title="Purge Scholarly Record"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>Showing {filteredArticles.length} matching entries</div>
            <div className={styles.paginationBtns}>
               <button disabled className={styles.actionBtn} style={{ opacity: 0.5 }}>Previous Phase</button>
               <button className={styles.actionBtn}>Next Phase</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
