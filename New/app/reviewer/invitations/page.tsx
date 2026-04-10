"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Bell, FileText, Clock, CheckCircle2, ChevronRight, 
  Search, BookOpen, 
  ShieldCheck, AlertCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import styles from "./ReviewerInvitations.module.css";

export default function ReviewerInvitationsPage() {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        const assignments = data.reviews || [];
        setInvitations(assignments.filter((r: any) => r.status === 'INVITED'));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleResponse(reviewId: string, response: 'ACCEPTED' | 'DECLINED') {
    if (!confirm(`Are you sure you want to ${response.toLowerCase()} this scholarly invitation?`)) return;
    try {
      const res = await fetch("/api/reviewer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, response })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Response error:", err);
    }
  }

  if (loading) {
    return (
      <div className={styles.emptyState} style={{ border: 'none' }}>
        <Loader2 className="animate-spin" size={40} color="#0061ff" style={{ margin: '0 auto 20px' }} />
        <p className={styles.emptyText} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Retrieving Expert Invitations...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Header Area */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
           <div>
              <div className={styles.badge}>Urgent Outreach</div>
              <h1 className={styles.title}>Pending Invitations</h1>
              <p className={styles.subtitle}>
                You have been nominated as an expert referee for the following scholarly research. Please accept or decline the invitation below.
              </p>
           </div>
           <div className={styles.requestBadge}>
              <Bell size={18} className="animate-pulse" /> {invitations.length} Expert Requests
           </div>
        </div>
      </div>

      {/* Invitations Feed */}
      {invitations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Bell size={40} />
          </div>
          <h3 className={styles.emptyTitle}>Workspace Clear</h3>
          <p className={styles.emptyText}>
            You do not have any pending scholarly invitations at this time.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {invitations.map((inv) => (
            <div key={inv.id} className={styles.card}>
               <div className={styles.cardContent}>
                  <div className={styles.cardMain}>
                     <div className={styles.invBadgeRow}>
                        <span className={styles.invStatus}>Invitation Required</span>
                        <span className={styles.msId}>MS-#[{inv.articleId.slice(-6).toUpperCase()}]</span>
                     </div>
                     <h2 className={styles.articleTitle}>
                        {inv.article?.title}
                     </h2>
                     <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                           <Clock size={14} className={styles.metaIcon} />
                           Outreach Sent: {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className={styles.metaItem}>
                           <ShieldCheck size={14} className={styles.metaIcon} />
                           Review Policy: Institutional Double-Blind
                        </div>
                     </div>
                     <div className={styles.abstractPreview}>
                        <div className={styles.abstractIcon}><BookOpen size={24} /></div>
                        <p className={styles.abstractText}>
                           {inv.article?.abstract || "Abstract content is finalizing in the editorial database."}
                        </p>
                     </div>
                  </div>

                  <div className={styles.btnGroup}>
                     <button 
                        onClick={() => handleResponse(inv.id, 'ACCEPTED')}
                        className={styles.acceptBtn}
                     >
                        <CheckCircle2 size={20} /> Accept & Review
                     </button>
                     <button 
                        onClick={() => handleResponse(inv.id, 'DECLINED')}
                        className={styles.declineBtn}
                     >
                        <AlertCircle size={20} /> Decline Outreach
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Note */}
      <div className={styles.protocolCard}>
         <div className={styles.protocolContent}>
            <div className={styles.protocolText}>
               <div className={styles.protocolHeader}>
                  <div className={styles.protocolIconBox}>
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className={styles.protocolTitle}>Double-Blind Protocol</h3>
               </div>
               <p className={styles.protocolDesc}>
                  By accepting this scholarly invitation, you adhere to the PJPS dual-blind peer review integrity standards. 
                  All manuscripts are strictly confidential and must be discarded following scorecard finalization.
               </p>
            </div>
            <div className={styles.protocolStats}>
               <div className={styles.statItem}>
                  <div className={styles.statValue}>14</div>
                  <div className={styles.statLabel}>Day Cycle</div>
               </div>
               <div className={styles.statItem}>
                  <div className={styles.statValue}>Full</div>
                  <div className={styles.statLabel}>Reward Credit</div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
