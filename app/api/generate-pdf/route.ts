import { NextResponse } from "next/server";

const PJPS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 10pt;
    color: #000;
    background: #fff;
    line-height: 1.35;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 2.5cm 2cm 3cm 2cm;
    background: #fff;
    position: relative;
  }

  /* ── JOURNAL HEADER ── */
  .journal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 9pt;
    border-bottom: 0.5pt solid #000;
    padding-bottom: 5pt;
    margin-bottom: 18pt;
  }
  .journal-header-left { font-style: italic; }
  .journal-header-right { font-weight: bold; }

  /* ── TITLE BLOCK ── */
  .article-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    line-height: 1.3;
    margin-bottom: 14pt;
    letter-spacing: 0.01em;
  }

  .article-authors {
    font-size: 12pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 6pt;
    line-height: 1.4;
  }

  .article-affiliations {
    font-size: 10pt;
    font-style: italic;
    text-align: center;
    line-height: 1.45;
    margin-bottom: 18pt;
  }

  /* ── ABSTRACT (full width) ── */
  .abstract-block {
    font-size: 10pt;
    text-align: justify;
    line-height: 1.35;
    margin-bottom: 10pt;
  }
  .abstract-block b { font-weight: bold; }

  .keywords-block {
    font-size: 9.5pt;
    margin-bottom: 12pt;
    line-height: 1.4;
  }

  .date-line {
    font-size: 9pt;
    font-style: italic;
    border-bottom: 0.75pt solid #000;
    padding-bottom: 6pt;
    margin-bottom: 20pt;
  }

  /* ── TWO-COLUMN BODY ── */
  .scientific-body {
    column-count: 2;
    column-gap: 18pt;
    column-fill: balance;
    text-align: justify;
    font-size: 10pt;
    line-height: 1.35;
    orphans: 3;
    widows: 3;
  }

  .section-heading {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    display: block;
    margin-top: 10pt;
    margin-bottom: 6pt;
    break-after: avoid;
    page-break-after: avoid;
  }

  .section-content p {
    text-align: justify;
    margin-bottom: 8pt;
    font-size: 10pt;
    line-height: 1.35;
  }

  .section-content h1, .section-content h2 {
    font-size: 11pt; font-weight: bold; text-transform: uppercase;
    margin: 10pt 0 6pt; break-after: avoid;
  }
  .section-content h3, .section-content h4 {
    font-size: 10pt; font-weight: bold; font-style: italic;
    margin: 8pt 0 5pt; break-after: avoid;
  }

  .section-content ul, .section-content ol {
    margin: 6pt 0 6pt 18pt;
    font-size: 10pt;
    line-height: 1.35;
  }
  .section-content li { margin-bottom: 3pt; }

  .section-content sup { font-size: 7pt; vertical-align: super; line-height: 0; }
  .section-content sub { font-size: 7pt; vertical-align: sub; line-height: 0; }

  .section-content img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 12pt auto;
  }

  /* Full-width table spanning both columns */
  .section-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 8.5pt;
    border-top: 1.5pt solid black;
    border-bottom: 1.5pt solid black;
    column-span: all;
    break-inside: avoid;
  }
  .section-content th {
    border-bottom: 1pt solid black;
    padding: 4pt 5pt;
    text-align: left;
    font-weight: bold;
  }
  .section-content td {
    padding: 3.5pt 5pt;
    border-bottom: 0.5pt solid #aaa;
    text-align: left;
  }

  /* Full-width figure */
  .full-width-figure {
    column-span: all;
    text-align: center;
    margin: 18pt 0;
    break-inside: avoid;
  }
  .full-width-figure img { max-width: 100%; }
  .full-width-figure p {
    font-size: 8.5pt;
    font-weight: bold;
    margin-top: 6pt;
    text-align: center;
  }

  /* References */
  .references-section p {
    padding-left: 18pt;
    text-indent: -18pt;
    font-size: 9pt;
    line-height: 1.3;
    margin-bottom: 5pt;
  }

  /* ── FOOTNOTE ── */
  .footnote-area {
    column-span: all;
    margin-top: 20pt;
    font-size: 8pt;
    border-top: 0.5pt solid black;
    padding-top: 4pt;
  }

  /* ── PAGE FOOTER ── */
  .article-footer {
    column-span: all;
    margin-top: 14pt;
    border-top: 0.75pt solid black;
    padding-top: 4pt;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
  }
