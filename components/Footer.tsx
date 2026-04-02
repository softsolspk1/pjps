import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerSection}>
          <div className={styles.footerLogo}>
            <span className={styles.logoAbbr}>PJPS</span>
            <span className={styles.logoFull}>Pakistan Journal of Pharmaceutical Sciences</span>
          </div>
          <p className={styles.footerDesc}>
            The Pakistan Journal of Pharmaceutical Sciences (PJPS) is a peer-reviewed monthly journal 
            dedicated to the advancement of pharmaceutical and biomedical sciences.
          </p>
          <div className={styles.accreditation}>
            <span>Indexed in Scopus, Web of Science, & PubMed</span>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Information</h4>
          <ul className={styles.linkList}>
            <li><Link href="/board">Editorial Board</Link></li>
            <li><Link href="/submission">Instructions for Authors</Link></li>
            <li><Link href="/archive">Journal Archive</Link></li>
            <li><Link href="/policy">Editorial Policies</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Editorial Office</h4>
          <ul className={styles.contactList}>
            <li>
              <strong>Address:</strong><br />
              Faculty of Pharmacy and Pharmaceutical Sciences, 
              University of Karachi, Karachi-75270, Pakistan.
            </li>
            <li>
              <strong>Queries:</strong><br />
              pjps@uok.edu.pk<br />
              pakjps@hotmail.com
            </li>
            <li>
              <strong>Submissions:</strong><br />
              submissions@pjps.pk
            </li>
          </ul>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomContent}`}>
          <p>© {currentYear} Pakistan Journal of Pharmaceutical Sciences. Published by the University of Karachi.</p>
          <div className={styles.bottomLinks}>
            <Link href="/terms">Terms</Link>
            <span className={styles.separator}>|</span>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
