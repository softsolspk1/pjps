"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FileText, Clock, CheckCircle2, ChevronRight,
  BookOpen, LogOut, Loader2, ShieldCheck,
  AlertCircle, Award, User
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import styles from "./dashboard.module.css";

export default function ReviewerDashboard() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reviewer/assignments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderWrap}>
        <Loader2 className={styles.spinner} size={40} />
        <div className={styles.loaderText}>Loading Manuscript Registry...</div>
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => r.status === "PENDING" || r.status !== "COMPLETED");
  const completedReviews = reviews.filter((r) => r.status === "COMPLETED");

  function getRecClass(rec: string) {
    if (rec === "ACCEPT") return styles.recAccept;
    if (rec === "MINOR") return styles.recMinor;
    if (rec === "MAJOR") return styles.recMajor;
    if (rec === "REJECT") return styles.recReject;
    return styles.recPending;
  }

  function getRecLabel(rec: string) {
    if (rec === "ACCEPT") return "Accept";
    if (rec === "MINOR") return "Minor Revision";
    if (rec === "MAJOR") return "Major Revision";
    if (rec === "REJECT") return "Reject";
    return "Pending";
  }

  return (
    <div className={styles.portalRoot}>

      {/* ── Top Navigation Bar ─── */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>P</div>
          <div>
            <div className={styles.brandName}>PJPS</div>
            <div className={styles.brandSub}>Reviewer Portal</div>
          </div>
        </div>

        <div className={styles.topBarRight}>
          {session?.user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {session.user.name?.charAt(0) || <User size={16} />}
              </div>
              <div>
                <div className={styles.userName}>{session.user.name}</div>
                <div className={styles.userRole}>Peer Reviewer</div>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={styles.logoutBtn}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Content ─── */}
      <div className={styles.content}>

        {/* Welcome Strip */}
        <div className={styles.welcomeStrip}>
          <div className={styles.welcomeGlow} />
          <div className={styles.welcomeText}>
            <h1>Welcome back, {session?.user?.name?.split(" ")[0] || "Reviewer"}</h1>
            <p>Manage your peer review assignments and track submission progress.</p>
          </div>
          <div className={styles.welcomeBadge}>
            <ShieldCheck size={12} />
            Double-Blind Review
          </div>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div style={{
            background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "12px",
            padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px"
          }}>
            <AlertCircle size={20} color="#e53e3e" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#c53030" }}>
              Unable to load your assignments. Please refresh the page or contact support.
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <FileText size={24} />
            </div>
            <div>
              <div className={styles.statNumber}>{reviews.length}</div>
              <div className={styles.statLabel}>Total Assigned</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
              <Clock size={24} />
            </div>
            <div>
              <div className={styles.statNumber}>{pendingReviews.length}</div>
              <div className={styles.statLabel}>Awaiting Review</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <Award size={24} />
            </div>
            <div>
              <div className={styles.statNumber}>{completedReviews.length}</div>
              <div className={styles.statLabel}>Reviews Finalized</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={styles.twoCol}>

          {/* Left: Pending + Completed */}
          <div>

            {/* ── Pending Reviews ─── */}
            <div className={styles.sectionCard} style={{ marginBottom: "24px" }}>
              <div className={styles.sectionHeader}>
                <div className={`${styles.sectionHeaderIcon} ${styles.iconAmber}`}>
                  <Clock size={18} />
                </div>
                <span className={styles.sectionTitle}>Action Required</span>
                <span className={styles.sectionCount}>{pendingReviews.length}</span>
              </div>

              {pendingReviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>All Clear</h3>
                  <p className={styles.emptyText}>
                    No manuscripts currently awaiting your review. You are up to date.
                  </p>
                </div>
              ) : (
                <div className={styles.assignmentList}>
                  {pendingReviews.map((review, i) => {
                    const daysOld = differenceInDays(new Date(), new Date(review.createdAt));
                    const isUrgent = daysOld >= 10;
                    return (
                      <Link
                        key={review.id}
                        href={`/reviewer/articles/${review.articleId}`}
                        className={styles.assignmentRow}
                      >
                        <div className={styles.assignmentIndex}>{i + 1}</div>
                        <div className={styles.assignmentContent}>
                          <div className={styles.assignmentTitle}>
                            {review.article?.title || "Untitled Manuscript"}
                          </div>
                          <div className={styles.assignmentMeta}>
                            <span className={styles.assignmentDate}>
                              <Clock size={11} />
                              Assigned {format(new Date(review.createdAt), "MMM dd, yyyy")}
                            </span>
                            {isUrgent && (
                              <span className={styles.urgentBadge}>Overdue</span>
                            )}
                            {!isUrgent && daysOld >= 7 && (
                              <span className={styles.urgentBadge} style={{ background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" }}>
                                Due Soon
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={18} className={styles.assignmentArrow} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Completed Reviews ─── */}
            {completedReviews.length > 0 && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={`${styles.sectionHeaderIcon} ${styles.iconGreen}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span className={styles.sectionTitle}>Completed Reviews</span>
                  <span className={styles.sectionCount}>{completedReviews.length}</span>
                </div>

                <div className={styles.completedList}>
                  {completedReviews.map((review) => (
                    <div key={review.id} className={styles.completedRow}>
                      <div className={styles.completedCheck}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div className={styles.completedTitle}>
                          {review.article?.title || "Untitled Manuscript"}
                        </div>
                        <div className={styles.completedMeta}>
                          <span className={`${styles.recBadge} ${getRecClass(review.recommendation)}`}>
                            {getRecLabel(review.recommendation)}
                          </span>
                          <span style={{ fontSize: "10px", color: "#a0aec0", fontWeight: 600 }}>
                            {format(new Date(review.updatedAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right: Guidelines & Info */}
          <div>

            {/* Review Guidelines */}
            <div className={styles.sideCard} style={{ marginBottom: "20px" }}>
              <div className={styles.sectionHeader}>
                <div className={`${styles.sectionHeaderIcon} ${styles.iconBlue}`}>
                  <BookOpen size={18} />
                </div>
                <span className={styles.sectionTitle}>Review Guidelines</span>
              </div>
              <div className={styles.guidelineList}>
                {[
                  { icon: ShieldCheck, text: "Maintain strict confidentiality throughout the peer-review process." },
                  { icon: FileText, text: "Evaluate originality, methodology, relevance, and scientific impact." },
                  { icon: Clock, text: "Submit finalized reviews within 14 days of manuscript assignment." },
                  { icon: Award, text: "Declare any conflicts of interest before accepting an assignment." },
                ].map((item, i) => (
                  <div key={i} className={styles.guidelineItem}>
                    <div className={styles.guidelineIcon}>
                      <item.icon size={16} />
                    </div>
                    <p className={styles.guidelineText}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Scale Reference */}
            <div className={styles.sideCard}>
              <div className={styles.sectionHeader}>
                <div className={`${styles.sectionHeaderIcon} ${styles.iconBlue}`}>
                  <Award size={18} />
                </div>
                <span className={styles.sectionTitle}>Recommendation Scale</span>
              </div>
              <div className={styles.guidelineList}>
                {[
                  { label: "Accept", desc: "Manuscript meets all standards. Ready for publication.", cls: styles.recAccept },
                  { label: "Minor Revision", desc: "Minor improvements needed. Can be re-reviewed by editor.", cls: styles.recMinor },
                  { label: "Major Revision", desc: "Significant improvements needed before acceptance.", cls: styles.recMajor },
                  { label: "Reject", desc: "Does not meet publication standards. Substantive flaws.", cls: styles.recReject },
                ].map((item, i) => (
                  <div key={i} className={styles.guidelineItem}>
                    <span className={`${styles.recBadge} ${item.cls}`} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                      {item.label}
                    </span>
                    <p className={styles.guidelineText}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 Pakistan Journal of Pharmaceutical Sciences. Developed by{" "}
        <a href="https://softsols.pk" target="_blank" rel="noopener noreferrer">Softsols Pakistan</a>
      </footer>
    </div>
  );
}
