import React, { useState } from "react";
import BACKEND_URL from "./config/api";

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", verticalAlign: "middle" };
  const d = {
    x: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    upload: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    card: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  };
  return d[n] || null;
}

export default function PremiumModal({ user, onClose }) {
  const PLANS = [
    { id: "30_days_basic", price: 55000, name: "Premium Basic", desc: "Access to standard modules for 30 days", days: 30, color: "#4a9eff" },
    { id: "30_days_pro", price: 49000, name: "Premium Pro", desc: "Best Value! Face-to-Face & More for 30 days", days: 30, color: "#1D9E75", best: true },
    { id: "90_days", price: 100000, name: "Ultimate Premium", desc: "All features forever! 90 days validity", days: 90, color: "#EF9F27" }
  ];

  const [step, setStep] = useState("select_plan"); // select_plan | select_method | upload_receipt | success
  const [plan, setPlan] = useState(PLANS[1]);
  const [method, setMethod] = useState(null);
  
  // Form State
  const [file, setFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const CARD_NUMBER = "8600 XXXX XXXX XXXX";
  const CARD_NAME = "HOJIAKBAR";

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please upload the payment receipt.");
    if (!phone) return setError("Please enter your phone number.");
    
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("userId", user.uid);
    formData.append("email", user.email);
    formData.append("planId", plan.id);
    formData.append("paymentMethod", method);
    formData.append("amount", plan.price);
    formData.append("phone", phone);
    formData.append("comment", comment);
    formData.append("receipt", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/create`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStep("success");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", animation: "fadeUp .3s ease" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
             Purchase Premium
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer" }}><Ic n="x" s={20}/></button>
        </div>

        <div style={{ padding: 24 }}>
          {error && <div style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 20, fontWeight: 600 }}>{error}</div>}

          {step === "select_plan" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
                {PLANS.map(p => (
                  <div key={p.id} onClick={() => setPlan(p)} style={{ background: plan.id === p.id ? `${p.color}15` : "rgba(255,255,255,0.03)", border: `2px solid ${plan.id === p.id ? p.color : "rgba(255,255,255,0.05)"}`, borderRadius: 16, padding: "20px 14px", cursor: "pointer", position: "relative", transition: "all .2s" }}>
                    {p.best && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: p.color, color: "#fff", fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 10, whiteSpace: "nowrap" }}>RECOMMENDED</div>}
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: plan.id === p.id ? p.color : "#fff", textAlign: "center", marginBottom: 6 }}>{p.name}</h3>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", textAlign: "center", letterSpacing: 0.5, marginBottom: 8 }}>{p.price.toLocaleString()} UZS</div>
                    <p style={{ fontSize: 11, color: "#8b9bbf", textAlign: "center", lineHeight: 1.4 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep("select_method")}
                style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 12, border: "none", background: plan.color, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 32px ${plan.color}40`, transition: "all 0.3s" }}>
                Continue
              </button>
            </div>
          )}

          {step === "select_method" && (
            <div>
              <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 16 }}>Select Payment Method:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { id: "click", label: "Click" },
                  { id: "payme", label: "Payme" },
                  { id: "uzum", label: "Uzum Bank" },
                  { id: "paynet", label: "Paynet" }
                ].map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setStep("upload_receipt"); }}
                    style={{ background: "#18243a", border: "1px solid rgba(255,255,255,0.1)", padding: "20px 10px", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("select_plan")} style={{ width: "100%", marginTop: 20, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8b9bbf", borderRadius: 10, cursor: "pointer" }}>Back</button>
            </div>
          )}

          {step === "upload_receipt" && (
            <form onSubmit={handleCheckout}>
              <div style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#4a9eff", fontWeight: 700, marginBottom: 12 }}>Transfer the payment to the card below and upload receipt:</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Card Number:</span> <span style={{ color: "#fff", fontWeight: 800, letterSpacing: 1 }}><Ic n="card" s={14} c="#a78bfa" /> {CARD_NUMBER}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Cardholder:</span> <span style={{ color: "#fff", fontWeight: 700 }}>{CARD_NAME}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Amount:</span> <span style={{ color: "#fff", fontWeight: 700 }}>{plan.price.toLocaleString()} UZS</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 6, marginTop: 8 }}>
                  <span style={{ color: "#8b9bbf" }}>Comment:</span> <span style={{ color: "#a78bfa", fontWeight: 700 }}>{plan.name}, userId: {user?.uid?.slice(-6)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Payment Receipt (Image or PDF) *</label>
                <div style={{ 
                  border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 12, padding: "20px", textAlign: "center", 
                  background: file ? "rgba(29,158,117,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer", position: "relative" 
                }}>
                  <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} required />
                  {file ? (
                    <div style={{ color: "#1D9E75", fontWeight: 700 }}><Ic n="check" s={18} /> {file.name}</div>
                  ) : (
                     <div style={{ color: "#a78bfa", fontSize: 13 }}><Ic n="upload" s={20} /><br/>Click to select a file</div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Phone Number *</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 123 45 67" required style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Amount (UZS) *</label>
                  <div style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 700, opacity: 0.7 }}>
                    {plan.price.toLocaleString()} UZS
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Additional comment (Optional)</label>
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Transaction ID or comment..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14 }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setStep("select_method")} style={{ padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8b9bbf", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}>Back</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "14px", background: "#4a9eff", border: "none", color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 800, opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, background: "rgba(29,158,117,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid rgba(29,158,117,0.3)" }}>
                <Ic n="check" s={32} c="#1D9E75" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Request Submitted!</h2>
              <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 24, lineHeight: 1.5 }}>
                Your payment will be reviewed by our admins. Once approved, your profile will automatically upgrade to Premium (usually within 5-15 minutes).
              </p>
              <button onClick={onClose} style={{ width: "100%", padding: "14px", background: "#18243a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
