// Dashboard.jsx — CEFR Center — Fixed Version
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
import Community from "./Community";
import PremiumModal from "./PremiumModal.jsx";
import FaceToFace from "./FaceToFace.jsx";
import AdminPanel from "./AdminPanel.jsx";
import Flashcards from "./Flashcards.jsx";
import Messages from "./Messages.jsx";

import { useProgress, LEVEL_THRESHOLDS, CEFR_META } from "./useProgress";
import { scoreToCEFR, scoreToWritingBand } from "./scoring";

const MAX_SCORE = 75;
const LISTENING_MAX = 75;
const ACC = "var(--accent)";

import BACKEND_URL from "./config/api.js";

async function addUserToFirestore(user) {
  return true;
}

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const paths = {
    grid:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    ear:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
    book:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    pen:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
    mic:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    shop:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    spin:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>,
    bell:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    gear:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    menu:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    logout: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    video:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    lock:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    check:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    coin:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 15a2.5 2.5 0 005 0"/></svg>,
    bolt:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    medal:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    hint:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    timer:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    file:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    sun:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>,
    trash:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    fire:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 2C6.5 7 4 10.5 4 14a8 8 0 0016 0c0-4.5-3.5-8.5-8-12z"/><path d="M12 18a3 3 0 01-3-3c0-2 3-5 3-5s3 3 3 5a3 3 0 01-3 3z"/></svg>,
    star:   <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    award:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    arrowR: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    arrowL: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    target: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    mock:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    trophy: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 01-4 4 5 5 0 01-4-4L7 4z"/><path d="M5 9H3a2 2 0 01-2-2V5a2 2 0 012-2h2M19 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2"/></svg>,
    globe:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    phone:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
    copy:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    crown:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 20h20M5 20L3 8l5 4 4-7 4 7 5-4-2 12"/></svg>,
  };
  return paths[n] || null;
}

const SECTIONS = [
  { key: "listening", label: "Listening", color: "var(--text-primary)", ic: "ear",  max: LISTENING_MAX, isL: true  },
  { key: "reading",   label: "Reading",   color: "var(--text-primary)", ic: "book", max: MAX_SCORE,     isL: false },
  { key: "writing",   label: "Writing",   color: "var(--text-primary)", ic: "pen",  max: MAX_SCORE,     isL: false },
  { key: "speaking",  label: "Speaking",  color: "var(--text-muted)",   ic: "mic",  max: MAX_SCORE,     isL: false, disabled: true },
];

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
    <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg-primary)", borderRadius: 14, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30d158" }} />
        LIVE STATUS
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>{uptime}</div>
    </div>
  );
}

