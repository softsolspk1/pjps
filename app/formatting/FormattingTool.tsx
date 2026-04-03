"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, SectionType } from "docx";
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
  const [title, setTitle] = useState("Clinical characteristics and factors affecting quality of life in children with congenital adrenal hyperplasia");
  const [doi, setDoi] = useState("doi.org/10.36721/PJPS.2026.39.6.151.1");
  const [dates, setDates] = useState({
    submitted: "27-08-2024",
    revised: "31-10-2024",
    accepted: "31-10-2024"
  });
  const [keywords, setKeywords] = useState("Congenital adrenal hyperplasia; Hormonal control; 21-Hydroxylase deficiency; Pediatric endocrinology; Quality of life");
  const [currAuthor, setCurrAuthor] = useState("Shiyi Xu et al");
  const [authors, setAuthors] = useState<Author[]>([
    { name: "Shiyi Xu", affiliation: "Department of Endocrinology, Fujian Children's Hospital, China" },
    { name: "Hui Liu*", affiliation: "College of Clinical Medicine, Fujian Medical University, China" }
  ]);
  const [sections, setSections] = useState<Sections>({
    abstract: "Congenital Adrenal Hyperplasia (CAH) is a group of disorders characterized by impaired adrenal steroid hormone synthesis...",
    introduction: "Congenital adrenal hyperplasia (CAH) is a group of genetic disorders caused by defects in the steroidogenic pathway...",
    materialsMethods: "This retrospective study included 30 pediatric patients diagnosed with CAH who were admitted to the hospital between June 2021 and June 2023...",
    results: "The results of the clinical characterization showed significant variation in quality of life scores...",
    discussion: "The study explores the multifaceted impact of CAH on long-term patient outcomes...",
    conclusion: "In conclusion, early diagnosis and customized treatment regimens are the cornerstone of CAH management...",
    references: "[1] Robinson et al. (2002). J. Clin. Endocr. Metab.<br/>[2] Musa et al. (2020). PJPS Vol 33.",
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
          new Paragraph({ text: "ABSTRACT", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          new Paragraph({ text: stripHtml(sections.abstract), alignment: AlignmentType.JUSTIFIED, spacing: { after: 300 } }),
          ...Object.entries(sections).filter(([k]) => k !== 'abstract').flatMap(([key, value]) => [
             new Paragraph({ text: key.toUpperCase(), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }),
             new Paragraph({ text: stripHtml(value), alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 } })
          ])
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
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

      {view === "EDIT" ? (
        <div className="space-y-10">
          <div className={styles.editorSection}>
            <label className={styles.label}>Full Manuscript Title (Official)</label>
            <textarea 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className={styles.titleField}
              rows={2}
              placeholder="Enter full title..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={styles.editorSection}>
              <label className={styles.label}>DOI / Reference ID</label>
              <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)} className={styles.authorInput} />
            </div>
            <div className={styles.editorSection}>
              <label className={styles.label}>Keywords (Semi-colon separated)</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className={styles.authorInput} />
            </div>
          </div>

          <div className={styles.editorSection}>
            <label className={styles.label}>Publication Chronology</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Submitted</span>
                <input type="text" value={dates.submitted} onChange={(e) => setDates({...dates, submitted: e.target.value})} className={styles.authorInput} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Revised</span>
                <input type="text" value={dates.revised} onChange={(e) => setDates({...dates, revised: e.target.value})} className={styles.authorInput} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Accepted</span>
                <input type="text" value={dates.accepted} onChange={(e) => setDates({...dates, accepted: e.target.value})} className={styles.authorInput} />
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
                    className={styles.authorInput} placeholder="Full Name"
                  />
                  <textarea 
                    value={auth.affiliation} onChange={(e) => handleAuthorChange(idx, "affiliation", e.target.value)}
                    className={styles.authorInput} placeholder="Institutional Affiliation"
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
                   {key === 'abstract' ? ' (Full Width)' : ' (Scientific Column)'}
                 </label>
                 <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
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
      ) : (
        <div className={styles.articleViewport}>
          <div ref={printRef} className={styles.articlePreview}>
             <div className={styles.journalHeader}>{doi}</div>
             
             <h1 className={styles.articleTitle}>{title}</h1>
             
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

             <div className={styles.abstractBlock}>
               <div dangerouslySetInnerHTML={{ __html: `<b>Abstract: </b>` + sections.abstract }} />
             </div>

             <div className={styles.keywordsBlock}>
               <b>Keywords: </b> {keywords}
             </div>

             <div className={styles.dateLine}>
               Submitted on {dates.submitted} — Revised on {dates.revised} — Accepted on {dates.accepted}
             </div>

             <div className={styles.scientificBody}>
               {Object.entries(sections).filter(([k]) => k !== 'abstract').map(([key, content]) => (
                  <div key={key} className={styles.scientificSection}>
                    <span className={styles.sectionHeading}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
               ))}
             </div>

             <div className={styles.footnoteArea}>
                <div className="border-t border-black pt-2 w-1/2">
                   *Corresponding author: e-mail: {authors[0]?.name.toLowerCase().replace(/\s+/g, '_')}@pjps.pk
                </div>
             </div>

             <div className={styles.articleFooter}>
                <span>{new Date().getFullYear() === 2026 ? "1602" : "Page No."}</span>
                <span>Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

