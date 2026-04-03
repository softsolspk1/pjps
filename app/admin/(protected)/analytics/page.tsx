export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import styles from "@/components/AdminTable.module.css";
import dashboardStyles from "../dashboard/DashboardModern.module.css";
import { 
  BarChart3, TrendingUp, Download, 
  Calendar, FileText, Users, Globe 
} from "lucide-react";

export default async function AnalyticsPage() {
  const [
    articleCount,
    userCount,
    publishedIssues,
    totalReviews
  ] = await Promise.all([
     prisma.article.count(),
     prisma.user.count(),
     prisma.issue.count({ where: { isPublished: true } }),
     prisma.review.count({ where: { status: "COMPLETED" } })
  ]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
           <p>System Performance & impact</p>
           <h1>Lifetime Reports</h1>
        </div>
        <div className={styles.actions}>
           <button style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0061ff', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
             <Download size={16} /> Export System Report
           </button>
        </div>
      </header>

      {/* Modern High-Fidelity Stats Grid (Matching Attachment 3) */}
      <div className={dashboardStyles.grid}>
        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#ebf4ff', color: '#0061ff' }}>
              <FileText size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Cataloged Manuscripts</div>
           <div className={dashboardStyles.cardValue}>{articleCount}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
              <Users size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Verified Experts</div>
           <div className={dashboardStyles.cardValue}>{userCount}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
              <Globe size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Global Volumes</div>
           <div className={dashboardStyles.cardValue}>{publishedIssues}</div>
        </div>

        <div className={dashboardStyles.card}>
           <div className={dashboardStyles.cardIcon} style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <BarChart3 size={24} />
           </div>
           <div className={dashboardStyles.cardLabel}>Completed Reviews</div>
           <div className={dashboardStyles.cardValue}>{totalReviews}</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
         <div className={dashboardStyles.wideCard}>
            <div className={dashboardStyles.wideCardTitle}>
               Publishing Velocity & Metrics
               <span className={dashboardStyles.historyLink} style={{ marginLeft: 'auto' }}>HISTORICAL LOGS</span>
            </div>
            <div className={dashboardStyles.emptyContent}>
               ANALYTICS ENGINE INITIALIZING...
            </div>
         </div>
      </div>
    </div>
  );
}
