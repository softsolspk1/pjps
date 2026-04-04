import { Article, User, AuthorMapping, Issue, Volume } from "@prisma/client";

/** 
 * Minimal JATS XML Generator for CrossRef/Scopus Metadata
 * Using Journal Article Tag Suite (JATS) 1.2
 */
export function generateJatsXml(
  article: Article & { 
    submitter: User | null; 
    authors: AuthorMapping[]; 
    issue: (Issue & { volume: Volume }) | null 
  }
) {
  const dateStr = new Date(article.createdAt).toISOString().split('T')[0];
  const [year, month, day] = dateStr.split('-');

  const jats = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Archiving and Interchange DTD v1.2 20190208//EN" "JATS-archivearticle1.dtd">
<article xmlns:xlink="http://www.w3.org/1999/xlink" article-type="research-article" xml:lang="en">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher-id">PJPS</journal-id>
      <journal-title-group>
        <journal-title>Pakistan Journal of Pharmaceutical Sciences</journal-title>
      </journal-title-group>
      <issn pub-type="ppub">1011-601X</issn>
      <publisher>
        <publisher-name>Faculty of Pharmacy, University of Karachi</publisher-name>
      </publisher>
    </journal-meta>
    <article-meta>
      <article-id pub-id-type="doi">${article.doi || "10.36721/PJPS.PENDING"}</article-id>
      <title-group>
        <article-title>${article.title}</article-title>
      </title-group>
      <contrib-group>
        ${article.authors.map((auth, idx) => `
        <contrib contrib-type="author">
          <name>
            <surname>${auth.name.split(' ').pop()}</surname>
            <given-names>${auth.name.split(' ').slice(0, -1).join(' ')}</given-names>
          </name>
          <aff>${auth.address || "Dept. of Pharmacy, University of Karachi"}</aff>
          <email>${auth.email || ""}</email>
        </contrib>`).join('')}
      </contrib-group>
      <pub-date pub-type="epub">
        <day>${day}</day>
        <month>${month}</month>
        <year>${year}</year>
      </pub-date>
      <volume>${article.issue?.volume.number || "39"}</volume>
      <issue>${article.issue?.number || "6"}</issue>
      <abstract>
        <p>${article.abstract || ""}</p>
      </abstract>
      <kwd-group>
        <kwd>Pharmacy</kwd>
        <kwd>Pharmacology</kwd>
        <kwd>Drug Development</kwd>
      </kwd-group>
    </article-meta>
  </front>
  <body>
    <p>Manuscript content follows in the full-text PDF version.</p>
  </body>
</article>`;

  return jats;
}

export function generateSimpleJson(article: Article) {
  return JSON.stringify(article, null, 2);
}
