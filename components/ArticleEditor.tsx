"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import Quill to avoid SSR issues
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

export default function ArticleEditor() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [authors, setAuthors] = useState([{ name: "", address: "" }]);
  
  const [sections, setSections] = useState({
    abstract: "",
    introduction: "",
    materialsMethods: "",
    results: "",
    discussion: "",
    conclusion: "",
    references: "",
  });

  const handleSectionChange = (field: keyof typeof sections, value: string) => {
    setSections(prev => ({ ...prev, [field]: value }));
  };

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
    // Basic API integration - we'll implement this route next
    const payload = {
      title, status, authors, ...sections
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
    <div className="max-w-5xl mx-auto space-y-8 bg-white p-6 shadow border rounded">
      
      {/* Settings Row */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded border">
        <h2 className="text-xl font-bold font-serif text-slate-800">Article Details</h2>
        <div className="flex gap-4">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-3 py-1 rounded outline-none border-gray-300">
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button onClick={submitArticle} className="bg-green-600 text-white px-4 py-2 font-bold rounded hover:bg-green-700 transition">Save Article</button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Article Title</label>
        <input 
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 text-lg font-serif outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Enter the title of the article..."
        />
      </div>

      <div className="bg-blue-50 p-4 rounded border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">Authors ({authors.length}/8)</label>
          {authors.length < 8 && (
            <button onClick={addAuthor} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ Add Author</button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map((author, idx) => (
            <div key={idx} className="bg-white p-3 rounded border border-gray-200 relative">
              {authors.length > 1 && (
                <button onClick={() => removeAuthor(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
              )}
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">Author {idx + 1}</h4>
              <input 
                type="text" placeholder="Full Name" value={author.name} onChange={(e) => handleAuthorChange(idx, 'name', e.target.value)}
                className="w-full border rounded p-1 mb-2 text-sm outline-none focus:border-blue-400"
              />
              <input 
                type="text" placeholder="Affiliation / Address" value={author.address} onChange={(e) => handleAuthorChange(idx, 'address', e.target.value)}
                className="w-full border rounded p-1 text-sm outline-none focus:border-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      {[{key: 'abstract', label: 'Abstract (Single Column)'}, {key: 'introduction', label: 'Introduction'}, {key: 'materialsMethods', label: 'Materials and Methods'}, {key: 'results', label: 'Results'}, {key: 'discussion', label: 'Discussion'}, {key: 'conclusion', label: 'Conclusion'}, {key: 'references', label: 'References'}].map((sec) => (
        <div key={sec.key}>
          <label className="block text-sm font-bold text-gray-700 mb-1">{sec.label}</label>
          <div className="bg-white">
            {/* @ts-ignore */}
            <ReactQuill 
              theme="snow" 
              modules={modules}
              value={sections[sec.key as keyof typeof sections]} 
              onChange={(v: string) => handleSectionChange(sec.key as keyof typeof sections, v)} 
              className="h-64 mb-12"
            />
          </div>
        </div>
      ))}

    </div>
  );
}
