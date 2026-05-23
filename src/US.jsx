// US.jsx — Fixed onboarding: username correctly saved, CSS variables for theming
import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  ChevronRight,
  Shield,
  User,
  AlertCircle,
  Loader2,
  Users,
  Search,
  Globe,
  Send
} from "lucide-react";

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

const HEAR_ABOUT_OPTIONS = [
  { id: "telegram",   label: "Telegram",                icon: <Send size={20} />,          color: "#3b82f6" },
  { id: "instagram",  label: "Instagram",               icon: <InstagramIcon size={20} />, color: "#e1306c" },
  { id: "google",     label: "Google / Search",         icon: <Search size={20} />,        color: "#4ade80" },
  { id: "friend",     label: "Friend / Recommendation", icon: <Users size={20} />,         color: "#f59e0b" },
  { id: "other",      label: "Other",                   icon: <Globe size={20} />,         color: "#a855f7" }
];

export default function US({ onSelect }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [otherText, setOtherText] = useState("");

  // FIX: Pass username correctly to onSelect, not hearAbout
  const handleFinish = async () => {
    if (!username || !isAvailable || !hearAbout || isFinishing) return;
    setIsFinishing(true);

    const finalVia = hearAbout === "Other" ? (otherText || "Other") : hearAbout;

    // Send to Telegram with timeout (non-blocking, fire-and-forget)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const text = `🎉 *New Registration — CEFR Center*\n\n` +
                   `👤 *Username:* ${username}\n` +
                   `🔍 *Bizni qayerdan topdingiz:* ${finalVia}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
        signal: controller.signal
      });
    } catch (e) {
      // Silently fail — don't block user registration
      console.warn("Telegram notification failed (non-blocking):", e.message);
    } finally {
      clearTimeout(timeoutId);
    }

    // Pass username as first arg, finalVia as second — Dashboard/useProgress saves the username
    if (typeof onSelect === "function") {
      onSelect(username, finalVia);
    } else {
      console.warn("US: onSelect not provided", { username, finalVia });
    }
  };

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckLoading(true);
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`, { signal: controller.signal });
        clearTimeout(tid);
        const data = await resp.json();
        setIsAvailable(data.available);
        setSuggestions(data.suggestions || []);
      } catch (e) {
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
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif",
      color: "var(--text-primary)",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .onboarding-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .suggestion-chip {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 99px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .suggestion-chip:hover { background: var(--bg-primary); }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: 32,
        padding: 40,
        position: "relative",
        zIndex: 10,
        animation: "fadeIn 0.6s ease-out",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
      }}>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: s === step ? "var(--text-primary)" : "var(--border)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Zap size={40} color="var(--text-primary)" fill="var(--text-primary)" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>Welcome to CEFR Center</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.6 }}>
              The most advanced platform to master English. Your journey starts with setting up your profile.
            </p>
            <button onClick={() => setStep(2)} style={{ width: "100%", height: 56, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              Let's Start <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Username */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Choose your Identity</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Pick a unique name for the Leaderboard.</p>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Ex: xojiakbar"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                style={{
                  width: "100%",
                  height: 56,
                  background: "var(--bg-primary)",
                  border: `2px solid ${isAvailable === true ? "#4ade80" : isAvailable === false ? "#f87171" : "var(--border)"}`,
                  borderRadius: 16,
                  padding: "0 48px 0 20px",
                  color: "var(--text-primary)",
                  fontSize: 16,
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              <div style={{ position: "absolute", right: 16, top: 18 }}>
                {isCheckLoading ? <Loader2 size={20} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} /> :
                  isAvailable === true ? <CheckCircle2 size={20} color="#4ade80" /> :
                  isAvailable === false ? <AlertCircle size={20} color="#f87171" /> :
                  <User size={20} color="var(--text-muted)" />}
              </div>
            </div>

            <div style={{ marginTop: 12, minHeight: 20 }}>
              {isCheckLoading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Checking availability...</p>}
              {!isCheckLoading && isAvailable === true && <p style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>✅ Username is available!</p>}
              {!isCheckLoading && isAvailable === false && <p style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>❌ Username is taken!</p>}
              {username.length > 0 && username.length < 3 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Enter at least 3 characters.</p>}
            </div>

            {isAvailable === false && suggestions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Try these options:</p>
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
                width: "100%",
                height: 56,
                marginTop: 32,
                background: isAvailable ? "var(--text-primary)" : "var(--border)",
                opacity: isAvailable ? 1 : 0.5,
                color: isAvailable ? "var(--bg-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 16,
                fontWeight: 800,
                cursor: isAvailable ? "pointer" : "not-allowed",
                fontSize: 16,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Step 3: How did you hear about us? */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Where did you find us?</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>How did you hear about CEFR Center?</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {HEAR_ABOUT_OPTIONS.map(opt => {
                const isSelected = hearAbout === opt.label;
                const isHovered = hoveredOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    className="onboarding-btn"
                    onClick={() => { setHearAbout(opt.label); if (opt.label !== "Other") setOtherText(""); }}
                    onMouseEnter={() => setHoveredOption(opt.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 14,
                      background: isSelected ? `${opt.color}15` : "var(--bg-primary)",
                      border: `1px solid ${isSelected ? opt.color : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                      transform: isHovered || isSelected ? 'scale(1.02) translateY(-2px)' : 'none',
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}>
                    <div style={{ color: isSelected ? opt.color : "var(--text-muted)", transition: "color 0.3s ease" }}>{opt.icon}</div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? opt.color : "var(--text-primary)", transition: "color 0.3s ease" }}>{opt.label}</span>
                    {isSelected && <CheckCircle2 size={18} color={opt.color} style={{ marginLeft: "auto" }} />}
                  </div>
                );
              })}
            </div>

            {hearAbout === "Other" && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Please describe how you found us..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  style={{
                    width: "100%",
                    height: 50,
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "0 20px",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            )}

            <button
              disabled={!hearAbout || isFinishing}
              onClick={handleFinish}
              style={{
                width: "100%",
                height: 60,
                marginTop: 32,
                background: (hearAbout && !isFinishing) ? "var(--text-primary)" : "var(--border)",
                opacity: (hearAbout && !isFinishing) ? 1 : 0.5,
                color: (hearAbout && !isFinishing) ? "var(--bg-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 16,
                fontWeight: 800,
                cursor: (hearAbout && !isFinishing) ? "pointer" : "not-allowed",
                fontSize: 16,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
              {isFinishing
                ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Please wait...</>
                : <><Shield size={20} /> Finish Setup</>
              }
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}