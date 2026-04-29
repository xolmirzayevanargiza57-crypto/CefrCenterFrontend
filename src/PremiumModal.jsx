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
  const [step, setStep] = useState("select_plan"); // select_plan | select_method | upload_receipt | success
  const [plan, setPlan] = useState({ id: "30_days", price: 49000, name: "Premium 30 kun" });
  const [method, setMethod] = useState(null);
  
  // Form State
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState(49000);
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const CARD_NUMBER = "8600 XXXX XXXX XXXX";
  const CARD_NAME = "HOJIAKBAR";

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!file) return setError("Iltimos, to'lov chekini (rasm) yuklang.");
    if (!phone) return setError("Telefon raqamingizni kiriting.");
    
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("userId", user.uid);
    formData.append("email", user.email);
    formData.append("planId", plan.id);
    formData.append("paymentMethod", method);
    formData.append("amount", amount);
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
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, width: "100%", maxWidth: 500, overflow: "hidden", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", animation: "fadeUp .3s ease" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
             Premium Xarid Qilish
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer" }}><Ic n="x" s={20}/></button>
        </div>

        <div style={{ padding: 24 }}>
          {error && <div style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 20, fontWeight: 600 }}>{error}</div>}

          {step === "select_plan" && (
            <div>
              <div style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.1),rgba(124,58,237,0.1))", border: "1px solid #7c3aed", borderRadius: 16, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa" }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: "#8b9bbf", marginTop: 4 }}>Face to Face va barcha modullar</p>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{plan.price.toLocaleString()} UZS</div>
              </div>
              <button 
                onClick={() => setStep("select_method")}
                style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                Davom etish
              </button>
            </div>
          )}

          {step === "select_method" && (
            <div>
              <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 16 }}>To'lov tizimini tanlang:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["Click", "Payme", "Uzum Bank", "Paynet"].map(m => (
                  <button key={m} onClick={() => { setMethod(m); setStep("upload_receipt"); }}
                    style={{ background: "#18243a", border: "1px solid rgba(255,255,255,0.1)", padding: "20px 10px", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("select_plan")} style={{ width: "100%", marginTop: 20, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8b9bbf", borderRadius: 10, cursor: "pointer" }}>Ortga</button>
            </div>
          )}

          {step === "upload_receipt" && (
            <form onSubmit={handleCheckout}>
              <div style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#4a9eff", fontWeight: 700, marginBottom: 12 }}>Quyidagi raqamga to'lov qiling va chekni yuklang:</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Karta raqami:</span> <span style={{ color: "#fff", fontWeight: 800, letterSpacing: 1 }}><Ic n="card" s={14} c="#a78bfa" /> {CARD_NUMBER}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Karta egasi:</span> <span style={{ color: "#fff", fontWeight: 700 }}>{CARD_NAME}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#8b9bbf" }}>Summa:</span> <span style={{ color: "#fff", fontWeight: 700 }}>{plan.price.toLocaleString()} UZS</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: 6, marginTop: 8 }}>
                  <span style={{ color: "#8b9bbf" }}>Izoh (Comment):</span> <span style={{ color: "#a78bfa", fontWeight: 700 }}>{plan.name}, userId: {user?.uid?.slice(-6)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>To'lov cheki (Rasm yoki PDF) *</label>
                <div style={{ 
                  border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 12, padding: "20px", textAlign: "center", 
                  background: file ? "rgba(29,158,117,0.1)" : "rgba(255,255,255,0.02)", cursor: "pointer", position: "relative" 
                }}>
                  <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} required />
                  {file ? (
                    <div style={{ color: "#1D9E75", fontWeight: 700 }}><Ic n="check" s={18} /> {file.name}</div>
                  ) : (
                     <div style={{ color: "#a78bfa", fontSize: 13 }}><Ic n="upload" s={20} /><br/>Faylni tanlash uchun bosing</div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Telefon raqam *</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 123 45 67" required style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Summa (UZS) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14 }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 6 }}>Qo'shimcha izoh (Ixtiyoriy)</label>
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Tranzaksiya ID si yoki izoh..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 14 }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setStep("select_method")} style={{ padding: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8b9bbf", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}>Ortga</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "14px", background: "#4a9eff", border: "none", color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 800, opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? "Yuborilmoqda..." : "Tasdiqlash va Yuborish"}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, background: "rgba(29,158,117,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid rgba(29,158,117,0.3)" }}>
                <Ic n="check" s={32} c="#1D9E75" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>So'rov yuborildi!</h2>
              <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 24, lineHeight: 1.5 }}>
                Sizning to'lovingiz adminlarimiz tomonidan tekshiriladi. Tasdiqlangach, profilingiz avtomatik ravishda Premium holatiga o'tadi (odatda 5-15 daqiqa ichida).
              </p>
              <button onClick={onClose} style={{ width: "100%", padding: "14px", background: "#18243a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}>
                Yopish
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
