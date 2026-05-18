import React, { useState } from "react";
import { Check, Crown, CreditCard, Image as ImageIcon, X, Send, Shield, Zap, RefreshCw, Star, Info } from "lucide-react";
import BACKEND_URL from "./config/api";

export default function PremiumModal({ user, onClose, isPremium, premiumExpire }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(30000);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [payName, setPayName] = useState("");
  const [payPhone, setPayPhone] = useState("");

  const PLANS = [
    { id: 1, name: "Starter", price: 30000, desc: "30 Days Access", icon: Zap, color: "#10b981", days: 30 },
    { id: 2, name: "Scholar", price: 75000, desc: "90 Days + AI Tutor", icon: Crown, color: "#4a9eff", days: 90 },
    { id: 3, name: "Ultimate", price: 199000, desc: "365 Days Mastery", icon: Shield, color: "#fbbf24", days: 365 }
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
      setError("Please attach a screenshot of your payment receipt.");
      return;
    }
    if (!payName || !payPhone) {
      setError("Please provide your name and phone for verification.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("amount", amount);
    formData.append("receipt", receipt);
    formData.append("username", payName);
    formData.append("phone", payPhone);
    
    const selectedPlan = PLANS.find(p => p.price === amount);
    formData.append("planId", `${selectedPlan?.days || 30}_days`);

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/submit`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      setError("Service unavailable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Glassmorphism Styles
  const glass = {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px"
  };

  if (isPremium) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: 440, ...glass, padding: 48, textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.8)", position: "relative" }}>
           <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 100, height: 100, borderRadius: "50%", background: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(251,191,36,0.4)" }}>
              <Crown size={50} color="#000" fill="#000" />
           </div>
           
           <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginTop: 24, marginBottom: 8 }}>Premium Member</h2>
           <p style={{ color: "#8b9bbf", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
             Full access active until <br />
             <strong style={{ color: "#fbbf24", fontSize: 18 }}>{new Date(premiumExpire).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
           </p>
           
           <button onClick={onClose} style={{ width: "100%", padding: "18px 0", borderRadius: 16, background: "linear-gradient(135deg, #fbbf24, #d97706)", border: "none", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 10px 25px rgba(251,191,36,0.3)" }}>
              Close
           </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(30px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
      
      <div style={{ width: "100%", maxWidth: 500, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, overflow: "hidden", position: "relative", boxShadow: "0 50px 150px rgba(0,0,0,0.7)" }}>
        
        {/* Animated Background Decor */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", zIndex: 0 }} />

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)", padding: "40px 32px 32px", position: "relative", zIndex: 1 }}>
          <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "rgba(0,0,0,0.3)", border: "none", color: "#fff", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}>
            <X size={20} />
          </button>
          <div style={{ background: "rgba(255,255,255,0.15)", width: "fit-content", padding: "6px 12px", borderRadius: 12, fontSize: 10, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Unlock Everything</div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.5px" }}>Choose Your Plan</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>Join 5,000+ students mastering English today.</p>
        </div>

        <div style={{ padding: 32, position: "relative", zIndex: 1 }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "40px 0", animation: "fUp .6s ease-out" }}>
               <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}>
                  <Send size={36} color="#10b981" />
               </div>
               <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 16 }}>Success!</h3>
               <p style={{ color: "#8b9bbf", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>We've received your request! Our team will verify the payment and activate your premium status within <span style={{ color: "#fff", fontWeight: 700 }}>60 minutes</span>.</p>
               <button onClick={onClose} style={{ width: "100%", padding: 18, borderRadius: 20, background: "#10b981", border: "none", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 10px 20px rgba(16,185,129,0.2)" }}>Great, let's go!</button>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {PLANS.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setAmount(p.price); setStep(2); }} 
                      style={{ 
                        padding: "20px 24px", borderRadius: 22, 
                        background: amount === p.price ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", 
                        border: amount === p.price ? `2.5px solid ${p.color}` : "1.5px solid rgba(255,255,255,0.06)", 
                        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
                        display: "flex", alignItems: "center", gap: 18,
                        transform: amount === p.price ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${p.color}20` }}>
                        <p.icon size={26} color={p.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{p.desc}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontSize: 18, color: p.color }}>{p.price.toLocaleString()}</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>UZS</div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: 12, padding: "14px 18px", background: "rgba(251,191,36,0.05)", borderRadius: 18, border: "1px dashed rgba(251,191,36,0.3)", display: "flex", alignItems: "center", gap: 12 }}>
                     <Star size={20} color="#fbbf24" fill="#fbbf24" />
                     <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>Unlock Speaking AI & Global Leaderboard today!</span>
                  </div>
                </div>
              ) : (
                <div style={{ animation: "fUp .4s ease-out" }}>
                  <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", padding: 24, borderRadius: 28, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 24 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Transfer Details</span>
                        <div style={{ padding: "4px 10px", background: "rgba(74,158,255,0.1)", borderRadius: 8, fontSize: 10, fontWeight: 800, color: "#4a9eff" }}>Click / Payme</div>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}>
                           <CreditCard size={22} color="#000" />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>8600 0000 0000 0000</div>
                           <div style={{ fontSize: 11, color: "#8b9bbf", fontWeight: 700 }}>Recipient: Nargiza Xolmirzayeva</div>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText("8600000000000000"); alert("Card Number Copied!"); }} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#4a9eff", fontSize: 11, fontWeight: 900, cursor: "pointer", padding: "8px 12px", borderRadius: 10 }}>COPY</button>
                     </div>
                     <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(251,191,36,0.05)", padding: 12, borderRadius: 12 }}>
                        <Info size={14} color="#fbbf24" style={{ marginTop: 2 }} />
                        <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600, lineHeight: 1.5 }}>Transfer <strong style={{ fontSize: 13 }}>{amount.toLocaleString()} UZS</strong>. Make sure the name in the receipt matches your profile.</div>
                     </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#8b9bbf", display: "block", marginBottom: 8, textTransform: "uppercase", paddingLeft: 4 }}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={payName}
                        onChange={(e) => setPayName(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 18px", color: "#fff", fontSize: 14, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#8b9bbf", display: "block", marginBottom: 8, textTransform: "uppercase", paddingLeft: 4 }}>Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="+998"
                        value={payPhone}
                        onChange={(e) => setPayPhone(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 18px", color: "#fff", fontSize: 14, outline: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: "block" }}>
                      <div style={{ width: "100%", height: 120, borderRadius: 24, border: "2px dashed rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.3s", background: receipt ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)" }}>
                         <ImageIcon size={32} color={receipt ? "#10b981" : "#64748b"} />
                         <span style={{ fontSize: 13, fontWeight: 700, color: receipt ? "#10b981" : "#8b9bbf", marginTop: 12 }}>{receipt ? receipt.name.slice(0,25) + '...' : "Attach Payment Screenshot"}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                  </div>

                  {error && <div style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 20, textAlign: "center", background: "rgba(248,113,113,0.1)", padding: "10px", borderRadius: 12 }}>{error}</div>}

                  <div style={{ display: "flex", gap: 16 }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15 }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 18, borderRadius: 18, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none", color: "#fff", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 16, boxShadow: "0 15px 30px rgba(79, 70, 229, 0.3)" }}>
                      {loading ? <RefreshCw className="spin" size={20} /> : <Check size={20} />} {loading ? "Processing..." : "Complete Upgrade"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
