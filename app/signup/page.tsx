"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./SignupPage.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    affiliation: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          affiliation: formData.affiliation,
          role: "AUTHOR" // Default role for new signups
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Scholarly registration failed.");
      }

      // Automatically redirect to login on success
      router.push("/admin/login?index=signup_success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signupCard}>
        <div className={styles.headerArea}>
           <h2 className={styles.title}>Author Registry</h2>
           <span className={styles.subtitle}>Institutional Contributor Enrollment</span>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Author Full Name</label>
            <input
              type="text"
              name="name"
              required
              className={styles.input}
              placeholder="e.g. Dr. Scholarly Researcher"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Institutional Affiliation</label>
            <input
              type="text"
              name="affiliation"
              required
              className={styles.input}
              placeholder="e.g. University of Karachi"
              value={formData.affiliation}
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Corporate / Academic Email</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              placeholder="author@institution.edu.pk"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Security Password</label>
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Verify Security Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? "Registering Account..." : "Confirm Enrollment"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.loginPrompt}>Already have a registry entry? <Link href="/admin/login" className={styles.loginLink}>Scholarly Login</Link></p>
        </div>
      </div>
    </div>
  );
}
