"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./submission.module.css";
import { 
  PlusCircle, Trash2, Upload, CheckCircle, 
  AlertCircle, FileText, Info, ShieldCheck,
  FileArchive, FileCode, ChevronRight, Loader2,
  Clock, Zap, Gauge, CreditCard, DollarSign
} from "lucide-react";

type Author = {
  name: string;
  email: string;
  affiliation: string;
};

export default function SubmissionPage() {
  const { data: session } = useSession();
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
  const [supplementaryFile, setSupplementaryFile] = useState<File | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);

  const [pricing, setPricing] = useState<any[]>([]);
  const [userOrigin, setUserOrigin] = useState("PAKISTANI");

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then(res => res.json())
      .then(data => setPricing(data))
      .catch(err => console.error("Failed to load pricing", err));
    
    if (session?.user) {
      // Assuming session might have country now after signup update
      const country = (session.user as any).country || "Pakistan";
      setUserOrigin(country.toLowerCase() === "pakistan" ? "PAKISTANI" : "INTERNATIONAL");

      // PRE-FILL FIRST AUTHOR (If form is fresh)
      if (authors.length === 1 && !authors[0].name && !authors[0].email) {
        setAuthors([{
          name: session.user.name || "",
          email: session.user.email || "",
          affiliation: ""
        }]);
      }
    }
  }, [session]);

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
    const newAuthors = [...authors];
    // @ts-ignore
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProofFile) return setError("Proof of payment is mandatory for scholarly review.");
    if (!manuscriptFile) return setError("Principal manuscript file is required.");
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
      formData.append("paymentProof", paymentProofFile);
      if (supplementaryFile) formData.append("supplementary", supplementaryFile);

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
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Manuscript Cataloged Successfully</h2>
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
        <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Manuscript Submission</h1>
        <p className="text-slate-500 font-medium">Official peer-review entry portal for Pakistan Journal of Pharmaceutical Sciences</p>
      </div>

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
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-900">
                  <CreditCard size={18} />
                  <span className="text-sm font-bold">Estimated Submission Fee</span>
                </div>
                <div className="text-xl font-serif font-black text-blue-600">
                  {userOrigin === "PAKISTANI" ? "Rs. " : "$ "}{getCurrentFee().toLocaleString()}
                </div>
              </div>
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
                    <label className={styles.subLabel}>Primary Institutional Affiliation</label>
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
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      {manuscriptFile ? manuscriptFile.name : "Select Document Source"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {manuscriptFile ? `${(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB` : "Max File Size: 15MB"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof of Payment */}
              <div className={`${styles.fileVaultCard} ${paymentProofFile ? styles.hasFilePayment : ""}`}>
                <div className={styles.fileCardHeader}>
                  <div className={styles.paymentIconBox}>
                     {paymentProofFile ? <CheckCircle size={24} className="text-emerald-500" /> : <DollarSign size={24} />}
                  </div>
                  <div>
                    <h4 className={styles.fileTitle}>Payment Proof</h4>
                    <p className={styles.fileSubtitle}>Mandatory for processing</p>
                  </div>
                </div>
                
                <div className={styles.paymentDropZone}>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={styles.fileInput}
                    onChange={(e) => setPaymentProofFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      {paymentProofFile ? paymentProofFile.name : "Upload Bank Receipt"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {paymentProofFile ? "Receipt Attached" : "PDF or High-res Image"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplementary Data */}
            <div className={styles.supplementaryRow}>
               <div className={styles.suppIcon}>
                 <FileArchive size={20} />
               </div>
               <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Extended Datasets & Media (Optional)</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">CSV, ZIP, or RAR versions</p>
               </div>
               <div className="flex items-center gap-4">
                 {supplementaryFile && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tight">ATTACHED</span>}
                 <input 
                   type="file" 
                   accept=".zip,.rar,.csv,.xlsx"
                   id="suppInput"
                   className="hidden"
                   onChange={(e) => setSupplementaryFile(e.target.files ? e.target.files[0] : null)}
                 />
                 <label htmlFor="suppInput" className={styles.suppButton}>
                   {supplementaryFile ? "Replace" : "Choose File"}
                 </label>
               </div>
            </div>

            {/* Guidelines Checkbox */}
            <div className={styles.ethicsContainer}>
               <div className="flex gap-6 items-start">
                  <div className="pt-2">
                    <input 
                      type="checkbox" 
                      id="guidelines" 
                      checked={guidelinesConfirmed}
                      onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                      className={styles.checkbox}
                    />
                  </div>
                  <label htmlFor="guidelines" className="cursor-pointer group">
                    <h4 className="font-serif font-bold text-xl text-white mb-2 group-hover:text-blue-400 transition-colors">Ethics & Formatting Adherence</h4>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      I confirm that the submitted manuscript adheres to the **PJPS Formatting Guidelines**, consists of original research not previously published, and complies with international ethical standards for scientific publication.
                    </p>
                  </label>
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
              onClick={() => {
                if (step === 1 && (!title || !abstract || !keywords)) return setError("Please fill in all manuscript metadata.");
                if (step === 2 && authors.some(a => !a.name || !a.email || !a.affiliation)) return setError("Please provide complete details for all authors.");
                setError(null);
                setStep(step + 1);
              }}
              className="btn btn-primary px-10 flex items-center gap-2"
            >
              Continue to {step === 1 ? "Authors" : "Scholarly File"} <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary px-12 py-4 flex items-center gap-3 active:scale-95 transition-transform">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> Complete Peer-Review Entry</>}
            </button>
          )}
        </div>
      </form>

      <div className="mt-12 flex justify-center items-center gap-8 text-slate-400 grayscale opacity-50">
         <Info size={16} />
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Double-Blind Peer Review Standard</span>
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Cope Compliant Workflow</span>
      </div>
    </div>
  );
}
