"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Document, Packer, Paragraph, TextRun, AlignmentType, SectionType, ImageRun, BorderStyle, Table, TableRow, TableCell, convertInchesToTwip, WidthType, PageNumber } from "docx";
import { saveAs } from "file-saver";
import { Download, Edit3, Eye, Printer, Loader2 } from "lucide-react";
import styles from "./formatting.module.css";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const formats = [
  "header", "bold", "italic", "underline", "script",
  "list", "bullet", "align", "image", "clean"
];

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline"],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["image", "clean"],
  ],
  clipboard: { matchVisual: false },
};

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

export default function FormattingTool() {
  const [view, setView] = useState<"EDIT" | "PREVIEW">("EDIT");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // States
  const [title, setTitle] = useState("Pharmacodynamic basis of gabapentin combined with Hegu-point catgut embedding for post-herpetic neuralgia");
  const [doi, setDoi] = useState("doi.org/10.36721/PJPS.2026.39.5.152.1");
  const [dates, setDates] = useState({
    submitted: "06-08-2025",
    revised: "29-12-2025",
    accepted: "02-01-2026",
  });
  const [keywords, setKeywords] = useState("Gabapentin; Hegu-point catgut embedding; Neuro-inflammation; Pharmacodynamics; Post-herpetic neuralgia");
  const [authors, setAuthors] = useState<Author[]>([
    { name: "Li-Ping Li", affiliation: "Dermatology, Sui Ning First People's Hospital in Sichuan Province, Sui Ning, China" },
  ]);
  const [sections, setSections] = useState<Sections>({
    abstract: "Background: Post-herpetic neuralgia (PHN) is a common complication. Methods: A randomized study... Results: Both groups displayed significant reduction in pain.",
    introduction: "<p>Neuropathic pain is the most common complication reported in patients suffering from herpes zoster...</p>",
    materialsMethods: "",
    results: "",
    discussion: "",
    conclusion: "",
    references: "<p>Abd-Elsalam et al. (2024). Pain Management. <i>Journal of Pain</i>.</p>",
  });

  const handleAuthor = (i: number, field: "name"|"affiliation", val: string) => {
    const arr = [...authors]; arr[i][field] = val; setAuthors(arr);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: "", affiliation: "" }]);
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSectionChange = (key: keyof Sections, val: string) => {
    setSections({ ...sections, [key]: val });
  };

  /* ── 1. EXACT PDF GENERATION VIA HTML2PDF ── */
  const exportPDF = async () => {
    if (!printRef.current) return;
    setIsPdfGenerating(true);
    
    // We target the .a4Page container precisely.
    const element = printRef.current;
    
    const opt: any = {
      margin:       0,
      filename:     `${(title || 'PJPS_Article').substring(0,25).replace(/\\s+/g,'_')}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: "#ffffff" },
      // html2pdf will treat the 210x297mm div as the exact page.
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert("PDF generation failed.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  /* ── 2. EXACT DOCX GENERATION VIA OOXML ── */
  const exportWord = async () => {
    // Parser to convert HTML content into DOCX paragraphs
    const parseHTML = (html: string): (Paragraph | Table)[] => {
      if (typeof window === 'undefined') return [];
      const docParser = new DOMParser().parseFromString(html, 'text/html');
      const docxElements: (Paragraph | Table)[] = [];

      const parseInline = (node: ChildNode): any[] => {
        const runs: any[] = [];
        node.childNodes.forEach((child: any) => {
          const tag = child.nodeName;
          const text = child.textContent || "";
          
          if (tag === 'STRONG' || tag === 'B') {
            runs.push(new TextRun({ text, bold: true, size: 20, font: "Times New Roman" })); // 20 half-points = 10pt
          } else if (tag === 'EM' || tag === 'I') {
            runs.push(new TextRun({ text, italics: true, size: 20, font: "Times New Roman" }));
          } else if (tag === 'SUP') {
            runs.push(new TextRun({ text, superScript: true, size: 14, font: "Times New Roman" }));
          } else if (tag === 'SUB') {
            runs.push(new TextRun({ text, subScript: true, size: 14, font: "Times New Roman" }));
          } else if (tag === 'SPAN') {
            runs.push(...parseInline(child));
          } else if (tag === 'IMG') {
            const src = child.getAttribute('src');
            if (src && src.startsWith('data:image')) {
              runs.push(new ImageRun({
                data: src.split(',')[1],
                transformation: { width: 330, height: 220 }, // Approximate scaling
              }));
            }
          } else if (text) {
            runs.push(new TextRun({ text, size: 20, font: "Times New Roman" }));
          }
        });
        return runs;
      };

      docParser.body.childNodes.forEach((node: any) => {
        const tag = node.nodeName;
        
        if (tag === 'P' || tag === 'DIV') {
          const children = parseInline(node);
          if (children.length > 0) {
            docxElements.push(new Paragraph({
              children,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120, line: 276 }, // 6pt after, 1.15 line spacing
            }));
          }
        } 
        else if (tag === 'H1' || tag === 'H2') {
          docxElements.push(new Paragraph({
            children: [new TextRun({ text: node.textContent?.toUpperCase() || "", bold: true, size: 22, font: "Times New Roman" })],
            spacing: { before: 200, after: 120 },
          }));
        } 
        else if (tag === 'H3' || tag === 'H4') {
          docxElements.push(new Paragraph({
            children: [new TextRun({ text: node.textContent || "", bold: true, italics: true, size: 20, font: "Times New Roman" })],
            spacing: { before: 160, after: 80 },
          }));
        }
        else if (tag === 'UL' || tag === 'OL') {
          node.querySelectorAll('li').forEach((li: any) => {
            docxElements.push(new Paragraph({
              children: parseInline(li),
              bullet: tag === 'UL' ? { level: 0 } : undefined,
              numbering: tag === 'OL' ? { reference: "my-numbering", level: 0 } : undefined,
              spacing: { after: 60, line: 276 },
            }));
          });
        }
        else if (tag === 'TABLE') {
          const rows = Array.from(node.querySelectorAll('tr')).map((tr: any) => {
            const cells = Array.from(tr.querySelectorAll('td, th')).map((td: any) => {
              return new TableCell({
                children: [
                  new Paragraph({ 
                    children: parseInline(td),
                    spacing: { before: 60, after: 60 }
                  })
                ],
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  bottom: { style: BorderStyle.DOTTED, size: 4, color: "999999" },
                  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                }
              });
            });
            return new TableRow({ children: cells });
          });

          if (rows.length > 0) {
            docxElements.push(new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
              }
            }));
            docxElements.push(new Paragraph({ text: "", spacing: { after: 120 } }));
          }
        }
        else if (tag === 'IMG') {
          const src = node.getAttribute('src');
          if (src && src.startsWith('data:image')) {
            docxElements.push(new Paragraph({
              children: [new ImageRun({
                data: src.split(',')[1],
                transformation: { width: 400, height: 280 },
              })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 }
            }));
          }
        }
        else if (node.nodeType === 3 && node.textContent?.trim()) {
          docxElements.push(new Paragraph({
            children: [new TextRun({ text: node.textContent, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 276 }
          }));
        }
      });
      return docxElements;
    };

    // References parser (adds hanging indent)
    const parseReferences = (html: string): Paragraph[] => {
       const base = parseHTML(html) as Paragraph[];
       // Modify each paragraph to have hanging indent
       return base.map(p => {
          return new Paragraph({
            ...p,
            indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
            spacing: { after: 80, line: 260 }
          });
       });
    };

    // BUILD THE DOCX
    const doc = new Document({
      creator: "PJPS formatting tool",
      numbering: {
        config: [
          {
            reference: "my-numbering",
            levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }],
          }
        ]
      },
      sections: [
        /* ── SECTION 1: HEADER & META (Single Column) ── */
        {
          properties: {
            page: {
              margin: { top: convertInchesToTwip(1), right: convertInchesToTwip(0.8), bottom: convertInchesToTwip(1), left: convertInchesToTwip(0.8) },
              size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) } // A4
            }
          },
          children: [
            // Journal Header
            new Paragraph({
              children: [
                new TextRun({ text: `Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1600-1610`, italics: true, size: 18, font: "Times New Roman" }),
                new TextRun({ text: `\t${doi.toUpperCase()}`, bold: true, size: 18, font: "Times New Roman" }),
              ],
              tabStops: [{ type: "right", position: convertInchesToTwip(6.67) }],
              border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
              spacing: { after: 360 }
            }),
            // Title
            new Paragraph({
              children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }),
            // Authors
            new Paragraph({
              children: authors.filter(a => a.name).map((a, i) => new TextRun({ text: `${a.name}${i+1}${i < authors.length-1 ? ', ' : ''}`, bold: true, size: 24, font: "Times New Roman" })),
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }),
            // Affiliations
            ...authors.filter(a => a.affiliation).map((a, i) => new Paragraph({
              children: [new TextRun({ text: `${i+1} ${a.affiliation}`, italics: true, size: 20, font: "Times New Roman" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 }
            })),
            new Paragraph({ text: "", spacing: { after: 240 } }), // Space before abstract
            // Abstract
            new Paragraph({
              children: [
                new TextRun({ text: "Abstract: ", bold: true, size: 20, font: "Times New Roman" }),
                new TextRun({ text: sections.abstract.replace("Abstract:", "").trim(), size: 20, font: "Times New Roman" })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 160, line: 276 }
            }),
            // Keywords
            new Paragraph({
              children: [
                new TextRun({ text: "Keywords: ", bold: true, size: 20, font: "Times New Roman" }),
                new TextRun({ text: keywords, size: 20, font: "Times New Roman" })
              ],
              spacing: { after: 240 }
            }),
            // Date line
            new Paragraph({
              children: [new TextRun({ text: `Submitted on ${dates.submitted} — Revised on ${dates.revised} — Accepted on ${dates.accepted}`, italics: true, size: 18, font: "Times New Roman" })],
              border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
              spacing: { after: 240 }
            })
          ],
        },
        /* ── SECTION 2: BODY TEXT (Two Columns) ── */
        {
          properties: {
            type: SectionType.CONTINUOUS,
            column: { count: 2, space: convertInchesToTwip(0.28) }, // ~20pt gap
          },
          children: [
            // Body Sections
            ...[
              { key: 'introduction', label: 'INTRODUCTION' },
              { key: 'materialsMethods', label: 'MATERIALS AND METHODS' },
              { key: 'results', label: 'RESULTS' },
              { key: 'discussion', label: 'DISCUSSION' },
              { key: 'conclusion', label: 'CONCLUSION' }
            ].filter(s => sections[s.key as keyof typeof sections]?.trim())
             .flatMap(s => [
               new Paragraph({
                 children: [new TextRun({ text: s.label, bold: true, size: 22, font: "Times New Roman" })],
                 spacing: { before: 240, after: 120 }
               }),
               ...parseHTML(sections[s.key as keyof typeof sections])
             ]),
            
            // References Section (hanging indent)
            ...(sections.references?.trim() ? [
              new Paragraph({
                 children: [new TextRun({ text: "REFERENCES", bold: true, size: 22, font: "Times New Roman" })],
                 spacing: { before: 240, after: 120 }
               }),
               ...parseReferences(sections.references)
            ] : [])
          ],
        }
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${(title || "PJPS_Article").substring(0,25).replace(/\s+/g, '_')}.docx`);
  };

  /* ── UI RENDERING ── */
  return (
    <div className={styles.container}>
      <div className={styles.toolHeader}>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] block mb-1">Elite Manuscript Workspace</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700 italic">Professional Academic Formatting</span>
          </div>
        </div>
        <div className={styles.controls}>
          {view === "EDIT" ? (
             <button onClick={() => setView("PREVIEW")} className="btn btn-outline flex items-center gap-2">
               <Eye size={16} /> Preview Mode
             </button>
          ) : (
             <button onClick={() => setView("EDIT")} className="btn btn-outline flex items-center gap-2">
               <Edit3 size={16} /> Editor Mode
             </button>
          )}

          <button onClick={exportPDF} disabled={isPdfGenerating} className="btn btn-primary flex items-center gap-2" style={{ background: '#002d5e' }}>
            {isPdfGenerating ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} 
            Download PDF
          </button>
          <button onClick={exportWord} className="btn btn-outline flex items-center gap-2 border-slate-300">
            <Download size={16} /> Download DOCX
          </button>
        </div>
      </div>

      {view === "EDIT" && (
        <div className="space-y-10">
          <div className={styles.editorSection}>
            <label className={styles.label}>Full Manuscript Title</label>
            <textarea 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className={styles.titleField} rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={styles.editorSection}>
              <label className={styles.label}>Authors & Affiliations</label>
              <div className={styles.authorsGrid}>
                {authors.map((author, i) => (
                  <div key={i} className={styles.authorCard}>
                    <input type="text" value={author.name} onChange={(e) => handleAuthor(i, "name", e.target.value)} placeholder="Full Name" className={styles.authorInput} />
                    <input type="text" value={author.affiliation} onChange={(e) => handleAuthor(i, "affiliation", e.target.value)} placeholder="Affiliation / University" className={styles.authorInput} />
                    {authors.length > 1 && (
                      <button onClick={() => removeAuthor(i)} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addAuthor} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">+ Add Author</button>
            </div>

            <div className={styles.editorSection}>
              <label className={styles.label}>Manuscript Metadata</label>
              <div className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500">DOI Assignment</label><input type="text" className={styles.authorInput} value={doi} onChange={e => setDoi(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-slate-500">Keywords (; separated)</label><input type="text" className={styles.authorInput} value={keywords} onChange={e => setKeywords(e.target.value)} /></div>
                <div className={styles.metadataGrid}>
                  <div><label className="text-xs font-bold text-slate-500">Submitted</label><input type="text" className={styles.authorInput} value={dates.submitted} onChange={e => setDates({...dates, submitted: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-slate-500">Revised</label><input type="text" className={styles.authorInput} value={dates.revised} onChange={e => setDates({...dates, revised: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-slate-500">Accepted</label><input type="text" className={styles.authorInput} value={dates.accepted} onChange={e => setDates({...dates, accepted: e.target.value})} /></div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.editorSection}>
             <label className={styles.label}>Abstract (Required)</label>
             <textarea 
               value={sections.abstract} onChange={(e) => setSections({...sections, abstract: e.target.value})}
               className="w-full p-4 border border-slate-300 rounded-lg text-sm" rows={4}
             />
          </div>

          {['introduction', 'materialsMethods', 'results', 'discussion', 'conclusion', 'references'].map((key) => (
            <div key={key} className={styles.editorSection}>
              <label className={styles.label}>{key.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}</label>
              <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
                <ReactQuill 
                  theme="snow" 
                  value={sections[key as keyof Sections]} 
                  onChange={(val) => handleSectionChange(key as keyof Sections, val)}
                  modules={modules} 
                  formats={formats}
                  className="h-64"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LIVE PREVIEW / PDF CAPTURE AREA ── */}
      {view === "PREVIEW" && (
        <div className={styles.previewBackground}>
          <div className={styles.a4Page} ref={printRef}>
            {/* Header */}
            <div className={styles.pjpsHeader}>
              <div className={styles.pjpsHeaderLeft}>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1600-1610</div>
              <div className={styles.pjpsHeaderRight}>{doi}</div>
            </div>

            {/* Title Block */}
            <div className={styles.articleTitle}>{title}</div>
            <div className={styles.articleAuthors}>
              {authors.filter(a => a.name).map((a, i) => <span key={i}>{a.name}<sup>{i+1}</sup>{i < authors.length-1 ? ', ' : ''}</span>)}
              <span> *</span>
            </div>
            <div className={styles.articleAffiliations}>
              {authors.filter(a => a.affiliation).map((a, i) => <div key={i}><sup>{i+1}</sup>{a.affiliation}</div>)}
            </div>

            {/* Metadata Block */}
            <div className={styles.abstractBlock}>
              <b>Abstract: </b>{sections.abstract.replace("Abstract:", "").trim()}
            </div>
            <div className={styles.keywordsBlock}>
              <b>Keywords: </b>{keywords}
            </div>
            <div className={styles.datesBlock}>
              Submitted on {dates.submitted} — Revised on {dates.revised} — Accepted on {dates.accepted}
            </div>

            {/* Two-Column Body */}
            <div className={styles.twoColumnArea}>
              {[
                { key: 'introduction', label: 'INTRODUCTION' },
                { key: 'materialsMethods', label: 'MATERIALS AND METHODS' },
                { key: 'results', label: 'RESULTS' },
                { key: 'discussion', label: 'DISCUSSION' },
                { key: 'conclusion', label: 'CONCLUSION' }
              ].filter(s => sections[s.key as keyof typeof sections]?.trim())
               .map(s => (
                <div key={s.key} className={styles.sectionBlock}>
                  <div className={styles.sectionTitle}>{s.label}</div>
                  <div className={styles.richText} dangerouslySetInnerHTML={{ __html: sections[s.key as keyof typeof sections] }} />
                </div>
              ))}

              {sections.references?.trim() && (
                <div className={`${styles.sectionBlock} ${styles.referencesBlock}`}>
                  <div className={styles.sectionTitle}>REFERENCES</div>
                  <div className={styles.richText} dangerouslySetInnerHTML={{ __html: sections.references }} />
                </div>
              )}

              {/* Footnote */}
              <div className={styles.footnoteBlock}>
                *Corresponding author: e-mail: {authors[0]?.name ? authors[0].name.toLowerCase().replace(/\s+/g, '_') : 'author'}@pjps.pk
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
