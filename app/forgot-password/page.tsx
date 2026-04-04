"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./ForgotPassword.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("A password recovery link has been dispatched to your scholarly email.");
      } else {
        setError(data.error || "Failed to initiate recovery.");
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <ShieldCheck size={28} />
          </div>
          <h2 className={styles.title}>Account Recovery</h2>
          <p className={styles.subtitle}>Enter your institutional email to verify your scholarly identity.</p>
        </div>

        {message ? (
          <div className={styles.successBox}>
            <Sparkles size={20} className={styles.sparkle} />
            <p>{message}</p>
            <Link href="/admin/login" className={styles.backLink}>
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Journal Registered Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input 
                  type="email" 
                  required 
                  className={styles.input}
                  placeholder="scholar@example.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Verifying..." : "Dispatch Recovery Email"}
            </button>

            <Link href="/admin/login" className={styles.cancelLink}>
              Cancel and Return
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
