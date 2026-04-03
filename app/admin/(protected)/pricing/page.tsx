"use client";

import { useState, useEffect } from "react";
import { Save, DollarSign, Globe, Percent, Sparkles } from "lucide-react";

export default function PricingPage() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const origins = ["PAKISTANI", "INTERNATIONAL"];

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
    const existing = pricing.find(p => p.origin === origin) || { origin, regular: 0, fast: 0, ultraFast: 0 };
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
        setMessage(`Pricing for ${origin} updated successfully!`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading pricing configurations...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-serif font-black text-slate-900 mb-2">Fee Management</h1>
        <p className="text-slate-500">Configure submission and processing fees for domestic and international scholars.</p>
      </header>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles size={18} /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {origins.map((origin) => {
          const data = pricing.find(p => p.origin === origin) || { regular: 0, fast: 0, ultraFast: 0 };
          return (
            <div key={origin} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {origin === "PAKISTANI" ? <div className="w-8 h-5 bg-emerald-600 rounded-sm"></div> : <Globe size={20} className="text-blue-600" />}
                  <h2 className="font-bold text-slate-800 tracking-tight">{origin}</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Tier</span>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Regular Track (10-12 Weeks)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                    <input 
                      type="number" 
                      value={data.regular}
                      onChange={(e) => handleUpdate(origin, "regular", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fast Track (4-6 Weeks)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                    <input 
                      type="number" 
                      value={data.fast}
                      onChange={(e) => handleUpdate(origin, "fast", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ultra Fast Track (2-3 Weeks)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                    <input 
                      type="number" 
                      value={data.ultraFast}
                      onChange={(e) => handleUpdate(origin, "ultraFast", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => savePricing(origin)}
                  disabled={saving}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? "Saving..." : `Update ${origin} Fees`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 p-6 rounded-xl">
        <h3 className="flex items-center gap-2 font-black text-blue-900 uppercase text-xs tracking-widest mb-4">
          <Percent size={14} /> Currency & Logic Notes
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 opacity-80">
          <li>• <strong>Pakistani Articles:</strong> Fees should be entered in PKR (Pakistani Rupees).</li>
          <li>• <strong>International Articles:</strong> Fees should be entered in USD (US Dollars).</li>
          <li>• <strong>User Matching:</strong> The portal automatically detects user origin based on their registration "Country".</li>
          <li>• <strong>Updates:</strong> Price changes take effect immediately for all new submissions.</li>
        </ul>
      </div>
    </div>
  );
}
