export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { 
  ClipboardCheck, 
  User, 
  CheckCircle, 
  ShieldCheck, 
  Activity,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import styles from "./Reviews.module.css";

export default async function ReviewPoolPage() {
  let reviews = [];
  let fetchError = false;

  try {
    reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        article: true,
        reviewer: true
      }
    });
  } catch (error) {
    console.error("Critical Registry Fetch Error:", error);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff5f5', borderRadius: '24px', border: '1px solid #feb2b2' }}>
           <AlertTriangle size={48} color="#e53e3e" style={{ margin: '0 auto 16px' }} />
           <h2 style={{ color: '#c53030', fontWeight: 900 }}>Registry Connection Failure</h2>
           <p style={{ color: '#9b2c2c', fontSize: '14px', marginTop: '8px' }}>The scholarly database is currently unavailable. Please verify your connection or contact the system administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
           <div className={styles.badge}>Editorial Oversight</div>
           <h1 className={styles.title}>Global Review Pool</h1>
           <p className={styles.subtitle}>Audit the integrity and progress of the double-blind peer-review lifecycle.</p>
        </div>
      </header>

      <div className={styles.tableCard}>
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
            {(reviews || []).map((review) => (
              <tr key={review.id}>
                <td>
                  <h3 className={styles.articleTitle}>{review.article?.title || "Manuscript Title Unavailable"}</h3>
                  <div className={styles.articleId}>Institutional ID: {review.articleId?.slice(0, 8) || "REF-ID-NA"}</div>
                </td>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userIcon}>
                       {review.reviewer?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className={styles.userName}>{review.reviewer?.name || "Anonymous Expert"}</div>
                      <div className={styles.userEmail}>{review.reviewer?.email || "No contact info"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`${styles.statusBadge} ${review.status === 'COMPLETED' ? styles.completed : styles.pending}`}>
                    {review.status || "PENDING"}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className={styles.dateText}>
                    {review.createdAt ? format(new Date(review.createdAt), "MMM dd, yyyy") : "Date Unavailable"}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                     <button className={styles.actionBtn} title="View Scholarly Review Detail">
                        <ClipboardCheck size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!reviews || reviews.length === 0) && (
          <div className={styles.emptyState}>
             <div className={styles.emptyIcon}>
               <ShieldCheck size={32} />
             </div>
             <h2 className={styles.emptyTitle}>Review Registry Empty</h2>
             <p className={styles.emptyText}>
               This registry tracks all manuscripts currently undergoing peer evaluation. 
               Once an editor assigns a reviewer to a manuscript, the record will appear here for longitudinal oversight.
             </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #edf2f7' }}>
         <div style={{ padding: '12px', backgroundColor: '#ebf4ff', borderRadius: '12px', color: '#0061ff' }}>
            <Activity size={20} />
         </div>
         <div>
            <h4 style={{ fontWeight: 800, fontSize: '13px', color: '#1a202c', marginBottom: '2px' }}>Scholarly Integrity Protocol</h4>
            <p style={{ fontSize: '11px', color: '#718096', fontWeight: 500 }}>
              The Review Pool ensures transparency in the evaluation process. Editors-in-Chief can utilize this module to detect bottlenecks in the scholarly workflow and ensure timely publication.
            </p>
         </div>
      </div>
    </div>
  );
}
