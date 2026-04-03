"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid admin credentials");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.headerArea}>
          <h2 className={styles.title}>PJPS Admin</h2>
          <span className={styles.subtitle}>Journal Management Portal</span>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Identifier / Username</label>
            <input
              type="text"
              required
              className={styles.input}
              placeholder="e.g. administrator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Security Password</label>
            <input
              type="password"
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            {loading ? "Verifying Credentials..." : "Authenticate"}
          </button>
        </form>

        <div className={styles.signupPrompt}>
          <p>New scholarly contributor? <Link href="/signup" className={styles.signupLink}>Create an Author Account</Link></p>
        </div>

        <div className={styles.footer}>
          <p>For technical assistance, please contact the <br/> <span className={styles.footerLink}>Editorial IT Support Team</span></p>
        </div>
      </div>
    </div>
  );
}
