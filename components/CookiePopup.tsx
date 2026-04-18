'use client';

import { useState, useEffect } from 'react';
import styles from './CookiePopup.module.css';

export default function CookiePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pjps-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pjps-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('pjps-cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.content}>
          <h4 className={styles.title}>Cookie Consent</h4>
          <p className={styles.text}>
            We use cookies to improve your experience on the Pakistan Journal of Pharmaceutical Sciences portal. By continuing to browse, you agree to our use of cookies and our <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={handleDecline} className={styles.btnSecondary}>
            Decline
          </button>
          <button onClick={handleAccept} className={styles.btnPrimary}>
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