`;

function buildHtml(data: {
  title: string;
  doi: string;
  authors: { name: string; affiliation: string }[];
  keywords: string;
  dates: { submitted: string; revised: string; accepted: string };
  sections: {
    abstract: string;
    introduction: string;
    materialsMethods: string;
    results: string;
    discussion: string;
    conclusion: string;
    references: string;
  };
  volumeInfo?: string;
  pageInfo?: string;
}): string {
  const {
    title, doi, authors, keywords, dates, sections,
    volumeInfo = "Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610",
    pageInfo = "1602",
  } = data;

  const authorLine = authors
    .filter(a => a.name)
    .map((a, i) => `${a.name}<sup>${i + 1}</sup>`)
    .join(", ");

  const affiliationLines = authors
    .filter(a => a.affiliation)
    .map((a, i) => `<div><sup>${i + 1}</sup>${a.affiliation}</div>`)
    .join("");

  const dateStr = [
    dates.submitted ? `Submitted on ${dates.submitted}` : "Submitted on 27-08-2024",
    dates.revised   ? `Revised on ${dates.revised}`     : "Revised on 31-10-2024",
    dates.accepted  ? `Accepted on ${dates.accepted}`   : "Accepted on 31-10-2024",
  ].join(" \u2014 ");

  const bodySections: { label: string; key: keyof typeof sections }[] = [
    { label: "Introduction",          key: "introduction" },
    { label: "Materials and Methods", key: "materialsMethods" },
    { label: "Results",               key: "results" },
    { label: "Discussion",            key: "discussion" },
    { label: "Conclusion",            key: "conclusion" },
  ];

  const bodyHtml = bodySections
    .filter(s => sections[s.key]?.trim())
    .map(s => `
      <div class="scientific-section">
        <span class="section-heading">${s.label}</span>
        <div class="section-content">${sections[s.key]}</div>
      </div>
    `).join("");

  const referencesHtml = sections.references?.trim() ? `
    <div class="scientific-section">
      <span class="section-heading">References</span>
      <div class="section-content references-section">${sections.references}</div>
    </div>
  ` : "";

  const correspondingEmail = authors[0]?.name
    ? authors[0].name.toLowerCase().replace(/\s+/g, "_") + "@pjps.pk"
    : "author@pjps.pk";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || "PJPS Article"}</title>
  <style>${PJPS_CSS}</style>
</head>
<body>
<div class="page">

  <div class="journal-header">
    <div class="journal-header-left">${volumeInfo}</div>
    <div class="journal-header-right">${doi || "doi.org/10.36721/PJPS..."}</div>
  </div>

  <h1 class="article-title">${title || "Untitled Manuscript"}</h1>
  <p class="article-authors">${authorLine}<span> *</span></p>
  <div class="article-affiliations">${affiliationLines}</div>

  <div class="abstract-block">
    <b>Abstract: </b>${sections.abstract || ""}
  </div>

  <div class="keywords-block">
    <b>Keywords:</b> ${keywords || "Not specified"}
  </div>

  <div class="date-line">${dateStr}</div>

  <div class="scientific-body">
    ${bodyHtml}
    ${referencesHtml}

    <div class="footnote-area">
      *Corresponding author: e-mail: ${correspondingEmail}
    </div>

    <div class="article-footer">
      <span>${pageInfo}</span>
      <span>${volumeInfo}</span>
    </div>
  </div>

</div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const html = buildHtml(data);

    // Dynamic import to avoid build-time issues
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    // In development, use local Chrome; on Vercel, use sparticuz chromium
    let executablePath: string;
    if (process.env.NODE_ENV === "development") {
      // Try common local Chrome paths on Windows/Mac/Linux
      const { execSync } = await import("child_process");
      const candidates = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
      ];
      let found = false;
      for (const c of candidates) {
        try {
          const fs = await import("fs");
          if (fs.existsSync(c)) { executablePath = c; found = true; break; }
        } catch {}
      }
      if (!found) {
        executablePath = await chromium.executablePath();
      }
    } else {
      executablePath = await chromium.executablePath();
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath!,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: false,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      // Margins are handled inside the HTML .page div to match PJPS spec
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdf);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PJPS_Article.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: err.message || "PDF generation failed" }, { status: 500 });
  }
}
