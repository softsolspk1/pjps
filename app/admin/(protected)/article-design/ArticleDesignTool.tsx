"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Highlight } from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useReactToPrint } from "react-to-print";
import { Document, Packer, Paragraph as DocxParagraph, TextRun, AlignmentType, SectionType, ImageRun, BorderStyle, PageNumber, Header, Footer, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType, HeightRule, VerticalAlign, ExternalHyperlink, UnderlineType } from "docx";
import { saveAs } from "file-saver";
import { 
  Printer, Bold, Italic, Heading1, Heading2, Heading3, 
  Minus, Image as ImageIcon, Maximize2, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, List, 
  ListOrdered, Minimize, Maximize, Columns, 
  Loader2, Download, PlusCircle, Trash2, Calendar, 
  FileText, Globe, Underline as UnderlineIcon, Link as LinkIcon, 
  Grid, MousePointer2, Highlighter, Quote, 
  Subscript as SubIcon, Superscript as SuperIcon, 
  Undo2, Redo2, Type, Table2, PlusSquare, 
  ArrowDownToLine, ArrowRightToLine, Eraser, 
  Strikethrough
} from "lucide-react";
import styles from "./article-design.module.css";

const editorStyles = `
  .tiptap-manuscript {
     text-align: justify;
     font-family: 'Times New Roman', Times, serif;
     font-size: 10pt;
     line-height: 1.35;
     min-height: 800px;
     width: 100%;
     margin: 0 auto;
     padding: 2.5cm 2cm;
     box-sizing: border-box;
     background: white;
     color: black;
  }
  
  .tiptap-manuscript:focus,
  .tiptap-manuscript:active {
    outline: none;
  }
  
  .tiptap-manuscript img {
     max-width: 100% !important;
     margin: 10pt auto !important;
     display: block;
  }
  
  .ProseMirror, .ProseMirror-focused {
     outline: none !important;
     border: none !important;
     box-shadow: none !important;
  }

  .column-layout {
     display: grid;
     grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
     gap: 18pt;
     margin: 12pt 0;
  }
  
  .column-block {
     min-height: 2rem;
     padding: 0;
  }
  
  .tiptap-manuscript > p, .tiptap-manuscript > ul, .tiptap-manuscript > ol {
     break-inside: avoid-column;
  }
  
  .tiptap-manuscript h1 { margin-top: 15pt; margin-bottom: 8pt; font-size: 14pt; line-height: 1.2; font-weight: bold; text-align: left; text-transform: uppercase; }
  .tiptap-manuscript h2 { margin-top: 12pt; margin-bottom: 6pt; font-size: 11pt; font-weight: bold; text-transform: uppercase; }
  .tiptap-manuscript h3 { margin-top: 10pt; margin-bottom: 4pt; font-size: 10.5pt; font-weight: bold; font-style: italic; }
  .tiptap-manuscript p { margin-bottom: 8pt; line-height: 1.35; }
  
  .tiptap-manuscript ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
  .tiptap-manuscript ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }

  .tiptap-manuscript blockquote {
     border-left: 3px solid #cbd5e0;
     padding-left: 1rem;
     margin: 1rem 0;
     font-style: italic;
     color: #4a5568;
  }

  .tiptap-manuscript table {
     border-collapse: collapse;
     table-layout: fixed;
     width: 100%;
     margin: 0;
     overflow: hidden;
  }

  .tiptap-manuscript table td,
  .tiptap-manuscript table th {
     min-width: 1em;
     border: 1px solid #cbd5e0;
     padding: 3px 5px;
     vertical-align: top;
     box-sizing: border-box;
     position: relative;
  }

  .tiptap-manuscript table th {
     font-weight: bold;
     text-align: left;
     background-color: #f7fafc;
  }

  .tiptap-manuscript table .selectedCell:after {
     z-index: 2;
     content: "";
     position: absolute;
     left: 0; right: 0; top: 0; bottom: 0;
     background: rgba(200, 200, 255, 0.4);
     pointer-events: none;
  }

  .tiptap-manuscript table .column-resize-handle {
     position: absolute;
     right: -2px;
     top: 0;
     bottom: -2px;
     width: 4px;
     background-color: #adf;
     pointer-events: none;
  }

  .tiptap-manuscript a {
     color: #3182ce;
     text-decoration: underline;
     cursor: pointer;
  }

  .tiptap-manuscript mark {
     background-color: #faf089;
     border-radius: 2px;
     padding: 0 2px;
  }

  @media print { 
     .tiptap-manuscript { padding: 0 !important; width: 100% !important; }
     .column-block { border: none !important; padding: 0 !important; }
     .tiptap-manuscript table td, .tiptap-manuscript table th { border: 0.5pt solid black !important; }
  }
`;

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      fullWidth: {
        default: false,
        parseHTML: element => element.classList.contains('full-width-block'),
        renderHTML: attributes => {
          if (!attributes.fullWidth) return {};
          return { class: 'full-width-block' };
        },
      },
    };
  },
});

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fullWidth: {
        default: false,
        parseHTML: element => element.classList.contains('full-width-block'),
        renderHTML: attributes => {
          if (!attributes.fullWidth) return {};
          return { class: 'full-width-block' };
        },
      },
    };
  },
});