// ─── DASH HOME ────────────────────────────────────────────────────────────────
function DashHome({ user, progress, scores, lvlMeta, pct, nxp, cxp, setPage, clearSectionScores, removeScore, timeBonusClaimed }) {
  const [showClear, setShowClear] = useState(false);

  const getSectionBest = (key, isL) => {
    const keys = Object.keys(scores).filter(k => k.startsWith(key + "_") || (isL && k.startsWith("listening_")));
    if (!keys.length) return null;
    if (isL) {
      const overall = keys.filter(k => k.includes("_overall")).map(k => scores[k]);
      return overall.length ? Math.max(...overall) : null;
    }
    if (key === "reading") {
      const vals = keys.map(k => scores[k]);
      return Math.max(...vals);
    }
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
    if (best == null) return null;
    const info = s.isL ? scoreToCEFR(best, LISTENING_MAX) : scoreToWritingBand(best, MAX_SCORE);
    return parseFloat(info.band);
  });
  const validBands = sectionBands.filter(b => b !== null);
  const overallBand = validBands.length > 0
    ? (Math.round((validBands.reduce((a, b) => a + b, 0) / validBands.length) * 2) / 2).toFixed(1)
    : null;
  const bandToCEFR = b => {
    const n = parseFloat(b);
    if (n >= 8.5) return { cefr: "C2", color: "#D4537E" };
    if (n >= 7.0) return { cefr: "C1", color: "#7F77DD" };
    if (n >= 5.5) return { cefr: "B2", color: "#D85A30" };
    if (n >= 4.5) return { cefr: "B1", color: "#EF9F27" };
    if (n >= 3.5) return { cefr: "A2", color: "#1D9E75" };
    return { cefr: "A1", color: "#378ADD" };
  };
  const overallCEFR = overallBand ? bandToCEFR(overallBand) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* LEVEL PROGRESS CARD */}
      <div style={{
        background: "var(--bg-secondary)",
        borderRadius: 24,
        padding: "24px",
        marginBottom: 24,
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        color: "var(--text-primary)",
        display: "flex", flexDirection: "column", gap: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r="32" fill="none" stroke="var(--border)" strokeWidth="6" />
                <motion.circle
                  initial={{ strokeDasharray: "0 201" }}
                  animate={{ strokeDasharray: `${(pct / 100) * 201} 201` }}
                  transition={{ duration: 1.5 }}
                  cx="36" cy="36" r="32" fill="none" stroke="var(--text-primary)" strokeWidth="6" strokeLinecap="round"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>{progress.level}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>{pct}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, textTransform: "uppercase" }}>Proficiency</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>Road to Mastery</h1>
              <div style={{ marginTop: 6, background: "var(--bg-primary)", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600, display: "inline-block", color: "var(--text-muted)" }}>
                {nxp ? `${Math.max(0, nxp - progress.xp)} XP to next` : "Master Level"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32, opacity: 0.2 }}>
            {[12, 18, 24, 32, 20, 28, 14, 24, 18, 12, 20, 14].map((h, i) => (
              <div key={i} style={{ width: 4, height: h, background: "var(--text-primary)", borderRadius: 2 }} />
            ))}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "var(--text-muted)", fontSize: 10, fontWeight: 700 }}>
            <span>{progress.level}</span>
            <span>{LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.findIndex(t => t.code === progress.level) + 1]?.code || "MAX"}</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-primary)", borderRadius: 4, width: "100%", overflow: "hidden", border: "1px solid var(--border)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "var(--text-primary)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* REFERRAL BANNER */}
      <div style={{
        background: "var(--bg-secondary)",
        borderRadius: 24,
        padding: "24px",
        marginBottom: 24,
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 24 }}>
              🎁
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: 0, marginBottom: 2 }}>Referral Program</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Invite 5 friends → 9 days Premium free</p>
            </div>
          </div>
          <div style={{ background: "var(--text-primary)", color: "var(--bg-primary)", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
            0 / 5
          </div>
        </div>
        <div style={{ height: 8, background: "var(--bg-primary)", borderRadius: 4, marginBottom: 20, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: "100%", width: "0%", background: "var(--text-primary)", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", overflow: "hidden" }}>
            🔗 <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>cefrcenter.vercel.app/?ref=invite</span>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText("https://cefrcenter.vercel.app/?ref=invite"); }}
            style={{ background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 14, padding: "0 24px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Copy
          </button>
        </div>
      </div>

      {/* STREAK & LEVEL CARD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic n="fire" s={36} c="#ff3b30" />
            </div>
            <div style={{ position: "absolute", top: -8, right: -8, background: "#ff3b30", color: "#fff", fontSize: 11, fontWeight: 900, width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--bg-secondary)" }}>
              {user.consecutiveDays || 0}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>Streak</h4>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Days Active</p>
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 24, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>{progress.level}</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>Current</h4>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>CEFR Level</p>
          </div>
        </div>
      </div>

      {/* Overall Band */}
      {overallBand && (
        <div style={{ background: "var(--bg-secondary)", border: `1px solid var(--border)`, borderRadius: 14, padding: "18px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: overallCEFR.color, lineHeight: 1 }}>{overallBand}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: overallCEFR.color }}>{overallCEFR.cefr}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Overall Band</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Section Bands</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {SECTIONS.map((s, i) => {
                const best = getSectionBest(s.key, s.isL);
                const info = best != null ? (s.isL ? scoreToCEFR(best, LISTENING_MAX) : scoreToWritingBand(best, MAX_SCORE)) : null;
                return (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                    <Ic n={s.ic} s={12} c="var(--text-muted)" />
                    <span style={{ color: "var(--text-muted)" }}>{s.label}:</span>
                    <strong style={{ color: info ? info.color : "var(--text-muted)" }}>{info ? info.band : "—"}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Mock CTA */}
      <div onClick={() => setPage("fullmock")} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}>
          <Ic n="mock" s={22} c="var(--text-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>Full Mock Exam</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Listening → Reading → Writing → Speaking</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Start →</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total XP", val: progress.xp, ic: "bolt" },
          { label: "Completed", val: Object.keys(progress.completed || {}).length, ic: "check" },
          { label: "Study Hours", val: (progress.xp * 0.1).toFixed(1), ic: "target" }
        ].map(({ label, val, ic }) => (
          <div key={label} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Ic n={ic} s={14} c="var(--text-muted)" />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
        <Leaderboard currentUser={user} />
      </div>

      {/* Section Scores */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Section Scores</p>
        <button onClick={() => setShowClear(p => !p)} style={{ fontSize: 11, color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
          <Ic n="trash" s={12} c="var(--text-muted)" /> Manage
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginBottom: 20 }}>
        {SECTIONS.map(({ key, label, color, ic, max, isL, disabled }) => {
          const best = getSectionBest(key, isL);
          const pct2 = best != null ? Math.round((best / max) * 100) : 0;
          const info = best != null ? (isL ? scoreToCEFR(best, LISTENING_MAX) : scoreToWritingBand(best, MAX_SCORE)) : null;
          const hasScore = best != null;
          return (
            <div key={key} style={{ background: "var(--bg-secondary)", border: `1px solid var(--border)`, borderRadius: 12, padding: 16, cursor: disabled ? "not-allowed" : "pointer", position: "relative", opacity: disabled ? 0.6 : 1 }}
              onClick={() => !disabled && setPage(key)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                    <Ic n={ic} s={16} c="var(--text-primary)" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{hasScore ? best : "—"}/{max}</div>
                  {info && <div style={{ fontSize: 10, color: info.color, fontWeight: 700 }}>Band {info.band} · {info.cefr}</div>}
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: "var(--bg-primary)", overflow: "hidden", marginBottom: 6, border: "1px solid var(--border)" }}>
                <div style={{ height: "100%", borderRadius: 3, width: `${pct2}%`, background: "var(--text-primary)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{hasScore ? `${pct2}% · Tap to practise` : "Tap to start"}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, background: "var(--bg-primary)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  {Object.keys(scores || {}).filter(k => k.startsWith(key) && (k.includes("overall") || !k.includes("_p"))).length} Done
                </div>
              </div>
              {showClear && (
                <button onClick={e => { e.stopPropagation(); clearSectionScores(isL ? "listening_" : key + "_"); }}
                  style={{ marginTop: 8, width: "100%", padding: "5px", borderRadius: 6, border: "1px solid rgba(225,29,72,0.25)", background: "rgba(225,29,72,0.06)", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  Clear {label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate Section */}
      <div style={{ marginBottom: 24 }}>
        <CertificateGenerator user={auth?.currentUser} progress={progress} scores={scores} />
      </div>

      {/* CEFR Scale */}
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>CEFR Scale</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
        {LEVEL_THRESHOLDS.map(l => {
          const m = CEFR_META[l.code];
          const curIdx = LEVEL_THRESHOLDS.findIndex(t => t.code === progress.level);
          const thisIdx = LEVEL_THRESHOLDS.findIndex(t => t.code === l.code);
          const isActive = l.code === progress.level;
          const isPassed = thisIdx < curIdx;
          return (
            <div key={l.code} style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "12px 10px", border: isActive ? `1px solid ${m.color}` : "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: m.bg, color: m.tc, fontWeight: 700 }}>{l.label}</span>
                {isActive && <span style={{ fontSize: 9, background: "var(--bg-primary)", color: "var(--text-primary)", padding: "1px 5px", borderRadius: 99, fontWeight: 700 }}>NOW</span>}
                {isPassed && <Ic n="check" s={11} c="#1D9E75" />}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{l.code}</div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{l.minXP} XP</div>
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

  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [page, setPage] = useState("dash");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(window.innerWidth > 768);
  const [loading, setLoading] = useState(true);
  const [timeBonusClaimed, setTimeBonusClaimed] = useState(false);
  const [lessons, setLessons] = useState(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const userAddedRef = useRef(false);
  const timerRef = useRef(null);
  const syncTimerRef = useRef(null);

  const fetchDbUser = useCallback(async (email) => {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${BACKEND_URL}/api/user/progress?email=${encodeURIComponent(email)}`, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        setDbUser(data);
      } else {
        setDbUser({});
      }
    } catch (e) {
      console.warn("Backend offline:", e.message);
      setDbUser({});
    }
  }, []);

  const isAdmin = dbUser?.isAdmin === true;
  const isPremActive = dbUser?.isPremium === true;
  const premDaysLeft = isPremActive ? Math.ceil((new Date(dbUser.premiumExpire) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  // Build NAV after isAdmin/isPremActive are derived
  const NAV = [
    { pg: "dash",          label: "Dashboard",     ic: "grid"   },
    { pg: "listening",     label: "Listening",     ic: "ear"    },
    { pg: "reading",       label: "Reading",       ic: "book"   },
    { pg: "writing",       label: "Writing",       ic: "pen"    },
    { pg: "speaking",      label: "Speaking",      ic: "mic",    badge: "FIX" },
    { pg: "analytics",     label: "Analytics",     ic: "bolt",   badge: "NEW" },
    { pg: "community",     label: "Community Hub", ic: "globe",  badge: "NEW" },
    { pg: "vocabulary",    label: "Vocabulary",    ic: "book",   badge: "NEW" },
    { pg: "messages",      label: "Messages",      ic: "bell"   },
    { pg: "facetoface",    label: "Face to Face",  ic: "video",  badge: "PREM" },
    { pg: "fullmock",      label: "Full Mock",     ic: "mock",   badge: "NEW" },
    { pg: "spin",          label: "Fortune Drum",  ic: "spin",   badge: "HOT" },
    { pg: "missions",      label: "Missions",      ic: "target", badge: "🎯" },
    { pg: "notifications", label: "Notifications", ic: "bell",   badge: unreadNotifs > 0 ? unreadNotifs : null },
    { pg: "settings",      label: "Profile",       ic: "gear"   },
  ];
  if (!isPremActive) {
    NAV.splice(NAV.length - 1, 0, { pg: "premium_upgrade", label: "Get Premium", ic: "crown", badge: "HOT" });
  }
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
          setUnreadNotifs(data.filter(n => !readIds.includes(n._id || n.id)).length);
        }
      } catch (e) {}
    };
    fetchNotifsCount();
    const itv = setInterval(fetchNotifsCount, 60000);
    return () => clearInterval(itv);
  }, []);

  // Fetch Lessons
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/lessons`)
      .then(r => r.json())
      .then(data => setLessons(data))
      .catch(e => console.error("Failed to load lessons:", e));
  }, []);

  // Auth listener
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

  useEffect(() => {
    if (!user || !progress) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => forceSyncNow(), 2000);
    return () => clearTimeout(syncTimerRef.current);
  }, [user, progress, forceSyncNow]);

  const handleLogout = async () => {
    setDropOpen(false);
    await signOut(auth);
    navigate("/", { replace: true });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-muted)", fontFamily: "inherit", fontSize: 14 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--text-primary)", animation: "spin .6s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading...
      </div>
    </div>
  );

  if (!progress.onboarded) return (
    <US onSelect={(name) => {
      updateUsername(name);
    }} />
  );

  const initials = (user?.displayName || progress.username || "ST").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const lvlMeta = CEFR_META[progress.level] ?? CEFR_META.A1;
  const nxp = nextLevelXP();
  const cxp = currentThreshold();
  const pct = nxp && nxp !== cxp ? Math.min(100, Math.max(0, Math.round(((progress.xp - cxp) / (nxp - cxp)) * 100))) : nxp === null ? 100 : 0;
  const TOPBAR_H = 56;

  const commonProps = {
    user, progress, scores,
    saveScore, addXP,
    isPremiumActive, activatePremium, getPremiumExpiry,
    clearSectionScores, setPage,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100vw", overflowX: "hidden", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        *{box-sizing:border-box;margin:0;padding:0}
        textarea:focus,input:focus{outline:none}
        html,body{overflow-x:hidden;position:relative;width:100%}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        @media (max-width:768px){
          .sidebar-container{position:fixed !important;left:0;z-index:300;box-shadow:10px 0 30px rgba(0,0,0,0.2);background:var(--bg-secondary) !important;}
          .main-content{padding:16px 12px !important}
          .top-bar-stats{display:none !important}
          .audio-vis{display:none !important}
        }
        @media (max-width:480px){
          .dash-sub-grid{grid-template-columns:1fr !important;gap:10px !important}
        }
      `}</style>

      {/* TOPBAR */}
      <div style={{ height: TOPBAR_H, background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0, position: "sticky", top: 0, zIndex: 200, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSideOpen(p => !p)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "var(--text-primary)", display: "flex" }}>
            <Ic n="menu" s={16} c="var(--text-primary)" />
          </button>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px" }}>Cefr Center</span>
        </div>

        <button onClick={() => window.location.reload()} style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", color: "var(--text-muted)", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Ic n="spin" s={12} c="var(--text-muted)" /> Sync
        </button>

        <div className="top-bar-stats" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 300, margin: "0 auto" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: lvlMeta.color, minWidth: 22 }}>{progress.level}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-primary)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: lvlMeta.color }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{progress.xp} XP</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div className="top-bar-stats" style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 8, background: "var(--bg-primary)", padding: "4px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic n="bolt" s={14} c="#fbbf24" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{progress.xp}</span>
            </div>
            <div style={{ width: 1, height: 14, background: "var(--border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic n="fire" s={14} c="#ef4444" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{progress.consecutiveDays}</span>
            </div>
          </div>
          <div className="ava-wrap" style={{ position: "relative" }}>
            {user?.photoURL
              ? <img src={user.photoURL} referrerPolicy="no-referrer" alt="avatar" onClick={() => setDropOpen(p => !p)} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)", cursor: "pointer", display: "block" }} />
              : <div onClick={() => setDropOpen(p => !p)} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer", border: "2px solid var(--border)" }}>{initials}</div>
            }
            {dropOpen && (
              <div style={{ position: "absolute", top: 42, right: 0, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, minWidth: 200, zIndex: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: "var(--text-primary)" }}>{user?.displayName || progress.username || "Student"}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{user?.email}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>{progress.consecutiveDays} day streak</p>
                <button onClick={handleLogout} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                  <Ic n="logout" s={13} c="var(--accent)" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {sideOpen && (
          <div className="sidebar-container" style={{ width: 210, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, position: "sticky", top: TOPBAR_H, height: `calc(100vh - ${TOPBAR_H}px)`, overflowY: "auto" }}>
            {NAV.map(({ pg, label, ic, badge }) => {
              const isActive = page === pg;
              const badgeColor = badge === "HOT" ? "#fbbf24" : badge === "NEW" ? "#a78bfa" : badge === "🎯" ? null : "var(--accent)";
              return (
                <motion.div
                  key={pg}
                  onClick={() => {
                    if (pg === "speaking") {
                      alert("Speaking module is currently under maintenance!");
                      return;
                    }
                    if (pg === "facetoface" && !isPremActive) {
                      setShowPremiumModal(true);
                      return;
                    }
                    setPage(pg);
                    // Close sidebar on mobile
                    if (window.innerWidth <= 768) setSideOpen(false);
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: isActive ? 700 : 500, background: isActive ? "var(--bg-primary)" : "transparent", color: isActive ? "var(--text-primary)" : "var(--text-muted)", border: isActive ? "1px solid var(--border)" : "1px solid transparent" }}>
                  <Ic n={ic} s={18} c={isActive ? "var(--text-primary)" : "var(--text-muted)"} />
                  {label}
                  {badge && (
                    <span style={{ marginLeft: "auto", fontSize: pg === "notifications" ? 10 : 9, fontWeight: 800, color: pg === "notifications" ? "#fff" : (badgeColor || "#EF9F27"), background: badge === "🎯" ? "transparent" : pg === "notifications" ? "#e11d48" : "var(--bg-primary)", padding: badge === "🎯" ? "0" : "1px 6px", borderRadius: 99, minWidth: pg === "notifications" ? 18 : "auto", textAlign: "center", border: pg === "notifications" ? "none" : "1px solid var(--border)" }}>
                      {badge}
                    </span>
                  )}
                </motion.div>
              );
            })}

            {/* Bottom sidebar info */}
            <div style={{ marginTop: "auto", paddingTop: 14 }}>
              <div style={{ padding: "16px", borderRadius: "16px", background: "var(--bg-primary)", border: "1px solid var(--border)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>SUBSCRIPTION</span>
                  <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: isPremActive ? "rgba(239,159,39,0.2)" : "var(--bg-secondary)", color: isPremActive ? "#EF9F27" : "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {isPremActive ? "PREMIUM" : "FREE"}
                  </span>
                </div>
                {isPremActive ? (
                  <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Ic n="timer" s={12} c="#EF9F27" /> Expires: {new Date(dbUser.premiumExpire).toLocaleDateString()}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#fbbf24", border: "none", color: "#000", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
                    GET TRIAL: 19 DAYS FREE
                  </button>
                )}
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase" }}>Level</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: lvlMeta.color }}>{progress.level}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{progress.xp} XP</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: lvlMeta.color }} />
                </div>
                {nxp && <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{Math.max(0, nxp - progress.xp)} XP to next</div>}
              </div>

              <SystemUptime />

              <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>Support</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>+998 94 146 44 42</div>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText("+998 94 146 44 42"); alert("Copied!"); }}
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px", cursor: "pointer", color: "var(--accent)" }}>
                    <Ic n="copy" s={14} c="var(--accent)" />
                  </button>
                </div>
                <a href="tel:+998941464442" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, background: "#1D9E75", color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  <Ic n="phone" s={14} c="#fff" /> Call Admin
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Mobile overlay to close sidebar */}
        {sideOpen && window.innerWidth <= 768 && (
          <div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 299 }} />
        )}

        <div className="main-content" style={{ flex: 1, padding: "24px 20px", minWidth: 0, overflowY: "auto", height: `calc(100vh - ${TOPBAR_H}px)` }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {page === "dash"           && <DashHome user={user} progress={progress} scores={scores} lvlMeta={lvlMeta} pct={pct} nxp={nxp} cxp={cxp} setPage={setPage} clearSectionScores={clearSectionScores} removeScore={removeScore} timeBonusClaimed={timeBonusClaimed} />}
              {page === "listening"      && <ListeningPage  {...commonProps} tests={lessons?.LISTENING_TESTS || []} onBack={() => setPage("dash")} />}
              {page === "reading"        && <ReadingPage    {...commonProps} tests={lessons?.READING_TESTS || []} />}
              {page === "writing"        && <WritingPage    {...commonProps} tests={lessons?.WRITING_TESTS || []} />}
              {page === "speaking"       && <Navigate to="/dashboard" replace />}
              {page === "facetoface"     && <FaceToFace user={user} progress={{ ...progress, isPremium: isPremActive }} openPremiumModal={() => setShowPremiumModal(true)} />}
              {page === "admin"          && isAdmin && <AdminPanel user={{ ...user, isAdmin: true }} onBack={() => setPage("dash")} />}
              {page === "fullmock"       && <FullMockPage {...commonProps} allTests={lessons} onBack={() => setPage("dash")} />}
              {page === "premium_upgrade" && (
                <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => setShowPremiumModal(true)} style={{ padding: "20px 40px", borderRadius: 20, background: "#fbbf24", color: "#000", fontSize: 24, fontWeight: 900, border: "none", cursor: "pointer" }}>
                    Upgrade Now
                  </button>
                </div>
              )}
              {page === "spin"           && <SpinPage progress={progress} canSpin={canSpin} recordSpin={recordSpin} prizes={lessons?.SPIN_PRIZES || []} />}
              {page === "missions"       && <MissionsPage progress={progress} scores={scores} addXP={addXP} timeBonusClaimed={timeBonusClaimed} setPage={setPage} />}
              {page === "notifications"  && <NotificationsPage />}
              {page === "settings"       && <Settings user={user} progress={progress} resetProgress={resetProgress} updateUsername={updateUsername} updateProfileData={updateProfileData} />}
              {page === "vocabulary"     && <Vocabulary progress={progress} saveVocabulary={saveVocabulary} updateProfileData={updateProfileData} onPractice={() => setPage("flashcards")} />}
              {page === "flashcards"     && <Flashcards vocabulary={progress.vocabulary} onBack={() => setPage("vocabulary")} />}
              {page === "analytics"      && <Analytics progress={progress} scores={scores} />}
              {page === "community"      && <Community user={user} progress={progress} />}
              {page === "messages"       && <Messages user={user} onBack={() => setPage("dash")} />}
            </motion.div>
          </AnimatePresence>
          {showPremiumModal && <PremiumModal user={user} isPremium={isPremActive} premiumExpire={dbUser?.premiumExpire} onClose={() => setShowPremiumModal(false)} />}
        </div>
      </div>
    </div>
  );
}