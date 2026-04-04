"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Globe, DollarSign, Sparkles, Percent, Info, Clock, Zap, Gauge } from "lucide-react";

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

  if (loading) return <div className="p-10 text-center font-serif italic text-slate-500">Retrieving Track-Specific Pricing...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <div className="flex items-center gap-2 text-blue-600 mb-2 justify-center md:justify-start">
           <CreditCard size={18} />
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scholarly Fiscal Command</span>
        </div>
        <h1 className="text-5xl font-serif font-black text-slate-900 mb-3 tracking-tight italic">Scholarly Pricing Matrix</h1>
        <p className="text-slate-500 font-medium text-lg">Manage multi-track processing and publication fees for domestic and international contributors.</p>
      </header>

      {message && (
        <div className="mb-10 p-6 bg-slate-900 text-white rounded-[24px] shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 border-l-[12px] border-blue-500">
          <Sparkles className="text-blue-400" size={28} /> 
          <span className="font-bold tracking-tight">{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {origins.map((origin) => {
          const data = pricing.find(p => p.origin === origin) || { 
            processingRegular: 0, processingFast: 0, processingUltraFast: 0,
            publicationRegular: 0, publicationFast: 0, publicationUltraFast: 0,
            extraPageFee: 0, extraCopyFee: 0, annualSubscriptionFee: 0
          };
          return (
            <div key={origin} className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-10 py-8 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-5">
                  {origin === "PAKISTANI" ? (
                    <div className="w-12 h-8 bg-emerald-600 rounded-lg shadow-md border border-emerald-500 flex items-center justify-center font-black text-white text-[12px]">PK</div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-lg border border-blue-500 flex items-center justify-center text-white"><Globe size={24} /></div>
                  )}
                  <div>
                    <h2 className="font-serif font-black text-slate-900 text-2xl italic tracking-tight">{origin} REGIME</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{origin === "PAKISTANI" ? "Currency: PKR (Rs.)" : "Currency: USD ($)"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => savePricing(origin)}
                  disabled={saving}
                  className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-300 disabled:opacity-50 active:scale-95"
                >
                  {saving ? "Deploying..." : "Update Schema"}
                </button>
              </div>

              <div className="p-10 space-y-12">
                {/* Processing Phase */}
                <div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                     <span className="w-8 h-[2px] bg-slate-200"></span>
                     Phase I: Submission Processing
                   </h3>
                   <div className="grid grid-cols-3 gap-6">
                     {tracks.map((track) => (
                       <div key={track.key} className="space-y-3">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                           {track.icon} {track.key}
                         </div>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[`processing${track.key}`]}
                              onChange={(e) => handleUpdate(origin, `processing${track.key}`, e.target.value)}
                              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-200 focus:bg-white outline-none transition-all font-bold text-slate-800 text-sm"
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Publication Phase */}
                <div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                     <span className="w-8 h-[2px] bg-slate-200"></span>
                     Phase II: Peer-Review Publication
                   </h3>
                   <div className="grid grid-cols-3 gap-6">
                     {tracks.map((track) => (
                       <div key={track.key} className="space-y-3">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                           {track.icon} {track.key}
                         </div>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[`publication${track.key}`]}
                              onChange={(e) => handleUpdate(origin, `publication${track.key}`, e.target.value)}
                              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-200 focus:bg-white outline-none transition-all font-bold text-slate-800 text-sm"
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Auxiliary Support */}
                <div className="pt-8 border-t border-slate-50">
                   <div className="grid grid-cols-3 gap-6">
                     {additionalFees.map((fee) => (
                       <div key={fee.key} className="space-y-3">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block">{fee.label}</label>
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">{origin === "PAKISTANI" ? "Rs." : "$"}</span>
                            <input 
                              type="number" 
                              value={data[fee.key]}
                              onChange={(e) => handleUpdate(origin, fee.key, e.target.value)}
                              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-200 focus:bg-white outline-none transition-all font-bold text-slate-800 text-sm"
                            />
                         </div>
                         <p className="text-[9px] text-slate-400 italic">{fee.desc}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-10 bg-blue-600 rounded-[48px] text-white shadow-3xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center border border-white/30 flex-shrink-0">
             <Percent size={40} />
           </div>
           <div>
              <h3 className="font-serif font-black text-3xl tracking-tight italic mb-3">Track Logic & Automated Invoicing</h3>
              <p className="text-white/80 text-lg leading-relaxed max-w-4xl font-medium">
                Authors are charged the <strong>Processing Fee</strong> immediately upon submission based on their chosen track. 
                The <strong>Publication Fee</strong> and <strong>Extra Page Surcharges</strong> are triggered only upon official acceptance. 
                Multi-year institutional subscriptions remain locked at the initial acquisition rate as per the 3-year PJP protocol.
              </p>
           </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
      </div>
    </div>
  );
}
