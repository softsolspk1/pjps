'use client';

import { useState } from 'react';
import { 
  Search, FileText, Clock, CheckCircle, 
  AlertCircle, BookOpen, ChevronRight, Loader2,
  Calendar, Globe, Bookmark
} from 'lucide-react';
import styles from './tracking.module.css';

const STEPS = [
  { id: 'SUBMITTED', label: 'Submission Received', desc: 'Manuscript has been successfully cataloged.' },
  { id: 'IN_REVIEW', label: 'Peer Review', desc: 'Expert evaluations are currently in progress.' },
  { id: 'ACCEPTED', label: 'Accepted', desc: 'Manuscript approved for scholarly publication.' },
  { id: 'PUBLISHED', label: 'Published', desc: 'Final version is available in the journal archive.' }
];

export default function TrackingPage() {
  const [refId, setRefId] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;

    setLoading(true);
    setError('');
    setArticle(null);

    try {
      const res = await fetch(`/api/tracking?id=${refId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Manuscript not found in registry');
      }

      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    return STEPS.findIndex(s => s.id === status);
  };

  return (
    <div className="container section-padding max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Manuscript Tracking</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Verify the real-time status and editorial progress of your scholarly contribution.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-premium overflow-hidden">
        <div className="p-10 bg-slate-50/50 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                placeholder="Enter Reference ID (e.g., cm0...)"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary px-10 rounded-2xl flex items-center gap-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Track Progress'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="font-bold text-sm tracking-wide">{error}</span>
            </div>
          )}
        </div>

        <div className="p-10">
          {!article && !loading && !error && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Bookmark size={32} />
              </div>
              <p className="text-slate-400 font-serif italic text-lg">Enter your manuscript reference ID above to begin.</p>
            </div>
          )}

          {article && (
            <div className="space-y-12 animate-in fade-in duration-700">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Scientific Manuscript</span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4">{article.title}</h2>
                  <div className="flex flex-wrap gap-4">
                     <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                       <Clock size={14} /> Submitted {new Date(article.createdAt).toLocaleDateString()}
                     </span>
                     {article.status === 'REJECTED' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          <AlertCircle size={14} /> Decision: Rejected
                        </span>
                     )}
                  </div>
                </div>
                
                {/* Publication Details */}
                {(article.status === 'ACCEPTED' || article.status === 'PUBLISHED') && article.issue && (
                   <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl min-w-[240px]">
                      <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BookOpen size={14} /> Publication Data
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm font-serif">
                          <span className="font-bold">Vol. {article.issue.volume.number}</span>, 
                          Issue {article.issue.number}
                        </p>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">
                          {article.issue.month} {article.issue.volume.year}
                        </p>
                      </div>
                   </div>
                )}
              </div>

              {/* Status Timeline */}
              {article.status !== 'REJECTED' && (
                <div className="relative">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-10">Manuscript Timeline</h3>
                  <div className="space-y-8">
                    {STEPS.map((step, idx) => {
                      const currentIdx = getCurrentStepIndex(article.status);
                      const isCompleted = idx <= currentIdx;
                      const isActive = idx === currentIdx;

                      return (
                        <div key={step.id} className="relative flex gap-6 group">
                          {/* Line */}
                          {idx !== STEPS.length - 1 && (
                            <div className={`absolute left-[15px] top-[40px] w-0.5 h-[calc(100%-8px)] transition-colors duration-1000 ${
                              idx < currentIdx ? 'bg-blue-600' : 'bg-slate-100'
                            }`} />
                          )}
                          
                          {/* Marker */}
                          <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 scale-100 ${
                            isCompleted 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'bg-white border-slate-100'
                          }`}>
                            {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 bg-slate-100 rounded-full" />}
                          </div>
                          
                          {/* Content */}
                          <div className={`pb-4 transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                            <h4 className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${
                              isActive ? 'text-blue-600' : 'text-slate-800'
                            }`}>
                              {step.label}
                              {isActive && <span className="ml-2 lowercase font-medium italic">(current)</span>}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
