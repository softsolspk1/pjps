"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Globe, DollarSign, Sparkles, Percent, Info, Clock, Zap, Gauge, ShieldCheck } from "lucide-react";
import styles from "./Pricing.module.css";

export default function PricingPage() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const origins = ["PAKISTANI", "INTERNATIONAL"];
  
  const tracks = [
    { key: "Regular", icon: <Clock size={14} />, color: "slate" },
    { key: "Fast", icon: <Zap size={14} />, color: "amber" },
    { key: "UltraFast", icon: <Gauge size={14} />, color: "indigo" }
  ];

  const additionalFees = [
    { key: "extraPageFee", label: "Extra/Colour Page", desc: "Per page surcharge" },
    { key: "extraCopyFee", label: "Additional Copy", desc: "Hard copy cost" },
    { key: "annualSubscriptionFee", label: "Annual Sub.", desc: "4 issues rate" }
  ];

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      setPricing(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (origin: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const existing = pricing.find(p => p.origin === origin) || { 
      origin,
      processingRegular: 0, processingFast: 0, processingUltraFast: 0,
      publicationRegular: 0, publicationFast: 0, publicationUltraFast: 0,
      extraPageFee: 0, extraCopyFee: 0, annualSubscriptionFee: 0
    };
    const updated = { ...existing, [field]: numValue };
    
    setPricing(prev => {
      const filtered = prev.filter(p => p.origin !== origin);
      return [...filtered, updated];
    });
  };

  const savePricing = async (origin: string) => {
    setSaving(true);
    setMessage("");
    try {
      const data = pricing.find(p => p.origin === origin);
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage(`Institutional rates for ${origin} updated successfully.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loader}><Clock className={styles.spinner} /> <p className={styles.emptyText}>Retrieving Fiscal Schema...</p></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>Fiscal Command Center</div>
        <h1 className={styles.title}>Global Pricing Matrix</h1>
        <p className={styles.subtitle}>Configure multi-track processing and publication fees for national and international contributors.</p>
      </header>

      {message && (
        <div className={styles.toast}>
          <Sparkles size={16} style={{ marginBottom: '-2px' }} /> {message}
        </div>
      )}

      <div className={styles.pricingGrid}>
        {origins.map((origin) => {
          const data = pricing.find(p => p.origin === origin) || { 
            processingRegular: 0, processingFast: 0, processingUltraFast: 0,
            publicationRegular: 0, publicationFast: 0, publicationUltraFast: 0,
            extraPageFee: 0, extraCopyFee: 0, annualSubscriptionFee: 0
          };
          return (
            <div key={origin} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.originGroup}>
                  <div className={styles.originIcon}>
                    {origin === "PAKISTANI" ? <span style={{ fontSize: '10px', fontWeight: 900 }}>PKR</span> : <Globe size={24} />}
                  </div>
                  <div>
                    <h2 className={styles.originTitle}>{origin} REGIME</h2>
                    <p className={styles.originCurrency}>{origin === "PAKISTANI" ? "Currency: Rupees (Rs.)" : "Currency: Dollars ($)"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => savePricing(origin)}
                  disabled={saving}
                  className={styles.saveBtn}
                >
                  {saving ? "Deploying..." : "Update Schema"}
                </button>
              </div>

              <div className={styles.cardBody}>
                {/* Processing Phase */}
                <div className={styles.sectionGroup}>
                   <div className={styles.sectionHeader}>
                      <span className={styles.sectionLabel}>Phase I: Submission Processing</span>
                      <div className={styles.sectionLine}></div>
                   </div>
                   <div className={styles.inputGrid}>
                     {tracks.map((track) => (
                       <div key={track.key} className={styles.inputWrapper}>
                         <div className={styles.inputLabel}>
                           {track.icon} {track.key} Track
                         </div>
                         <div className={styles.inputField}>
                            <span className={styles.currency}>{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[`processing${track.key}`]}
                              onChange={(e) => handleUpdate(origin, `processing${track.key}`, e.target.value)}
                              className={styles.input}
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Publication Phase */}
                <div className={styles.sectionGroup}>
                   <div className={styles.sectionHeader}>
                      <span className={styles.sectionLabel}>Phase II: Final Publication</span>
                      <div className={styles.sectionLine}></div>
                   </div>
                   <div className={styles.inputGrid}>
                     {tracks.map((track) => (
                       <div key={track.key} className={styles.inputWrapper}>
                         <div className={styles.inputLabel}>
                           {track.icon} {track.key} Track
                         </div>
                         <div className={styles.inputField}>
                            <span className={styles.currency}>{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[`publication${track.key}`]}
                              onChange={(e) => handleUpdate(origin, `publication${track.key}`, e.target.value)}
                              className={styles.input}
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Auxiliary Support */}
                <div className={styles.sectionGroup} style={{ marginBottom: 0 }}>
                   <div className={styles.sectionHeader}>
                      <span className={styles.sectionLabel}>Scholarly Surcharges</span>
                      <div className={styles.sectionLine}></div>
                   </div>
                   <div className={styles.inputGrid}>
                     {additionalFees.map((fee) => (
                       <div key={fee.key} className={styles.inputWrapper}>
                         <label className={styles.inputLabel}>{fee.label}</label>
                         <div className={styles.inputField}>
                            <span className={styles.currency}>{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[fee.key]}
                              onChange={(e) => handleUpdate(origin, fee.key, e.target.value)}
                              className={styles.input}
                            />
                         </div>
                         <p className={styles.inputDesc}>{fee.desc}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerInfo}>
         <div className={styles.infoIcon}>
           <Percent size={32} />
         </div>
         <div>
            <h3 className={styles.infoTitle}>Track-Based Financial Logic</h3>
            <p className={styles.infoText}>
              The **Processing Fee** is charged immediately upon manuscript submission. The **Publication Fee** and **Auxiliary Surcharges** (extra pages/copies) are triggered only upon official editorial acceptance. 
              Changes to this matrix will reflect in all new submissions from the baseline registry date.
            </p>
         </div>
      </div>
    </div>
  );
}
