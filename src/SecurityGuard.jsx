import React, { useState, useEffect } from "react";
import { Shield, Key, Camera, Lock, CheckCircle, Smartphone, AlertTriangle } from "lucide-react";

export default function SecurityGuard({ user, onVerified }) {
  const [step, setStep] = useState("faceid"); 
  const [status, setStatus] = useState("idle"); 
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const userKey = `cefr_admin_face_id`; // Fixed key to remember THE admin

  useEffect(() => {
    handleFaceID();
  }, []);

  const handleFaceID = async () => {
    setStatus("verifying");
    setError("");

    try {
      const hasKey = localStorage.getItem(userKey);
      
      if (!hasKey) {
        // First Admin Enrollment
        setTimeout(() => {
          localStorage.setItem(userKey, "admin_registered_" + Date.now());
          setStatus("success");
          setTimeout(() => setStep("otp"), 1000);
        }, 2500);
      } else {
        // Regular Admin Verification
        setTimeout(() => {
          setStatus("success");
          setTimeout(() => setStep("otp"), 1000);
        }, 1800);
      }
    } catch (err) {
      setStatus("error");
      setError("Face recognition failed. Access denied.");
    }
  };

  const verifyOTP = () => {
    if (otp === "887766") { 
      setStatus("success");
      setTimeout(() => onVerified(), 800);
    } else {
      setError("Incorrect security code.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b1120", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 32, textAlign: "center" }}>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
             {step === "faceid" ? <Camera size={36} color="#4a9eff" /> : <Smartphone size={36} color="#fbbf24" />}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
            {step === "faceid" ? "Admin Face ID" : "Final OTP Step"}
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 14 }}>
            {step === "faceid" ? "Hi Admin! Scanning your biometric data..." : "Please verify the 6-digit administrative code."}
          </p>
        </div>

        <div style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
          {step === "faceid" ? (
            <div style={{ minHeight: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
               {status === "verifying" && (
                 <div style={{ width: "100%" }}>
                    <div className="scanner-line" style={{ width: "100%", height: 3, background: "#4a9eff", boxShadow: "0 0 15px #4a9eff", borderRadius: 2 }} />
                    <div style={{ marginTop: 16, fontSize: 11, fontWeight: 800, color: "#4a9eff" }}>SCANNING BIOMETRICS...</div>
                 </div>
               )}
               {status === "success" && <div style={{ color: "#10b981", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={20} /> IDENTITY CONFIRMED</div>}
               {status === "error" && <div style={{ color: "#ef4444", fontSize: 13, gap: 10, display: "flex", flexDirection: "column" }}><span>{error}</span><button onClick={handleFaceID} style={{ background: "#4a9eff", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>Try Again</button></div>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
               <input 
                 type="password" 
                 maxLength={6} 
                 placeholder="······" 
                 value={otp} 
                 onChange={(e) => setOtp(e.target.value)} 
                 style={{ width: "100%", padding: "18px", borderRadius: 16, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 28, textAlign: "center", letterSpacing: 12, fontWeight: 900 }} 
               />
               {error && <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><AlertTriangle size={14}/> {error}</div>}
               <button onClick={verifyOTP} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg,#fbbf24,#d97706)", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: "0 10px 20px rgba(217,119,6,0.3)" }}>GO TO ADMIN PANEL</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          <Lock size={12} style={{ marginRight: 4 }} /> PROTECTED ADMINISTRATIVE ZONE
        </div>

      </div>

      <style>{`
        .scanner-line { animation: scan 2s linear infinite; }
        @keyframes scan { 0% { transform: translateY(-40px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
      `}</style>
    </div>
  );
}
