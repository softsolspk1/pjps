'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // SCROLL DEPTH MONITORING
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      
      // HEADER STICKY GLASS STATE
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isMenuOpen ? styles.menuActive : ''}`}>
      <div className={styles.topBar}>
        <div className={`container-full ${styles.topBarContent}`}>
          <div className={styles.institutionalBranding}>
            <span>University of Karachi</span>
            <span className={styles.divider}>|</span>
            <span>Faculty of Pharmacy</span>
          </div>
          <div className={styles.journalBrandingTop}>
            Pakistan Journal of Pharmaceutical Sciences
          </div>
        </div>
      </div>
      
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }}></div>
      
      <div className={`container-full ${styles.headerContent}`}>
        <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.logoBadge}>PJPS</div>
          <div className={styles.logoText}>
            <span className={styles.journalFull}>Pakistan Journal of <br/> Pharmaceutical Sciences</span>
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.menuToggle} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link href="/issues" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Issues</Link></li>
            <li><Link href="/archive" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Archive</Link></li>
            <li><Link href="/submission" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Submission</Link></li>
            <li><Link href="/contact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            {/* Mobile-only links */}
            <li className={styles.mobileOnly}><Link href="/admin/login" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Author Login</Link></li>
          </ul>
          
          <div className={styles.mobileActions}>
             <Link href="/admin/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>Login</Link>
             <Link href="/submission" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Online Submission Portal</Link>
          </div>
        </nav>

        <div className={styles.actions}>
          <button className={styles.searchBtn} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </button>
          <Link href="/admin/login" className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Login</Link>
          <Link href="/submission" className={`btn btn-primary ${styles.cta}`}>Online Submission Portal</Link>
        </div>
      </div>
    </header>
  );
}

