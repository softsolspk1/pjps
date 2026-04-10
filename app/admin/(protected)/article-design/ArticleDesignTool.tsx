"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Paragraph from "@tiptap/extension-paragraph";
import { useReactToPrint } from "react-to-print";
import { Document, Packer, Paragraph as DocxParagraph, TextRun, AlignmentType, SectionType, ImageRun, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { 
  Printer, Bold, Italic, Heading1, Heading2, Heading3, 
  Minus, Image as ImageIcon, Maximize2, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, List, 
  ListOrdered, Minimize, Maximize, Columns, 
  Loader2, Download, PlusCircle, Trash2, Calendar, 
  FileText, Globe 
} from "lucide-react";
import styles from "./article-design.module.css";

const editorStyles = `
  .tiptap-manuscript {
     text-align: justify;
     font-family: 'Times New Roman', Times, serif;
     font-size: 11pt;
     line-height: 1.5;
     min-height: 800px;
     width: 100%;
     margin: 0 auto;
     padding: 2.5cm 2cm;
     box-sizing: border-box;
     background: white;
  }
  
  .tiptap-manuscript:focus,
  .tiptap-manuscript:active {
    outline: none;
  }
  
  .tiptap-manuscript img {
     aspect-ratio: auto !important;
     width: 100% !important;
     max-width: 100% !important;
     margin: 20px auto !important;
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
     gap: 1.5rem;
     margin: 1.5rem 0;
  }
  
  .column-block {
     min-height: 2rem;
     border: 1px dashed #e2e8f0;
     padding: 10px;
     border-radius: 6px;
  }
  
  .tiptap-manuscript > p, .tiptap-manuscript > ul, .tiptap-manuscript > ol {
     break-inside: avoid-column;
  }
  
  .tiptap-manuscript h1 { margin-top: 2rem; margin-bottom: 1rem; font-size: 14pt; line-height: 1.2; font-weight: bold; text-align: left; text-transform: uppercase; }
  .tiptap-manuscript h2 { margin-top: 1.5rem; margin-bottom: 0.8rem; font-size: 12pt; font-weight: bold; text-transform: uppercase; }
  .tiptap-manuscript h3 { margin-top: 1rem; margin-bottom: 0.5rem; font-size: 11pt; font-weight: bold; font-style: italic; }
  .tiptap-manuscript p { margin-bottom: 1rem; line-height: 1.5; }
  .tiptap-manuscript hr { margin: 2rem 0; border: 0; border-top: 1px solid black; }
  
  .tiptap-manuscript ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
  .tiptap-manuscript ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }

  @media print { 
     .tiptap-manuscript { padding: 0 !important; width: 100% !important; }
     .column-block { border: none !important; padding: 0 !important; }
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

const ColumnBlock = Node.create({
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

const ColumnLayout = Node.create({
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
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      ColumnLayout,
      ColumnBlock,
    ],
    content: `
      <h2>ABSTRACT</h2>
      <p>Draft your scholarly abstract here. This section remains full-width at the beginning of the manuscript.</p>
      <hr />
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

  const exportToWord = async () => {
    if (!editor) return;

    const parseHtmlToDocx = (html: string): DocxParagraph[] => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const paragraphs: DocxParagraph[] = [];

      const parseInlineNodes = (node: ChildNode): TextRun[] => {
        const runs: TextRun[] = [];
        node.childNodes.forEach((child: any) => {
          const tag = child.nodeName;
          const text = child.textContent || "";
          if (tag === "STRONG" || tag === "B") {
            runs.push(new TextRun({ text, bold: true, font: "Times New Roman" }));
          } else if (tag === "EM" || tag === "I") {
            runs.push(new TextRun({ text, italics: true, font: "Times New Roman" }));
          } else if (node.nodeType === 3 && text.trim()) {
            runs.push(new TextRun({ text, font: "Times New Roman" }));
          }
        });
        return runs;
      };

      doc.body.childNodes.forEach((node: any) => {
        const tag = node.nodeName;
        if (tag === "P") {
          paragraphs.push(new DocxParagraph({ children: parseInlineNodes(node), alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 } }));
        } else if (tag.startsWith("H")) {
          paragraphs.push(new DocxParagraph({ 
            children: [new TextRun({ text: node.textContent?.toUpperCase(), bold: true, font: "Times New Roman", size: 24 })],
            spacing: { before: 240, after: 120 }
          }));
        }
      });
      return paragraphs;
    };

    const doc = new Document({
      sections: [{
        properties: { type: SectionType.CONTINUOUS },
        children: [
          new DocxParagraph({
            children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new DocxParagraph({
            children: authors.map((a, i) => new TextRun({ text: `${a.name}${i+1}${i < authors.length-1 ? ", " : ""}`, bold: true, size: 24, font: "Times New Roman" })),
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          ...authors.map((a, i) => new DocxParagraph({
            children: [new TextRun({ text: `${i+1} ${a.affiliation}`, italics: true, size: 20, font: "Times New Roman" })],
            alignment: AlignmentType.CENTER,
          })),
          new DocxParagraph({ text: "", spacing: { after: 400 } }),
          ...parseHtmlToDocx(editor.getHTML())
        ]
      }]
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
               <label className={styles.label}>Full Manuscript Title</label>
               <textarea 
                 value={title} onChange={(e) => setTitle(e.target.value)}
                 className={styles.titleField}
                 placeholder="Enter academic title..."
                 rows={2}
               />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "30px" }}>
               <div>
                  <label className={styles.label}>Keywords (Semi-colon separated)</label>
                  <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={styles.authorInput} placeholder="e.g. Pharmacology; Clinical Trails; Bioethics" />
               </div>
               <div>
                  <label className={styles.label}>DOI Reference (Optional)</label>
                  <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)} className={styles.authorInput} placeholder="e.g. 10.36721/PJPS.2026..." />
               </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <label className={styles.label}>Author Affiliations ({authors.length}/8)</label>
                  <button onClick={addAuthor} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0061ff", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>
                     <PlusCircle size={14} /> Add Author
                  </button>
               </div>
               <div className={styles.authorsGrid}>
                  {authors.map((auth, idx) => (
                    <div key={idx} className={styles.authorCard}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 900, color: "#cbd5e0" }}>FACULTY {idx + 1}</span>
                          {authors.length > 1 && <Trash2 size={14} color="#f87171" style={{ cursor: "pointer" }} onClick={() => removeAuthor(idx)} />}
                       </div>
                       <input value={auth.name} onChange={(e) => updateAuthor(idx, "name", e.target.value)} className={styles.authorInput} placeholder="Full Name (e.g. Dr. Jane Doe)" style={{ marginBottom: "8px" }} />
                       <textarea value={auth.affiliation} onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)} className={styles.authorInput} placeholder="Institution, Department, City, Country" rows={2} />
                    </div>
                  ))}
               </div>
            </div>

            <div style={{ borderTop: "1px solid #edf2f7", paddingTop: "20px" }}>
               <label className={styles.label}>Publication Chronology (Optional)</label>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px" }}>SUBMITTED</span>
                    <input type="date" value={dates.submitted} onChange={(e) => setDates({ ...dates, submitted: e.target.value })} className={styles.authorInput} />
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px" }}>REVISED</span>
                    <input type="date" value={dates.revised} onChange={(e) => setDates({ ...dates, revised: e.target.value })} className={styles.authorInput} />
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#a0aec0", display: "block", marginBottom: "6px" }}>ACCEPTED</span>
                    <input type="date" value={dates.accepted} onChange={(e) => setDates({ ...dates, accepted: e.target.value })} className={styles.authorInput} />
                  </div>
               </div>
            </div>
        </div>

        {/* Tiptap Editor with Sticky Toolbar */}
        <div className={`${styles.editorContainerWrapper} ${isFullscreen ? styles.editorContainerFullscreen : ""} relative`}>
          {isUploading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm rounded-b-xl">
               <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
          )}
          {editor && (
            <div className={styles.toolbar} style={{ justifyContent: "center", borderBottom: "1px solid #edf2f7" }}>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.toolbarBtnActive : ""}`}><Heading1 size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.toolbarBtnActive : ""}`}><Heading2 size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 3 }) ? styles.toolbarBtnActive : ""}`}><Heading3 size={18} /></button>
              <div className={styles.toolbarDivider}></div>
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.toolbarBtnActive : ""}`}><Bold size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.toolbarBtnActive : ""}`}><Italic size={18} /></button>
              <div className={styles.toolbarDivider}></div>
              <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? styles.toolbarBtnActive : ""}`}><AlignLeft size={18} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? styles.toolbarBtnActive : ""}`}><AlignCenter size={18} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "justify" }) ? styles.toolbarBtnActive : ""}`}><AlignJustify size={18} /></button>
              <div className={styles.toolbarDivider}></div>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.toolbarBtnActive : ""}`}><List size={18} /></button>
              <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={styles.toolbarBtn}><Minus size={18} /></button>
              <button onClick={() => fileInputRef.current?.click()} className={styles.toolbarBtn}><ImageIcon size={18} /></button>
              <button onClick={() => (editor.chain().focus() as any).insertTwoColumns().run()} className={styles.toolbarBtn}><Columns size={18} /></button>
              <div className={styles.toolbarDivider}></div>
              <button onClick={exportToWord} className={`${styles.toolbarBtn} text-indigo-600`}><Download size={18} /></button>
              <button onClick={() => handlePrint()} className={`${styles.toolbarBtn} text-white bg-blue-600 hover:bg-blue-700`} style={{ borderRadius: "4px", padding: "6px 12px" }}>
                <Printer size={16} /> Print PDF
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className={styles.toolbarBtn}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          )}

          {/* PRINT-READY CONTAINER (Hidden until Printing) */}
          <div style={{ display: "none" }}>
            <div ref={printRef} className="print-container" style={{ padding: "2.5cm 2cm", fontFamily: "Times New Roman", fontSize: "11pt", backgroundColor: "white", color: "black" }}>
               <style>{editorStyles}</style>
               {/* 1. Scholarly Header */}
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", borderBottom: "0.5pt solid black", paddingBottom: "4pt", marginBottom: "20pt" }}>
                  <span style={{ fontStyle: "italic" }}>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610</span>
                  <span style={{ fontWeight: "bold" }}>{doi || "10.36721/PJPS..."}</span>
               </div>

               {/* 2. Article Identification */}
               <h1 style={{ fontSize: "16pt", fontWeight: "bold", textAlign: "center", marginBottom: "15pt", textTransform: "uppercase" }}>{title || "UNTITLED MANUSCRIPT"}</h1>
               
               <p style={{ textAlign: "center", fontSize: "12pt", fontWeight: "bold", marginBottom: "6pt" }}>
                  {authors.filter(a => a.name).map((a, i) => (
                    <span key={i}>{a.name}<sup>{i+1}</sup>{i < authors.length-1 ? ", " : ""}</span>
                  ))}
               </p>

               <div style={{ textAlign: "center", fontSize: "10pt", fontStyle: "italic", marginBottom: "20pt", lineHeight: 1.4 }}>
                  {authors.filter(a => a.affiliation).map((a, i) => (
                    <div key={i}><sup>{i+1}</sup>{a.affiliation}</div>
                  ))}
               </div>

               {/* 3. Keywords & Dates */}
               <div style={{ fontSize: "10pt", marginBottom: "10pt" }}>
                  <b>Keywords:</b> {keywords || "Not specified"}
               </div>

               <div style={{ fontSize: "9pt", fontStyle: "italic", borderBottom: "0.5pt solid black", paddingBottom: "8pt", marginBottom: "20pt" }}>
                  Submitted: {dates.submitted || "---"} | Revised: {dates.revised || "---"} | Accepted: {dates.accepted || "---"}
               </div>

               {/* 4. Editor Content */}
               <div className="tiptap-manuscript" dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
            </div>
          </div>

          {/* LIVE EDITOR VIEW */}
          <div className={styles.tiptapEditorBox} style={{ backgroundColor: "#f1f5f9", display: "flex", justifyContent: "center" }}>
            <style>{editorStyles}</style>
            <div style={{ width: "210mm", minHeight: "297mm", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

