"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Document, Packer, Paragraph, TextRun, AlignmentType, SectionType, ImageRun, BorderStyle, Table, TableRow, TableCell, convertInchesToTwip, WidthType } from "docx";
import { saveAs } from "file-saver";
import { Download, Edit3, Eye, Sparkles } from "lucide-react";
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

  // Convert HTML to LaTeX
  const parseHtmlToLaTeX = (html: string): string => {
    if (typeof window === 'undefined') return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    const parseNode = (node: ChildNode): string => {
      let text = "";
      if (node.nodeType === 3) {
        // Escape LaTeX special characters
        return (node.textContent || "")
          .replace(/&/g, '\\&')
          .replace(/%/g, '\\%')
          .replace(/\\$/g, '\\$')
          .replace(/#/g, '\\#')
          .replace(/_/g, '\\_');
      }
      
      node.childNodes.forEach(child => {
        text += parseNode(child);
      });
      
      const tag = node.nodeName.toUpperCase();
      if (tag === 'STRONG' || tag === 'B') return `\\textbf{${text}}`;
      if (tag === 'EM' || tag === 'I') return `\\textit{${text}}`;
      if (tag === 'U') return `\\underline{${text}}`;
      if (tag === 'SUP') return `\\textsuperscript{${text}}`;
      if (tag === 'SUB') return `\\textsubscript{${text}}`;
      if (tag === 'P') return `${text}\n\n`;
      if (tag === 'DIV') return `${text}\n\n`;
      if (tag === 'H1' || tag === 'H2') return `\\section*{${text}}\n`;
      if (tag === 'H3' || tag === 'H4') return `\\subsection*{${text}}\n`;
      if (tag === 'UL') return `\\begin{itemize}\n${text}\\end{itemize}\n\n`;
      if (tag === 'OL') return `\\begin{enumerate}\n${text}\\end{enumerate}\n\n`;
      if (tag === 'LI') return `  \\item ${text}\n`;
      if (tag === 'BR') return `\\newline\n`;
      if (tag === 'IMG') return `\n[Image Placeholder - Upload manually in Overleaf]\n`;

      return text;
    };

    let latex = "";
    doc.body.childNodes.forEach(node => {
      latex += parseNode(node);
    });
    
    return latex.trim();
  };

  const exportToOverleaf = () => {
    const authorLine = authors.filter(a => a.name).map((a, i) => `${parseHtmlToLaTeX(a.name)}$^{${i+1}}$`).join(", ");
    const affiliationLine = authors.filter(a => a.affiliation).map((a, i) => `$^{${i+1}}$ ${parseHtmlToLaTeX(a.affiliation)}`).join(" \\\\ ");
    
    const bodyStr = [
      { key: 'introduction', label: 'INTRODUCTION' },
      { key: 'materialsMethods', label: 'MATERIALS AND METHODS' },
      { key: 'results', label: 'RESULTS' },
      { key: 'discussion', label: 'DISCUSSION' },
      { key: 'conclusion', label: 'CONCLUSION' },
    ].filter(s => sections[s.key as keyof Sections]?.trim())
     .map(s => `\\section*{${s.label}}\n` + parseHtmlToLaTeX(sections[s.key as keyof Sections]))
     .join("\n\n");
     
    const refStr = sections.references?.trim() 
        ? `\\section*{REFERENCES}\n` + parseHtmlToLaTeX(sections.references) 
        : "";

    const abstractText = sections.abstract.replace(/^Abstract:\s*/i, "").trim();

    const latexTemplate = `\\documentclass[twocolumn,a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{times}
\\usepackage[margin=2cm]{geometry}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{abstract}

\\titleformat{\\section}{\\large\\bfseries\\uppercase}{\\thesection.}{1em}{}
\\titleformat{\\subsection}{\\normalsize\\bfseries}{\\thesubsection.}{1em}{}

\\title{ \\vspace{-2cm} \\Large \\textbf{ ${parseHtmlToLaTeX(title)} } }
\\author{ ${authorLine} \\\\ \\vspace{2mm} \\small \\textit{ ${affiliationLine} } }
\\date{\\vspace{-6ex}}

\\begin{document}
\\twocolumn[
  \\begin{center}
    \\textit{Pak. J. Pharm. Sci., Vol.39, No.6, June 2026, pp.1602-1610} \\hfill \\textbf{ ${parseHtmlToLaTeX(doi)} }
  \\end{center}
  \\maketitle
  \\begin{abstract}
    \\noindent \\textbf{Abstract: } ${parseHtmlToLaTeX(abstractText)}
  \\end{abstract}
  \\noindent \\textbf{Keywords:} ${parseHtmlToLaTeX(keywords)} \\\\
  \\vspace{0.5cm} \\\\
  \\noindent \\textit{Submitted: ${parseHtmlToLaTeX(dates.submitted)} --- Revised: ${parseHtmlToLaTeX(dates.revised)} --- Accepted: ${parseHtmlToLaTeX(dates.accepted)}}
  \\vspace{1cm}
]

${bodyStr}

${refStr}

\\end{document}
`;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    const snipInput = document.createElement('input');
    snipInput.type = 'hidden';
    snipInput.name = 'snip';
    snipInput.value = latexTemplate;
    
    form.appendChild(snipInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  /* ── RAW DOCX FALLBACK ── */
  const exportWord = async () => {
    const parseHTML = (html: string): (Paragraph | Table)[] => {
      if (typeof window === 'undefined') return [];
      const docParser = new DOMParser().parseFromString(html, 'text/html');
      const docxElements: (Paragraph | Table)[] = [];

      const parseInline = (node: ChildNode): any[] => {
        const runs: any[] = [];
        node.childNodes.forEach((child: any) => {
          const tag = child.nodeName;
          const text = child.textContent || "";
          
          if (tag === 'STRONG' || tag === 'B') runs.push(new TextRun({ text, bold: true, size: 20, font: "Times New Roman" }));
          else if (tag === 'EM' || tag === 'I') runs.push(new TextRun({ text, italics: true, size: 20, font: "Times New Roman" }));
          else if (tag === 'SUP') runs.push(new TextRun({ text, superScript: true, size: 14, font: "Times New Roman" }));
          else if (tag === 'SUB') runs.push(new TextRun({ text, subScript: true, size: 14, font: "Times New Roman" }));
          else if (tag === 'SPAN') runs.push(...parseInline(child));
          else if (text) runs.push(new TextRun({ text, size: 20, font: "Times New Roman" }));
        });
        return runs;
      };

      docParser.body.childNodes.forEach((node: any) => {
        const tag = node.nodeName;
        if (tag === 'P' || tag === 'DIV') {
          const children = parseInline(node);
          if (children.length > 0) docxElements.push(new Paragraph({ children, alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 276 } }));
        } else if (tag === 'H1' || tag === 'H2') {
          docxElements.push(new Paragraph({ children: [new TextRun({ text: node.textContent?.toUpperCase() || "", bold: true, size: 22, font: "Times New Roman" })], spacing: { before: 200, after: 120 } }));
        } else if (tag === 'H3' || tag === 'H4') {
          docxElements.push(new Paragraph({ children: [new TextRun({ text: node.textContent || "", bold: true, italics: true, size: 20, font: "Times New Roman" })], spacing: { before: 160, after: 80 } }));
        } else if (tag === 'UL' || tag === 'OL') {
          node.querySelectorAll('li').forEach((li: any) => {
            docxElements.push(new Paragraph({ children: parseInline(li), bullet: tag === 'UL' ? { level: 0 } : undefined, spacing: { after: 60, line: 276 } }));
          });
        }
      });
      return docxElements;
    };

    const doc = new Document({
      creator: "PJPS formatting tool",
      sections: [
        {
          properties: { page: { margin: { top: convertInchesToTwip(1), right: convertInchesToTwip(0.8), bottom: convertInchesToTwip(1), left: convertInchesToTwip(0.8) } } },
          children: [
            new Paragraph({ children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 240 } }),
            new Paragraph({ children: authors.filter(a => a.name).map((a, i) => new TextRun({ text: `${a.name}${i+1}${i < authors.length-1 ? ', ' : ''}`, bold: true, size: 24, font: "Times New Roman" })), alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
            ...authors.filter(a => a.affiliation).map((a, i) => new Paragraph({ children: [new TextRun({ text: `${i+1} ${a.affiliation}`, italics: true, size: 20, font: "Times New Roman" })], alignment: AlignmentType.CENTER, spacing: { after: 40 } })),
            new Paragraph({ children: [new TextRun({ text: "Abstract: ", bold: true, size: 20, font: "Times New Roman" }), new TextRun({ text: sections.abstract.replace("Abstract:", "").trim(), size: 20, font: "Times New Roman" })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 240, after: 160, line: 276 } }),
          ],
        },
        {
          properties: { type: SectionType.CONTINUOUS, column: { count: 2, space: convertInchesToTwip(0.28) } },
          children: [
            ...['introduction', 'materialsMethods', 'results', 'discussion', 'conclusion'].filter(k => sections[k as keyof Sections]?.trim()).flatMap(k => [
               new Paragraph({ children: [new TextRun({ text: k.toUpperCase(), bold: true, size: 22, font: "Times New Roman" })], spacing: { before: 240, after: 120 } }),
               ...parseHTML(sections[k as keyof Sections])
            ]),
            ...(sections.references?.trim() ? [
               new Paragraph({ children: [new TextRun({ text: "REFERENCES", bold: true, size: 22, font: "Times New Roman" })], spacing: { before: 240, after: 120 } }),
               ...parseHTML(sections.references).map(p => new Paragraph({ ...(p as any), indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } }))
            ] : [])
          ],
        }
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${(title || "PJPS_Article").substring(0,25).replace(/\\s+/g, '_')}.docx`);
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
          <button 
            onClick={exportToOverleaf}
            className="btn btn-primary flex items-center gap-2"
            style={{ background: '#002d5e', minWidth: 180 }}
            title="Automatically format your paper using Overleaf LaTeX"
          >
            <Sparkles size={16} /> Format in Overleaf (Precision)
          </button>
          <button onClick={exportWord} className="btn btn-outline flex items-center gap-2 border-slate-300">
            <Download size={16} /> Raw DOCX
          </button>
        </div>
      </div>

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
    </div>
  );
}
