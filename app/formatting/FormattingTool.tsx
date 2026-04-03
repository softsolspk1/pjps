"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, SectionType } from "docx";
import { saveAs } from "file-saver";
import { FileText, Download, Printer, Users, Layout, PlusCircle, Trash2, Eye, Edit3, BarChart3, Save } from "lucide-react";
import styles from "./formatting.module.css";
import "react-quill/dist/quill.snow.css";

// Dynamically import Quill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
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
  const [title, setTitle] = useState("Research Manuscript Title");
  const [authors, setAuthors] = useState<Author[]>([{ name: "", affiliation: "" }]);
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

  // 1. PDF Export (using react-to-print)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title || "PJPS_Formatted_Article",
  });

  // 2. Word Export (using docx)
  const exportToWord = async () => {
    // Utility to strip HTML for Word doc (simplified)
    const stripHtml = (html: string) => {
       if (typeof window === 'undefined') return html;
       const doc = new DOMParser().parseFromString(html, 'text/html');
       return doc.body.textContent || "";
    };

    const doc = new Document({
      sections: [{
        properties: { type: SectionType.CONTINUOUS },
        children: [
          new Paragraph({
            text: title.toUpperCase(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
               new TextRun({ text: authors.map(a => a.name).join(", "), bold: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
               new TextRun({ text: authors.map(a => a.affiliation).join(" | "), italic: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({ text: "ABSTRACT", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          new Paragraph({ text: stripHtml(sections.abstract), alignment: AlignmentType.JUSTIFIED, spacing: { after: 300 } }),
          
          ...Object.entries(sections).filter(([k]) => k !== 'abstract').flatMap(([key, value]) => [
             new Paragraph({ text: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }),
             new Paragraph({ text: stripHtml(value), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 } })
          ])
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
    
    // Log Export Analytics
    fetch('/api/formatting/analytics', { method: 'POST', body: JSON.stringify({ type: 'EXPORT' }) }).catch(() => {});
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolHeader}>
        <div>
          <h1 className={styles.title}>Article Formatting CMS</h1>
          <p className="text-gray-500">Live scientific layout and export engine for researchers.</p>
        </div>
        <div className={styles.controls}>
          {view === "EDIT" ? (
             <button onClick={() => setView("PREVIEW")} className="btn btn-outline flex items-center gap-2">
               <Eye size={16} /> Live Preview
             </button>
          ) : (
            <button onClick={() => setView("EDIT")} className="btn btn-outline flex items-center gap-2">
               <Edit3 size={16} /> Continue Editing
             </button>
          )}
          <button onClick={exportToWord} className="btn btn-outline flex items-center gap-2 border-slate-300">
            <Download size={16} /> Word (.docx)
          </button>
          {/* @ts-ignore */}
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2">
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {view === "EDIT" ? (
        <div className="space-y-10">
          <div className={styles.editorSection}>
            <label className={styles.label}>Manuscript Full Title</label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-serif font-bold p-4 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Clinical characteristics and factors affecting quality of life in children..."
            />
          </div>

          <div className={styles.editorSection}>
            <div className="flex justify-between items-center mb-4">
              <label className={styles.label}>Author Metadata ({authors.length}/8)</label>
              <button onClick={addAuthor} className="text-blue-600 font-bold text-sm flex items-center gap-1">
                <PlusCircle size={14} /> Add Author
              </button>
            </div>
            <div className={styles.authorsGrid}>
              {authors.map((auth, idx) => (
                <div key={idx} className={styles.authorCard}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-400">AUTHOR {idx + 1}</span>
                    {authors.length > 1 && (
                       <button onClick={() => removeAuthor(idx)} className="text-red-400 hover:text-red-600">
                         <Trash2 size={14} />
                       </button>
                    )}
                  </div>
                  <input 
                    type="text" value={auth.name} onChange={(e) => handleAuthorChange(idx, "name", e.target.value)}
                    className={styles.authorInput} placeholder="Full Name"
                  />
                  <input 
                    type="text" value={auth.affiliation} onChange={(e) => handleAuthorChange(idx, "affiliation", e.target.value)}
                    className={styles.authorInput} placeholder="Affiliation / Institutional Address"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {Object.keys(sections).map((key) => (
               <div key={key} className={styles.editorSection}>
                 <label className={styles.label}>
                   {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                   {key === 'abstract' ? ' (Single Column)' : ' (Two Column Body)'}
                 </label>
                 <div className="bg-white border rounded">
                   <ReactQuill 
                      theme="snow" 
                      value={sections[key as keyof Sections]} 
                      onChange={(v) => handleSectionChange(key as keyof Sections, v)}
                      modules={modules}
                    />
                 </div>
               </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-10 rounded-lg overflow-auto max-h-[80vh]">
          <div ref={printRef} className={styles.articlePreview}>
             <h1 className={styles.articleTitle}>{title}</h1>
             <p className={styles.articleAuthors}>
               {authors.filter(a => a.name).map((a, i) => (
                  <span key={i}>{a.name}{i < authors.length - 1 ? ', ' : ''}</span>
               ))}
             </p>
             <p className={styles.articleAffiliations}>
               {authors.filter(a => a.affiliation).map((a, i) => (
                  <span key={i}>{a.affiliation}{i < authors.length - 1 ? ' | ' : ''}</span>
               ))}
             </p>

             <div className={styles.scientificSection}>
               <h3 className={styles.abstractTitle}>ABSTRACT</h3>
               <div className={styles.abstractContent} dangerouslySetInnerHTML={{ __html: sections.abstract }} />
             </div>

             <div className={styles.scientificBody}>
               {Object.entries(sections).filter(([k]) => k !== 'abstract').map(([key, content]) => (
                  <div key={key} className={styles.scientificSection}>
                    <h3 className={styles.sectionHeading}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </h3>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
