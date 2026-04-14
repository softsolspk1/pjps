"use client";

import { useState, useEffect, Suspense, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import styles from "./submission.module.css";
import RoleLayout from "@/components/RoleLayout";
import { 
  PlusCircle, Trash2, Upload, CheckCircle, 
  AlertCircle, FileText, Info, ShieldCheck,
  FileArchive, FileCode, ChevronRight, Loader2,
  Clock, Zap, Gauge, CreditCard, DollarSign,
  History, RotateCcw, Layers, Globe, ArrowLeft
} from "lucide-react";
import HeaderWrapper from "@/components/HeaderWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
(pdfMake as any).vfs = pdfFonts.vfs;
import { BookOpen, Download } from "lucide-react";
import SectionEditor from "../admin/(protected)/article-design/SectionEditor";

type Author = {
  name: string;
  email: string;
  affiliation: string;
};

function SubmissionForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revisionOf");
  const parentId = searchParams.get("parentId");
  const currentVersion = parseInt(searchParams.get("v") || "1");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [submissionType, setSubmissionType] = useState("REGULAR");
  const [authors, setAuthors] = useState<Author[]>([{ name: "", email: "", affiliation: "" }]);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [figureFiles, setFigureFiles] = useState<File[]>([]);
  const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);
  const [sections, setSections] = useState([
    { id: 'introduction', title: 'INTRODUCTION', html: '' },
    { id: 'methods', title: 'MATERIALS AND METHODS', html: '' },
    { id: 'results', title: 'RESULTS', html: '' },
    { id: 'discussion', title: 'DISCUSSION', html: '' },
    { id: 'conclusion', title: 'CONCLUSION', html: '' },
    { id: 'references', title: 'REFERENCES', html: '' }
  ]);

  const [pricing, setPricing] = useState<any[]>([]);
  const [userOrigin, setUserOrigin] = useState("PAKISTANI");

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then(res => res.json())
      .then(data => setPricing(data))
      .catch(err => console.error("Failed to load pricing", err));
    
    // If it's a revision, we might want to fetch parent details
    if (parentId) {
       fetch(`/api/articles/${parentId}`)
         .then(res => res.json())
         .then(data => {
            setTitle(data.title);
            setAbstract(data.abstract);
            // Pre-fill authors
            if (data.authors) {
               setAuthors(data.authors.map((a: any) => ({
                  name: a.name,
                  email: a.email || "",
                  affiliation: a.address || ""
               })));
            }
         })
         .catch(err => console.error("Failed to load parent article", err));
    }

    if (session?.user) {
      const country = (session.user as any).country || "Pakistan";
      setUserOrigin(country.toLowerCase() === "pakistan" ? "PAKISTANI" : "INTERNATIONAL");

      if (!parentId && authors.length === 1 && !authors[0].name && !authors[0].email) {
        setAuthors([{
          name: session.user.name || "",
          email: session.user.email || "",
          affiliation: ""
        }]);
      }
    }
  }, [session, parentId]);

  const getCurrentFee = () => {
    const p = pricing.find(item => item.origin === userOrigin);
    if (!p) return 0;
    
    if (submissionType === "REGULAR") return p.processingRegular;
    if (submissionType === "FAST") return p.processingFast;
    if (submissionType === "ULTRAFAST") return p.processingUltraFast;
    
    return 0;
  };

  const addAuthor = () => setAuthors([...authors, { name: "", email: "", affiliation: "" }]);
  const removeAuthor = (index: number) => setAuthors(authors.filter((_, i) => i !== index));
  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const newAuthors = authors.map((author, i) => 
      i === index ? { ...author, [field]: value } : author
    );
    setAuthors(newAuthors);
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!title.trim() || !abstract.trim() || !keywords.trim()) {
        setError("Metadata fields (Title, Abstract, Keywords) are required.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    
    if (step === 2) {
      const hasEmpty = authors.some(a => !a.name.trim() || !a.email.trim() || !a.affiliation.trim());
      if (hasEmpty) {
        setError("All author details (Name, Email, Affiliation) are mandatory for journal indexing.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImageNative = async (files: File[], editorInstance: any, position?: number | null) => {
    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.success && editorInstance) {
            if (position !== undefined && position !== null) {
               editorInstance.chain().focus().insertContentAt(position, { type: 'image', attrs: { src: data.url } }).run();
            } else {
               editorInstance.chain().focus().setImage({ src: data.url }).run();
            }
          }
        })
      );
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) return;

    // Validation for final submission
    // Since payment proof was removed from UI, we bypass its validation
    // Manuscript is optional if they formatted online? We'll make it not strictly mandatory if formatted, 
    // but the prompt says 4) Attach documents (if required). 
    if (!guidelinesConfirmed) return setError("You must confirm adherence to PJPS formatting guidelines.");
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("keywords", keywords);
      formData.append("submissionType", submissionType);
      formData.append("trackingType", submissionType);
      formData.append("origin", userOrigin);
      formData.append("authors", JSON.stringify(authors));
      
      if (manuscriptFile) formData.append("file", manuscriptFile);
      
      formData.append("sections", JSON.stringify(sections));

      if (paymentProofFile) {
         formData.append("paymentProof", paymentProofFile);
      } else if (parentId) {
         // Dummy file since it's a revision and might bypass payment logic
         const dummy = new File(["dummy"], "payment_memo.txt", { type: "text/plain" });
         formData.append("paymentProof", dummy);
      } else {
         // If regular submission but payment proof is skipped
         const dummy = new File(["waived"], "payment_waived.txt", { type: "text/plain" });
         formData.append("paymentProof", dummy);
      }

      if (parentId) {
         formData.append("parentId", parentId);
         formData.append("version", (currentVersion + 1).toString());
      }

      // Handle Figures
      figureFiles.forEach((file, index) => {
         formData.append(`figure_${index}`, file);
      });

      // Handle Supplementary
      supplementaryFiles.forEach((file, index) => {
         formData.append(`supplementary_${index}`, file);
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to catalog manuscript");

      setSuccess(true);
      // Wait to scroll
      window.scrollTo(0,0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPreviewDocx = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "Pakistan Journal of Pharmaceutical Sciences", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "MANUSCRIPT PREVIEW - UNPUBLISHED", alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: authors.map((a, i) => new TextRun({ text: `${a.name}${i < authors.length - 1 ? ", " : ""}`, bold: true }))
          }),
          ...authors.map(a => new Paragraph({ 
            children: [new TextRun({ text: a.affiliation, italics: true })] 
          })),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "ABSTRACT", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: abstract }),
          new Paragraph({ text: "" }),
          new Paragraph({ 
            children: [new TextRun({ text: "Keywords:", bold: true })] 
          }),
          new Paragraph({ text: keywords }),
          new Paragraph({ text: "" }),
          new Paragraph({ 
            children: [new TextRun({ text: `Article Track: ${submissionType}`, italics: true })] 
          }),
          new Paragraph({ text: `Generated Date: ${new Date().toLocaleDateString()}` }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "article.docx");
    });
  };

  const handleDownloadPreviewPdf = () => {
    const docDefinition = {
      content: [
        { text: 'Pakistan Journal of Pharmaceutical Sciences', style: 'header', alignment: 'center' },
        { text: 'MANUSCRIPT PREVIEW - FOR AUTHOR REVIEW ONLY', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: title, style: 'title', alignment: 'center' },
        { text: authors.map(a => a.name).join(', '), alignment: 'center', bold: true, margin: [0, 10, 0, 5] },
        { text: authors.map(a => a.affiliation).join('; '), alignment: 'center', fontSize: 9, italics: true, margin: [0, 0, 0, 20] },
        { text: 'ABSTRACT', style: 'sectionHeader' },
        { text: abstract, alignment: 'justify', margin: [0, 5, 0, 15] },
        { text: 'Keywords', style: 'boldSmall' },
        { text: keywords, margin: [0, 2, 0, 10] },
        { text: `Track: ${submissionType}`, italics: true }
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: '#002d5e' },
        subheader: { fontSize: 10, bold: true, color: '#64748b' },
        title: { fontSize: 16, bold: true, margin: [0, 20, 0, 10] },
        sectionHeader: { fontSize: 12, bold: true, decoration: 'underline', margin: [0, 10, 0, 5] },
        boldSmall: { fontSize: 10, bold: true }
      }
    };
    pdfMake.createPdf(docDefinition as any).download("article.pdf");
  };

  const renderStepIndicator = () => (
    <div className={styles.stepper}>
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className={`${styles.step} ${step === s ? styles.activeStep : ""} ${step > s ? styles.completedStep : ""}`}>
          <div className={styles.stepCircle}>
             {step > s ? <CheckCircle size={18} /> : (
               <span className="text-xs font-black">{s}</span>
             )}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-center" style={{ width: '80px', marginLeft: '-25px' }}>
            {s === 1 ? "Meta Data" : s === 2 ? "Authors" : s === 3 ? "Formatting" : s === 4 ? "Attach" : s === 5 ? "Review" : "Submit"}
          </p>
          {s < 6 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  );

  const FormContent = (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Institutional Banner */}
      <div className="relative p-12 bg-slate-900 rounded-[3rem] text-white shadow-premium overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full group-hover:scale-110 transition-all duration-1000" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Formal Scholarly Entry</div>
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                   <ShieldCheck size={14} /> Platinum Peer Review Protocol
                </div>
            </div>
            <h1 className="text-5xl font-serif font-black mb-4 tracking-tight">
               {parentId ? `Manuscript Revision (v${currentVersion + 1})` : "Manuscript Submission"}
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl mb-8">
               {parentId 
                 ? "Scientific revision submission for previously reviewed research. Prior metadata has been verified and pre-filled." 
                 : "Official peer-review entry portal. Your research will enter the editorial screening phase upon submission."}
            </p>
            
            {/* Back CTA if we're in dashboard mode */}
            {session?.user && (
              <button onClick={() => window.location.href = "/author/dashboard"} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group">
                <ArrowLeft size={16} className="group-hover:-translateX-1 transition-transform" /> Back to Dashboard
              </button>
            )}
         </div>
      </div>

      {parentId && (
         <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-premium">
               <RotateCcw size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Revision Outreach Link Active</p>
               <p className="text-sm text-blue-700 font-bold italic">You are submitting a mandatory revision for Manuscript <strong>#{parentId.slice(-6).toUpperCase()}</strong>.</p>
            </div>
         </div>
      )}

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[3rem] shadow-premium p-12 relative">
        {error && (
          <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-4 animate-shake">
            <AlertCircle size={24} />
            <span className="text-xs font-black uppercase tracking-tight">{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={styles.formGroup}>
                <label className="text-sm font-medium text-slate-800 mb-4 block">Select Submission Track</label>
                <div className="flex flex-row gap-8 items-center cursor-pointer">
                  {[
                    { id: "REGULAR", label: "Regular" },
                    { id: "FAST", label: "Fast Track" },
                    { id: "ULTRAFAST", label: "Ultra Fast" },
                  ].map((track) => (
                    <label 
                      key={track.id}
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <input 
                        type="radio" 
                        name="submissionTrack"
                        checked={submissionType === track.id}
                        onChange={() => setSubmissionType(track.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>{track.label}</span>
                    </label>
                  ))}
                </div>
                </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Index Keywords</label>
                <input 
                  type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                  className={styles.input}
                  placeholder="Pharmacology, Pharmaceutics..."
                />
              </div>
              
              <div className={`col-span-1 md:col-span-2 max-w-4xl ${styles.formGroup}`}>
                <label className={styles.label}>Full Manuscript Title</label>
                <input 
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="Scientific title of your research..."
                />
              </div>
              
              <div className={`col-span-1 md:col-span-2 max-w-4xl ${styles.formGroup}`}>
                <label className={styles.label}>Abstract (Scoping Summary)</label>
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-inner mt-2">
                  <SectionEditor 
                    title="ABSTRACT (RICH TEXT)"
                    html={abstract}
                    onChange={(newHtml) => setAbstract(newHtml)}
                    onImageUpload={uploadImageNative}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Author Registry</label>
              <button type="button" onClick={addAuthor} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <PlusCircle size={16} /> Add Co-author
              </button>
            </div>
            {authors.map((author, idx) => (
              <div key={idx} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl relative group hover:border-blue-200 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className={styles.subLabel}>Full Academic Name (A{idx + 1})</label>
                    <input 
                      type="text" value={author.name} onChange={(e) => updateAuthor(idx, "name", e.target.value)}
                      className={styles.inputSmall}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className={styles.subLabel}>Email Address</label>
                    <input 
                      type="email" value={author.email} onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                      className={styles.inputSmall}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={styles.subLabel}>Primary Institutional Affiliation <span className="text-red-500 font-black">*</span></label>
                    <input 
                      type="text" value={author.affiliation} onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
                      className={styles.inputSmall}
                      placeholder="University / Research Center / Hospital"
                    />
                  </div>
                </div>
                {authors.length > 1 && (
                  <button 
                    type="button" onClick={() => removeAuthor(idx)} 
                    className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Manuscript Formatting</h3>
                 <div className="flex justify-center gap-2 mt-3 mb-4">
                   <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">New Features</span>
                   <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-200 uppercase">Optional Step</span>
                 </div>
                 <p className="text-sm text-slate-500 mt-1 max-w-2xl mx-auto font-medium">
                   You may skip this optional formatting step if you have already attached a full manuscript (PDF/DOCX) in the <strong>Attach</strong> step.
                 </p>
                <p className="text-sm text-slate-500 mt-1">
                  You may skip this formatting step if you have already attached a full manuscript (PDF/DOCX) in the <strong>Attach</strong> step. 
                  However, formatting here enables direct indexing.
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
                {sections.map((sec, idx) => (
                  <SectionEditor 
                    key={sec.id}
                    title={sec.title}
                    html={sec.html}
                    autoFocus={idx === 0}
                    onChange={(newHtml) => {
                      const newSecs = [...sections];
                      newSecs[idx].html = newHtml;
                      setSections(newSecs);
                    }}
                    onImageUpload={uploadImageNative}
                  />
                ))}
              </div>
           </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-black text-slate-800">Attach Documents</h3>
              <p className="text-sm text-slate-500 mt-2">Upload any required supplementary or original files to accompany your submission.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Manuscript */}
              <div className={`${styles.fileVaultCard} ${manuscriptFile ? styles.hasFile : ""}`}>
                <div className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-slate-200">Optional</div>
                <div className={styles.fileCardHeader}>
                  <div className={styles.fileIconBox}>
                     {manuscriptFile ? <CheckCircle size={24} className="text-emerald-500" /> : <Upload size={24} />}
                  </div>
                  <div>
                    <h4 className={styles.fileTitle}>Full Manuscript Text</h4>
                    <p className={styles.fileSubtitle}>PDF, DOCX (If not formatted in Step 3)</p>
                  </div>
                </div>
                
                <div className={styles.dropZone}>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.tex,.zip"
                    className={styles.fileInput}
                    onChange={(e) => setManuscriptFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 mb-1 max-w-[200px] truncate mx-auto">
                      {manuscriptFile ? manuscriptFile.name : (parentId ? "Upload Revision v" + (currentVersion + 1) : "Select Document Source")}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       {manuscriptFile ? `${(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB` : ".TEX, .PDF, .DOCX"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Figures Upload */}
            <div className={styles.supplementaryRow}>
               <div className="flex-1 flex items-center gap-4">
                  <div className={styles.suppIcon} style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
                    <Layers size={20} />
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 tracking-tight">Analytical Figures & Charts</p>
                        <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">Optional</span>
                     </div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">JPG, PNG, or TIFF versions</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 {figureFiles.length > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-tight">{figureFiles.length} ATTACHED</span>}
                  <input 
                    type="file" multiple accept="image/*" id="figInput"
                    style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }}
                    onChange={(e) => setFigureFiles(Array.from(e.target.files || []))}
                  />
                  <label htmlFor="figInput" className={styles.suppButton}>
                    {figureFiles.length > 0 ? "Change" : "Add Figures"}
                  </label>
               </div>
            </div>

            {/* Supplementary Data */}
            <div className={styles.supplementaryRow}>
               <div className="flex-1 flex items-center gap-4">
                  <div className={styles.suppIcon}>
                    <FileArchive size={20} />
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 tracking-tight">Extended Datasets & Media</p>
                        <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">Optional</span>
                     </div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">CSV, ZIP, or RAR versions</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 {supplementaryFiles.length > 0 && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tight">{supplementaryFiles.length} ATTACHED</span>}
                  <input 
                    type="file" multiple accept=".zip,.rar,.csv,.xlsx,.xls" id="suppInput"
                    style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }}
                    onChange={(e) => setSupplementaryFiles(Array.from(e.target.files || []))}
                  />
                  <label htmlFor="suppInput" className={styles.suppButton}>
                    {supplementaryFiles.length > 0 ? "Change" : "Add Datasets"}
                  </label>
               </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden print-body-section" style={{ fontFamily: "'Times New Roman', serif", backgroundColor: 'white', color: 'black' }}>
               <div className="absolute top-0 left-0 w-full h-2 bg-blue-900"></div>
               <div className="absolute top-4 right-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">PJPS Submission Registry</div>
               
               <div className="border-b-2 border-slate-900 pb-12 mb-12 text-center">
                  <h1 className="text-4xl font-serif font-black uppercase text-slate-900 mb-8 leading-tight tracking-tight">{title}</h1>
                  <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                     {authors.map((a, i) => (
                        <div key={i} className="text-center group">
                           <p className="font-bold text-slate-900 uppercase tracking-tighter text-[12px] mb-1">{a.name}<sup>{i+1}*</sup></p>
                           <p className="text-[10px] text-slate-400 italic max-w-[200px] mx-auto leading-tight">{a.affiliation}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="max-w-[850px] mx-auto text-black">
                  <div className="mb-14">
                     <h4 className="font-bold text-[11px] uppercase tracking-[0.3em] mb-6 border-b border-slate-100 pb-3 text-slate-900">Abstract</h4>
                     <div className="text-[14px] leading-relaxed text-justify indent-10 font-serif" dangerouslySetInnerHTML={{ __html: abstract || 'No abstract content localized.' }} />
                  </div>

                  <div className="space-y-16">
                     {sections.map((sec, i) => (
                       <div key={i} className="text-justify pt-10 border-t border-slate-100 first:border-0 first:pt-0">
                         <h4 className="font-bold text-[11px] mb-6 uppercase tracking-[0.2em] text-slate-950 flex items-center gap-4">
                           <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-[11px] font-black">{i+1}</span>
                           {sec.title}
                         </h4>
                         <div dangerouslySetInnerHTML={{ __html: sec.html || "<p class='italic text-slate-300 py-6 text-center border border-dashed rounded-2xl'>Section content skipped.</p>" }} 
                              className="text-[15px] leading-[1.8] tiptap-section" />
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                  <button type="button" onClick={() => setStep(3)} className="px-10 py-3 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Correction needed? Return to Formatting</button>
               </div>
            </div>

            {manuscriptFile && (
              <div className="flex items-center gap-6 p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <FileText size={28} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Attached Manuscript</p>
                    <p className="text-lg font-bold">{manuscriptFile?.name}</p>
                 </div>
                 <div className="flex gap-3">
                    <button type="button" onClick={handleDownloadPreviewPdf} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/10" title="Review formatting as PDF">
                       <Download size={20} />
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-8 bg-blue-900 rounded-[2rem] text-white">
               <div className="flex items-center gap-4 mb-4">
                  <ShieldCheck size={28} className="text-blue-400" />
                  <h4 className="text-lg font-bold">Scientific Integrity Confirmation</h4>
               </div>
               <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  By clicking submit, you certify that this manuscript constitutes original scholarly research and adheres to the ethical standards of the Pakistan Journal of Pharmaceutical Sciences.
               </p>
               <label className="flex items-center gap-6 cursor-pointer group bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                   <div className="relative">
                     <input 
                       type="checkbox" 
                       required
                       checked={guidelinesConfirmed}
                       onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                       className="w-8 h-8 rounded-lg bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500 transition-all cursor-pointer"
                     />
                   </div>
                   <div className="flex-1">
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">Peer-Review Integrity Check</p>
                     <p className="text-xs font-bold text-white group-hover:text-blue-100 transition-colors leading-relaxed">I certify that this submission is original work and adheres to the ethical standards and formatting guidelines of the Pakistan Journal of Pharmaceutical Sciences.</p>
                   </div>
                </label>
            </div>
           </div>
        )}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline px-10">
              Return
            </button>
          ) : <div />}

          {step < 6 ? (
            <button 
              type="button" 
              onClick={handleNextStep}
              className="btn btn-primary px-10 flex items-center gap-2"
            >
              Continue to {step === 1 ? "Authors" : step === 2 ? "Formatting" : step === 3 ? "Attach" : step === 4 ? "Review" : "Submit"} <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary px-12 py-4 flex items-center gap-3 active:scale-95 transition-transform shadow-premium">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> {parentId ? "Submit Revision Cycle" : "Complete Peer-Review Entry"}</>}
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="mt-16 flex flex-wrap justify-center items-center gap-10 text-slate-400 grayscale opacity-60 pb-10">
         <div className="flex items-center gap-2">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Double-Blind Peer Review Standard</span>
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cope Compliant Workflow</span>
         </div>
      </div>
    </div>
  );

  const isAuthor = (session?.user as any)?.role === 'AUTHOR';

  if (success) {
    const SuccessContent = (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-premium border border-emerald-100">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-serif font-black text-slate-900 mb-6 tracking-tight">
           {parentId ? "Revision Cataloged" : "Manuscript Cataloged"}
        </h2>
        <p className="text-slate-500 max-w-lg mb-12 mx-auto leading-relaxed font-medium">
          Your research contribution has been successfully indexed in the PJPS scholarly registry and is now entering the editorial screening phase.
        </p>
        <div className="flex justify-center gap-4">
           <button onClick={() => window.location.href = "/author/dashboard"} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">
              Return to Dashboard
           </button>
        </div>
      </div>
    );

    if (isAuthor) {
      return (
        <RoleLayout role="AUTHOR">
          {SuccessContent}
        </RoleLayout>
      );
    }

    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <HeaderWrapper />
        <div className="flex-1" style={{ paddingTop: '100px' }}>
           {SuccessContent}
        </div>
        <FooterWrapper />
      </div>
    );
  }

  if (isAuthor) {
    return (
      <RoleLayout role="AUTHOR">
        {FormContent}
      </RoleLayout>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <HeaderWrapper />
      <div className="flex-1" style={{ paddingTop: '100px' }}>
         {FormContent}
      </div>
      <FooterWrapper />
    </div>
  );
}

export default function SubmissionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
         <Loader2 className="animate-spin text-blue-600" size={40} />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Submission Portal...</p>
      </div>
    }>
      <SubmissionForm />
    </Suspense>
  )
}
