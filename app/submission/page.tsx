"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import styles from "./submission.module.css";
import { 
  PlusCircle, Trash2, Upload, CheckCircle, 
  AlertCircle, FileText, Info, ShieldCheck,
  FileArchive, FileCode, ChevronRight, Loader2,
  Clock, Zap, Gauge, CreditCard, DollarSign,
  History, RotateCcw, Layers
} from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return handleNextStep();

    if (!paymentProofFile && !parentId) return setError("Proof of payment is mandatory for scholarly review.");
    if (!manuscriptFile) return setError("Principal manuscript file (v" + (parentId ? currentVersion + 1 : 1) + ") is required.");
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
      formData.append("file", manuscriptFile);
      
      if (paymentProofFile) {
         formData.append("paymentProof", paymentProofFile);
      } else if (parentId) {
         // Use a dummy empty file or signal it's a revision 
         // For now, API expects paymentProof, so I'll handle it there or require it.
         // Usually, revisions don't pay again.
         const dummy = new File(["dummy"], "payment_memo.txt", { type: "text/plain" });
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
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className={styles.stepper}>
      {[1, 2, 3].map((s) => (
        <div key={s} className={`${styles.step} ${step === s ? styles.activeStep : ""} ${step > s ? styles.completedStep : ""}`}>
          <div className={styles.stepCircle}>{step > s ? <CheckCircle size={16} /> : s}</div>
          <span className={styles.stepLabel}>{s === 1 ? "Metadata" : s === 2 ? "Authors" : "Scholarly File"}</span>
          {s < 3 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="container section-padding flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
           {parentId ? "Revision Cataloged Successfully" : "Manuscript Cataloged Successfully"}
        </h2>
        <p className="text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
          Your research contribution is now entering the editorial screening phase. You can track its progress using the unique Reference ID provided in your confirmation email.
        </p>
        <button onClick={() => window.location.href = "/"} className="btn btn-primary px-10">Return to Portal</button>
      </div>
    );
  }

  return (
    <div className="container section-padding max-w-4xl">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
           {parentId ? `Manuscript Revision (v${currentVersion + 1})` : "Manuscript Submission"}
        </h1>
        <p className="text-slate-500 font-medium">
           {parentId 
             ? "Scientific revision submission for previously reviewed research" 
             : "Official peer-review entry portal for Pakistan Journal of Pharmaceutical Sciences"}
        </p>
      </div>

      {parentId && (
         <div className="mb-10 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
               <RotateCcw size={24} />
            </div>
            <div>
               <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Revision Cycle</p>
               <p className="text-xs text-blue-700 font-bold">You are submitting a revised version of Manuscript <strong>#{parentId.slice(-6)}</strong>. Prior metadata has been pre-filled.</p>
            </div>
         </div>
      )}

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-premium p-10 mt-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-bold tracking-wide">{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={styles.formGroup}>
              <label className="text-sm font-medium text-slate-800 mb-4 block">Select Submission Track</label>
              <div className="flex flex-row gap-10 items-center">
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
              {!parentId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-900">
                    <CreditCard size={18} />
                    <span className="text-sm font-bold">Estimated Submission Fee</span>
                  </div>
                  <div className="text-xl font-serif font-black text-blue-600">
                    {userOrigin === "PAKISTANI" ? "Rs. " : "$ "}{getCurrentFee().toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Manuscript Title</label>
              <input 
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Scientific title of your research..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Abstract (Scoping Summary)</label>
              <textarea 
                required value={abstract} onChange={(e) => setAbstract(e.target.value)}
                className={styles.textarea}
                rows={6}
                placeholder="Comprehensive summary of research objectives, methodology, and key findings..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Index Keywords</label>
              <input 
                type="text" required value={keywords} onChange={(e) => setKeywords(e.target.value)}
                className={styles.input}
                placeholder="e.g. Pharmacology, Pharmaceutics, Clinical Trials (comma-separated)"
              />
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
                      type="text" required value={author.name} onChange={(e) => updateAuthor(idx, "name", e.target.value)}
                      className={styles.inputSmall}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className={styles.subLabel}>Email Address</label>
                    <input 
                      type="email" required value={author.email} onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                      className={styles.inputSmall}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={styles.subLabel}>Primary Institutional Affiliation <span className="text-red-500 font-black">*</span></label>
                    <input 
                      type="text" required value={author.affiliation} onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
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
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Manuscript */}
              <div className={`${styles.fileVaultCard} ${manuscriptFile ? styles.hasFile : ""}`}>
                <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-100">Mandatory</div>
                <div className={styles.fileCardHeader}>
                  <div className={styles.fileIconBox}>
                     {manuscriptFile ? <CheckCircle size={24} className="text-emerald-500" /> : <Upload size={24} />}
                  </div>
                  <div>
                    <h4 className={styles.fileTitle}>Principal Manuscript</h4>
                    <p className={styles.fileSubtitle}>PDF, DOCX, or LaTeX (ZIP)</p>
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

              {/* Proof of Payment / Revision Link */}
              <div className={`${styles.fileVaultCard} ${paymentProofFile ? styles.hasFilePayment : ""} ${parentId ? "opacity-50 pointer-events-none" : ""}`}>
                {!parentId && <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-100">Mandatory</div>}
                <div className={styles.fileCardHeader}>
                  <div className={styles.paymentIconBox}>
                     {parentId ? <RotateCcw size={24} className="text-blue-500" /> : (paymentProofFile ? <CheckCircle size={24} className="text-emerald-500" /> : <DollarSign size={24} />)}
                  </div>
                  <div>
                    <h4 className={styles.fileTitle}>{parentId ? "Revision (No Fee)" : "Payment Proof"}</h4>
                    <p className={styles.fileSubtitle}>{parentId ? "Cycle " + currentVersion : "Institution Bank Receipt"}</p>
                  </div>
                </div>
                
                {!parentId ? (
                  <div className={styles.paymentDropZone}>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      className={styles.fileInput}
                      onChange={(e) => setPaymentProofFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900 mb-1 max-w-[200px] truncate mx-auto">
                        {paymentProofFile ? paymentProofFile.name : "Upload Confirmation"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {paymentProofFile ? "Receipt Attached" : "PDF or High-res Image"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col justify-center items-center text-center px-6">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                        Submission fees are waived for manuscripts in their revision cycle.
                     </p>
                  </div>
                )}
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

            {/* Guidelines Checkbox */}
            <div className={styles.ethicsContainer}>
               <div className="flex gap-6 items-start">
                  <div className="pt-1.5">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-emerald-400">
                       <ShieldCheck size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="flex gap-4 items-start cursor-pointer group">
                      <div className="pt-2 relative">
                        <input 
                          type="checkbox" 
                          id="guidelines" 
                          checked={guidelinesConfirmed}
                          onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-slate-600 bg-transparent text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold tracking-tight text-base group-hover:text-emerald-400 transition-colors">Ethics & Formatting Adherence</p>
                        <p className="text-slate-200 text-sm leading-relaxed max-w-[600px]">
                           I hereby confirm that this manuscript is our original work, has not been published elsewhere, and strictly adheres to the <span className="text-emerald-400 font-bold italic underline">PJPS Editorial Guidelines</span> and Ethical Standards.
                        </p>
                      </div>
                    </label>
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline px-10">
              Return
            </button>
          ) : <div />}

          {step < 3 ? (
            <button 
              type="button" 
              onClick={handleNextStep}
              className="btn btn-primary px-10 flex items-center gap-2"
            >
              Continue to {step === 1 ? "Authors" : "Scholarly File"} <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary px-12 py-4 flex items-center gap-3 active:scale-95 transition-transform">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> {parentId ? "Submit Revision Cycle" : "Complete Peer-Review Entry"}</>}
            </button>
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
}

export default function SubmissionPage() {
  return (
    <Suspense fallback={<div>Loading Submission Portal...</div>}>
      <SubmissionForm />
    </Suspense>
  )
}
