"use client";

import { useState } from "react";
import styles from "./submission.module.css";
import { PlusCircle, Trash2, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";

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
  const [authors, setAuthors] = useState<Author[]>([{ name: "", email: "", affiliation: "" }]);
  const [file, setFile] = useState<File | null>(null);

  const addAuthor = () => setAuthors([...authors, { name: "", email: "", affiliation: "" }]);
  const removeAuthor = (index: number) => setAuthors(authors.filter((_, i) => i !== index));
  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please upload your manuscript file");
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("keywords", keywords);
      formData.append("authors", JSON.stringify(authors));
      formData.append("file", file);

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit manuscript");

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
          <span className={styles.stepLabel}>{s === 1 ? "Metadata" : s === 2 ? "Authors" : "Upload"}</span>
          {s < 3 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="container section-padding flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Submission Successful!</h2>
        <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
          Your manuscript has been successfully submitted to the **Pakistan Journal of Pharmaceutical Sciences**. 
          An editorial review coordinator will contact you shortly regarding the next steps in the peer-review process.
        </p>
        <button onClick={() => window.location.href = "/"} className="btn btn-primary">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container section-padding max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Manuscript Submission</h1>
        <p className="text-slate-500">Official submission portal for PJPS academic researchers</p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 md:p-12 shadow-premium rounded-xl">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Manuscript Title</label>
              <input 
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="Full title of your research paper..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Abstract</label>
              <textarea 
                required value={abstract} onChange={(e) => setAbstract(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-60 text-base"
                placeholder="Brief summary of your research findings (max 400 words)..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Keywords</label>
              <input 
                type="text" required value={keywords} onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Separated by commas (e.g. Pharmacology, Clinical Trials, Drug Delivery)"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Author Information</label>
              <button type="button" onClick={addAuthor} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-bold">
                <PlusCircle size={16} /> Add Co-author
              </button>
            </div>
            {authors.map((author, idx) => (
              <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name (Author {idx + 1})</label>
                    <input 
                      type="text" required value={author.name} onChange={(e) => updateAuthor(idx, "name", e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                    <input 
                      type="email" required value={author.email} onChange={(e) => updateAuthor(idx, "email", e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Affiliation / Institution</label>
                    <input 
                      type="text" required value={author.affiliation} onChange={(e) => updateAuthor(idx, "affiliation", e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                {authors.length > 1 && (
                  <button 
                    type="button" onClick={() => removeAuthor(idx)} 
                    className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {file ? file.name : "Upload Full Manuscript"}
                </h3>
                <p className="text-sm text-slate-500">
                  Drag and drop your PDF or MS Word file here, or click to browse.
                </p>
                <p className="text-xs text-slate-400 mt-4 uppercase tracking-tighter">
                  Max file size: 10MB | Formats: PDF, DOCX
                </p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={24} />
              <div className="text-sm text-blue-800 leading-relaxed">
                <strong>Important Note:</strong> Please ensure that your manuscript is anonymized if the journal requires double-blind review. Remove author names or affiliations from the document file before uploading.
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-secondary">
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button 
              type="button" 
              onClick={() => {
                if (step === 1 && (!title || !abstract || !keywords)) return setError("Please fill in all metadata fields");
                if (step === 2 && authors.some(a => !a.name || !a.email || !a.affiliation)) return setError("Please complete all author details");
                setError(null);
                setStep(step + 1);
              }}
              className="btn btn-primary"
            >
              Continue to {step === 1 ? "Authors" : "Upload"}
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2">
              {loading ? "Processing..." : <><FileText size={18} /> Complete Submission</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
