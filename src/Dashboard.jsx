// Dashboard.jsx — CEFR Center — Fast Loading Version
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./firebase";
import CertificateGenerator from "./components/CertificateGenerator";
import Analytics from "./components/Analytics";
import Leaderboard from "./components/Leaderboard";
import Vocabulary from "./Vocabulary";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import US from "./US.jsx";
import Settings from "./Settings.jsx";
import ListeningPage from "./Listening.jsx";
import ReadingPage from "./Reading.jsx";
import WritingPage from "./Writing.jsx";
import SpeakingPage from "./Speaking.jsx";
import SpinPage from "./Spin.jsx";
import NotificationsPage from "./Notifications.jsx";
import MissionsPage from "./Mission.jsx";
import FullMockPage from "./FullMock.jsx";
import Community    from "./Community";
import PremiumModal from "./PremiumModal.jsx";
import FaceToFace   from "./FaceToFace.jsx";
import AdminPanel   from "./AdminPanel.jsx";
import Flashcards   from "./Flashcards.jsx";
import Messages     from "./Messages.jsx";

import { useProgress, LEVEL_THRESHOLDS, CEFR_META } from "./useProgress";
import { scoreToCEFR, scoreToWritingBand } from "./scoring";

const MAX_SCORE = 75;
const LISTENING_MAX = 75;
const ACC = "#4a9eff";

import BACKEND_URL from "./config/api.js";

async function addUserToFirestore(user) {
  // Keeping this empty since we moved to MongoDB via useProgress.js
  return true;
}

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const paths = {
    grid:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    ear:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
    book:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    pen:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
    mic:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    shop:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    spin:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>,
    bell:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    gear:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    menu:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    logout:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    video:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    lock:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    check:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    coin:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 15a2.5 2.5 0 005 0"/></svg>,
    bolt:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    medal:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    hint:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    timer:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    file:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    sun:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
    trash:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    fire:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 2C6.5 7 4 10.5 4 14a8 8 0 0016 0c0-4.5-3.5-8.5-8-12z"/><path d="M12 18a3 3 0 01-3-3c0-2 3-5 3-5s3 3 3 5a3 3 0 01-3 3z"/></svg>,
    star:    <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    award:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    arrowR:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    arrowL:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    lock:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    target:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    mock:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    trophy:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 01-4 4 5 5 0 01-4-4L7 4z"/><path d="M5 9H3a2 2 0 01-2-2V5a2 2 0 012-2h2M19 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2"/></svg>,
    globe:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    phone:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
    copy:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  };
  return paths[n] || null;
}



// Redundant LISTENING_TESTS removed as it is now fetched from the backend via useEffect.

const SECTIONS = [
  { key: "listening", label: "Listening", color: "#1D9E75", ic: "ear",  max: LISTENING_MAX, isL: true  },
  { key: "reading",   label: "Reading",   color: "#378ADD", ic: "book", max: MAX_SCORE,     isL: false },
  { key: "writing",   label: "Writing",   color: "#EF9F27", ic: "pen",  max: MAX_SCORE,     isL: false },
  { key: "speaking",  label: "Speaking (Maintenance)", color: "#D4537E", ic: "mic",  max: MAX_SCORE,     isL: false, disabled: true },
];

const ICON_MAP = {
  mic: "mic", pen: "pen", bolt: "bolt", hint: "hint",
  medal: "medal", clock: "timer", file: "file", sun: "sun",
};



