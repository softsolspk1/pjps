import styles from './JournalMetrics.module.css';
import { BarChart3, Award, Hash, BookOpen } from 'lucide-react';

export default function JournalMetrics() {
  const metrics = [
    {
      label: "JCR Impact Factor",
      value: "0.6",
      icon: <BarChart3 size={24} className={styles.icon} />,
      year: "2024"
    },
    {
      label: "CiteScore (Q3)",
      value: "1.4",
      icon: <Award size={24} className={styles.icon} />,
      year: "Scopus"
    },
    {
      label: "ISSN (Print)",
      value: "1011-601X",
      icon: <Hash size={24} className={styles.icon} />,
      year: "Registered"
    },
    {
      label: "Total Publications",
      value: "5,893+",
      icon: <BookOpen size={24} className={styles.icon} />,
      year: "Since 1988"
    }
  ];

  return (
    <div className={styles.metricsWrapper}>
      <div className="container-full">
        <div className={styles.metricsGrid}>
          {metrics.map((item, idx) => (
            <div key={idx} className={styles.metricCard}>
              <div className={styles.iconWrapper}>
                {item.icon}
              </div>
              <div className={styles.content}>
                <div className={styles.value}>{item.value}</div>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.meta}>{item.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
