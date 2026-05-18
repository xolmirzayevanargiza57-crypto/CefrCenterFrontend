import React, { useState, useEffect } from "react";
import { 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Star,
  User,
  AlertCircle,
  Loader2,
  Trophy,
  Users,
  Search,
  Globe,
  Send
} from "lucide-react";
import { LEVEL_THRESHOLDS, CEFR_META } from "./useProgress";

import BACKEND_URL from "./config/api.js";
const BOT_TOKEN = "8968436498:AAEMGT-rJ2tRR1-2bWDFi1OTqkgQ_Dhpm3o";
const CHAT_ID = "7747756904";

const InstagramIcon = ({ size, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LEVEL_DESCRIPTIONS = {
  A1: "You can understand and use very basic everyday expressions and phrases.",
  A2: "You can communicate in simple and routine tasks requiring a simple exchange of information.",
  B1: "You can deal with most situations likely to arise while travelling in an area where English is spoken.",
  B2: "You can interact with a degree of fluency and spontaneity that makes regular interaction quite possible.",
  C1: "You can express ideas fluently and spontaneously without much obvious searching for expressions.",
  C2: "You can understand with ease virtually everything heard or read, and summarize information correctly."
};

const HEAR_ABOUT_OPTIONS = [
  { id: "telegram", label: "Telegram", icon: <Send size={20} />, color: "#3b82f6" },
  { id: "instagram", label: "Instagram", icon: <InstagramIcon size={20} />, color: "#e1306c" },
  { id: "google", label: "Google / Search", icon: <Search size={20} />, color: "#4ade80" },
  { id: "friend", label: "Friend / Recommendation", icon: <Users size={20} />, color: "#f59e0b" },
  { id: "other", label: "Other", icon: <Globe size={20} />, color: "#a855f7" }
];

export default function US({ onSelect }) {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [username, setUsername] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [otherText, setOtherText] = useState("");

  const handleFinish = async () => {
    if (!username || !isAvailable || !hearAbout || isFinishing) return;
    setIsFinishing(true);
    
    // Send to Telegram
    try {
      const finalVia = hearAbout === "Other" ? (otherText || "Other") : hearAbout;
      const text = `🎉 *New Registration — CEFR Center*\n\n` +
                   `👤 *Username:* ${username}\n` +
                   `🔍 *Bizni qayerdan topdingiz:* ${finalVia}`;
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" })
      });
    } catch (e) {
      console.error("Telegram send failed", e);
    }

    const finalVia = hearAbout === "Other" ? (otherText || "Other") : hearAbout;
    onSelect(username, finalVia);
  };

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckLoading(true);
      setError("");
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`, { signal: controller.signal });
        clearTimeout(tid);
        const data = await resp.json();
        setIsAvailable(data.available);
        setSuggestions(data.suggestions || []);
      } catch (e) {
        // Backend offline — allow user to proceed (username will be verified on server)
        console.warn("Username check offline, allowing:", e.message);
        setIsAvailable(true);
        setSuggestions([]);
      } finally {
        setIsCheckLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060c1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'Sora', sans-serif",
      color: "#f0f4ff",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background: rgba(17, 25, 40, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .onboarding-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .onboarding-btn.level-btn { border: 2px solid rgba(255,255,255,0.06); }
        .onboarding-btn.level-btn:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .onboarding-btn.level-btn.selected { background: rgba(74, 158, 255, 0.1) !important; border-color: #4a9eff !important; transform: scale(1.02); }
        .suggestion-chip {
          padding: 8px 16px;
          background: rgba(74, 158, 255, 0.1);
          border: 1px solid rgba(74, 158, 255, 0.2);
          border-radius: 99px;
          cursor: pointer;
          font-size: 13px;
          color: #4a9eff;
          transition: all 0.2s;
        }
        .suggestion-chip:hover { background: rgba(74, 158, 255, 0.2); }
      `}</style>

      <div className="glass-card" style={{ 
        width: "100%", 
        maxWidth: step === 3 ? "900px" : "500px", 
        borderRadius: 32, 
        padding: 40, 
        position: "relative",
        zIndex: 10,
        animation: "fadeIn 0.6s ease-out"
      }}>
        
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, background: "rgba(74, 158, 255, 0.1)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Zap size={40} color="#4a9eff" fill="#4a9eff" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Welcome to CEFR Center</h1>
            <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 40, lineHeight: 1.6 }}>
              The most advanced AI portal to master English. Your journey starts with setting up your profile.
            </p>
            <button onClick={() => setStep(2)} style={{ width: "100%", height: 60, background: "linear-gradient(135deg, #2563eb, #60a5fa)", color: "#fff", border: "none", borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              Let's Start <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Choose your Identity</h2>
              <p style={{ fontSize: 14, color: "#94a3b8" }}>Pick a unique name to represent you on the Leaderboard.</p>
            </div>

            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder="Ex: xojiakbar" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                style={{
                  width: "100%", height: 56, background: "rgba(255,255,255,0.03)", border: "2px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: "0 48px 0 20px", color: "#fff", fontSize: 16, outline: "none",
                  borderColor: isAvailable === true ? "#1D9E75" : isAvailable === false ? "#E11D48" : "rgba(255,255,255,0.1)"
                }}
              />
              <div style={{ position: "absolute", right: 16, top: 18 }}>
                {isCheckLoading ? <Loader2 className="animate-spin" size={20} color="#64748b" /> : 
                 isAvailable === true ? <CheckCircle2 size={20} color="#1D9E75" /> : 
                 isAvailable === false ? <AlertCircle size={20} color="#E11D48" /> : 
                 <User size={20} color="#64748b" />}
              </div>
            </div>

            <div style={{ marginTop: 12, minHeight: 20 }}>
              {isCheckLoading && <p style={{ fontSize: 13, color: "#94a3b8" }}>Checking availability...</p>}
              {!isCheckLoading && isAvailable === true && <p style={{ fontSize: 13, color: "#1D9E75", fontWeight: 700 }}>✅ This username is Available!</p>}
              {!isCheckLoading && isAvailable === false && <p style={{ fontSize: 13, color: "#E11D48", fontWeight: 700 }}>❌ This username is Taken!</p>}
              {username.length > 0 && username.length < 3 && <p style={{ fontSize: 13, color: "#94a3b8" }}>Enter at least 3 characters.</p>}
            </div>

            {isAvailable === false && suggestions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Try these options:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map(s => (
                    <div key={s} className="suggestion-chip" onClick={() => setUsername(s)}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            <button 
              disabled={!isAvailable} 
              onClick={() => setStep(3)}
              style={{
                width: "100%", height: 56, marginTop: 40, 
                background: isAvailable ? "#4a9eff" : "#1e293b", 
                opacity: isAvailable ? 1 : 0.5, 
                color: "#fff", border: "none", borderRadius: 16, 
                fontWeight: 800, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10
              }}>
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        )}



        {/* Step 3: How did you hear about us? */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Where did you find us?</h2>
              <p style={{ fontSize: 14, color: "#94a3b8" }}>How did you hear about CEFR Center?</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {HEAR_ABOUT_OPTIONS.map(opt => {
                const isSelected = hearAbout === opt.label;
                const isHovered = hoveredOption === opt.id;
                const activeColor = isSelected || isHovered ? opt.color : "#64748b";
                return (
                  <div key={opt.id} 
                    className="onboarding-btn" 
                    onClick={() => { setHearAbout(opt.label); if(opt.label !== "Other") setOtherText(""); }}
                    onMouseEnter={() => setHoveredOption(opt.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    style={{ 
                      padding: "16px 20px", borderRadius: 14, 
                      background: isSelected ? `${opt.color}15` : isHovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", 
                      border: `1px solid ${isSelected ? opt.color : isHovered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, 
                      display: "flex", alignItems: "center", gap: 15,
                      transform: isHovered || isSelected ? 'scale(1.02) translateY(-2px)' : 'none',
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}>
                    <div style={{ color: activeColor, transition: "color 0.3s ease" }}>{opt.icon}</div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected || isHovered ? opt.color : "#f0f4ff", transition: "color 0.3s ease" }}>{opt.label}</span>
                  </div>
                );
              })}
            </div>
            
            {hearAbout === "Other" && (
              <div style={{ 
                marginTop: 16,
                animation: "fadeIn 0.3s ease-out"
              }}>
                <input 
                  type="text" 
                  placeholder="Please describe how you found us..." 
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  style={{
                    width: "100%", height: 50, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14, padding: "0 20px", color: "#fff", fontSize: 15, outline: "none"
                  }}
                />
              </div>
            )}

            <button 
              disabled={!hearAbout || isFinishing} 
              onClick={handleFinish}
              style={{
                width: "100%", height: 60, marginTop: 40, 
                background: hearAbout ? "linear-gradient(135deg, #2563eb, #60a5fa)" : "#1e293b", 
                opacity: (hearAbout && !isFinishing) ? 1 : 0.5, 
                color: "#fff", border: "none", borderRadius: 16, 
                fontWeight: 800, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: hearAbout ? "0 10px 20px rgba(37, 99, 235, 0.2)" : "none"
              }}>
              {isFinishing ? <><Loader2 className="animate-spin" size={20} /> Please wait...</> : <><Shield size={20} /> Finish Setup</>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}