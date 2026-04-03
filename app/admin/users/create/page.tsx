"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Shield, UserCheck, AlertCircle } from "lucide-react";

export default function CreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("REVIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      router.push("/admin/users");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-serif font-bold text-slate-800 mb-2">Create New User</h2>
        <p className="text-slate-500 font-medium">Add a new administrator, editor, or reviewer to the journal registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-10 shadow-premium">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-widest">Full Name</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium"
              placeholder="Full name of the user..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium"
              placeholder="Official email address..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-widest">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium"
              placeholder="Strong password..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Account Role</label>
            <div className="grid grid-cols-3 gap-4">
              {["ADMIN", "REVIEWER", "EDITOR"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                    role === r ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {r === "ADMIN" ? <Shield size={20} /> : r === "REVIEWER" ? <UserCheck size={20} /> : <UserPlus size={20} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-4 border border-slate-200 rounded-xl text-slate-600 font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? "Creating..." : "Confirm & Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
