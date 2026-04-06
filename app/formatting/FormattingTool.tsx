"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, SectionType, ImageRun, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { FileText, Download, Printer, Users, Layout, PlusCircle, Trash2, Eye, Edit3, BarChart3, Save, Calendar, Globe } from "lucide-react";
import styles from "./formatting.module.css";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import Quill
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false, // Cleaner pasting
  },
};

const formats = [
  "header", "bold", "italic", "underline", "strike",
  "color", "background", "list", "bullet", "align",
  "link", "image", "video"
];

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
  const [title, setTitle] = useState("");
  const [doi, setDoi] = useState("");
  const [dates, setDates] = useState({
    submitted: "",
    revised: "",
    accepted: ""
  });
  const [keywords, setKeywords] = useState("");
  const [currAuthor, setCurrAuthor] = useState("");
  const [authors, setAuthors] = useState<Author[]>([
    { name: "", affiliation: "" }
  ]);
  const [sections, setSections] = useState<Sections>({
    abstract: "",
    introduction: "",
    materialsMethods: "",
    results: "",
    discussion: "",
    conclusion: "",
    references: "",
  });

  const printRef = useRef(null);

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    if (authors.length < 8) setAuthors([...authors, { name: "", affiliation: "" }]);
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSectionChange = (key: keyof Sections, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title || "PJPS_Formatted_Article",
  });

  const exportToWord = async () => {
  const parseHtmlToDocx = (html: string): (Paragraph)[] => {
    if (typeof window === 'undefined') return [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const paragraphs: Paragraph[] = [];

    const parseInlineNodes = (node: ChildNode): any[] => {
      const runs: any[] = [];
      node.childNodes.forEach((child: any) => {
        const tag = child.nodeName;
        const text = child.textContent || "";
        if (tag === 'STRONG' || tag === 'B') {
          runs.push(new TextRun({ text, bold: true, font: "Times New Roman", size: 20 }));
        } else if (tag === 'EM' || tag === 'I') {
          runs.push(new TextRun({ text, italics: true, font: "Times New Roman", size: 20 }));
        } else if (tag === 'U') {
          runs.push(new TextRun({ text, underline: {}, font: "Times New Roman", size: 20 }));
        } else if (tag === 'SUP') {
          runs.push(new TextRun({ text, superScript: true, font: "Times New Roman", size: 16 }));
        } else if (tag === 'SUB') {
          runs.push(new TextRun({ text, subScript: true, font: "Times New Roman", size: 16 }));
        } else if (tag === 'IMG') {
          const src = child.getAttribute('src');
          if (src?.startsWith('data:image')) {
            runs.push(new ImageRun({
              data: src.split(',')[1],
              transformation: { width: 330, height: 220 },
            }));
          }
        } else if (tag === 'SPAN') {
          // Recurse for nested spans (Quill color/background spans)
          runs.push(...parseInlineNodes(child));
        } else {
          if (text) runs.push(new TextRun({ text, font: "Times New Roman", size: 20 }));
        }
      });
      return runs;
    };

    const processNode = (node: any) => {
      const tag = node.nodeName;

      if (tag === 'P' || tag === 'DIV') {
        const children = parseInlineNodes(node);
        if (children.length > 0) {
          paragraphs.push(new Paragraph({ 
            children, 
            alignment: AlignmentType.JUSTIFIED, 
            spacing: { after: 100, line: 276 } 
          }));
        }
      } else if (tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4') {
        const sizeMap: Record<string, number> = { H1: 24, H2: 22, H3: 21, H4: 20 };
        paragraphs.push(new Paragraph({
          children: [new TextRun({ 
            text: node.textContent?.toUpperCase() || "", 
            bold: true, 
            font: "Times New Roman", 
            size: sizeMap[tag] 
          })],
          spacing: { before: 200, after: 100 },
        }));
      } else if (tag === 'UL' || tag === 'OL') {
        node.querySelectorAll('li').forEach((li: any, idx: number) => {
          const bullet = tag === 'UL' ? '•  ' : `${idx + 1}.  `;
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: bullet + li.textContent, font: "Times New Roman", size: 20 })],
            indent: { left: 360 },
            spacing: { after: 60 },
          }));
        });
      } else if (tag === 'TABLE') {
        // Tables are not supported inline in docx paragraphs array; emit a placeholder
        const rows = Array.from(node.querySelectorAll('tr'));
        rows.forEach((row: any) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          const cellTexts = cells.map((c: any) => c.textContent || "").join(" | ");
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: cellTexts, font: "Times New Roman", size: 18 })],
            spacing: { after: 60 },
            border: {
              bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 },
            }
          }));
        });
      } else if (tag === 'IMG') {
        const src = node.getAttribute('src');
        if (src?.startsWith('data:image')) {
          paragraphs.push(new Paragraph({
            children: [new ImageRun({
              data: src.split(',')[1],
              transformation: { width: 400, height: 280 },
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 160 }
          }));
        }
      } else if (node.nodeType === 3 && node.textContent?.trim()) {
        paragraphs.push(new Paragraph({ 
          children: [new TextRun({ text: node.textContent, font: "Times New Roman", size: 20 })], 
          alignment: AlignmentType.JUSTIFIED, 
          spacing: { after: 100, line: 276 } 
        }));
      }
    };

    doc.body.childNodes.forEach(processNode);
    return paragraphs;
  };


    const doc = new Document({
      creator: "PJPS Manuscript Architect",
      title: title || "Scholarly Article",
      styles: {
        default: {
          document: {
            run: {
              font: "Times New Roman",
              size: 20, // 10pt
            },
          },
        },
      },
      sections: [
        {
          properties: { type: SectionType.CONTINUOUS },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610`,
                  italics: true,
                  size: 18,
                }),
                new TextRun({
                  text: `\t${(doi || "10.36721/PJPS...").toUpperCase()}`,
                  bold: true,
                  size: 18,
                }),
              ],
              tabStops: [
                {
                  type: "right",
                  position: 9000,
                },
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: (title || "UNTITLED MANUSCRIPT").toUpperCase(),
                  bold: true,
                  size: 32, // 16pt
                  font: "Times New Roman"
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: authors.filter(a => a.name).map((a, i) => `${a.name}${i + 1}`).join(", "), 
                  bold: true,
                  size: 24, // 12pt
                  font: "Times New Roman"
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 150 },
            }),
            ...authors.filter(a => a.affiliation).map((a, i) => new Paragraph({
              children: [
                new TextRun({
                  text: `${i + 1} ${a.affiliation}`,
                  size: 20, // 10pt
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
            })),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({ 
              children: [new TextRun({ text: "Abstract: ", bold: true, size: 20 })],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 }
            }),
            ...parseHtmlToDocx(sections.abstract),
            new Paragraph({ 
              children: [
                new TextRun({ text: "Keywords: ", bold: true, size: 18 }),
                new TextRun({ text: keywords, size: 18 }),
              ],
              spacing: { before: 200, after: 200 } 
            }),
            new Paragraph({ 
              children: [
                new TextRun({ 
                  text: `Submitted: ${dates.submitted || "27-08-2024"} — Revised: ${dates.revised || "31-10-2024"} — Accepted: ${dates.accepted || "31-10-2024"}`,
                  italics: true,
                  size: 18
                }),
              ],
              alignment: AlignmentType.LEFT,
              border: {
                bottom: {
                  color: "auto",
                  space: 10,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: { after: 400 },
            }),
          ],
        },
        {
          properties: { 
            type: SectionType.CONTINUOUS,
            column: { count: 2, space: 400 },
          },
          children: Object.entries(sections).filter(([k]) => k !== 'abstract').flatMap(([key, value]) => [
            new Paragraph({ 
              children: [
                new TextRun({
                  text: key.toUpperCase(),
                  bold: true,
                  size: 24, // 12pt
                })
              ],
              alignment: AlignmentType.LEFT,
              spacing: { before: 300, after: 150 } 
            }),
            ...parseHtmlToDocx(value),
          ]),
        }
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${(title || "PJPS_Article").replace(/\s+/g, '_')}.docx`);
  };

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
               <Eye size={16} /> Print Preview
             </button>
          ) : (
            <button onClick={() => setView("EDIT")} className="btn btn-outline flex items-center gap-2">
               <Edit3 size={16} /> Editor Mode
             </button>
          )}
          <button onClick={exportToWord} className="btn btn-outline flex items-center gap-2 border-slate-300">
            <Download size={16} /> DOCX
          </button>
          {/* @ts-ignore */}
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2">
            <Printer size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: view === "EDIT" ? "block" : "none" }}>
        <div className="space-y-10">
          <div className={styles.editorSection}>
            <label className={styles.label}>Full Manuscript Title (Official)</label>
            <textarea 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className={styles.titleField}
              rows={2}
              placeholder="Enter full title of your research paper..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={styles.editorSection}>
              <label className={styles.label}>DOI / Reference ID (Optional)</label>
              <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)} className={styles.authorInput} placeholder="e.g. doi.org/10.36721..." />
            </div>
            <div className={styles.editorSection}>
              <label className={styles.label}>Keywords (Semi-colon separated)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={styles.authorInput} placeholder="Keyword 1; Keyword 2..." />
            </div>
          </div>

          <div className={styles.editorSection}>
            <label className={styles.label}>Publication Chronology (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-start-1">
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Date Submitted</span>
                <input 
                  type="date" 
                  value={dates.submitted} 
                  onChange={(e) => setDates({...dates, submitted: e.target.value})} 
                  className={styles.authorInput} 
                />
              </div>
            </div>
          </div>

          <div className={styles.editorSection}>
            <div className="flex justify-between items-center mb-4">
              <label className={styles.label}>Author Affiliations ({authors.length}/8)</label>
              <button onClick={addAuthor} className="text-blue-600 font-bold text-sm flex items-center gap-1">
                <PlusCircle size={14} /> Add Author
              </button>
            </div>
            <div className={styles.authorsGrid}>
              {authors.map((auth, idx) => (
                <div key={idx} className={styles.authorCard}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400">AUTHOR {idx + 1} {idx === 0 && "(Corresponding)"}</span>
                    {authors.length > 1 && (
                       <button onClick={() => removeAuthor(idx)} className="text-red-400 hover:text-red-600">
                         <Trash2 size={14} />
                       </button>
                    )}
                  </div>
                  <input 
                    type="text" value={auth.name} onChange={(e) => handleAuthorChange(idx, "name", e.target.value)}
                    className={styles.authorInput} placeholder="Author Full Name"
                  />
                  <textarea 
                    value={auth.affiliation} onChange={(e) => handleAuthorChange(idx, "affiliation", e.target.value)}
                    className={styles.authorInput} placeholder="Institutional Affiliation (Department, University, City, Country)"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            {Object.keys(sections).map((key) => (
               <div key={key} className={styles.editorSection}>
                 <label className={styles.label}>
                   {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                   <span className="ml-2 text-[10px] font-normal lowercase text-slate-400">
                     ({key === 'abstract' ? 'Single Column Header Block' : 'Two Column Body Section'})
                   </span>
                 </label>
                 <div className={styles.manuscriptBox}>
                    <div className="bg-slate-50 border-b p-2 flex gap-2">
                       <button 
                         type="button"
                         onClick={() => {
                           const input = document.createElement('input');
                           input.type = 'file';
                           input.accept = 'image/*';
                           input.onchange = (e: any) => {
                             const file = e.target.files[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onload = (re) => {
                                 const img = `<img src="${re.target?.result}" className="img-inside-column" alt="Section Image" style="max-width: 100%; display: block; margin: 15px 0; border-radius: 4px;" />`;
                                 handleSectionChange(key as keyof Sections, (sections[key as keyof Sections] || "") + img);
                               };
                               reader.readAsDataURL(file);
                             }
                           };
                           input.click();
                         }}
                         className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-white border rounded hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1"
                       >
                         <PlusCircle size={10} /> Add Image
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           const input = document.createElement('input');
                           input.type = 'file';
                           input.accept = 'image/*';
                           input.onchange = (e: any) => {
                             const file = e.target.files[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onload = (re) => {
                                 const img = `<div class="full-width-asset" style="text-align: center; margin: 25px 0; break-inside: avoid; column-span: all;"><p style="font-weight: bold; margin-bottom: 10px; font-size: 11px;">Table ${new Date().getTime().toString().slice(-2)}: [Enter Table Description]</p><img src="${re.target?.result}" alt="Table Image" style="max-width: 100%; border-top: 1.5pt solid black; border-bottom: 1.5pt solid black; padding: 6px; border-radius: 0;" /></div>`;
                                 handleSectionChange(key as keyof Sections, (sections[key as keyof Sections] || "") + img);
                               };
                               reader.readAsDataURL(file);
                             }
                           };
                           input.click();
                         }}
                         className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-white border rounded hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-1"
                       >
                         <Layout size={10} /> Add Table (Full Width)
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           const input = document.createElement('input');
                           input.type = 'file';
                           input.accept = 'image/*';
                           input.onchange = (e: any) => {
                             const file = e.target.files[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onload = (re) => {
                                 const img = `<div class="full-width-asset" style="text-align: center; margin: 25px 0; break-inside: avoid; column-span: all;"><img src="${re.target?.result}" alt="Graph Image" style="max-width: 100%;" /><p style="font-weight: bold; margin-top: 10px; font-size: 11px;">Fig. ${new Date().getTime().toString().slice(-2)}</p></div>`;
                                 handleSectionChange(key as keyof Sections, (sections[key as keyof Sections] || "") + img);
                               };
                               reader.readAsDataURL(file);
                             }
                           };
                           input.click();
                         }}
                         className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-white border rounded hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-1"
                       >
                         <BarChart3 size={10} /> Add Graph (Full Width)
                       </button>
                    </div>
                    <ReactQuill 
                       theme="snow"
                       value={sections[key as keyof Sections]} 
                       onChange={(val) => handleSectionChange(key as keyof Sections, val)}
                       modules={modules}
                       formats={formats}
                       placeholder={`Draft ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} content with images and tables...`}
                       className="min-h-[250px]"
                     />
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: view === "PREVIEW" ? "block" : "none" }} className={styles.articleViewport}>
        <div ref={printRef} className={styles.articlePreview}>
           <div className={styles.journalHeader}>
             <div className={styles.journalHeaderLeft}>
               Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610
             </div>
             <div className={styles.journalHeaderRight}>
               {doi || "10.36721/PJPS..."}
             </div>
           </div>
           
           <h1 className={styles.articleTitle}>{title || "Untitled Manuscript"}</h1>
           
           <p className={styles.articleAuthors}>
             {authors.filter(a => a.name).map((a, i) => (
                <span key={i}>
                  {a.name}<sup>{i + 1}</sup>{i < authors.length - 1 ? ', ' : ''}
                </span>
             ))}
             <span className="ml-1">*</span>
           </p>
           
           <div className={styles.articleAffiliations}>
             {authors.filter(a => a.affiliation).map((a, i) => (
                <div key={i} className="mb-1 leading-tight">
                  <sup>{i + 1}</sup> {a.affiliation}
                </div>
             ))}
           </div>

           <div className={`${styles.abstractBlock} rich-content`}>
             <div dangerouslySetInnerHTML={{ __html: `<b>Abstract: </b>` + sections.abstract }} />
           </div>

           <div className={styles.keywordsBlock}>
             <b>Keywords: </b> {keywords || "Not specified"}
           </div>

           <div className={styles.dateLine}>
             {dates.submitted ? `Submitted on ${dates.submitted}` : "Submitted on 27-08-2024" } 
             {dates.revised ? ` — Revised on ${dates.revised}` : " — Revised on 31-10-2024"} 
             {dates.accepted ? ` — Accepted on ${dates.accepted}` : " — Accepted on 31-10-2024"}
           </div>

           <div className={styles.scientificBody}>
             {Object.entries(sections).filter(([k]) => k !== 'abstract').map(([key, content]) => (
                <div key={key} className={styles.scientificSection}>
                  <span className={styles.sectionHeading}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: content || "Content pending..." }} />
                </div>
             ))}
           </div>

           <div className={styles.footnoteArea}>
              <div className="border-t border-black pt-2 w-1/2">
                 *Corresponding author: e-mail: {authors[0]?.name ? authors[0].name.toLowerCase().replace(/\s+/g, '_') + "@pjps.pk" : "---"}
              </div>
           </div>

           <div className={styles.articleFooter}>
              <span>{doi ? doi.split('/').pop()?.toUpperCase() : "1602"}</span>
              <span>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610</span>
           </div>
        </div>
      </div>
    </div>
  );
}
