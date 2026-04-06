"use client";

import { useEffect, useState } from "react";
import styles from "./print.module.css";

type Author = { name: string; affiliation: string };
type Sections = {
  abstract: string;
  introduction: string;
  materialsMethods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string;
};
type ArticleData = {
  title: string;
  doi: string;
  authors: Author[];
  keywords: string;
  dates: { submitted: string; revised: string; accepted: string };
  sections: Sections;
};

const BODY_SECTIONS: { label: string; key: keyof Sections }[] = [
  { label: "Introduction",          key: "introduction" },
  { label: "Materials and Methods", key: "materialsMethods" },
  { label: "Results",               key: "results" },
  { label: "Discussion",            key: "discussion" },
  { label: "Conclusion",            key: "conclusion" },
];

export default function PrintPreviewPage() {
  const [data, setData] = useState<ArticleData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pjps_print_data");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  const handlePrint = () => window.print();

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#64748b" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <p style={{ fontWeight: 700 }}>No article data found.</p>
        <p style={{ fontSize: 14 }}>Please go back to the <a href="/formatting" style={{ color: "#002d5e" }}>Formatting Tool</a> and click "Open Print View".</p>
      </div>
    </div>
  );

  const { title, doi, authors, keywords, dates, sections } = data;

  const volumeInfo = "Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610";

  const dateStr = [
    dates.submitted ? `Submitted on ${dates.submitted}` : "Submitted on 27-08-2024",
    dates.revised   ? `Revised on ${dates.revised}`     : "Revised on 31-10-2024",
    dates.accepted  ? `Accepted on ${dates.accepted}`   : "Accepted on 31-10-2024",
  ].join(" — ");

  return (
    <>
      {/* Print Toolbar — hidden when printing */}
      <div className={styles.printToolbar}>
        <div className={styles.toolbarContent}>
          <div className={styles.toolbarLeft}>
            <div className={styles.toolbarBadge}>PJPS Print Preview</div>
            <span className={styles.toolbarTitle}>{title || "Untitled"}</span>
          </div>
          <div className={styles.toolbarActions}>
            <a href="/formatting" className={styles.backBtn}>← Back to Editor</a>
            <button onClick={handlePrint} className={styles.printBtn}>
              🖨 Save as PDF (Ctrl+P)
            </button>
          </div>
        </div>
        <p className={styles.toolbarHint}>
          In the print dialog: select <strong>Save as PDF</strong>, set paper to <strong>A4</strong>, and set margins to <strong>None</strong>.
        </p>
      </div>

      {/* Article - this is what gets printed */}
      <div className={styles.printPage}>
        <div className={styles.articleSheet}>

          {/* Journal Header */}
          <div className={styles.journalHeader}>
            <span className={styles.journalHeaderLeft}>{volumeInfo}</span>
            <span className={styles.journalHeaderRight}>{doi || "doi.org/10.36721/PJPS..."}</span>
          </div>

          {/* Title */}
          <h1 className={styles.articleTitle}>{title || "Untitled Manuscript"}</h1>

          {/* Authors */}
          <p className={styles.articleAuthors}>
            {authors.filter(a => a.name).map((a, i) => (
              <span key={i}>
                {a.name}<sup>{i + 1}</sup>
                {i < authors.filter(a => a.name).length - 1 ? ", " : ""}
              </span>
            ))}
            <span> *</span>
          </p>

          {/* Affiliations */}
          <div className={styles.articleAffiliations}>
            {authors.filter(a => a.affiliation).map((a, i) => (
              <div key={i}><sup>{i + 1}</sup>{a.affiliation}</div>
            ))}
          </div>

          {/* Abstract — full width */}
          {sections.abstract && (
            <div className={styles.abstractBlock}>
              <div dangerouslySetInnerHTML={{ __html: `<b>Abstract: </b>${sections.abstract}` }} />
            </div>
          )}

          {/* Keywords */}
          <div className={styles.keywordsBlock}>
            <b>Keywords: </b>{keywords || "Not specified"}
          </div>

          {/* Date Line */}
          <div className={styles.dateLine}>{dateStr}</div>

          {/* Two-Column Body */}
          <div className={styles.scientificBody}>
            {BODY_SECTIONS.filter(s => sections[s.key]?.trim()).map(s => (
              <div key={s.key} className={styles.scientificSection}>
                <span className={styles.sectionHeading}>{s.label}</span>
                <div
                  className={styles.sectionContent}
                  dangerouslySetInnerHTML={{ __html: sections[s.key] }}
                />
              </div>
            ))}

            {sections.references?.trim() && (
              <div className={styles.scientificSection}>
                <span className={styles.sectionHeading}>References</span>
                <div
                  className={`${styles.sectionContent} ${styles.referencesContent}`}
                  dangerouslySetInnerHTML={{ __html: sections.references }}
                />
              </div>
            )}

            {/* Footnote */}
            <div className={styles.footnoteArea}>
              <div className={styles.footnoteLine}>
                *Corresponding author: e-mail:{" "}
                {authors[0]?.name
                  ? authors[0].name.toLowerCase().replace(/\s+/g, "_") + "@pjps.pk"
                  : "author@pjps.pk"}
              </div>
            </div>

            {/* Page Footer */}
            <div className={styles.articleFooter}>
              <span>1602</span>
              <span>{volumeInfo}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
