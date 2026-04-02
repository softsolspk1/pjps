import styles from './contact.module.css';

export default function ContactPage() {
  return (
    <div className={`container section-padding ${styles.contact}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>Get in touch with the Pakistan Journal of Pharmaceutical Sciences (PJPS) editorial office.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.contactInfo}>
          <div className={styles.infoGroup}>
            <h2>Editorial Office</h2>
            <p>Faculty of Pharmacy and Pharmaceutical Sciences,<br />
            University of Karachi, Karachi-75270, Pakistan.</p>
          </div>

          <div className={styles.infoGroup}>
            <h2>Inquiries</h2>
            <p><strong>General:</strong> pjps@uok.edu.pk / pakjps@hotmail.com</p>
            <p><strong>Submissions:</strong> submissions@pjps.pk</p>
          </div>

          <div className={styles.infoGroup}>
            <h2>Office Hours</h2>
            <p>Monday - Friday: 09:00 AM - 05:00 PM<br />
            Saturday: 09:00 AM - 01:00 PM (Closed Sunday)</p>
          </div>
        </div>

        <div className={styles.contactForm}>
          <h2>Send a Message</h2>
          <form className={styles.formPlaceholder}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" placeholder="Your Name" disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input type="email" placeholder="Your Email" disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Message</label>
              <textarea placeholder="Your Message" rows={6} disabled></textarea>
            </div>
            <p className={styles.formNote}>Note: Contact form is under maintenance. Please use the email addresses provided instead.</p>
            <button className="btn btn-primary" type="button" disabled>Submit Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