// ─── UPTIME COMPONENT ────────────────────────────────────────────────────────
function SystemUptime() {
  const launchDate = useMemo(() => new Date("2026-04-01T00:00:00"), []);
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const itv = setInterval(() => {
      const now = new Date();
      const diff = now - launchDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setUptime(`${days}d ${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(itv);
  }, [launchDate]);

  return (
    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(74, 158, 255, 0.05)", borderRadius: 10, border: "0.5px solid rgba(74, 158, 255, 0.1)" }}>
      <div style={{ fontSize: 9, color: "#4a9eff", fontWeight: 700, textTransform: "uppercase", marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px #4ade80" }} />
        System Uptime
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff", fontFamily: "monospace" }}>{uptime}</div>
    </div>
  );
}

// ─── DASH HOME ────────────────────────────────────────────────────────────────
function DashHome({ user, progress, scores, lvlMeta, pct, nxp, cxp, setPage, clearSectionScores, removeScore, timeBonusClaimed }) {
  const [showClear, setShowClear] = useState(false);
  const getSectionBest = (key, isL) => {
    const keys = Object.keys(scores).filter(k=>k.startsWith(key+"_") || (isL && k.startsWith("listening_")));
    if(!keys.length) return null;

    if (isL) {
      const overall = keys.filter(k => k.includes("_overall")).map(k => scores[k]);
      return overall.length ? Math.max(...overall) : null;
    }

    if (key === "reading") {
      const vals = keys.map(k => scores[k]);
      return Math.max(...vals);
    }

    // Writing & Speaking: Group by Test ID (e.g., writing_t1_p1.1 + writing_t1_p2)
    const testGroups = {};
    keys.forEach(k => {
      const parts = k.split("_");
      if (parts.length >= 3) {
        const testId = parts[1];
        testGroups[testId] = (testGroups[testId] || 0) + (scores[k] || 0);
      }
    });
    const totals = Object.values(testGroups);
    return totals.length ? Math.max(...totals) : null;
  };
  const sectionBands = SECTIONS.map(s => {
    const best = getSectionBest(s.key, s.isL);
    if(best==null) return null;
    const info = s.isL ? scoreToCEFR(best,LISTENING_MAX) : scoreToWritingBand(best,MAX_SCORE);
    return parseFloat(info.band);
  });
  const validBands = sectionBands.filter(b=>b!==null);
  const overallBand = validBands.length>0
    ? (Math.round((validBands.reduce((a,b)=>a+b,0)/validBands.length)*2)/2).toFixed(1)
    : null;
  const bandToCEFR = b => {
    const n=parseFloat(b);
    if(n>=8.5) return{cefr:"C2",color:"#D4537E"};
    if(n>=7.0) return{cefr:"C1",color:"#7F77DD"};
    if(n>=5.5) return{cefr:"B2",color:"#D85A30"};
    if(n>=4.5) return{cefr:"B1",color:"#EF9F27"};
    if(n>=3.5) return{cefr:"A2",color:"#1D9E75"};
    return{cefr:"A1",color:"#378ADD"};
  };
  const overallCEFR = overallBand ? bandToCEFR(overallBand) : null;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* PREMIUM LEVEL PROGRESS CARD (Matching Image 1) */}
      <div style={{
        background: "linear-gradient(90deg, #2b3b75, #4f46e5)",
        borderRadius: 16,
        padding: "16px 24px",
        marginBottom: 20,
        boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
        color: "#fff",
        display: "flex", flexDirection: "column", gap: 16
      }}>
        {/* Top Row: Circular gauge & Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Circular Gauge */}
            <div style={{ position: "relative", width: 60, height: 60 }}>
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 163" }}
                  animate={{ strokeDasharray: `${(pct / 100) * 163} 163` }}
                  transition={{ duration: 1.5 }}
                  cx="30" cy="30" r="26" fill="none" stroke="#a5b4fc" strokeWidth="6" strokeLinecap="round" 
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{progress.level}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{pct}%</span>
              </div>
            </div>
            
            {/* Title & Subtitle */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>CEFR LEVEL</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{progress.level}</h1>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>• {pct}%</span>
              </div>
              <div style={{ marginTop: 4, background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 12, fontSize: 11, display: "inline-block" }}>
                → Steady progress
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
             {/* Equilizer graphic (mock) */}
             <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24, opacity: 0.6 }}>
               {[4,8,12,16,10,14,6,12,8,4,10,6].map((h, i) => <div key={i} style={{ width: 3, height: h, background: "#fff", borderRadius: 2 }}/>)}
             </div>
             
             {/* Book Icon Button */}
             <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Ic n="book" s={18} c="#fff" />
                <div style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>7</div>
             </div>
             
             {/* Close Button */}
             <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <span style={{ fontSize: 12, fontWeight: 800 }}>X</span>
             </div>
          </div>
        </div>
        
        {/* Bottom Progress Bar */}
        <div style={{ position: "relative", marginTop: 8 }}>
           <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", width: "100%", top: 12, padding: "0 10%", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }}>
             <span>B1</span>
             <span>B2</span>
             <span>C1</span>
           </div>
           
           <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, width: "100%", overflow: "hidden" }}>
             <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#a5b4fc", borderRadius: 3 }} />
           </div>
        </div>
      </div>

      {/* REFERRAL BANNER (Matching Image 2) */}
      <div style={{
        background: "#f8fafc",
        borderRadius: 16,
        padding: "20px",
        marginBottom: 20,
        border: "1px solid #e2e8f0",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>Do'stlarni taklif qiling</h3>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>5 ta do'stingiz ro'yxatdan o'tib, mashq qilsa — sizga 9 kun Pro bepul!</p>
          </div>
          <div style={{ background: "#1e293b", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
            0/5
          </div>
        </div>
        
        {/* Progress bar */}
        <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
           <div style={{ height: "100%", width: "0%", background: "#4f46e5", borderRadius: 4 }} />
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#1e293b", color: "#f8fafc", borderRadius: 12, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
             🔗 www.cefrai.uz/register?ref=5cd79a89
          </div>
          <button style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 12, padding: "0 24px", fontWeight: 800, cursor: "pointer" }}>
            Ulashish
          </button>
        </div>
      </div>

      {/* STREAK & LEVEL CARD (Matching Image 2 & 3) */}
      <div className="dash-sub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic n="bolt" s={32} c="#e11d48" />
            </div>
            <div style={{ position: "absolute", top: -5, right: -5, background: "#e11d48", color: "#fff", fontSize: 10, fontWeight: 900, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #060c1a" }}>
              {user.consecutiveDays || 0}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Day Streak</h4>
            <p style={{ fontSize: 11, color: "#8b9bbf", fontWeight: 600 }}>Keep it up!</p>
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
           <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${lvlMeta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${lvlMeta.color}33` }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: lvlMeta.color }}>{lvlMeta.name}</span>
           </div>
           <div style={{ textAlign: "center" }}>
             <h4 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Level {progress.lvl}</h4>
             <p style={{ fontSize: 11, color: "#8b9bbf", fontWeight: 600 }}>{nxp - progress.xp} XP to Lvl {progress.lvl + 1}</p>
           </div>
        </div>
      </div>

      {overallBand && (
        <div style={{background:"linear-gradient(135deg,#0f1f35,#1a2e4a)",border:`1px solid ${overallCEFR.color}44`,borderRadius:14,padding:"18px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{fontSize:44,fontWeight:800,color:overallCEFR.color,lineHeight:1}}>{overallBand}</span>
            <div><div style={{fontSize:14,fontWeight:700,color:overallCEFR.color}}>{overallCEFR.cefr}</div><div style={{fontSize:11,color:"#8b9bbf"}}>Overall Band</div></div>
          </div>
          <div style={{flex:1,minWidth:180}}>
            <div style={{fontSize:13,fontWeight:600,color:"#f0f4ff",marginBottom:8}}>Section Bands</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {SECTIONS.map((s,i) => {
                const best=getSectionBest(s.key,s.isL);
                const info=best!=null?(s.isL?scoreToCEFR(best,LISTENING_MAX):scoreToWritingBand(best,MAX_SCORE)):null;
                return <div key={s.key} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}><Ic n={s.ic} s={12} c={s.color}/><span style={{color:"#64748b"}}>{s.label}:</span><strong style={{color:info?info.color:"#4a5568"}}>{info?info.band:"—"}</strong></div>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Mock CTA */}
      <div onClick={()=>setPage("fullmock")} style={{background:"linear-gradient(135deg,#1a1040,#0f1829)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:14,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:16,cursor:"pointer"}}>
        <div style={{width:44,height:44,borderRadius:12,background:"rgba(167,139,250,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ic n="mock" s={22} c="#a78bfa"/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff",marginBottom:2}}>Full Mock Exam</div>
          <div style={{fontSize:12,color:"#8b9bbf"}}>Listening → Reading → Writing → Speaking in one session</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"6px 14px"}}>
          <span style={{fontSize:12,fontWeight:700,color:"#a78bfa"}}>Start →</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>
        {[
          {label:"Total XP",val:progress.xp,color:ACC,ic:"bolt"},
          {label:"Completed",val:Object.keys(progress.completed||{}).length,color:"#1D9E75",ic:"check"},
          {label:"Study Hours",val:(progress.xp * 0.1).toFixed(1),color:"#3b82f6",ic:"target"}
        ].map(({label,val,color,ic})=>(
          <div key={label} style={{background:"#18243a",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Ic n={ic} s={14} c={color}/><span style={{fontSize:11,color:"#8b9bbf"}}>{label}</span></div>
            <div style={{fontSize:26,fontWeight:700,color}}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
        <Leaderboard currentUser={user} />
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <p style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>Section Scores</p>
        <button onClick={()=>setShowClear(p=>!p)} style={{fontSize:11,color:"#8b9bbf",background:"transparent",border:"0.5px solid rgba(255,255,255,0.1)",padding:"4px 10px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
          <Ic n="trash" s={12} c="#8b9bbf"/> Manage
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,marginBottom:20}}>
        {SECTIONS.map(({key,label,color,ic,max,isL,disabled})=>{
          const best=getSectionBest(key,isL);
          const pct2=best!=null?Math.round((best/max)*100):0;
          const info=best!=null?(isL?scoreToCEFR(best,LISTENING_MAX):scoreToWritingBand(best,MAX_SCORE)):null;
          const hasScore=best!=null;
          return (
            <div key={key} style={{background:"#18243a",border:`0.5px solid ${hasScore?color+"44":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:16,cursor:disabled?"not-allowed":"pointer", position: "relative", opacity:disabled?0.6:1}}
              onClick={()=>!disabled && setPage(key)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${color}22`}}>
                    <Ic n={ic} s={16} c={color}/>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{label}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:17,fontWeight:800,color:hasScore?color:"#4a5568"}}>{hasScore?best:"—"}/{max}</div>
                  {info && <div style={{fontSize:10,color:info.color,fontWeight:700}}>Band {info.band} · {info.cefr}</div>}
                </div>
              </div>
              <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",borderRadius:3,width:`${pct2}%`,background:color}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                <div style={{fontSize:11,color:"#4a5568"}}>{hasScore?`${pct2}% · Tap to practise`:"Tap to start"}</div>
                <div style={{fontSize:10,color:color,fontWeight:700,background:`${color}12`,padding:"2px 8px",borderRadius:6}}>
                  {Object.keys(scores||{}).filter(k => k.startsWith(key) && (k.includes("overall") || !k.includes("_p"))).length} Completed
                </div>
              </div>
              {showClear && <button onClick={e=>{e.stopPropagation();clearSectionScores(isL?"listening_":key+"_")}} style={{marginTop:8,width:"100%",padding:"5px",borderRadius:6,border:"1px solid rgba(225,29,72,0.25)",background:"rgba(225,29,72,0.06)",color:"#f87171",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Clear {label} scores</button>}
            </div>
          );
        })}
      </div>

      {/* CERTIFICATE SECTION */}
      <div style={{ marginBottom: 24 }}>
        <CertificateGenerator user={auth?.currentUser} progress={progress} scores={scores} />
      </div>

      <p style={{fontSize:13,fontWeight:700,color:"#f0f4ff",marginBottom:12}}>CEFR Scale</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8}}>
        {LEVEL_THRESHOLDS.map(l=>{
          const m=CEFR_META[l.code];
          const curIdx=LEVEL_THRESHOLDS.findIndex(t=>t.code===progress.level);
          const thisIdx=LEVEL_THRESHOLDS.findIndex(t=>t.code===l.code);
          const isActive=l.code===progress.level;
          const isPassed=thisIdx<curIdx;
          return (
            <div key={l.code} style={{background:"#18243a",borderRadius:10,padding:"12px 10px",border:isActive?`1px solid ${m.color}`:"0.5px solid rgba(255,255,255,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:9,padding:"1px 6px",borderRadius:99,background:m.bg,color:m.tc,fontWeight:700}}>{l.label}</span>
                {isActive && <span style={{fontSize:9,background:`${ACC}18`,color:ACC,padding:"1px 5px",borderRadius:99,fontWeight:700}}>NOW</span>}
                {isPassed && <Ic n="check" s={11} c="#1D9E75"/>}
              </div>
              <div style={{fontSize:20,fontWeight:800,color:m.color}}>{l.code}</div>
              <div style={{fontSize:9,color:"#4a5568",marginTop:2}}>{l.minXP} XP</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    progress, scores, premiums,
    nextLevelXP, currentThreshold,
    setInitialLevel, addXP,
    canSpin, recordSpin,
    claimTimeBonus, hasClaimedTimeBonus,
    isPremiumActive, activatePremium, getPremiumExpiry,
    saveScore, removeScore, clearSectionScores,
    resetProgress, forceSyncNow, saveVocabulary,
    updateUsername, updateProfileData
  } = useProgress();

  const [user, setUser]           = useState(null);
  const [dbUser, setDbUser]       = useState(null); // Backend user data (isAdmin, isPremium, premiumExpire)
  const [page, setPage]           = useState("dash");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const [sideOpen, setSideOpen]   = useState(window.innerWidth > 768);
  const [loading, setLoading]     = useState(true);
  const [timeBonusClaimed, setTimeBonusClaimed] = useState(false);
  const [lessons, setLessons]     = useState(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const userAddedRef = useRef(false);
  const timerRef = useRef(null);
  const syncTimerRef = useRef(null);

  // Fetch backend user info (isAdmin, isPremium, premiumExpire)
  const fetchDbUser = useCallback(async (email) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/progress?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
        console.log("Admin Check:", data.isAdmin);
      }
    } catch (e) { console.warn("Failed to fetch dbUser:", e.message); }
  }, []);

  const NAV = [
    { pg: "dash",          label: "Dashboard",     ic: "grid"   },
    { pg: "listening",     label: "Listening",     ic: "ear"    },
    { pg: "reading",       label: "Reading",       ic: "book"   },
    { pg: "writing",       label: "Writing",       ic: "pen"    },
    { pg: "speaking",      label: "Speaking",      ic: "mic",    badge: "FIX" },
    { pg: "analytics",     label: "Analytics",     ic: "bolt",   badge: "NEW" },
    { pg: "community",     label: "Community Hub", ic: "globe",   badge: "NEW" },
    { pg: "vocabulary",    label: "Vocabulary",    ic: "book",   badge: "NEW" },
    { pg: "messages",      label: "Messages",      ic: "bell" },
    { pg: "facetoface",    label: "Face to Face",  ic: "video",  badge: "PREM" },
    { pg: "fullmock",      label: "Full Mock",     ic: "mock",  badge: "NEW" },
    { pg: "spin",          label: "Fortune Drum",  ic: "spin",  badge: "HOT" },
    { pg: "missions",      label: "Missions",      ic: "target", badge: "🎯" },
    { pg: "notifications", label: "Notifications", ic: "bell",   badge: unreadNotifs > 0 ? unreadNotifs : null },
    { pg: "settings",      label: "Profile",       ic: "gear"   },
  ];

  if (!isPremActive) {
    NAV.splice(NAV.length - 1, 0, { pg: "premium_upgrade", label: "Get Premium", ic: "crown", badge: "HOT" });
  }
  const isAdmin = dbUser?.isAdmin === true;
  const isPremActive = dbUser?.isPremium === true;
  const premDaysLeft = isPremActive ? Math.ceil((new Date(dbUser.premiumExpire) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  if (isAdmin) NAV.push({ pg: "admin", label: "Admin Panel", ic: "lock", badge: "PRO" });

  // Fetch Notifications Count
  useEffect(() => {
    const fetchNotifsCount = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/notifications`);
        if (r.ok) {
          const data = await r.json();
          const readIds = (() => {
            try { return JSON.parse(localStorage.getItem("cefr_notif_read_v1")) || []; }
            catch { return []; }
          })();
          const count = data.filter(n => !readIds.includes(n._id || n.id)).length;
          setUnreadNotifs(count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifsCount();
    const itv = setInterval(fetchNotifsCount, 60000); // Check every minute
    return () => clearInterval(itv);
  }, []);

  // Fetch Lessons from Backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/lessons`)
      .then(r => r.json())
      .then(data => {
        setLessons(data);
        console.log("📚 Lessons loaded from backend");
      })
      .catch(e => console.error("Failed to load lessons:", e));
  }, []);

  // TEZ AUTH - loadingni darhol tugat
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { 
        navigate("/", { replace: true }); 
        setLoading(false); 
        return; 
      }
      setUser(u);
      setLoading(false);
      fetchDbUser(u.email);
      addUserToFirestore(u);
    });
    return () => unsub();
  }, [navigate, fetchDbUser]);

  useEffect(() => {
    const fn = e => { if (!e.target.closest(".ava-wrap")) setDropOpen(false); };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  useEffect(() => {
    const fn = () => setSideOpen(window.innerWidth > 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (hasClaimedTimeBonus()) { setTimeBonusClaimed(true); return; }
    timerRef.current = setTimeout(() => {
      const claimed = claimTimeBonus();
      if (claimed) setTimeBonusClaimed(true);
    }, 6 * 60 * 1000);
    return () => clearTimeout(timerRef.current);
  }, [hasClaimedTimeBonus, claimTimeBonus]);

  // KECIKTIRILGAN sync - tezlik uchun
  useEffect(() => {
    if (!user || !progress) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      forceSyncNow();
    }, 2000);
    return () => clearTimeout(syncTimerRef.current);
  }, [user, progress, forceSyncNow]);

  const handleLogout = async () => { setDropOpen(false); await signOut(auth); navigate("/", { replace: true }); };

  // TEZ loading screen
  if (loading || (user && !dbUser)) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0b1120",color:"#8b9bbf",fontFamily:"sans-serif",fontSize:14}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${ACC}33`,borderTopColor:ACC,animation:"spin .6s linear infinite",margin:"0 auto 12px"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Syncing Profile...
      </div>
    </div>
  );

  if (!progress.onboarded) return <US onSelect={setInitialLevel} />;

  const initials = (user?.displayName || progress.username || "ST").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const lvlMeta  = CEFR_META[progress.level] ?? CEFR_META.A1;
  const nxp      = nextLevelXP();
  const cxp      = currentThreshold();
  const pct      = nxp && nxp !== cxp ? Math.min(100,Math.max(0,Math.round(((progress.xp-cxp)/(nxp-cxp))*100))) : nxp===null ? 100 : 0;
  const TOPBAR_H = 56;

  const commonProps = {
    user, progress, scores,
    saveScore, addXP,
    isPremiumActive, activatePremium, getPremiumExpiry,
    clearSectionScores, setPage,
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",width:"100vw",overflowX:"hidden",background:"#0b1120",color:"#f0f4ff",fontFamily:"'Sora','Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        *{box-sizing:border-box;margin:0;padding:0}
        textarea:focus,input:focus{outline:none}
        /* Prevent annoying horizontal scroll */
        html, body { overflow-x: hidden; position: relative; width: 100%; }
        
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}

        @media (max-width: 768px) {
          .dash-grid-top { grid-template-columns: 1fr !important; }
          .progress-card-content { flex-direction: column !important; align-items: center !important; gap: 20px !important; text-align: center !important; }
          .audio-visualizer-decor { display: none !important; }
          .hero-h1 { font-size: 32px !important; }
          .main-content { padding: 16px 12px !important; }
          .sidebar-container {
            position: fixed !important;
            left: 0;
            z-index: 300;
            box-shadow: 10px 0 30px rgba(0,0,0,0.6);
            background: #131d2e;
          }
        }

        @media (max-width: 480px) {
          .top-bar-stats { display: none !important; }
          .hero-h1 { font-size: 26px !important; }
          .hero-badge-row { flex-direction: column !important; align-items: center !important; gap: 10px !important; }
          .progress-card-content { gap: 16px !important; }
          .progress-card-content div:first-child { width: 100px !important; height: 100px !important; }
          .progress-card-content svg { width: 100px !important; height: 100px !important; }
          .dash-sub-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>

      {/* TOPBAR */}
      <div style={{height:TOPBAR_H,background:"#131d2e",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",padding:"0 16px",flexShrink:0,position:"sticky",top:0,zIndex:200,gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSideOpen(p=>!p)} style={{background:"transparent",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#f0f4ff",display:"flex"}}>
            <Ic n="menu" s={16} c="#f0f4ff"/>
          </button>
          <span style={{fontSize:16,fontWeight:800,color:ACC,letterSpacing:"-0.5px"}}>Cefr Center</span>
        </div>
        
        <button onClick={() => window.location.reload()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", color: "#8b9bbf", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
           <Ic n="spin" s={12} c="#8b9bbf" /> Sync
        </button>

        <div className="top-bar-stats" style={{display:"flex",alignItems:"center",gap:8,flex:1,maxWidth:300,margin:"0 auto"}}>
          <span style={{fontSize:11,fontWeight:700,color:lvlMeta.color,minWidth:22}}>{progress.level}</span>
          <div style={{flex:1,height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:lvlMeta.color}}/>
          </div>
          <span style={{fontSize:11,color:"#8b9bbf",whiteSpace:"nowrap"}}>{progress.xp} XP</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
          <div className="top-bar-stats" style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 8, background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 4 }} title="XP">
                <Ic n="bolt" s={14} c="#fbbf24" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{progress.xp}</span>
             </div>
             <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
             <div style={{ display: "flex", alignItems: "center", gap: 4 }} title="Days Streak">
                <Ic n="fire" s={14} c="#ef4444" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{progress.consecutiveDays}</span>
             </div>
          </div>
          <div className="ava-wrap" style={{position:"relative"}}>
            {user?.photoURL
              ? <img src={user.photoURL} referrerPolicy="no-referrer" alt="avatar" onClick={()=>setDropOpen(p=>!p)} style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${ACC}44`,cursor:"pointer",display:"block"}}/>
              : <div onClick={()=>setDropOpen(p=>!p)} style={{width:32,height:32,borderRadius:"50%",background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#85b7eb",cursor:"pointer",border:`2px solid ${ACC}44`}}>{initials}</div>
            }
            {dropOpen && (
              <div style={{position:"absolute",top:42,right:0,background:"#131d2e",border:"0.5px solid rgba(255,255,255,0.14)",borderRadius:12,padding:12,minWidth:200,zIndex:400}}>
                <p style={{fontSize:13,fontWeight:600,marginBottom:2,color:"#f0f4ff"}}>{user?.displayName || progress.username || "Student"}</p>
                <p style={{fontSize:11,color:"#8b9bbf",marginBottom:4}}>{user?.email}</p>
                <p style={{fontSize:11,color:"#8b9bbf",marginBottom:10}}>{progress.consecutiveDays} day streak {progress.consecutiveDays>=7?"🔥":""}</p>
                <button onClick={handleLogout} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"0.5px solid rgba(255,255,255,0.14)",background:"transparent",color:ACC,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit"}}>
                  <Ic n="logout" s={13} c={ACC}/> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{display:"flex",flex:1,minHeight:0, position:"relative"}}>
        {sideOpen && (
          <div className="sidebar-container" style={{width:210,background:"#131d2e",borderRight:"0.5px solid rgba(255,255,255,0.06)",padding:"12px 8px",display:"flex",flexDirection:"column",gap:2,flexShrink:0,position:"sticky",top:TOPBAR_H,height:`calc(100vh - ${TOPBAR_H}px)`,overflowY:"auto"}}>
            {NAV.filter(n => !["facetoface", "admin"].includes(n.pg)).map(({pg,label,ic,badge})=>{
              const isActive=page===pg;
              const badgeColor = badge==="HOT"?"#fbbf24":badge==="NEW"?"#a78bfa":badge==="🎯"?null:"#4a9eff";
              return (
                <motion.div 
                  key={pg} 
                  onClick={() => {
                    if (pg === "speaking") {
                      alert("Speaking module is currently under maintenance. We are working hard to fix it!");
                      setPage("dash");
                    } else {
                      setPage(pg);
                    }
                  }} 
                  whileHover={{ scale: 1.02, x: 5, background: isActive ? `${ACC}25` : "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:isActive?700:500,background:isActive?`${ACC}18`:"transparent",color:isActive?ACC:"#8b9bbf"}}>
                  <Ic n={ic} s={18} c={isActive?ACC:"#8b9bbf"}/>
                  {label}
                  {badge && (
                    <span style={{marginLeft:"auto",fontSize:pg === "notifications" ? 10 : 9,fontWeight:800,color:pg === "notifications" ? "#fff" : (badgeColor||"#EF9F27"),background:badge==="🎯"?"transparent":pg === "notifications" ? "#e11d48" : `rgba(${badge==="HOT"?"251,191,36":badge==="NEW"?"167,139,250":"74,158,255"},0.15)`,padding:badge==="🎯"?"0":"1px 6px",borderRadius:99, minWidth: pg === "notifications" ? 18 : "auto", textAlign: "center"}}>
                      {badge}
                    </span>
                  )}
                </motion.div>
              );
            })}

            {/* PREMIUM NAV SECTION */}
            {isPremActive && (
              <div style={{ marginTop: 24, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "#EF9F27", padding: "0 12px", marginBottom: 8, letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
                   <Ic n="award" s={12} c="#EF9F27" /> PRO FEATURES
                </div>
                {NAV.filter(n => ["facetoface", "admin"].includes(n.pg)).map(({pg,label,ic,badge})=>{
                  const isActive=page===pg;
                  return (
                    <motion.div 
                      key={pg} 
                      onClick={() => setPage(pg)} 
                      whileHover={{ scale: 1.02, x: 5, background: "rgba(239,159,39,0.1)" }}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:isActive?700:500,background:isActive?"rgba(239,159,39,0.15)":"transparent",color:isActive?"#EF9F27" : "#8b9bbf"}}>
                      <Ic n={ic} s={18} c={isActive ? "#EF9F27" : "#8b9bbf"}/>
                      {label}
                      <span style={{marginLeft:"auto",fontSize:9,fontWeight:900,color:"#EF9F27",background:"rgba(239,159,39,0.1)",padding:"1px 6px",borderRadius:6}}>PRO</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {/* Premium Status Card at bottom of sidebar */}
            <div style={{marginTop:"auto",paddingTop:14}}>
              {/* Premium Status Section */}
              <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#8b9bbf", fontWeight: 700 }}>SUBSCRIPTION</span>
                    <span style={{ 
                      fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 6,
                      background: isPremActive ? "rgba(239,159,39,0.2)" : "rgba(255,255,255,0.05)",
                      color: isPremActive ? "#EF9F27" : "#4a5568"
                    }}>
                      {isPremActive ? "PREMIUM" : "FREE"}
                    </span>
                  </div>
                  {isPremActive ? (
                    <div style={{ fontSize: 12, color: "#f0f4ff", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                       <Ic n="timer" s={12} c="#EF9F27" /> Expires: {new Date(dbUser.premiumExpire).toLocaleDateString()}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowPremiumModal(true)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #fbbf24, #d97706)", border: "none", color: "#000", fontWeight: 800, fontSize: 11, cursor: "pointer", boxShadow: "0 4px 12px rgba(251,191,36,0.3)" }}
                    >
                      GET TRIAL: 19 DAYS FREE
                    </button>
                  )}
                </div>
              <div style={{padding:12,borderRadius:10,background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:9,color:"#4a5568",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Level</div>
                <div style={{fontSize:22,fontWeight:800,color:lvlMeta.color}}>{progress.level}</div>
                <div style={{fontSize:11,color:"#8b9bbf",marginTop:2}}>{progress.xp} XP</div>
                <div style={{marginTop:6,height:4,borderRadius:2,background:"rgba(255,255,255,0.08)"}}>
                  <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:lvlMeta.color}}/>
                </div>
                {nxp && <div style={{fontSize:9,color:"#4a5568",marginTop:4}}>{nxp-progress.xp} XP to next</div>}
              </div>
              <SystemUptime />
              
              {/* Admin Contact Widget */}
              <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#8b9bbf", marginBottom: 8, textTransform: "uppercase" }}>Support</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.2)", padding: "8px 10px", borderRadius: 8, border: "0.5px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#4a5568" }}>Phone Support</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>+998 94 146 44 42</div>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText("+998 94 146 44 42"); alert("Number copied!"); }}
                    style={{ background: "rgba(74, 158, 255, 0.1)", border: "none", borderRadius: 6, padding: "6px", cursor: "pointer", color: ACC }}>
                    <Ic n="copy" s={14} />
                  </button>
                </div>
                <a href="tel:+998941464442" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, background: "#1D9E75", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  <Ic n="phone" s={14} /> Call Admin
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="main-content" style={{flex:1,padding:"24px 20px",minWidth:0,overflowY:"auto",height:`calc(100vh - ${TOPBAR_H}px)`}}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {page==="dash"          && <DashHome user={user} progress={progress} scores={scores} lvlMeta={lvlMeta} pct={pct} nxp={nxp} cxp={cxp} setPage={setPage} clearSectionScores={clearSectionScores} removeScore={removeScore} timeBonusClaimed={timeBonusClaimed}/>}
              {page==="listening"     && <ListeningPage  {...commonProps} tests={lessons?.LISTENING_TESTS || []} onBack={()=>setPage("dash")}/>}
              {page==="reading"       && <ReadingPage    {...commonProps} tests={lessons?.READING_TESTS || []}/>}
              {page==="writing"       && <WritingPage    {...commonProps} tests={lessons?.WRITING_TESTS || []}/>}
              {page==="speaking"      && <Navigate to="/dashboard" replace />}
              {page==="facetoface"    && <FaceToFace     user={user} progress={{...progress, isPremium: isPremActive}} openPremiumModal={() => setShowPremiumModal(true)} />}
              {page==="admin"         && <AdminPanel     user={{...user, isAdmin: isAdmin}} onBack={()=>setPage("dash")} />}
              {page==="fullmock"      && <FullMockPage   {...commonProps} allTests={lessons} onBack={()=>setPage("dash")}/>}
              {page==="premium_upgrade" && <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}><button onClick={() => setShowPremiumModal(true)} style={{ padding: "20px 40px", borderRadius: 20, background: "#fbbf24", color: "#000", fontSize: 24, fontWeight: 900, border: "none", cursor: "pointer"}}>Upgrade Now</button></div>}
              {page==="spin"          && <SpinPage       progress={progress} canSpin={canSpin} recordSpin={recordSpin} prizes={lessons?.SPIN_PRIZES || []}/>}
              {page==="missions"      && <MissionsPage   progress={progress} scores={scores} addXP={addXP} timeBonusClaimed={timeBonusClaimed} setPage={setPage}/>}
              {page==="notifications" && <NotificationsPage/>}
              {page==="settings"      && <Settings user={user} progress={progress} resetProgress={resetProgress} updateUsername={updateUsername} updateProfileData={updateProfileData}/>}
              {page==="vocabulary"    && <Vocabulary progress={progress} saveVocabulary={saveVocabulary} updateProfileData={updateProfileData} onPractice={() => setPage("flashcards")} />}
              {page==="flashcards"    && <Flashcards vocabulary={progress.vocabulary} onBack={() => setPage("vocabulary")} />}
              {page==="analytics"     && <Analytics progress={progress} scores={scores} />}
              {page==="community"     && <Community user={user} progress={progress} />}
              {page==="messages"      && <Messages user={user} onBack={()=>setPage("dash")} />}
            </motion.div>
          </AnimatePresence>
          {showPremiumModal && <PremiumModal user={user} isPremium={isPremActive} premiumExpire={dbUser?.premiumExpire} onClose={() => setShowPremiumModal(false)} />}
        </div>
      </div>
    </div>  
  );
}