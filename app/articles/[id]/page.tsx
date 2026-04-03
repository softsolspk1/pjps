import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./ArticleView.module.css";

export default async function ArticleReaderPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: { authors: { orderBy: { sequence: 'asc' } }, media: true }
  });

  if (!article || article.status !== "PUBLISHED") {
    return notFound();
  }

  const sections = [
    { title: "Introduction", id: "introduction", content: article.introduction },
    { title: "Materials and Methods", id: "materials", content: article.materialsMethods },
    { title: "Results", id: "results", content: article.results },
    { title: "Discussion", id: "discussion", content: article.discussion },
    { title: "Conclusion", id: "conclusion", content: article.conclusion },
  ];

  return (
    <div className={styles.articleContainer}>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Scientific Portal
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
          Date Published: {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <section className={styles.abstractSection}>
        <h2 className={styles.sectionTitle}>ABSTRACT</h2>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.abstract || '' }} />
      </section>

      <div className={styles.bodyGrid}>
        {sections.filter(s => s.content).map(sec => (
          <section key={sec.id} id={sec.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{sec.title}</h2>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: sec.content || '' }} />
          </section>
        ))}
      </div>

      {article.references && (
        <section className={styles.referencesContainer}>
          <h2 className={styles.sectionTitle}>REFERENCES</h2>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.references || '' }} />
        </section>
      )}

    </div>
  );
}
