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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <label className={styles.label} style={{ marginBottom: 0 }}>Security Password</label>
              <Link href="/forgot-password" style={{ fontSize: '12px', fontWeight: 700, color: '#0061ff', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
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

        {/* Demo Credentials Table */}
        <div style={{ marginTop: '24px', backgroundColor: '#f4f2e6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #dcd8c9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#e3e1d1', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #dcd8c9' }}>
              <tr>
                <th style={{ padding: '8px 12px', borderRight: '1px solid #dcd8c9' }}>Institutional Identity</th>
                <th style={{ padding: '8px 12px', borderRight: '1px solid #dcd8c9' }}>Role Sovereignty</th>
                <th style={{ padding: '8px 12px' }}>Access Key</th>
              </tr>
            </thead>
            <tbody>
              {[
                { email: "eic@pjps.pk", role: "Editor-in-Chief" },
                { email: "finance@pjps.pk", role: "Finance Admin" },
                { email: "editor@pjps.pk", role: "Associate Editor" },
                { email: "reviewer@pjps.pk", role: "Peer Reviewer" },
                { email: "author@pjps.pk", role: "Scholarly Author" },
              ].map((demo, idx) => (
                <tr key={idx} style={{ borderBottom: idx === 4 ? 'z' : '1px solid #dcd8c9' }}>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #dcd8c9' }}>
                    <span style={{ padding: '2px 6px', backgroundColor: '#dcdad0', color: '#ba2a2a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
                      {demo.email}
                    </span>
                  </td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #dcd8c9', fontWeight: 700, color: '#475569' }}>
                    {demo.role}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <span style={{ padding: '2px 6px', backgroundColor: '#dcdad0', color: '#ba2a2a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
                      Softsols@123
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
