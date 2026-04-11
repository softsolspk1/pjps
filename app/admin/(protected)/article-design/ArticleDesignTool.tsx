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

export default function ArticleDesignTool() {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      CustomImage,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'manuscript-link' } }),
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      ColumnLayout,
      ColumnBlock,
    ],
    content: `
      <h2>ABSTRACT</h2>
      <p>Draft your scholarly abstract here. This section remains full-width at the beginning of the manuscript.</p>
    `,
    editorProps: {
      attributes: {
        className: 'tiptap-manuscript',
      },
    },
  });

  const uploadImageNative = async (files: File[]) => {
    setIsUploading(true);
    let successCount = 0;
    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.success && editor) {
            editor.chain().focus().setImage({ src: data.url }).run();
            successCount++;
          }
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (!editor) return;

      const parseHtmlToDocx = async (html: string, isTwoColumn: boolean = false): Promise<any[]> => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const children: any[] = [];

        const parseInline = (node: Node | ChildNode, styles: any = {}): any[] => {
          const runs: any[] = [];
          node.childNodes.forEach((child: any) => {
            const tag = child.nodeName;
            const text = child.textContent || "";
            const newStyles = { ...styles, font: "Times New Roman", size: 20 };
            
            if (tag === "#text") {
              if (text.trim() || text === " ") runs.push(new TextRun({ text, ...newStyles }));
            } else if (tag === "STRONG" || tag === "B") {
              runs.push(...parseInline(child, { ...newStyles, bold: true }));
            } else if (tag === "EM" || tag === "I") {
              runs.push(...parseInline(child, { ...newStyles, italics: true }));
            } else if (tag === "U") {
              runs.push(...parseInline(child, { ...newStyles, underline: { type: UnderlineType.SINGLE } }));
            } else if (tag === "SUB") {
              runs.push(...parseInline(child, { ...newStyles, subScript: true }));
            } else if (tag === "SUP") {
              runs.push(...parseInline(child, { ...newStyles, superScript: true }));
            } else if (tag === "A") {
              runs.push(new ExternalHyperlink({ children: parseInline(child, newStyles), link: child.getAttribute("href") || "#" }));
            } else if (tag === "BR") {
              runs.push(new TextRun({ break: 1, ...newStyles }));
            }
          });
          return runs;
        };

        const processNode = async (node: any) => {
          const tag = node.nodeName;
          const isHeading = ["H1", "H2", "H3"].includes(tag);
          const headingStyles = { font: "Arial", bold: true };
          
          if (tag === "P") {
            children.push(new DocxParagraph({ children: parseInline(node), alignment: AlignmentType.JUSTIFIED, spacing: { line: 276 } }));
          } else if (tag === "H1") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent?.toUpperCase() || "", ...headingStyles, size: 22 })], spacing: { before: 240, after: 120 } }));
          } else if (tag === "H2") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent?.toUpperCase() || "", ...headingStyles, size: 18 })], spacing: { before: 200, after: 100 } }));
          } else if (tag === "H3") {
            children.push(new DocxParagraph({ children: [new TextRun({ text: node.textContent || "", ...headingStyles, italics: true, size: 17 })], spacing: { before: 180, after: 90 } }));
          } else if (tag === "BLOCKQUOTE") {
            children.push(new DocxParagraph({ children: parseInline(node), indent: { left: 720 }, spacing: { before: 150, after: 150 } }));
          } else if (tag === "TABLE") {
            const rows: DocxTableRow[] = [];
            for (const tr of Array.from(node.querySelectorAll("tr"))) {
              const cells: DocxTableCell[] = [];
              for (const td of Array.from((tr as any).children)) {
                 cells.push(new DocxTableCell({ 
                   children: [new DocxParagraph({ children: parseInline(td as any), spacing: { after: 0 } })],
                   shading: (td as any).nodeName === "TH" ? { fill: "F7FAFC", type: "clear" as any } : undefined
                 }));
              }
              rows.push(new DocxTableRow({ children: cells }));
            }
            children.push(new DocxTable({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          } else if (tag === "IMG") {
            const src = node.getAttribute("src");
            if (src) {
              const b64 = await getBase64Image(src);
              children.push(new DocxParagraph({ children: [new ImageRun({ data: b64.split(',')[1], transformation: { width: isTwoColumn ? 300 : 450, height: isTwoColumn ? 200 : 300 } })], alignment: AlignmentType.CENTER }));
            }
          }
        };

        for (const node of Array.from(doc.body.childNodes)) {
          await processNode(node);
        }
        return children;
      };

      const fullHtml = editor.getHTML();
      const parts = fullHtml.split('<hr>');
      const abstractHtml = parts[0] || "";
      const bodyHtml = parts.slice(1).join('<hr>') || "";

      const firstAuthor = authors[0]?.name || "Author";
      const shortTitle = (title.length > 50 ? title.substring(0, 50) + "..." : title) || "Short Title";

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
                        new TextRun({ text: "Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610", italics: true, size: 18 }),
                        new TextRun({ text: `\t${doi || "10.36721/PJPS..."}`, bold: true, size: 18 }),
                      ],
                      tabStops: [{ type: "right" as any, position: 9350 }],
                      border: { bottom: { style: BorderStyle.SINGLE, size: 6 } }
                   })
                ]
              })
            },
            footers: {
              default: new Footer({
                children: [
                  new DocxParagraph({
                    children: [
                      new TextRun({ text: `*Corresponding author: e-mail: ${correspondingEmail || "info@pjps.pk"}`, size: 16 }),
                      new TextRun({ text: `\t${startPage}`, size: 18 }),
                    ],
                    tabStops: [{ type: "right" as any, position: 9350 }],
                    border: { top: { style: BorderStyle.SINGLE, size: 4 } }
                  })
                ]
              })
            },
            children: [
              new DocxParagraph({
                children: [new TextRun({ text: (title || "UNTITLED MANUSCRIPT").toUpperCase(), bold: true, size: 36, font: "Arial" })],
                spacing: { before: 0, after: 400 }
              }),
              new DocxParagraph({
                children: authors.map((a, i) => new TextRun({ text: `${a.name}${i+1}${i < authors.length-1 ? ", " : ""}`, bold: true, size: 24, font: "Arial" })),
                spacing: { after: 120 }
              }),
              ...authors.map((a, i) => new DocxParagraph({
                children: [new TextRun({ text: `${i+1} ${a.affiliation}`, italics: true, size: 18, font: "Times New Roman" })],
              })),
              new DocxParagraph({ text: "", spacing: { after: 400 } }),
              new DocxParagraph({ 
                 children: [new TextRun({ text: "Abstract: ", bold: true, size: 20 }), ...await parseHtmlToDocx(abstractHtml)],
                 alignment: AlignmentType.JUSTIFIED,
              }),
              new DocxParagraph({ 
                 children: [new TextRun({ text: `Keywords: ${keywords}`, bold: true, size: 18 })],
                 spacing: { before: 100, after: 100 }
              }),
              new DocxParagraph({
                 children: [new TextRun({ text: `Submitted on ${dates.submitted} - Revised on ${dates.revised} - Accepted on ${dates.accepted}`, italics: true, size: 18 })],
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
                    children: [new TextRun({ text: `${firstAuthor} et al`, italics: true, size: 18 })],
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
                      new TextRun({ text: `Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610`, italics: true, size: 16 }),
                      new TextRun({ text: `\t{PAGE_NUMBER}`, size: 18 }),
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

  if (!isMounted) return null;

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && uploadImageNative(Array.from(e.target.files))} accept="image/*" multiple className="hidden" style={{display: "none"}} />
      
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
                  <input type="number" value={startPage} onChange={(e) => setStartPage(e.target.value)} className={styles.authorInput} placeholder="1602" />
               </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <div style={{ flex: 1, marginRight: "20px" }}>
                     <label className={styles.label}>Corresponding Email</label>
                     <input type="email" value={correspondingEmail} onChange={(e) => setCorrespondingEmail(e.target.value)} className={styles.authorInput} placeholder="info@pjps.pk" />
                  </div>
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

        {/* Tiptap Editor */}
        <div className={`${styles.editorContainerWrapper} ${isFullscreen ? styles.editorContainerFullscreen : ""} relative`}>
          {isUploading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm rounded-b-xl">
               <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
          )}
          {editor && (
            <div className={styles.toolbar} style={{ justifyContent: "center", display: "flex", flexWrap: "wrap", gap: "4px", padding: "10px", backgroundColor: "#fff", borderBottom: "1px solid #edf2f7", position: "sticky", top: 0, zIndex: 50 }}>
              
              {/* History Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().undo().run()} className={styles.toolbarBtn} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
                <button onClick={() => editor.chain().focus().redo().run()} className={styles.toolbarBtn} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
              </div>

              {/* Headings Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.toolbarBtnActive : ""}`} title="Heading 1"><Heading1 size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.toolbarBtnActive : ""}`} title="Heading 2"><Heading2 size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 3 }) ? styles.toolbarBtnActive : ""}`} title="Heading 3"><Heading3 size={16} /></button>
              </div>

              {/* Basic Formatting */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.toolbarBtnActive : ""}`} title="Bold"><Bold size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.toolbarBtnActive : ""}`} title="Italic"><Italic size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${styles.toolbarBtn} ${editor.isActive("underline") ? styles.toolbarBtnActive : ""}`} title="Underline"><UnderlineIcon size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${styles.toolbarBtn} ${editor.isActive("strike") ? styles.toolbarBtnActive : ""}`} title="Strikethrough"><Strikethrough size={16} /></button>
              </div>

              {/* Script Formatting */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`${styles.toolbarBtn} ${editor.isActive("subscript") ? styles.toolbarBtnActive : ""}`} title="Subscript"><SubIcon size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`${styles.toolbarBtn} ${editor.isActive("superscript") ? styles.toolbarBtnActive : ""}`} title="Superscript"><SuperIcon size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`${styles.toolbarBtn} ${editor.isActive("highlight") ? styles.toolbarBtnActive : ""}`} title="Highlight"><Highlighter size={16} /></button>
              </div>

              {/* Alignment Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? styles.toolbarBtnActive : ""}`} title="Align Left"><AlignLeft size={16} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? styles.toolbarBtnActive : ""}`} title="Align Center"><AlignCenter size={16} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? styles.toolbarBtnActive : ""}`} title="Align Right"><AlignRight size={16} /></button>
                <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "justify" }) ? styles.toolbarBtnActive : ""}`} title="Justify"><AlignJustify size={16} /></button>
              </div>

              {/* Lists & Blockquote */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.toolbarBtnActive : ""}`} title="Bullet List"><List size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.toolbarBtnActive : ""}`} title="Ordered List"><ListOrdered size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${styles.toolbarBtn} ${editor.isActive("blockquote") ? styles.toolbarBtnActive : ""}`} title="Blockquote"><Quote size={16} /></button>
              </div>

              {/* Insertions Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => {
                  const url = window.prompt("Enter URL:");
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} className={`${styles.toolbarBtn} ${editor.isActive("link") ? styles.toolbarBtnActive : ""}`} title="Insert Link"><LinkIcon size={16} /></button>
                <button onClick={() => fileInputRef.current?.click()} className={styles.toolbarBtn} title="Insert Image"><ImageIcon size={16} /></button>
                <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={styles.toolbarBtn} title="Insert Divider (HR)"><Minus size={16} /></button>
                <button onClick={() => (editor.chain().focus() as any).insertTwoColumns().run()} className={styles.toolbarBtn} title="Two Column Layout"><Columns size={16} /></button>
              </div>

              {/* Table Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
                <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={styles.toolbarBtn} title="Insert Table (3x3)"><Table2 size={16} /></button>
                {editor.isActive('table') && (
                  <>
                    <button onClick={() => editor.chain().focus().addColumnBefore().run()} className={styles.toolbarBtn} title="Add Column Before"><ArrowRightToLine size={14} style={{ transform: "rotate(180deg)" }} /></button>
                    <button onClick={() => editor.chain().focus().addColumnAfter().run()} className={styles.toolbarBtn} title="Add Column After"><ArrowRightToLine size={14} /></button>
                    <button onClick={() => editor.chain().focus().addRowBefore().run()} className={styles.toolbarBtn} title="Add Row Before"><ArrowDownToLine size={14} style={{ transform: "rotate(180deg)" }} /></button>
                    <button onClick={() => editor.chain().focus().addRowAfter().run()} className={styles.toolbarBtn} title="Add Row After"><ArrowDownToLine size={14} /></button>
                    <button onClick={() => editor.chain().focus().deleteTable().run()} className={styles.toolbarBtn} title="Delete Table"><Eraser size={14} color="#f87171" /></button>
                  </>
                )}
              </div>

              {/* Actions Group */}
              <div className={styles.toolbarGroup} style={{ display: "flex", gap: "6px" }}>
                <button onClick={exportToWord} className={`${styles.toolbarBtn} text-indigo-600`} title="Export to Word (.docx)"><Download size={18} /></button>
                <button onClick={() => handlePrint()} className={`${styles.toolbarBtn} text-white bg-blue-600 hover:bg-blue-700`} style={{ borderRadius: "4px", padding: "6px 16px" }}>
                  <Printer size={16} /> Print PDF
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className={styles.toolbarBtn} title="Toggle Fullscreen">
                  {isFullscreen ? <Minimize size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* PRINT VIEW */}
          <div style={{ display: "none" }}>
            <div ref={printRef} className="print-container" style={{ padding: "2.5cm 1.5cm", fontFamily: "'Times New Roman', Times, serif", fontSize: "10pt", backgroundColor: "white", color: "black", width: "210mm", minHeight: "297mm" }}>
               <style>{editorStyles}</style>
               
               {/* Section 1: Metadata Area (Single Column) */}
               <div className="print-header-section">
                  {/* Scholarly Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", borderBottom: "0.5pt solid black", paddingBottom: "4pt", marginBottom: "25pt" }}>
                     <span style={{ fontStyle: "italic" }}>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610</span>
                     <span style={{ fontWeight: "bold" }}>{doi || "10.36721/PJPS..."}</span>
                  </div>

                  {/* Article Title */}
                  <h1 style={{ fontFamily: "Arial, sans-serif", fontSize: "18pt", fontWeight: "bold", textAlign: "left", marginBottom: "12pt", textTransform: "uppercase", lineHeight: "1.2" }}>{title || "UNTITLED MANUSCRIPT"}</h1>
                  
                  {/* Authors */}
                  <p style={{ textAlign: "left", fontSize: "11pt", fontWeight: "bold", marginBottom: "6pt" }}>
                     {authors.filter(a => a.name).map((a, i) => (
                       <span key={i}>{a.name}<sup>{i+1}</sup>{i < authors.length-1 ? ", " : ""}</span>
                     ))}
                  </p>

                  {/* Affiliations */}
                  <div style={{ textAlign: "left", fontSize: "8.5pt", fontStyle: "italic", marginBottom: "15pt", lineHeight: 1.4, color: "#4a5568" }}>
                     {authors.filter(a => a.affiliation).map((a, i) => (
                       <div key={i}><sup>{i+1}</sup>{a.affiliation}</div>
                     ))}
                  </div>

                  {/* Abstract & Meta */}
                  <div style={{ fontSize: "10pt", marginBottom: "12pt", textAlign: "justify" }}>
                     <div dangerouslySetInnerHTML={{ __html: editor?.getHTML().split('<hr>')[0] || "" }} />
                  </div>

                  <div style={{ fontSize: "10pt", marginBottom: "12pt", textAlign: "justify" }}>
                     <b>Keywords:</b> {keywords || "---"}
                  </div>

                  <div style={{ fontSize: "8.5pt", fontStyle: "italic", borderBottom: "0.75pt solid black", paddingBottom: "8pt", marginBottom: "20pt" }}>
                     Submitted on {dates.submitted || "---"} – Revised on {dates.revised || "---"} – Accepted on {dates.accepted || "---"}
                  </div>
               </div>

               {/* Section 2: Body Area (Two Column) */}
               <div className="print-body-section" style={{ columnCount: 2, columnGap: "18pt", textAlign: "justify" }}>
                  <style>{`
                    .print-body-section h2, .print-body-section h1 { font-family: Arial, sans-serif; text-transform: uppercase; font-size: 11pt; margin-top: 15pt; }
                    .print-body-section h3 { font-family: Arial, sans-serif; font-style: italic; font-size: 10.5pt; }
                    .print-body-section p { margin-bottom: 8pt; line-height: 1.25; }
                  `}</style>
                  <div dangerouslySetInnerHTML={{ __html: editor?.getHTML().split('<hr>').slice(1).join('<hr>') || "" }} />
               </div>
               
               {/* Footnote for first page */}
               <div style={{ position: "absolute", bottom: "2cm", left: "1.5cm", right: "1.5cm", fontSize: "8pt", borderTop: "0.5pt solid black", paddingTop: "5pt", display: "flex", justifyContent: "space-between" }}>
                  <span>*Corresponding author: e-mail: {correspondingEmail || "info@pjps.pk"}</span>
                  <span>{startPage}</span>
               </div>
            </div>
          </div>

          {/* EDITOR PREVIEW */}
          <div className={styles.tiptapEditorBox} style={{ backgroundColor: "#f1f5f9", display: "flex", justifyContent: "center", padding: "40px" }}>
            <style>{editorStyles}</style>
            <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "white", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "0" }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


