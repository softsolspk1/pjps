"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Filter, User, Book, Calendar, Hash, FileText } from "lucide-react";
import styles from "./SearchPage.module.css";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [doi, setDoi] = useState(searchParams.get("doi") || "");

  const performSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    const res = await fetch(`/api/public/v1/search?${params.toString()}`);
    const data = await res.json();
    setResults(data.data || []);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (author) params.set("author", author);
    if (year) params.set("year", year);
    if (doi) params.set("doi", doi);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <p className={styles.preTitle}>Scholarly Discovery Service</p>
          <h1 className={styles.title}>Advanced Search Registry</h1>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Advanced Filters Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>
              <Filter size={18} /> Search Parameters
            </div>
            
            <form onSubmit={handleSearch} className={styles.form}>
              <div className={styles.inputGroup}>
                <label><Search size={14} /> Full-text Query</label>
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Title, Abstract, Keywords..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label><User size={14} /> Author Identity</label>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  placeholder="Search by contributor name..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label><Calendar size={14} /> Publication Year</label>
                <input 
                  type="number" 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  placeholder="e.g. 2024"
                />
              </div>

              <div className={styles.inputGroup}>
                <label><Hash size={14} /> DOI Locator</label>
                <input 
                  type="text" 
                  value={doi} 
                  onChange={(e) => setDoi(e.target.value)} 
                  placeholder="Digital Object Identifier..."
                />
              </div>

              <button type="submit" className={styles.searchBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Query Registry"}
              </button>
              
              <button 
                type="button" 
                className={styles.resetBtn}
                onClick={() => {
                  setQuery(""); setAuthor(""); setYear(""); setDoi("");
                  router.push("/search");
                }}
              >
                Clear Parameters
              </button>
            </form>
          </div>
        </aside>

        {/* Search Results Area */}
        <main className={styles.resultsArea}>
          <div className={styles.resultsHeader}>
             <p className={styles.resultsCount}>
                <strong>{total}</strong> Scholarly Entries Cataloged
             </p>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <Loader2 className="animate-spin" size={48} color="#0061ff" />
              <p>Aggregating repository data...</p>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {results.map((article: any) => (
                <div key={article.id} className={styles.articleCard}>
                   <div className={styles.articleMeta}>
                      <span className={styles.articleType}>Review Article</span>
                      <span className={styles.articleDate}>{new Date(article.createdAt).toLocaleDateString()}</span>
                   </div>
                   <Link href={`/articles/${article.id}`} className={styles.articleTitle}>
                      {article.title}
                   </Link>
                   <p className={styles.articleAuthors}>
                      {article.authors.map((a: any) => a.name).join(", ")}
                   </p>
                   {article.issue && (
                     <div className={styles.articleJournal}>
                        <Book size={14} /> 
                        Volume {article.issue.volume.number}, Issue {article.issue.number} ({article.issue.month} {article.issue.volume.year})
                     </div>
                   )}
                   <div className={styles.articleFooter}>
                      <span className={styles.articleDoi}>DOI: {article.doi || "Pending Assignment"}</span>
                      <Link href={`/articles/${article.id}`} className={styles.readBtn}>
                        Read Entry <FileText size={14} />
                      </Link>
                   </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className={styles.emptyState}>
                   <Search size={48} color="#e2e8f0" />
                   <h3>No Registry Entries Match Your Parameters</h3>
                   <p>Adjust your filters or try a zero-query broad search.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading Search System...</div>}>
      <SearchResults />
    </Suspense>
  );
}
