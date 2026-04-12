export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./DashboardModern.module.css";
import { 
  FileText, Users, Download, Activity, 
  CheckCircle, ArrowRight, BookOpen, 
  Globe, ShieldCheck, Mail, History,
  TrendingUp, BarChart3, UserPlus, Layers 
} from "lucide-react";

export default async function DashboardPage() {
  const [
    articleCount,
    userCount,
    pendingReviews,
    unassignedManuscripts,
    publishedIssues,
    totalVolumes,
    totalReviews,
    recentActivity
  ] = await Promise.all([
     prisma.article.count(),
     prisma.user.count(),
     prisma.review.count({ where: { status: "PENDING" } }),
     prisma.article.count({ where: { status: "SUBMITTED" } }),
     prisma.issue.count({ where: { isPublished: true } }),
     prisma.volume.count(),
     prisma.review.count({ where: { status: "COMPLETED" } }),
     prisma.auditLog.findMany({
       take: 5,
       orderBy: { createdAt: "desc" },
       include: { user: true }
     })
  ]);

  // @ts-ignore
  const analytics = await prisma.analytics.findUnique({ where: { id: "global" } }) || { formattingCount: 0, totalExports: 0, totalPageViews: 0 };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerSubtitle}>Pharmacy Academic Management Dashboard</div>
        <h2 className={styles.headerTitle}>System Overview</h2>
      </header>
      
      {/* Attachment 3: Top Stats Grid */}
      <div className={styles.grid}>
        <div className={styles.card}>
           <div className={styles.cardIcon} style={{ backgroundColor: '#ebf4ff', color: '#0061ff' }}>
              <FileText size={24} />
           </div>
           <div className={styles.cardLabel}>Total Manuscripts</div>
           <div className={styles.cardValue}>{articleCount}</div>
        </div>

        <div className={styles.card}>
           <div className={styles.cardIcon} style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
              <CheckCircle size={24} />
           </div>
           <div className={styles.cardLabel}>Peer Reviews</div>
           <div className={styles.cardValue}>{totalReviews}</div>
        </div>

        <div className={styles.card}>
           <div className={styles.cardIcon} style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
              <Users size={24} />
           </div>
           <div className={styles.cardLabel}>Global Authors</div>
           <div className={styles.cardValue}>{userCount}</div>
        </div>

        <div className={styles.card}>
           <div className={styles.cardIcon} style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <Globe size={24} />
           </div>
           <div className={styles.cardLabel}>Digital Impact</div>
           <div className={styles.cardValue}>{publishedIssues}</div>
        </div>
      </div>

      {/* Attachment 3: Main Sections */}
      <div className={styles.mainSection}>
          <div className={styles.wideCard}>
            <div className={styles.wideCardTitle}>
               Recent Editorial Activity
               <Link href="/admin/audit-logs" className={styles.historyLink} style={{ marginLeft: 'auto', textDecoration: 'none' }}>HISTORICAL LOGS</Link>
            </div>
            <div className={styles.activityFeed}>
               {recentActivity.length > 0 ? (
                 recentActivity.map((log: any) => (
                   <div key={log.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                         <Activity size={12} />
                      </div>
                      <div className={styles.activityContent}>
                         <div className={styles.activityTitle}>
                            <strong>{log.user?.name || "System"}</strong> {log.action.replace(/_/g, ' ').toLowerCase()}
                         </div>
                         <div className={styles.activityMeta}>
                            {new Date(log.createdAt).toLocaleString()} • {log.entityType}
                         </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className={styles.emptyContent}>
                    NO RECENT LOGS RECORDED IN REGISTRY
                 </div>
               )}
            </div>
          </div>

         <div className={styles.toolSection}>
            <div className={styles.wideCardTitle}>System Tools</div>
            
            <Link href="/admin/issues" className={styles.toolCard}>
               <div className={styles.toolIcon}>
                  <Layers size={20} />
               </div>
               <div className={styles.toolName}>Issue Catalog</div>
            </Link>

            <Link href="/admin/users" className={styles.toolCard}>
               <div className={styles.toolIcon} style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                  <Users size={20} />
               </div>
               <div className={styles.toolName}>User Directory</div>
            </Link>

            <Link href="/admin/analytics" className={styles.toolCard}>
               <div className={styles.toolIcon} style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
                  <TrendingUp size={20} />
               </div>
               <div className={styles.toolName}>Analytics Hub</div>
            </Link>
         </div>
      </div>
    </div>
  );
}
