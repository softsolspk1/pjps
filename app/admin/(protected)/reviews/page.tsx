export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import styles from "@/components/AdminTable.module.css";
import { 
  ClipboardCheck, Search, Filter, 
  User, Calendar, CheckCircle, Clock 
} from "lucide-react";
import { format } from "date-fns";

export default async function ReviewPoolPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      article: true,
      reviewer: true
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>Peer Review Oversight</p>
           <h1>Reviewer Pool</h1>
        </div>
      </header>

      {/* Registry Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
         <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px', height: '54px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Search size={18} color="#a0aec0" />
            <input type="text" placeholder="Filter review pool by manuscript title or reviewer identity..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: '#1a202c' }} />
         </div>
         <button style={{ backgroundColor: 'white', border: '1px solid #edf2f7', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', color: '#718096', cursor: 'pointer' }}>
            <Filter size={16} /> Pool Filters
         </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Manuscript Details</th>
              <th>Assigned Reviewer</th>
              <th style={{ textAlign: 'center' }}>Review Status</th>
              <th style={{ textAlign: 'center' }}>Assignment Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#a0aec0', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  No active peer reviews currently found in the repository.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div style={{ fontWeight: 800, color: '#1a202c', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>{review.article.title}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#0061ff', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID: {review.articleId.slice(0, 8)}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#ebf4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0061ff', fontSize: '12px', fontWeight: 900 }}>
                       {review.reviewer.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1a202c', fontSize: '13px' }}>{review.reviewer.name}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#a0aec0' }}>{review.reviewer.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${styles.badge} ${
                    review.status === "COMPLETED" ? styles.badgeSuccess : styles.badgePending
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568' }}>
                    {format(new Date(review.createdAt), "MMM dd, yyyy")}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                     <button className={styles.actionBtn} title="View Review Detail">
                        <ClipboardCheck size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
