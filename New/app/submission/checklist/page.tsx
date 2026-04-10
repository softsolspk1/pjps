"use client";

import { CheckCircle, Info, DollarSign, FileText, ShieldCheck, AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "./Checklist.module.css";

export default function SubmissionChecklistPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.badge}>Author Guidance Center</div>
          <h1 className={styles.title}>Submission Readiness Checklist</h1>
          <p className={styles.subtitle}>Ensure your scholarly work meets PJPS standards before initiating the formal submission process.</p>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          {/* Section 1: Formatting & Scope */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><FileText size={20} /> Manuscript Formatting</div>
            <ul className={styles.checkList}>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>The submission has not been previously published, nor is it before another journal for consideration.</span>
              </li>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>The submission file is in **Microsoft Word (.doc or .docx)** format.</span>
              </li>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>Where available, URLs for the references have been provided.</span>
              </li>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>The text is single-spaced; uses a 12-point font; employs italics, rather than underlining.</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Ethics & COI */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><ShieldCheck size={20} /> Ethical Compliance</div>
            <ul className={styles.checkList}>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>Conflict of Interest (COI) statement is included on the title page.</span>
              </li>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>Human/Animal ethics committee approval details are clearly documented in the methods section.</span>
              </li>
              <li>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>All authors have read and approved the final manuscript.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Detailed Fee Structure */}
          <section className={styles.section}>
            <div className={styles.sectionTitle}><DollarSign size={20} /> Final Fee Structure (Regular Track)</div>
            <div className={styles.feeInfo}>
              <p>Submission of processing fees does not guarantee acceptance. All fees include handling and mailing charges.</p>
              <div className={styles.feeGrid}>
                <div className={styles.feeItem}>
                  <span className={styles.feeLabel}>Processing Fee (Non-refundable)</span>
                  <span className={styles.feeValue}>Rs. 2,000 / $20</span>
                </div>
                <div className={styles.feeItem}>
                  <span className={styles.feeLabel}>Publication Charge (3 Pages)</span>
                  <span className={styles.feeValue}>Rs. 15,000 / $150</span>
                </div>
                <div className={styles.feeItem}>
                  <span className={styles.feeLabel}>Extra / Color Page</span>
                  <span className={styles.feeValue}>Rs. 1,000 / $10</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.pricingCard}>
             <h3 className={styles.cardTitle}>Choose Submission Track</h3>
             <div className={styles.trackList}>
                <div className={styles.trackItem}>
                   <div className={styles.trackInfo}>
                      <span className={styles.trackName}>Regular Track</span>
                      <span className={styles.trackPrice}>Standard Pricing</span>
                   </div>
                   <div className={styles.trackTime}>~8-12 Weeks</div>
                </div>
                <div className={styles.trackItem}>
                   <div className={styles.trackInfo}>
                      <span className={styles.trackName}>Fast Track</span>
                      <span className={styles.trackPrice}>Premium Upgrade</span>
                   </div>
                   <div className={styles.trackTime}>~4-6 Weeks</div>
                </div>
                <div className={styles.trackItem}>
                   <div className={styles.trackInfo}>
                      <span className={styles.trackName}>Ultra Fast Track</span>
                      <span className={styles.trackPrice}>Priority Elite</span>
                   </div>
                   <div className={styles.trackTime}>~2 Weeks</div>
                </div>
             </div>
             
             <div className={styles.warningBox}>
                <AlertTriangle size={18} />
                <p>Note: Upgrade fees apply for priority processing. Consult editorial office for latest premium rates.</p>
             </div>

             <Link href="/submission" className={styles.submitBtn}>
                Initiate Submission <ArrowRight size={18} />
             </Link>
          </div>

          <div className={styles.resources}>
             <h4 className={styles.resTitle}>Helpful Resources</h4>
             <a href="#" className={styles.resLink}>Author Guidelines PDF <ExternalLink size={14} /></a>
             <a href="#" className={styles.resLink}>Template Manuscript <ExternalLink size={14} /></a>
             <a href="#" className={styles.resLink}>Ethics Statement FAQ <ExternalLink size={14} /></a>
          </div>
        </aside>
      </div>
    </div>
  );
}
