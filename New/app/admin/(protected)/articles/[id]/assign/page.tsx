"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  User, Search, UserPlus, ArrowLeft, Loader2,
  CheckCircle, AlertCircle, ShieldCheck, BookOpen
} from "lucide-react";
import styles from "./assign.module.css";

export default function AssignReviewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [article, setArticle] = useState<any>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleRes, reviewersRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch(`/api/admin/reviewers`),
        ]);

        const articleData = await articleRes.json();
        const reviewersData = await reviewersRes.json();

        setArticle(articleData);
        setReviewers(Array.isArray(reviewersData) ? reviewersData : []);
        setFilteredReviewers(Array.isArray(reviewersData) ? reviewersData : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    const q = search.toLowerCase();
    const results = reviewers.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.interests?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.affiliation?.toLowerCase().includes(q)
    );
    setFilteredReviewers(results);
    // If selected reviewer is no longer visible, keep selection intact
  }, [search, reviewers]);

  const isAlreadyAssigned = (reviewerId: string) =>
    article?.reviews?.some((r: any) => r.reviewerId === reviewerId);

  const handleAssign = async () => {
    if (!selectedReviewerId) return;
    setAssigning(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, reviewerId: selectedReviewerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Reviewer assigned successfully! A notification has been dispatched." });
        const articleRes = await fetch(`/api/articles/${id}`);
        const updatedArticle = await articleRes.json();
        setArticle(updatedArticle);
        setSelectedReviewerId(null);
        router.refresh();
      } else {
        throw new Error(data.error || "Assignment failed. Please try again.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <div className={styles.loaderText}>Loading Faculty Registry...</div>
      </div>
    );
  }

  const selectedReviewer = reviewers.find((r) => r.id === selectedReviewerId);

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button onClick={() => router.back()} className={styles.backBtn}>
        <ArrowLeft size={14} />
        Back to Manuscript Registry
      </button>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.badge}>Peer Review Assignment</div>
        <h1 className={styles.pageTitle}>Assign Peer Reviewer</h1>
        <p className={styles.manuscriptTitle}>
          Manuscript: &ldquo;{article?.title || "Loading manuscript..."}&rdquo;
        </p>
      </div>

      {/* Currently Assigned */}
      {article?.reviews?.length > 0 && (
        <div className={styles.assignedInfo}>
          <div className={styles.assignedAvatars}>
            {article.reviews.map((r: any, i: number) => (
              <div key={i} className={styles.assignedAvatar} title={r.reviewer?.name}>
                {r.reviewer?.name?.charAt(0)}
              </div>
            ))}
          </div>
          <p>
            {article.reviews.length} reviewer{article.reviews.length > 1 ? "s" : ""} already assigned to this manuscript
          </p>
        </div>
      )}

      {/* Alert Message */}
      {message && (
        <div className={`${styles.alert} ${message.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Main Panel */}
      <div className={styles.mainCard}>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} color="#a0aec0" />
            <input
              type="text"
              placeholder="Search by name, affiliation, or research interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.searchCount}>
            {filteredReviewers.length} expert{filteredReviewers.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* List Header */}
        <div className={styles.listHeader}>
          <div className={styles.listHeaderCell}></div>
          <div className={styles.listHeaderCell}>Expert Identity</div>
          <div className={styles.listHeaderCell}>Institutional Affiliation</div>
          <div className={styles.listHeaderCell}>Research Interests</div>
          <div className={styles.listHeaderCell}>Workload</div>
          <div className={styles.listHeaderCell} style={{ textAlign: "right" }}>Status / Role</div>
        </div>

        {/* Reviewer List */}
        <div className={styles.reviewerList}>
          {filteredReviewers.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={28} />
              </div>
              <h3 className={styles.emptyTitle}>No Experts Found</h3>
              <p className={styles.emptyText}>
                No faculty members match your search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            filteredReviewers.map((reviewer) => {
              const assigned = isAlreadyAssigned(reviewer.id);
              const isSelected = selectedReviewerId === reviewer.id;
              const interests = reviewer.interests
                ? reviewer.interests.split(";").map((s: string) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={reviewer.id}
                  className={`${styles.reviewerRow} ${isSelected ? styles.selected : ""} ${assigned ? styles.alreadyAssigned : ""}`}
                  onClick={() => !assigned && setSelectedReviewerId(isSelected ? null : reviewer.id)}
                  title={assigned ? "Already assigned to this manuscript" : undefined}
                >
                  {/* Radio */}
                  <div className={styles.radioCell}>
                    {assigned ? (
                      <CheckCircle size={18} color="#10b981" />
                    ) : (
                      <div className={styles.radioOuter}>
                        <div className={styles.radioInner} />
                      </div>
                    )}
                  </div>

                  {/* Identity */}
                  <div className={styles.identityCell}>
                    <div className={styles.avatar}>{reviewer.name?.charAt(0)}</div>
                    <div style={{ overflow: "hidden" }}>
                      <div className={styles.reviewerName}>{reviewer.name}</div>
                      <div className={styles.reviewerEmail}>{reviewer.email}</div>
                    </div>
                  </div>

                  {/* Affiliation */}
                  <div className={styles.affiliationCell}>
                    {reviewer.affiliation || <span style={{ color: "#cbd5e0", fontStyle: "italic" }}>Independent Scholar</span>}
                  </div>

                  {/* Interests */}
                  <div className={styles.interestsCell}>
                    {interests.length > 0 ? (
                      interests.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className={styles.interestTag}>{tag}</span>
                      ))
                    ) : (
                      <span style={{ color: "#cbd5e0", fontSize: "11px", fontStyle: "italic" }}>—</span>
                    )}
                    {interests.length > 2 && (
                      <span className={styles.interestTag} title={interests.slice(2).join(", ")}>
                        +{interests.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Workload */}
                  <div className={styles.workloadCell}>
                    <ShieldCheck
                      size={16}
                      className={reviewer._count?.reviewsGiven > 2 ? styles.workloadHigh : styles.workloadNormal}
                    />
                    <div>
                      <div className={`${styles.workloadBadge} ${reviewer._count?.reviewsGiven > 2 ? styles.workloadHigh : styles.workloadNormal}`}>
                        {reviewer._count?.reviewsGiven || 0}
                      </div>
                      <div className={styles.workloadLabel}>Active</div>
                    </div>
                  </div>

                  {/* Status / Role */}
                  <div className={styles.actionCell}>
                    {assigned ? (
                      <div className={styles.assignedBadge}>
                        <CheckCircle size={12} />
                        Assigned
                      </div>
                    ) : (
                      <span className={`${styles.roleBadge} ${
                        reviewer.role === "EDITOR" || reviewer.role === "EDITOR_IN_CHIEF"
                          ? styles.roleEditor
                          : styles.roleReviewer
                      }`}>
                        {reviewer.role?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.selectionInfo}>
            {selectedReviewer ? (
              <>
                Selected:{" "}
                <span className={styles.selectionInfoBold}>{selectedReviewer.name}</span>
                {selectedReviewer.affiliation && (
                  <> &mdash; {selectedReviewer.affiliation}</>
                )}
              </>
            ) : (
              "Click a row to select a peer reviewer for assignment"
            )}
          </div>

          <button
            onClick={handleAssign}
            disabled={!selectedReviewerId || assigning}
            className={styles.assignBtn}
          >
            {assigning ? (
              <><Loader2 className={styles.spinner} size={16} /> Assigning...</>
            ) : (
              <><UserPlus size={16} /> Confirm Assignment</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
