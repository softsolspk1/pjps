"use client";

import { useState } from "react";
import styles from "./submission.module.css";
import { 
  PlusCircle, Trash2, Upload, CheckCircle, 
  AlertCircle, FileText, Info, ShieldCheck,
  FileArchive, FileCode, ChevronRight, Loader2,
  Clock, Zap, Gauge
} from "lucide-react";

type Author = {
  name: string;
  email: string;
  affiliation: string;
};

export default function SubmissionPage() {
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
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);

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
      formData.append("authors", JSON.stringify(authors));
      formData.append("file", manuscriptFile);
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Select Submission Track</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "REGULAR", label: "Regular", desc: "4-8 Weeks", icon: <Clock size={20} />, color: "border-slate-200" },
                  { id: "FAST", label: "Fast Track", desc: "2-4 Weeks", icon: <Zap size={20} />, color: "border-blue-200" },
                  { id: "ULTRAFAST", label: "Ultra Fast", desc: "7-12 Days", icon: <Gauge size={20} />, color: "border-emerald-200" },
                ].map((track) => (
                  <div 
                    key={track.id}
                    onClick={() => setSubmissionType(track.id)}
                    className={`flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      submissionType === track.id 
                        ? `${track.color} bg-white ring-2 ring-blue-500/20` 
                        : "border-slate-50 bg-slate-50/30 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 hover:border-slate-200"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-4 w-fit ${submissionType === track.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {track.icon}
                    </div>
                    <h3 className={`font-black uppercase tracking-widest text-xs mb-1 ${submissionType === track.id ? 'text-slate-900' : 'text-slate-400'}`}>
                      {track.label}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Review: {track.desc}</p>
                  </div>
                ))}
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
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Primary Manuscript */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Principal Manuscript File</label>
              <div className="relative h-48 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.tex,.zip"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setManuscriptFile(e.target.files ? e.target.files[0] : null)}
                />
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 mb-4 transition-colors">
                  {manuscriptFile ? <CheckCircle size={24} className="text-emerald-500" /> : <Upload size={24} />}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">
                  {manuscriptFile ? manuscriptFile.name : "Select Manuscript Source"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  PDF, DOCX, or LaTeX (ZIP) | Max 10MB
                </p>
              </div>
            </div>

            {/* Supplementary Data */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Supplementary Data (Optional)</label>
              <div className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl">
                 <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                   <FileArchive size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">Extended Datasets & Media</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">CSV, ZIP, or RAR versions</p>
                 </div>
                 <input 
                   type="file" 
                   accept=".zip,.rar,.csv,.xlsx"
                   id="suppInput"
                   className="hidden"
                   onChange={(e) => setSupplementaryFile(e.target.files ? e.target.files[0] : null)}
                 />
                 <label htmlFor="suppInput" className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 cursor-pointer transition-colors">
                   {supplementaryFile ? "Replace File" : "Choose File"}
                 </label>
              </div>
              {supplementaryFile && <p className="text-xs text-blue-600 font-medium ml-2 flex items-center gap-2"><CheckCircle size={12}/> {supplementaryFile.name} attached.</p>}
            </div>

            {/* Guidelines Checkbox */}
            <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl">
               <div className="flex gap-4">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id="guidelines" 
                      checked={guidelinesConfirmed}
                      onChange={(e) => setGuidelinesConfirmed(e.target.checked)}
                      className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="guidelines" className="cursor-pointer">
                    <h4 className="font-serif font-bold text-lg mb-2">Ethics & Formatting Adherence</h4>
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
