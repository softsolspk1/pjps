"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  Search, BookOpen, 
  Calendar, Award, ShieldCheck, Loader2
} from "lucide-react";
import { format } from "date-fns";
import styles from "./ReviewerArticles.module.css";

export default function ReviewerArticlesPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        const assignments = data.reviews || [];
        setReviews(assignments.filter((r: any) => r.status !== 'INVITED'));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReviews = reviews.filter(r => 
    r.article?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.articleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.emptyState} style={{ border: 'none' }}>
        <Loader2 className="animate-spin" size={40} color="#0061ff" style={{ margin: '0 auto 20px' }} />
        <p className={styles.emptyText} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Retrieving Expert Registry...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
           <div>
              <div className={styles.badge}>Expert Workspace</div>
              <h1 className={styles.title}>Assigned Manuscripts</h1>
              <p className={styles.subtitle}>
                Manage your active peer review assignments and finalize expert scholarly feedback within the unified PJPS portal.
              </p>
           </div>
           <div className={styles.searchWrapper}>
              <Search size={18} className={styles.metaIcon} />
              <input 
                type="text" 
                placeholder="Search my reviews..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput} 
              />
           </div>
        </div>
      </div>

      {/* Registry Grid */}
      {filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={40} />
          </div>
          <h3 className={styles.emptyTitle}>Expert Registry Empty</h3>
          <p className={styles.emptyText}>
            You do not have any active or completed peer review assignments matching your search criteria at this time.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredReviews.map((review) => (
            <div key={review.id} className={styles.card}>
               <div className={styles.cardContent}>
                  <div className={styles.cardMain}>
                     <div className={styles.cardHeader}>
                        <span className={`${styles.statusBadge} ${
                          review.status === 'COMPLETED' ? styles.statusCompleted : styles.statusAccepted
                        }`}>
                           {review.status}
                        </span>
                        <span className={styles.msId}>MS-#[{review.articleId.slice(-6).toUpperCase()}]</span>
                     </div>
                     <h2 className={styles.articleTitle}>
                        {review.article?.title}
                     </h2>
                     <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                           <Calendar size={14} className={styles.metaIcon} />
                           Assigned: {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </div>
                        {review.recommendation && (
                           <div className={styles.metaItem} style={{ color: '#059669' }}>
                              <CheckCircle2 size={14} />
                              Recommendation: {review.recommendation}
                           </div>
                        )}
                        <div className={styles.metaItem}>
                           <BookOpen size={14} className={styles.metaIcon} />
                           Double-Blind Access
                        </div>
                     </div>
                  </div>

                  <div className={styles.actionArea}>
                    {review.status === 'ACCEPTED' ? (
                       <Link 
                         href={`/reviewer/articles/${review.articleId}`}
                         className={styles.fillBtn}
                       >
                         Fill Scorecard <ChevronRight size={18} />
                       </Link>
                    ) : (
                       <div className={styles.completedBox}>
                          <span className={styles.completedLabel}>Peer Review Complete</span>
                          <div className={styles.completedValue}>
                             <Award size={18} /> Archive Logged
                          </div>
                       </div>
                    )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Recognition Footer */}
      <div className={styles.footerGrid}>
         <div className={styles.footerCard}>
            <div className={`${styles.footerIconBox} ${styles.blueIconBox}`}>
               <ShieldCheck size={32} />
            </div>
            <div>
               <h4 className={styles.footerTitle}>Expert Verification</h4>
               <p className={styles.footerDesc}>Your expert reviews are verified and credited toward your institutional scholarly credentials.</p>
            </div>
         </div>
         <div className={styles.footerCard}>
            <div className={`${styles.footerIconBox} ${styles.emeraldIconBox}`}>
               <Award size={32} />
            </div>
            <div>
               <h4 className={styles.footerTitle}>Reviewer Rewards</h4>
               <p className={styles.footerDesc}>Earn Recognition Certificates and Eligibility for Annual PJPS Reviewer Awards upon scorecard finalization.</p>
            </div>
         </div>
      </div>

    </div>
  );
}
