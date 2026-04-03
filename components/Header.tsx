'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContent}`}>
          <div className={styles.institutionalBranding}>
            <span>University of Karachi</span>
            <span className={styles.divider}>|</span>
            <span>Faculty of Pharmacy</span>
          </div>
          <div className={styles.topLinks}>
            <Link href="/login" className={styles.topLink}>Author Login</Link>
            <Link href="/board" className={styles.topLink}>Editorial Board</Link>
          </div>
        </div>
      </div>
      
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }}></div>
      
      <div className={`container ${styles.headerContent}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoBadge}>PJPS</div>
          <div className={styles.logoText}>
            <span className={styles.journalFull}>Pakistan Journal of <br/> Pharmaceutical Sciences</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink}>Home</Link></li>
            <li><Link href="/issues" className={styles.navLink}>Issues</Link></li>
            <li><Link href="/archive" className={styles.navLink}>Archive</Link></li>
            <li><Link href="/submission" className={styles.navLink}>Submission</Link></li>
            <li><Link href="/contact" className={styles.navLink}>Contact</Link></li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button className={styles.searchBtn} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </button>
          <Link href="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Login</Link>
          <Link href="/submission" className={`btn btn-primary ${styles.cta}`}>Online Submission Portal</Link>
        </div>
      </div>
    </header>
  );
}

