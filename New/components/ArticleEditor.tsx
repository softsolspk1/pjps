"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

import styles from "./ArticleEditor.module.css";

export default function ArticleEditor() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [authors, setAuthors] = useState([{ name: "", address: "" }]);
  
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");

  const handleAuthorChange = (index: number, field: 'name'|'address', value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    if (authors.length < 8) {
      setAuthors([...authors, { name: "", address: "" }]);
    }
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const submitArticle = async () => {
    const payload = {
      title, status, authors, abstract, content, keywords
    };
    
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      window.location.href = "/admin/articles";
    } else {
      alert("Failed to submit article");
    }
  };

  return (
    <div className={styles.editorContainer}>
      
      {/* Settings Row */}
      <div className={styles.settingsRow}>
        <div className={styles.settingsHeader}>
          <h2 className={styles.sectionTitle}>Article Management CMS</h2>
          <p className="text-gray-500 text-sm">Drafting and publishing your research.</p>
        </div>
        <div className={styles.actions}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.statusSelect}>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button onClick={submitArticle} className="btn btn-primary">Save & Publish</button>
        </div>
      </div>

      <div className={styles.formSection}>
        <label className={styles.label}>Manuscript Title</label>
        <input 
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className={styles.titleInput}
          placeholder="Enter the title of the article..."
        />
      </div>

      <div className={styles.formSection}>
        <label className={styles.label}>Keywords</label>
        <input 
          type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
          className={styles.titleInput}
          style={{ fontSize: '1rem', padding: '0.5rem' }}
          placeholder="Enter keywords separated by commas..."
        />
      </div>

      <div className={styles.formSection}>
        <div className={styles.authorsContainer}>
          <div className={styles.authorsHeader}>
            <label className={styles.label}>Research Authors ({authors.length}/8)</label>
            {authors.length < 8 && (
              <button onClick={addAuthor} className="btn btn-outline" style={{ padding: '0.4rem 1.2rem', fontSize: '0.75rem' }}>+ Add Author</button>
            )}
          </div>
          
          <div className={styles.authorsGrid}>
            {authors.map((author, idx) => (
              <div key={idx} className={styles.authorCard}>
                {authors.length > 1 && (
                  <button onClick={() => removeAuthor(idx)} className={styles.removeAuthor}>&times;</button>
                )}
                <span className={styles.authorNum}>Author {idx + 1}</span>
                <input 
                  type="text" placeholder="Full Name (e.g. Dr. John Doe)" value={author.name} onChange={(e) => handleAuthorChange(idx, 'name', e.target.value)}
                  className={styles.authorInput}
                />
                <input 
                  type="text" placeholder="Institutional Affiliation / Address" value={author.address} onChange={(e) => handleAuthorChange(idx, 'address', e.target.value)}
                  className={styles.authorInput}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sectionsList}>
          <div className={styles.formSection}>
            <label className={styles.label}>Abstract (Full Width)</label>
            <div className={styles.quillWrapper}>
              {/* @ts-ignore */}
              <ReactQuill 
                theme="snow" 
                modules={modules}
                value={abstract} 
                onChange={setAbstract} 
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <label className={styles.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>Manuscript Body (2-Column Format when rendered)</span>
              <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: '#666'}}>Use headings, dividers, and images freely here.</span>
            </label>
            <div className={styles.quillWrapper}>
              {/* @ts-ignore */}
              <ReactQuill 
                theme="snow" 
                modules={modules}
                value={content} 
                onChange={setContent} 
                className="main-body-editor"
              />
            </div>
          </div>
      </div>

    </div>
  );
}
