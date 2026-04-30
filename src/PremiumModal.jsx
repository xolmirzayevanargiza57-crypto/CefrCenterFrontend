import React, { useState } from "react";
import { Check, Crown, CreditCard, Image as ImageIcon, X, Send, ShieldCheck, Zap } from "lucide-react";
import BACKEND_URL from "./config/api";

export default function PremiumModal({ user, onClose, isPremium, premiumExpire }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(49000);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const PLANS = [
    { id: 1, name: "Starter", price: 49000, desc: "30 Days Access", icon: Zap, color: "#10b981" },
    { id: 2, name: "Scholar", price: 99000, desc: "90 Days Access", icon: Crown, color: "#4a9eff" },
    { id: 3, name: "Infinite", price: 149000, desc: "Unlimited Mastery", icon: ShieldCheck, color: "#fbbf24" }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
      return;
    }
    setReceipt(file);
    setError("");
  };

  const handleSubmit = async () => {
    if (!receipt) {
      setError("Please upload your payment receipt");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("amount", amount);
    formData.append("receipt", receipt);

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/submit`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Execution failed. Please contact admin.");
      }
    } catch (err) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#131d2e", borderRadius: 32, padding: 40, textAlign: "center", border: "1px solid rgba(251,191,36,0.3)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
           <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Crown size={40} color="#fbbf24" fill="#fbbf24" />
           </div>
           <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 16 }}>Premium Student</h2>
           <p style={{ color: "#8b9bbf", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
             You have full access to all features until <span style={{ color: "#fbbf24", fontWeight: 800 }}>{new Date(premiumExpire).toLocaleDateString()}</span>. Continue your mastery!
           </p>
           <button onClick={onClose} style={{ width: "100%", padding: 16, borderRadius: 16, background: "#fbbf24", border: "none", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(25px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      
      <div style={{ width: "100%", maxWidth: 480, background: "#0b1120", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 32, overflow: "hidden", position: "relative", boxShadow: "0 30px 100px rgba(0,0,0,0.6)" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)", padding: "32px 32px 24px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={20} />
          </button>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Upgrade to Premium</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>Unleash the full potential of CEFR Center</p>
        </div>

        <div style={{ padding: 32 }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0", animation: "fUp .5s ease" }}>
               <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Send size={28} color="#10b981" />
               </div>
               <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 12 }}>Receipt Submitted!</h3>
               <p style={{ color: "#8b9bbf", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>We've received your receipt. Our admins will verify your payment within 1-2 hours. Enjoy your learning!</p>
               <button onClick={onClose} style={{ width: "100%", padding: 16, borderRadius: 16, background: "#10b981", border: "none", color: "#fff", fontWeight: 900, cursor: "pointer" }}>Back to Dashboard</button>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PLANS.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setAmount(p.price); setStep(2); }} 
                      style={{ padding: 24, borderRadius: 20, background: amount === p.price ? "rgba(74,158,255,0.05)" : "rgba(255,255,255,0.02)", border: amount === p.price ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 20 }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p.icon size={24} color={p.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "#fff" }}>{p.name} Plan</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{p.desc}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontSize: 15, color: p.color }}>{p.price.toLocaleString()}</div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.1)" }}>UZS</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 24, padding: 16, background: "rgba(16,185,129,0.05)", borderRadius: 16, border: "1px dashed rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: 12 }}>
                     <ShieldCheck size={18} color="#10b981" />
                     <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>Money back guarantee within 48 hours</span>
                  </div>
                </div>
              ) : (
                <div style={{ animation: "fUp .3s ease" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 12, textTransform: "uppercase" }}>Payment Instructions</div>
                     <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                           <CreditCard size={20} color="#000" />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 1.5 }}>8600 0000 0000 0000</div>
                           <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>CEFR ADMIN: Nargiza Xolmirzayeva</div>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText("8600000000000000"); alert("Copied!"); }} style={{ background: "none", border: "none", color: "#4a9eff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>COPY</button>
                     </div>
                     <div style={{ fontSize: 11, color: "#8b9bbf", lineHeight: 1.5 }}>Please transfer <strong style={{ color: "#fbbf24" }}>{amount.toLocaleString()} UZS</strong>. After payment, upload a clear screenshot of your receipt.</div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", marginBottom: 12 }}>
                      <div style={{ width: "100%", height: 120, borderRadius: 20, border: "2px dashed rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", background: receipt ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)" }}>
                         <ImageIcon size={32} color={receipt ? "#10b981" : "#64748b"} />
                         <span style={{ fontSize: 12, fontWeight: 700, color: receipt ? "#10b981" : "#8b9bbf", marginTop: 10 }}>{receipt ? receipt.name : "Attach Payment Receipt"}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  </div>

                  {error && <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{error}</div>}

                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Back</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 16, borderRadius: 16, background: "#4a9eff", border: "none", color: "#fff", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      {loading ? <RefreshCw className="spin" size={18} /> : <Check size={18} />} {loading ? "Verifying..." : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
