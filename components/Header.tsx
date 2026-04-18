'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User as UserIcon, LogOut, LayoutDashboard, UserCircle, Search, Menu, X, ChevronDown, Globe } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();
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
            <Globe size={12} />
            <span>Faculty of Pharmacy and Pharmaceutical Sciences</span>
            <span className={styles.divider}>|</span>
            <span>University of Karachi</span>
          </div>
          <div className={styles.topLinks}>
             <Link href="/contact">Support</Link>
             <Link href="/about">About OJS</Link>
             <Link href="/admin/login">Journal Login</Link>
          </div>
        </div>
      </div>
      
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }}></div>
      
      <div className={`container-full ${styles.headerMain}`}>
        <div className={styles.logoAndSearch}>
          <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
            <div className={styles.logoBadge}>PJPS</div>
            <div className={styles.logoText}>
              <span className={styles.journalFull}>Pakistan Journal of <br/> Pharmaceutical Sciences</span>
            </div>
          </Link>

          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search articles, authors, or keywords..." className={styles.searchInput} />
            <button className={styles.searchSubmit} aria-label="Submit Search">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className={styles.headerActions}>
           {session ? (
             <div className="flex items-center gap-4">
               <Link href="/submission" className="btn btn-primary btn-sm">Submit Article</Link>
               <Link href="/profile" className={styles.profileLink}><UserCircle size={24} /></Link>
             </div>
           ) : (
             <div className="flex items-center gap-4">
               <Link href="/admin/login" className={styles.loginLink}>Sign In</Link>
               <Link href="/submission" className="btn btn-primary btn-sm">Submit</Link>
             </div>
           )}
           <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
             {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      <nav className={`${styles.navStrip} ${isMenuOpen ? styles.navOpen : ''}`}>
        <div className="container-full">
          <ul className={styles.navList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About PJPS</Link></li>
            <li className={styles.hasDropdown}>
              <span>SUBMISSION <ChevronDown size={14} /></span>
              <ul className={styles.dropdown}>
                <li><Link href="/formatting">Article Formating Tool</Link></li>
                <li><Link href="/submission/checklist">Submission Checklist and Fees</Link></li>
                <li><Link href="/submission/instructions">Instructions for Authors</Link></li>
                <li><Link href="/submission/peer-review">Peer Review Guidelines</Link></li>
                <li><Link href="/submission/conflict-of-interest">Conflict of Interest</Link></li>
                <li><Link href="/tracking">Track Manuscript</Link></li>
              </ul>
            </li>
            <li className={styles.hasDropdown}>
              <span>ARTICLES <ChevronDown size={14} /></span>
              <ul className={styles.dropdown}>
                <li><Link href="/publication/current">Current Issue</Link></li>
                <li><Link href="/archive">Past Issues</Link></li>
                <li><Link href="/publication/special">Special Issues</Link></li>
              </ul>
            </li>
            <li><Link href="/archive">ARCHIVE</Link></li>
            <li><Link href="/contact">CONTACT</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