const ColumnBlock = TiptapNode.create({
  name: 'columnBlock',
  content: 'block+',
  isolating: true,
  parseHTML() {
    return [{ tag: 'div.column-block' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'column-block' }), 0];
  },
});

const ColumnLayout = TiptapNode.create({
  name: 'columnLayout',
  group: 'block',
  content: 'columnBlock columnBlock',
  parseHTML() {
    return [{ tag: 'div.column-layout' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'column-layout' }), 0];
  },
  addCommands() {
    return {
      // @ts-ignore
      insertTwoColumns: () => ({ commands }: any) => {
        return commands.insertContent({
          type: 'columnLayout',
          content: [
            { type: 'columnBlock', content: [{ type: 'paragraph' }] },
            { type: 'columnBlock', content: [{ type: 'paragraph' }] },
          ],
        });
      },
    } as any;
  },
});

type Author = { name: string; affiliation: string };

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

import SectionEditor from "./SectionEditor";

export default function ArticleDesignTool() {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [sections, setSections] = useState([
    { id: 'abstract', title: 'ABSTRACT', html: 'Draft your scholarly abstract here. This section remains full-width.' },
    { id: 'introduction', title: 'INTRODUCTION', html: '' },
    { id: 'methods', title: 'MATERIALS AND METHODS', html: '' },
    { id: 'results', title: 'RESULTS', html: '' },
    { id: 'discussion', title: 'DISCUSSION', html: '' },
    { id: 'conclusion', title: 'CONCLUSION', html: '' },
    { id: 'references', title: 'REFERENCES', html: '' }
  ]);
  const printRef = useRef<HTMLDivElement>(null);

  // Metadata State
  const [title, setTitle] = useState("");
  const [doi, setDoi] = useState("");
  const [keywords, setKeywords] = useState("");
  const [startPage, setStartPage] = useState("");
  const [correspondingEmail, setCorrespondingEmail] = useState("");
  const [dates, setDates] = useState({ submitted: "", revised: "", accepted: "" });
  const [authors, setAuthors] = useState<Author[]>([{ name: "", affiliation: "" }]);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: (title || "PJPS_Formatted_Manuscript").replace(/\s+/g, '_'),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uploadImageNative = async (files: File[], editorInstance: any) => {
    setIsUploading(true);
    let successCount = 0;
    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.success && editorInstance) {
            editorInstance.chain().focus().setImage({ src: data.url }).run();
            successCount++;
          }
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      // We don't reset file input here because it belongs to the child component
    }
  };

  const addAuthor = () => setAuthors([...authors, { name: "", affiliation: "" }]);
  const removeAuthor = (i: number) => setAuthors(authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, field: keyof Author, val: string) => {
    const newAuthors = [...authors];
    newAuthors[i][field] = val;
    setAuthors(newAuthors);
  };

  // Convert image URL to base64 for docx
  const getBase64Image = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

    const exportToWord = async () => {

      const parseHtmlToDocx = async (html: string, isTwoColumn: boolean = false): Promise<any[]> => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const children: any[] = [];

        const parseInline = async (node: Node | ChildNode, styles: any = {}): Promise<any[]> => {
          const runs: any[] = [];
          for (const child of Array.from(node.childNodes)) {
            const tag = child.nodeName;
            const text = child.textContent || "";
            const newStyles = { ...styles, font: "Times New Roman", size: 20 };
            
            if (tag === "#text") {
              if (text.trim() || text === " ") runs.push(new TextRun({ text, ...newStyles }));
            } else if (tag === "STRONG" || tag === "B") {
              runs.push(...await parseInline(child, { ...newStyles, bold: true }));
            } else if (tag === "EM" || tag === "I") {
              runs.push(...await parseInline(child, { ...newStyles, italics: true }));
            } else if (tag === "U") {
              runs.push(...await parseInline(child, { ...newStyles, underline: { type: UnderlineType.SINGLE } }));
            } else if (tag === "SUB") {
              runs.push(...await parseInline(child, { ...newStyles, subScript: true }));
            } else if (tag === "SUP") {
              runs.push(...await parseInline(child, { ...newStyles, superScript: true }));
            } else if (tag === "A") {
              runs.push(new ExternalHyperlink({ children: await parseInline(child, newStyles), link: (child as any).getAttribute("href") || "#" }));
            } else if (tag === "BR") {
              runs.push(new TextRun({ break: 1, ...newStyles }));
            } else if (tag === "IMG") {
              const src = (child as any).getAttribute("src");
              if (src) {
                try {
                  const blob = await fetch(src).then(r => r.blob());
                  const buf = await blob.arrayBuffer();
                  runs.push(new ImageRun({ data: buf, transformation: { width: isTwoColumn ? 300 : 450, height: isTwoColumn ? 200 : 300 } }));
                } catch(e) { console.error("Image loading failed in export", e); }
              }
            }
          }
          return runs;
        };

        const processNode = async (node: any) => {
          const tag = node.nodeName;
          const isHeading = ["H1", "H2", "H3"].includes(tag);
          const headingStyles = { font: "Arial", bold: true };
          
          if (tag === "P") {
            children.push(new DocxParagraph({ children: await parseInline(node), alignment: AlignmentType.JUSTIFIED, spacing: { line: 276 } }));
          } else if (tag === "H1") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent?.toUpperCase() || "", ...headingStyles, size: 22 })], spacing: { before: 240, after: 120 } }));
          } else if (tag === "H2") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent?.toUpperCase() || "", ...headingStyles, size: 18 })], spacing: { before: 200, after: 100 } }));
          } else if (tag === "H3") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent || "", ...headingStyles, italics: true, size: 17 })], spacing: { before: 180, after: 90 } }));
          } else if (tag === "BLOCKQUOTE") {
            children.push(new DocxParagraph({ children: await parseInline(node), indent: { left: 720 }, spacing: { before: 150, after: 150 } }));
          } else if (tag === "TABLE") {
            const rows: DocxTableRow[] = [];
            for (const tr of Array.from(node.querySelectorAll("tr"))) {
              const cells: DocxTableCell[] = [];
              for (const td of Array.from((tr as any).children)) {
                 cells.push(new DocxTableCell({ 
                   children: [new DocxParagraph({ children: await parseInline(td as any), spacing: { after: 0 } })],
                   shading: (td as any).nodeName === "TH" ? { fill: "F7FAFC", type: "clear" as any } : undefined
                 }));
              }
              rows.push(new DocxTableRow({ children: cells }));
            }
            children.push(new DocxTable({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          } else if (tag === "IMG") {
            const src = node.getAttribute("src");
            if (src) {
              const blob = await fetch(src).then(r => r.blob());
              const buf = await blob.arrayBuffer();
              children.push(new DocxParagraph({ children: [new ImageRun({ data: buf, transformation: { width: isTwoColumn ? 300 : 450, height: isTwoColumn ? 200 : 300 } })], alignment: AlignmentType.CENTER }));
            }
          }
        };

        for (const node of Array.from(doc.body.childNodes)) {
          await processNode(node);
        }
        return children;
      };

      const abstractHtml = sections[0].html;
      const bodyHtml = sections.slice(1).map(s => `<h2>${s.title}</h2>${s.html}`).join('');

      const firstAuthor = authors[0]?.name || "Author";

      const doc = new Document({
        creator: "PJPS Manuscript Architect",
        sections: [
          // Section 1: 1 Column (Title, Authors, Abstract)
          {
            properties: { type: SectionType.CONTINUOUS },
            headers: {
              default: new Header({
                children: [
                   new DocxParagraph({
                      children: [
                        new TextRun({ text: `\t${doi || "doi.org/10.36721/PJPS..."}`, size: 18, font: "Times New Roman" }),
                      ],
                      tabStops: [{ type: "right" as any, position: 9350 }],
                   })
                ]
              })
            },
            footers: {
              default: new Footer({
                children: [
                   // Intentionally left blank or simple. We removed the corresponding author block based on feedback.
                   new DocxParagraph({ text: "" })
                ]
              })
            },
            children: [
              new DocxParagraph({
                children: [
                  new TextRun({ text: `${startPage}`, size: 18, font: "Times New Roman" }),
                  new TextRun({ text: `\tPak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610`, size: 18, font: "Times New Roman" }),
                ],
                spacing: { before: 0, after: 200 }
              }),
              new DocxParagraph({
                children: [new TextRun({ text: toTitleCase(title || "UNTITLED MANUSCRIPT"), bold: true, size: 30, font: "Times New Roman" })],
                spacing: { before: 100, after: 400 }
              }),
              new DocxParagraph({
                children: authors.map((a, i) => new TextRun({ text: `${a.name}${i+1}${i < authors.length-1 ? ", " : ""}`, bold: true, size: 24, font: "Times New Roman" })),
                spacing: { after: 120 }
              }),
              ...authors.map((a, i) => new DocxParagraph({
                children: [new TextRun({ text: `${i+1} ${a.affiliation}`, italics: true, size: 18, font: "Times New Roman" })],
              })),
              new DocxParagraph({ text: "", spacing: { after: 400 } }),
              
              ...(abstractHtml.trim() ? [
                  new DocxParagraph({ 
                     children: [new TextRun({ text: "Abstract: ", bold: true, size: 20, font: "Times New Roman" })],
                     alignment: AlignmentType.JUSTIFIED,
                  }),
                  ...await parseHtmlToDocx(abstractHtml)
              ] : []),
              
              new DocxParagraph({ 
                 children: [
                   new TextRun({ text: `Keywords: `, bold: true, size: 18, font: "Times New Roman" }),
                   new TextRun({ text: keywords, size: 18, font: "Times New Roman" })
                 ],
                 spacing: { before: 100, after: 100 }
              }),
              new DocxParagraph({
                 children: [new TextRun({ text: `Submitted on ${dates.submitted} - Revised on ${dates.revised} - Accepted on ${dates.accepted}`, italics: true, size: 18, font: "Times New Roman" })],
                 border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 10 } },
                 spacing: { after: 400 }
              }),
            ]
          },
          // Section 2: 2 Columns (Main Body)
          {
            properties: { 
              type: SectionType.CONTINUOUS,
              column: { count: 2, space: 720 }, // ~0.5 inch gap
            },
            headers: {
              default: new Header({
                children: [
                  new DocxParagraph({
                    children: [new TextRun({ text: `${firstAuthor} et al`, italics: true, size: 18, font: "Times New Roman" })],
                    alignment: AlignmentType.CENTER,
                    border: { bottom: { style: BorderStyle.SINGLE, size: 4 } }
                  })
                ]
              })
            },
            footers: {
              default: new Footer({
                children: [
                  new DocxParagraph({
                    children: [
                      new TextRun({ text: `Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610`, italics: true, size: 16, font: "Times New Roman" }),
                      new TextRun({ text: `\t{PAGE_NUMBER}`, size: 18, font: "Times New Roman" }),
                    ],
                    tabStops: [{ type: "right" as any, position: 9350 }],
                    border: { top: { style: BorderStyle.SINGLE, size: 4 } }
                  })
                ]
              })
            },
            children: await parseHtmlToDocx(bodyHtml, true)
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${(title || "PJPS_Article").replace(/\s+/g, "_")}.docx`);
    };
  const printAbstractHtml = sections[0].html;
  const printBodyHtml = sections.slice(1).map(s => `<h2>${s.title}</h2>${s.html}`).join('');

  if (!isMounted) return null;

  return (
    <>
      <div className={styles.container} style={{ maxWidth: "100%", padding: 0, boxShadow: "none", border: "none" }}>
        
        {/* Metadata Editor (Above Tiptap) */}
        <div style={{ padding: "40px", backgroundColor: "#fcfdfe", borderBottom: "1px solid #edf2f7", marginBottom: "30px" }}>
            <div style={{ marginBottom: "30px" }}>
               <label className={styles.label}>Full Manuscript Title (16pt Std)</label>
               <textarea 
                 value={title} onChange={(e) => setTitle(e.target.value)}
                 className={styles.titleField}
                 placeholder="Enter academic title..."
                 rows={2}
               />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "30px" }}>
               <div>
                  <label className={styles.label}>Keywords</label>
                  <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={styles.authorInput} placeholder="e.g. Pharmacology; Clinical Trails" />
               </div>
               <div>
                  <label className={styles.label}>DOI Reference</label>
                  <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)} className={styles.authorInput} placeholder="e.g. 10.36721/PJPS.2026..." />
               </div>
               <div>
                  <label className={styles.label}>Starting Page</label>
                  <input type="number" value={startPage} onChange={(e) => setStartPage(e.target.value)} className={styles.authorInput} placeholder="Leave blank for auto" />
               </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <label className={styles.label} style={{ alignSelf: "flex-end", marginBottom: "8px" }}>Authors & Affiliations</label>
                  <button onClick={addAuthor} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0061ff", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>
                     <PlusCircle size={14} /> Add Author
                  </button>
               </div>
               <div className={styles.authorsGrid}>
                  {authors.map((auth, idx) => (
                    <div key={idx} className={styles.authorCard}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 900, color: "#cbd5e0" }}>AUTHOR {idx + 1}</span>
                          {authors.length > 1 && <Trash2 size={14} color="#f87171" style={{ cursor: "pointer" }} onClick={() => removeAuthor(idx)} />}
                       </div>
                       <input value={auth.name} onChange={(e) => updateAuthor(idx, "name", e.target.value)} className={styles.authorInput} placeholder="Full Name" style={{ marginBottom: "8px" }} />
                       <textarea value={auth.affiliation} onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)} className={styles.authorInput} placeholder="Affiliation" rows={2} />
                    </div>
                  ))}
               </div>
            </div>

            <div style={{ borderTop: "1px solid #edf2f7", paddingTop: "20px" }}>
               <label className={styles.label}>Publication Chronology (Optional)</label>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Submitted Date</span>
                    <input type="date" value={dates.submitted} onChange={(e) => setDates({ ...dates, submitted: e.target.value })} className={styles.authorInput} />
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Revised Date</span>
                    <input type="date" value={dates.revised} onChange={(e) => setDates({ ...dates, revised: e.target.value })} className={styles.authorInput} />
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Accepted Date</span>
                    <input type="date" value={dates.accepted} onChange={(e) => setDates({ ...dates, accepted: e.target.value })} className={styles.authorInput} />
                  </div>
               </div>
            </div>
        </div>

        {/* Sectioned Editors */}
        <div style={{ position: "relative" }}>
          {isUploading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm rounded-b-xl">
               <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
          )}
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", gap: "10px" }}>
             <button onClick={exportToWord} className={`${styles.toolbarBtn} text-indigo-600`} style={{ padding: "8px 16px", borderRadius: "4px", backgroundColor: "white", border: "1px solid #e2e8f0" }}>
               <Download size={18} style={{ marginRight: "6px" }} /> Export to Word
             </button>
             <button onClick={() => handlePrint()} className={`${styles.toolbarBtn} text-white bg-blue-600 hover:bg-blue-700`} style={{ padding: "8px 16px", borderRadius: "4px" }}>
               <Printer size={16} style={{ marginRight: "6px" }} /> Print PDF
             </button>
          </div>

          {sections.map((sec, idx) => (
             <SectionEditor 
               key={sec.id}
               title={sec.title}
               html={sec.html}
               onChange={(newHtml) => {
                 const newSecs = [...sections];
                 newSecs[idx].html = newHtml;
                 setSections(newSecs);
               }}
               onImageUpload={uploadImageNative}
             />
          ))}

          {/* PRINT VIEW */}
          <div style={{ display: "none" }}>
            <div ref={printRef} className="print-container" style={{ padding: "2.5cm 1.5cm", fontFamily: "'Times New Roman', Times, serif", fontSize: "10pt", backgroundColor: "white", color: "black", width: "210mm", minHeight: "297mm" }}>
               <style>{editorStyles}</style>
               
               {/* Section 1: Metadata Area (Single Column) */}
               <div className="print-header-section">
                  {/* Scholarly Header */}
                  <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "10pt", marginBottom: "0pt" }}>
                     <span>{doi || "doi.org/10.36721/PJPS..."}</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10pt", marginBottom: "20pt" }}>
                     <span>{startPage}</span>
                     <span>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610</span>
                  </div>

                  {/* Article Title */}
                  <h1 style={{ fontFamily: "Times New Roman, serif", fontSize: "15pt", fontWeight: "bold", textAlign: "left", marginBottom: "12pt", lineHeight: "1.2" }}>{toTitleCase(title || "UNTITLED MANUSCRIPT")}</h1>
                  
                  {/* Authors */}
                  <p style={{ textAlign: "left", fontSize: "12pt", fontWeight: "bold", marginBottom: "6pt", fontFamily: "Times New Roman, serif" }}>
                     {authors.filter(a => a.name).map((a, i) => (
                       <span key={i}>{a.name}<sup>{i+1}</sup>{i < authors.length-1 ? ", " : ""}</span>
                     ))}
                  </p>

                  {/* Affiliations */}
                  <div style={{ textAlign: "left", fontSize: "9pt", fontStyle: "italic", marginBottom: "15pt", lineHeight: 1.4, color: "#4a5568", fontFamily: "Times New Roman, serif" }}>
                     {authors.filter(a => a.affiliation).map((a, i) => (
                       <div key={i}><sup>{i+1}</sup>{a.affiliation}</div>
                     ))}
                  </div>

                  {/* Abstract & Meta */}
                  {printAbstractHtml.trim() && (
                    <div style={{ fontSize: "10pt", marginBottom: "12pt", textAlign: "justify", fontFamily: "Times New Roman, serif" }}>
                       <strong>Abstract: </strong><span dangerouslySetInnerHTML={{ __html: printAbstractHtml }} />
                    </div>
                  )}

                  <div style={{ fontSize: "10pt", marginBottom: "12pt", textAlign: "justify", fontFamily: "Times New Roman, serif" }}>
                     <b>Keywords:</b> {keywords || "---"}
                  </div>

                  <div style={{ fontSize: "8.5pt", fontStyle: "italic", borderBottom: "0.75pt solid black", paddingBottom: "8pt", marginBottom: "20pt", fontFamily: "Times New Roman, serif" }}>
                     Submitted on {dates.submitted || "---"} – Revised on {dates.revised || "---"} – Accepted on {dates.accepted || "---"}
                  </div>
               </div>

               {/* Section 2: Body Area (Two Column) */}
               <div className="print-body-section" style={{ columnCount: 2, columnGap: "18pt", textAlign: "justify", fontFamily: "Times New Roman, serif" }}>
                  <style>{`
                    .print-body-section h2, .print-body-section h1 { font-family: 'Times New Roman', serif; text-transform: uppercase; font-size: 11pt; margin-top: 15pt; }
                    .print-body-section h3 { font-family: 'Times New Roman', serif; font-style: italic; font-size: 10.5pt; }
                    .print-body-section p { margin-bottom: 8pt; line-height: 1.25; }
                  `}</style>
                  <div dangerouslySetInnerHTML={{ __html: printBodyHtml }} />
               </div>
               
               {/* Footnote for first page - Currently Empty as per request */}
               <div style={{ position: "absolute", bottom: "2cm", left: "1.5cm", right: "1.5cm", fontSize: "10pt", borderTop: "none", paddingTop: "0" }}>
               </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}


