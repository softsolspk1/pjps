import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./ArticleView.module.css";
import { 
  Eye, Download, Quote, 
  Share2, FileText, ChevronRight,
  TrendingUp, Award, Globe,
  Calendar, Hash, Book
} from "lucide-react";
import Script from "next/script";

export default async function ArticleReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Fetch complete article with metadata
  const article = await prisma.article.findUnique({
    where: { id: id },
    include: { 
      authors: { orderBy: { sequence: 'asc' } }, 
      media: true, 
      issue: { include: { volume: true } } 
    }
  });

  if (!article || article.status !== "PUBLISHED") {
    return notFound();
  }

  // 2. Fetch live impact metrics
  const pageViews = await prisma.pageView.count({
    where: { path: `/articles/${id}` }
  });

  const legacySections = [
    { title: "Introduction", id: "introduction", content: article.introduction },
    { title: "Materials and Methods", id: "materials", content: article.materialsMethods },
    { title: "Results", id: "results", content: article.results },
    { title: "Discussion", id: "discussion", content: article.discussion },
    { title: "Conclusion", id: "conclusion", content: article.conclusion },
  ];

  return (
    <div className={styles.articleContainer}>
      <Link href="/search" className={styles.backLink}>
        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Advanced Search
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.authorsList}>
          {article.authors.map(a => (
            <div key={a.id} className={styles.authorItem}>
                <span className={styles.authorName}>{a.name}</span>
                <span className={styles.authorAffiliation}>{a.address || "PJPS Researcher"}</span>
            </div>
          ))}
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Calendar size={14} /> 
            Published: {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className={styles.metaItem}>
             <Hash size={14} /> 
             DOI: <span className={styles.doiVal}>{article.doi || "Pending"}</span>
          </div>
        </div>
      </header>

      {/* Modern Scholarly Impact Bar */}
      <div className={styles.metricsBar}>
         <div className={styles.metricCard}>
            <Eye size={18} />
            <div className={styles.metricText}>
               <span className={styles.metricVal}>{pageViews}</span>
               <span className={styles.metricLabel}>Views</span>
            </div>
         </div>
         <div className={styles.metricCard}>
            <Download size={18} />
            <div className={styles.metricText}>
               <span className={styles.metricVal}>{article.downloadCount || 0}</span>
               <span className={styles.metricLabel}>Downloads</span>
            </div>
         </div>
         
         {article.doi && (
           <>
             <div className={styles.metricCard}>
                <div 
                  className="altmetric-embed" 
                  data-badge-type="donut" 
                  data-doi={article.doi} 
                  data-condensed="true"
                ></div>
             </div>
             <div className={styles.metricCard}>
                <div 
                   className="__dimensions_badge_embed__" 
                   data-doi={article.doi} 
                   data-style="small_rectangle"
                ></div>
             </div>
           </>
         )}
      </div>

      <section className={styles.abstractSection}>
        <div className={styles.abstractHeader}>
           <h2 className={styles.sectionTitle}>ABSTRACT</h2>
           <a 
             href={`/api/articles/${article.id}/download`} 
             className={styles.downloadPaper}
             target="_blank"
           >
             Download Manuscript PDF <FileText size={16} />
           </a>
        </div>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.abstract || '' }} />
        {article.keywords && (
          <div className={styles.keywordsLine}>
            <strong>Keywords:</strong> {article.keywords}
          </div>
        )}
      </section>

      <div className={styles.bodyGrid}>
        {article.content ? (
           <div className={styles.twoColumnContent} dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          legacySections.filter(s => s.content).map(sec => (
            <section key={sec.id} id={sec.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{sec.title}</h2>
              <div className={styles.content} dangerouslySetInnerHTML={{ __html: sec.content || '' }} />
            </section>
          ))
        )}
      </div>

      {article.references && (
        <section className={styles.referencesContainer}>
          <h2 className={styles.sectionTitle}>REFERENCES</h2>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.references || '' }} />
        </section>
      )}

      {/* External Metrics Scripts */}
      <Script src="https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js" strategy="lazyOnload" />
      <Script src="https://badge.dimensions.ai/badge.js" strategy="lazyOnload" />
    </div>
  );
}
