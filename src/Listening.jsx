// Listening.jsx — CEFR Center
import React, { useState, useEffect, useRef, useCallback } from "react";
import { scoreToCEFR } from "./scoring";

const MAX_SCORE = 75;
const TOTAL_TIME = 45 * 60; // 45 mins total
const PREP_SECONDS = 30;

const getAssetUrl = (path, isImage = false) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (isImage && path.includes("archive.org")) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(path)}`;
    }
    return path;
  }
  return `${window.location.origin}${path}`;
};

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, flexShrink: 0, display: "inline-block", verticalAlign: "middle" };
  const icons = {
    play:  <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    pause: <svg style={st} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    clock: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    head:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
    chR:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    chL:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    chD:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    exit:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    flag:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    alert: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    map:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>,
    coin:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 15a2.5 2.5 0 005 0"/></svg>,
  };
  return icons[n] || null;
}

const PART_COLORS = {
  mcq_short: "#378ADD",
  note:      "#1D9E75",
  matching:  "#D4537E",
  map:       "#7F77DD",
  mcq:       "#EF9F27",
  lecture:   "#D85A30",
};

function norm(str) {
  return (str || "").toLowerCase().trim().replace(/[''`]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
}
function isCorrect(userAns, correct, alts = []) {
  if (!userAns || userAns === "") return false;
  const n1 = norm(userAns);
  return n1 === norm(correct) || (alts || []).map(norm).includes(n1);
}
function calcPartScore(part, getA) {
  let correct = 0, total = 0;
  if (part.type === "mcq_short" || part.type === "mcq") {
    (part.questions || []).forEach((q, i) => {
      total++;
      const v = getA(part.id, i);
      if (v !== "" && v !== null && v !== undefined && Number(v) === q.answer) correct++;
    });
  } else if (part.type === "note" || part.type === "lecture") {
    (part.notes || []).filter(n => n.answer !== null && n.answer !== undefined).forEach((note, i) => {
      total++;
      if (isCorrect(getA(part.id, i), note.answer, note.alt)) correct++;
    });
  } else if (part.type === "matching" || part.type === "map") {
    (part.questions || []).forEach((q, i) => {
      total++;
      if (norm(getA(part.id, i)) === norm(q.answer)) correct++;
    });
  }
  return { correct, total };
}

function BlankInput({ value, onChange, color, width = 130 }) {
  const [focused, setFocused] = useState(false);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", position: "relative", verticalAlign: "middle", margin: "0 3px" }}>
      <input
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width,
          background: focused ? `${color}10` : "transparent",
          border: "none",
          borderBottom: `2px solid ${focused ? color : color + "55"}`,
          borderRadius: focused ? "4px 4px 0 0" : 0,
          padding: "3px 8px 2px",
          color: "#f0f4ff",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "all .2s",
          textAlign: "center"
        }}
        placeholder="· · ·"
      />
    </span>
  );
}

function Timer({ seconds }) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  const low = seconds < 300;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: low ? "rgba(225,29,72,.1)" : "rgba(255,255,255,.05)", border: `1px solid ${low ? "rgba(225,29,72,.3)" : "rgba(255,255,255,.1)"}`, borderRadius: 8, padding: "5px 12px" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <Ic n="clock" s={13} c={low ? "#e11d48" : "#8b9bbf"} />
      <span style={{ fontSize: 14, fontWeight: 800, color: low ? "#e11d48" : "#f0f4ff", animation: low ? "blink 1s infinite" : "none", fontVariantNumeric: "tabular-nums" }}>{m}:{s}</span>
    </div>
  );
}

function PrepCountdown({ partId, onDone }) {
  const [sec, setSec] = useState(PREP_SECONDS);
  useEffect(() => {
    setSec(PREP_SECONDS);
    const t = setInterval(() => setSec(s => { if (s <= 1) { clearInterval(t); onDone(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [partId]);
  const pct = ((PREP_SECONDS - sec) / PREP_SECONDS) * 100;
  const urgent = sec <= 10;
  const col = urgent ? "#EF9F27" : "#378ADD";
  return (
    <div style={{ background: urgent ? "rgba(239,159,39,.06)" : "rgba(55,138,221,.05)", border: `1px solid ${urgent ? "rgba(239,159,39,.3)" : "rgba(55,138,221,.2)"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: `conic-gradient(${col} ${pct * 3.6}deg, rgba(255,255,255,.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: urgent ? "#1f1500" : "#0f1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: col }}>{sec}</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff", marginBottom: 2 }}>Preparation Time</p>
          <p style={{ fontSize: 11, color: urgent ? "#fac775" : "#8b9bbf" }}>{sec > 0 ? "Read your questions carefully!" : "Time's up! Press Play."}</p>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 2, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

function QBadge({ num, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, background: `${color}20`, padding: "1px 6px", borderRadius: 4, margin: "0 3px", verticalAlign: "middle", flexShrink: 0 }}>{num}</span>
  );
}

// ── INLINE NOTE RENDERER ────────────────────────────────────────────────────
// Renders note labels with ___ as inline blank inputs.
// If label contains ___, the blank is inserted at that position.
// Otherwise, the blank is appended at the end.
function NoteInline({ label, qNum, ansIdx, curId, pColor, getA, setA }) {
  // Split by 2+ underscores (blank marker)
  const parts = label.split(/_{2,}/);

  const inputEl = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, verticalAlign: "middle" }}>
      <QBadge num={qNum} color={pColor} />
      <BlankInput
        value={getA(curId, ansIdx)}
        onChange={e => setA(curId, ansIdx, e.target.value)}
        color={pColor}
        width={130}
      />
    </span>
  );

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "2px 2px",
      padding: "7px 0",
      lineHeight: 2.2,
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }}>
      <span style={{ color: pColor, marginRight: 5, fontSize: 16, flexShrink: 0 }}>•</span>
      {parts.length === 1 ? (
        // No ___ in label → blank at end
        <>
          <span style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.8 }}>{parts[0]}</span>
          {inputEl}
        </>
      ) : (
        // ___ found → split and insert blank inline
        parts.map((part, pi) => (
          <React.Fragment key={pi}>
            {part && (
              <span style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.8 }}>{part}</span>
            )}
            {pi < parts.length - 1 && inputEl}
          </React.Fragment>
        ))
      )}
    </div>
  );
}

function AudioPlayer({ audioUrl, partLabel, partType, onEnded, onError, onPlay, alreadyPlayed }) {
  const [status, setStatus]     = useState(alreadyPlayed ? "ended" : "idle");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef    = useRef(null);
  const hasPlayedRef = useRef(alreadyPlayed);
  const rafRef      = useRef(null);
  const color = PART_COLORS[partType] || "#378ADD";
  const fullUrl = getAssetUrl(audioUrl);

  useEffect(() => {
    if (alreadyPlayed) { setStatus("ended"); hasPlayedRef.current = true; }
  }, [alreadyPlayed]);

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const updateProgress = () => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(a.currentTime);
    if (!a.paused && !a.ended) rafRef.current = requestAnimationFrame(updateProgress);
  };

  const play = () => {
    if (hasPlayedRef.current || alreadyPlayed || status !== "idle") return;
    onPlay?.();
    hasPlayedRef.current = true;
    setStatus("loading");
    const a = new Audio();
    a.src = fullUrl;
    audioRef.current = a;
    a.onloadedmetadata = () => { if (a.duration && isFinite(a.duration)) setDuration(a.duration); };
    a.oncanplay = () => { if (a.duration && isFinite(a.duration)) setDuration(a.duration); setStatus("playing"); };
    a.ontimeupdate = () => { setProgress(a.currentTime); if (a.duration && isFinite(a.duration) && duration === 0) setDuration(a.duration); };
    a.onplay = () => { setStatus("playing"); rafRef.current = requestAnimationFrame(updateProgress); };
    a.onended = () => { setStatus("ended"); setProgress(a.duration || 0); if (rafRef.current) cancelAnimationFrame(rafRef.current); onEnded?.(); };
    a.onerror = () => { setStatus("error"); onError?.(`Cannot load audio: ${fullUrl}`); };
    a.play().catch(() => { setStatus("error"); onError?.("Autoplay blocked or media error."); });
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return "00:00";
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const isPlaying = status === "playing";
  const isEnded   = status === "ended" || alreadyPlayed;
  const isLoading = status === "loading";

  return (
    <div style={{ background: isEnded ? "rgba(29,158,117,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${isPlaying ? color : isEnded ? "#1D9E7540" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
      <style>{`@keyframes waveBeat{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}} @keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.35}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={play}
          disabled={status !== "idle" || alreadyPlayed}
          style={{ width: 44, height: 44, borderRadius: 10, border: "none", flexShrink: 0, background: isEnded ? "rgba(29,158,117,0.15)" : isPlaying ? `${color}22` : color, display: "flex", alignItems: "center", justifyContent: "center", cursor: status === "idle" && !alreadyPlayed ? "pointer" : "not-allowed", transition: "all .2s" }}>
          {isPlaying
            ? <div style={{ display: "flex", gap: 2, alignItems: "center", height: 18 }}>
                {[8,14,10,16,8].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: color, animation: `waveBeat .6s ${i * 0.1}s ease-in-out infinite`, transformOrigin: "center" }} />
                ))}
              </div>
            : isLoading
              ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />
              : isEnded
                ? <Ic n="check" s={18} c="#1D9E75" />
                : <Ic n="play" s={16} c="#fff" />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partLabel}</span>
            {isPlaying && <span style={{ fontSize: 9, background: `${color}22`, color, padding: "2px 8px", borderRadius: 20, fontWeight: 800, animation: "livePulse 1.4s infinite", border: `1px solid ${color}44`, flexShrink: 0, marginLeft: 8 }}>● Playing</span>}
            {isEnded   && <span style={{ fontSize: 9, background: "rgba(29,158,117,.15)", color: "#1D9E75", padding: "2px 8px", borderRadius: 20, fontWeight: 800, flexShrink: 0, marginLeft: 8, border: "1px solid rgba(29,158,117,0.3)" }}>✓ Done</span>}
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", overflow: "hidden", position: "relative", marginBottom: 5 }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: isEnded ? "100%" : `${pct}%`, background: isEnded ? "#1D9E75" : color, borderRadius: 2, transition: isPlaying ? "none" : "width .3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a5568", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            <span>{fmt(progress)}</span>
            <span>{duration > 0 ? fmt(duration) : "--:--"}</span>
          </div>
        </div>
      </div>
      {status === "idle" && !alreadyPlayed && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#e11d48", display: "flex", gap: 6, background: "rgba(225,29,72,.06)", borderRadius: 8, padding: "7px 12px", border: "0.5px solid rgba(225,29,72,0.15)" }}>
          <Ic n="alert" s={12} c="#e11d48" />
          <span>Audio plays <strong>only once</strong>. Do not refresh or exit.</span>
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#fac775", background: "rgba(239,159,39,.1)", borderRadius: 8, padding: "7px 12px" }}>
          <strong>Error:</strong> Media not found or blocked.
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Listening({ user, scores, saveScore, addXP, progress, onBack, tests = [] }) {
  const [view, setView]               = useState("list");
  const [selectedTest, setSelectedTest] = useState(null);
  const [partIdx, setPartIdx]         = useState(0);
  const [answers, setAnswers]         = useState({});
  const [timeLeft, setTimeLeft]       = useState(TOTAL_TIME);
  const [audioPlayed, setAudioPlayed] = useState({});
  const [prepDone, setPrepDone]       = useState({});
  const [results, setResults]         = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [showExit, setShowExit]       = useState(false);
  const [error, setError]             = useState("");
  const timerRef = useRef(null);

  const PARTS = selectedTest?.parts || [];
  const cur   = PARTS[partIdx];

  const totalQ = PARTS.reduce((s, p) => {
    if (p.type === "note" || p.type === "lecture") return s + (p.notes || []).filter(n => n.answer !== null && n.answer !== undefined).length;
    return s + (p.questions || []).length;
  }, 0);
  const answeredCount = Object.values(answers).filter(v => v !== "" && v !== null && v !== undefined).length;

  const setA = (pid, qi, val) => setAnswers(prev => ({ ...prev, [`${pid}_${qi}`]: val }));
  const getA = (pid, qi) => { const v = answers[`${pid}_${qi}`]; return v !== undefined && v !== null ? String(v) : ""; };

  useEffect(() => {
    if (view !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); submitAll(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view]);

  const submitAll = useCallback(async () => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    const partResults = PARTS.map(p => {
      const { correct, total } = calcPartScore(p, getA);
      const qResults = [];
      if (p.type === "mcq_short" || p.type === "mcq") {
        (p.questions || []).forEach((q, i) => {
          const ua = getA(p.id, i);
          const ok = ua !== "" && Number(ua) === q.answer;
          qResults.push({ q: q.q, userAnswer: ua !== "" ? q.options[Number(ua)] : "—", correctAnswer: q.options[q.answer], isCorrect: ok });
        });
      } else if (p.type === "note" || p.type === "lecture") {
        (p.notes || []).filter(n => n.answer !== null && n.answer !== undefined).forEach((note, i) => {
          const ua = getA(p.id, i);
          const ok = isCorrect(ua, note.answer, note.alt);
          qResults.push({ q: note.label, userAnswer: ua || "—", correctAnswer: note.answer, isCorrect: ok });
        });
      } else if (p.type === "matching" || p.type === "map") {
        (p.questions || []).forEach((q, i) => {
          const ua = getA(p.id, i);
          const ok = norm(ua) === norm(q.answer);
          qResults.push({ q: q.q, userAnswer: ua || "—", correctAnswer: q.answer, isCorrect: ok });
        });
      }
      const rawScore = total > 0 ? Math.round((correct / total) * 75) : 0;
      return { partId: p.id, label: p.label, title: p.title, type: p.type, rawScore, correct, total, qResults };
    });

    const totalCorrect = partResults.reduce((s, r) => s + r.correct, 0);
    const totalItems   = partResults.reduce((s, r) => s + r.total,   0);
    const overallScore = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 75) : 0;
    const cefrBand     = scoreToCEFR(overallScore, 75);

    partResults.forEach(r => {
      const key    = `t${selectedTest.id}_p${r.partId}`;
      const xpKey  = `listening_${key}`;
      saveScore?.("listening", key, r.rawScore);
      if (!progress?.completed?.[xpKey]) addXP?.(r.rawScore, xpKey, r.rawScore);
    });
    saveScore?.("listening", `t${selectedTest.id}_overall`, overallScore);

    setResults({ parts: partResults, overall: overallScore, totalCorrect, totalItems, cefrBand });
    setSubmitting(false);
    setView("results");
  }, [PARTS, submitting, getA, selectedTest, saveScore, addXP, progress]);

  const startTest = (test) => {
    setSelectedTest(test);
    setPartIdx(0);
    setAnswers({});
    setAudioPlayed({});
    setPrepDone({});
    setTimeLeft(TOTAL_TIME);
    setResults(null);
    setError("");
    setView("intro");
  };

  // ── LIST ──────────────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div style={{ animation: "fadeUp .4s ease" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <Ic n="head" s={20} c="#1D9E75" /> <span style={{ color: "#1D9E75" }}>Listening</span> Practice Tests
          </h2>
          <p style={{ color: "#8b9bbf", fontSize: 13 }}>IELTS-style · 6 parts per test · 35 questions · Auto-graded · Real audio</p>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#8b9bbf", display: "flex", alignItems: "center", gap: 6 }}>
              <Ic n="head" s={12} c="#1D9E75" /> {tests.length} tests available
            </div>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#8b9bbf", display: "flex", alignItems: "center", gap: 6 }}>
              <Ic n="flag" s={12} c="#EF9F27" /> {tests.reduce((s, t) => s + t.totalQuestions, 0)} total questions
            </div>
            {(() => {
              const doneCount = tests.filter(t => scores?.[`listening_t${t.id}_overall`] != null).length;
              return doneCount > 0 ? (
                <div style={{ background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.25)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#1D9E75", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Ic n="check" s={12} c="#1D9E75" /> {doneCount} completed
                </div>
              ) : null;
            })()}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {tests.map(test => {
            const savedScore = scores?.[`listening_t${test.id}_overall`];
            const cefrInfo   = savedScore != null ? scoreToCEFR(savedScore, MAX_SCORE) : null;
            const isDone     = savedScore != null;
            return (
              <div key={test.id} onClick={() => startTest(test)}
                style={{ background: isDone ? "rgba(29,158,117,0.04)" : "#18243a", border: `1px solid ${isDone ? "rgba(29,158,117,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all .15s", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1D9E7577"; e.currentTarget.style.background = isDone ? "rgba(29,158,117,0.08)" : "#1e2d48"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDone ? "rgba(29,158,117,0.3)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.background = isDone ? "rgba(29,158,117,0.04)" : "#18243a"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: isDone ? "#1D9E75" : "rgba(255,255,255,0.05)", border: isDone ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isDone ? <Ic n="check" s={18} c="#fff" /> : <span style={{ fontSize: 13, fontWeight: 800, color: "#8b9bbf" }}>{tests.indexOf(test) + 1}</span>}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff", marginBottom: 3 }}>{test.title}</h3>
                    <p style={{ fontSize: 12, color: "#8b9bbf" }}>{test.level} · {test.totalQuestions} questions · ~{test.duration} min</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {cefrInfo && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: cefrInfo.color }}>{savedScore}/{MAX_SCORE}</div>
                      <div style={{ fontSize: 10, color: cefrInfo.color, fontWeight: 600 }}>{cefrInfo.cefr} · Band {cefrInfo.band}</div>
                    </div>
                  )}
                  <Ic n="chR" s={14} c="#8b9bbf" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (view === "intro") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 28, maxWidth: 460, width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f0f4ff", marginBottom: 4 }}>{selectedTest.title}</h2>
          <p style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 20 }}>{selectedTest.level} · {selectedTest.totalQuestions} questions · {selectedTest.duration} minutes</p>
          <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#EF9F27", marginBottom: 8, textTransform: "uppercase" }}>Rules</p>
            {["30 seconds preparation time per part","Audio plays ONCE — no pause, no restart","Answer while audio is playing","All 6 parts must be completed in order","Score is calculated like real IELTS"].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
                <Ic n="chR" s={12} c="#1D9E75" />
                <span style={{ fontSize: 12, color: "#c8d4f0" }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(55,138,221,.05)", border: "1px solid rgba(55,138,221,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#378ADD", marginBottom: 8 }}>TEST STRUCTURE</p>
            {selectedTest.parts.map(p => (
              <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: PART_COLORS[p.type], background: `${PART_COLORS[p.type]}18`, padding: "1px 6px", borderRadius: 4 }}>P{p.id}</span>
                <span style={{ fontSize: 12, color: "#8b9bbf" }}>{p.title}</span>
                <span style={{ fontSize: 11, color: "#4a5568", marginLeft: "auto" }}>Q{p.questionRange}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setView("test")} style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", background: "#1D9E75", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ic n="play" s={14} c="#fff" /> Start Test
          </button>
          <button onClick={() => setView("list")} style={{ background: "transparent", border: "none", color: "#8b9bbf", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, margin: "0 auto" }}>
            <Ic n="chL" s={13} c="#8b9bbf" /> Back to list
          </button>
        </div>
      </div>
    );
  }

  // ── TEST ──────────────────────────────────────────────────────────────────────
  if (view === "test" && cur) {
    const isPrepped     = prepDone[cur.id];
    const pColor        = PART_COLORS[cur.type] || "#378ADD";
    const isAudioPlayed = !!audioPlayed[cur.id];
    const startQNum     = parseInt((cur.questionRange || "1").split(/[–\-]/)[0]) || 1;
    const fullMapUrl    = cur.mapImage ? getAssetUrl(cur.mapImage, true) : null;

    return (
      <div style={{ animation: "fadeUp .3s ease", maxWidth: 760, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Exit modal */}
        {showExit && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 28, maxWidth: 360 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f0f4ff", marginBottom: 10 }}>Exit test?</h3>
              <p style={{ fontSize: 13, color: "#8b9bbf", marginBottom: 20 }}>You answered <strong>{answeredCount}/{totalQ}</strong> questions. All progress will be <strong style={{ color: "#e11d48" }}>lost</strong>.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowExit(false)} style={{ flex: 1, padding: 11, borderRadius: 9, border: "1px solid rgba(255,255,255,.15)", background: "transparent", color: "#f0f4ff", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={() => setView("list")}   style={{ flex: 1, padding: 11, borderRadius: 9, border: "none", background: "#e11d48", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Exit</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.07)", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => setShowExit(true)} style={{ background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontSize: 13 }}>
            <Ic n="exit" s={14} c="#8b9bbf" /> Exit
          </button>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {PARTS.map((p, i) => (
              <button key={p.id} onClick={() => setPartIdx(i)}
                style={{ padding: "4px 10px", borderRadius: 7, border: partIdx === i ? `1px solid ${PART_COLORS[p.type]}` : "1px solid rgba(255,255,255,.1)", background: partIdx === i ? `${PART_COLORS[p.type]}22` : "transparent", color: audioPlayed[p.id] ? "#5dcaa5" : partIdx === i ? PART_COLORS[p.type] : "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                P{p.id} {audioPlayed[p.id] && <Ic n="check" s={10} c="#5dcaa5" />}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Timer seconds={timeLeft} />
            <span style={{ fontSize: 12, color: "#8b9bbf", background: "rgba(255,255,255,.05)", padding: "4px 9px", borderRadius: 6 }}>{answeredCount}/{totalQ}</span>
          </div>
        </div>

        {/* Part title bar */}
        <div style={{ background: `${pColor}0d`, border: `1px solid ${pColor}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: pColor, background: `${pColor}20`, padding: "2px 8px", borderRadius: 5 }}>PART {cur.id} of {PARTS.length}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{cur.title}</span>
            <span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: "auto" }}>Q {cur.questionRange}</span>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.6 }}>{cur.subtitle}</p>
        </div>

        {/* Prep / Audio */}
        {!isPrepped
          ? <PrepCountdown key={`prep_${cur.id}`} partId={cur.id} onDone={() => setPrepDone(p => ({ ...p, [cur.id]: true }))} />
          : <AudioPlayer  key={`audio_${cur.id}`} audioUrl={cur.audioUrl} partLabel={`Part ${cur.id} — ${cur.title}`} partType={cur.type} onPlay={() => setAudioPlayed(p => ({ ...p, [cur.id]: true }))} onError={setError} alreadyPlayed={isAudioPlayed} />
        }
        {error && <div style={{ background: "rgba(225,29,72,.1)", border: "1px solid #e11d48", borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: "#f87171", fontSize: 13 }}>{error}</div>}

        {/* Map image */}
        {cur.type === "map" && fullMapUrl && (
          <div style={{ background: `${pColor}0d`, border: `1px solid ${pColor}33`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Ic n="map" s={14} c={pColor} />
                <span style={{ fontSize: 13, fontWeight: 800, color: pColor, textTransform: "uppercase" }}>Map Layout</span>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Part {cur.id} Reference</span>
            </div>
            <div style={{ background: "#050a14", borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.1)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, minHeight: 200 }}>
              <img src={fullMapUrl} alt="Map Reference"
                style={{ maxWidth: "100%", maxHeight: 450, objectFit: "contain", borderRadius: 4 }}
                onError={e => { e.target.style.display = "none"; const fb = e.target.parentElement; if (fb) fb.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b"><p>Map image failed to load.</p></div>`; }}
              />
            </div>
          </div>
        )}

        {/* Matching options box */}
        {cur.type === "matching" && cur.matchOptions && (
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 8, textTransform: "uppercase" }}>Options (2 are extra)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {cur.matchOptions.map(opt => <div key={opt.key} style={{ fontSize: 13, color: "#c8d4f0", padding: "3px 0" }}>{opt.label}</div>)}
            </div>
          </div>
        )}

        {/* Map options box */}
        {cur.type === "map" && cur.mapOptions && (
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 6, textTransform: "uppercase" }}>Letters A–H (3 are extra)</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cur.mapOptions.map(opt => <span key={opt.key} style={{ fontSize: 13, fontWeight: 700, color: "#c8d4f0", background: "rgba(255,255,255,.04)", padding: "4px 10px", borderRadius: 6 }}>{opt.label}</span>)}
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "18px 18px", marginBottom: 14 }}>

          {/* MCQ Short */}
          {cur.type === "mcq_short" && (
            <div>
              {cur.questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(255,255,255,.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <QBadge num={startQNum + i} color={pColor} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5, flex: 1 }}>{q.q}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {q.options.map((opt, j) => {
                      const sel = getA(cur.id, i) !== "" && Number(getA(cur.id, i)) === j;
                      return (
                        <div key={j} onClick={() => setA(cur.id, i, j)}
                          style={{ padding: "9px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, border: sel ? `2px solid ${pColor}` : "1px solid rgba(255,255,255,.07)", background: sel ? `${pColor}15` : "rgba(255,255,255,.01)", color: sel ? "#f0f4ff" : "#8b9bbf", transition: "all .12s", display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: sel ? pColor : "rgba(255,255,255,.06)", color: sel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: sel ? "none" : "1px solid rgba(255,255,255,.15)" }}>{String.fromCharCode(65 + j)}</div>
                          <span style={{ lineHeight: 1.4 }}>{opt.replace(/^[ABC]\) /, "")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── NOTE (inline blank rendering) ── */}
          {cur.type === "note" && (
            <div>
              {cur.context && (
                <div style={{ textAlign: "center", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f0f4ff" }}>{cur.context}</h3>
                </div>
              )}
              <div>
                {(() => {
                  let ansIdx = 0;
                  return (cur.notes || []).map((note, i) => {
                    // Static display note (no blank)
                    if (note.display === false || note.answer === null || note.answer === undefined) {
                      return (
                        <div key={i} style={{ fontSize: 13, color: "#6b7a99", padding: "5px 0 5px 18px", fontStyle: "italic", borderBottom: "1px solid rgba(255,255,255,.03)", lineHeight: 1.7 }}>
                          {note.label}
                        </div>
                      );
                    }
                    const ai = ansIdx++;
                    const qNum = note.qNum !== undefined ? note.qNum : (startQNum + ai);
                    return (
                      <NoteInline
                        key={i}
                        label={note.label}
                        qNum={qNum}
                        ansIdx={ai}
                        curId={cur.id}
                        pColor={pColor}
                        getA={getA}
                        setA={setA}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ── LECTURE (inline blank rendering) ── */}
          {cur.type === "lecture" && (
            <div>
              {cur.topic && (
                <div style={{ textAlign: "center", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f0f4ff", letterSpacing: 1 }}>{cur.topic}</h3>
                </div>
              )}
              <div>
                {(() => {
                  let ansIdx = 0;
                  return (cur.notes || []).map((note, i) => {
                    // Static display note (no blank)
                    if (note.display === false || note.answer === null || note.answer === undefined) {
                      return (
                        <div key={i} style={{ fontSize: 13, color: "#6b7a99", padding: "6px 0 6px 18px", lineHeight: 1.7, borderBottom: "1px solid rgba(255,255,255,.03)" }}>
                          {note.label}
                        </div>
                      );
                    }
                    const ai = ansIdx++;
                    const qNum = note.qNum !== undefined ? note.qNum : (startQNum + ai);
                    return (
                      <NoteInline
                        key={i}
                        label={note.label}
                        qNum={qNum}
                        ansIdx={ai}
                        curId={cur.id}
                        pColor={pColor}
                        getA={getA}
                        setA={setA}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Matching */}
          {cur.type === "matching" && (
            <div>
              {(cur.questions || []).map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < cur.questions.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <QBadge num={q.qNum} color={pColor} />
                    <span style={{ fontSize: 13, color: "#f0f4ff", lineHeight: 1.4 }}>{q.q}</span>
                  </div>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <select value={getA(cur.id, i)} onChange={e => setA(cur.id, i, e.target.value)}
                      style={{ background: "#0d1624", border: `1.5px solid ${getA(cur.id, i) ? pColor : "rgba(255,255,255,.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getA(cur.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 110, appearance: "none", transition: "border-color .2s" }}>
                      <option value="">Select</option>
                      {(cur.matchOptions || []).map(opt => <option key={opt.key} value={opt.key}>{opt.key}</option>)}
                    </select>
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Ic n="chD" s={11} c="#8b9bbf" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map */}
          {cur.type === "map" && (
            <div>
              {(cur.questions || []).map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < cur.questions.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <QBadge num={q.qNum} color={pColor} />
                    <span style={{ fontSize: 13, color: "#f0f4ff", lineHeight: 1.4 }}>{q.q}</span>
                  </div>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <select value={getA(cur.id, i)} onChange={e => setA(cur.id, i, e.target.value)}
                      style={{ background: "#0d1624", border: `1.5px solid ${getA(cur.id, i) ? pColor : "rgba(255,255,255,.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getA(cur.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 110, appearance: "none" }}>
                      <option value="">Select</option>
                      {(cur.mapOptions || []).map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                    </select>
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Ic n="chD" s={11} c="#8b9bbf" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MCQ (extracts) */}
          {cur.type === "mcq" && (
            <div>
              {(cur.extractLabels || []).map((extractLabel, ei) => {
                const extractQs = cur.questions.filter(q => q.extract === extractLabel);
                return (
                  <div key={ei} style={{ marginBottom: 20 }}>
                    <div style={{ background: `${pColor}0d`, border: `1px solid ${pColor}22`, borderRadius: 8, padding: "6px 12px", marginBottom: 12, display: "inline-block" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: pColor }}>{extractLabel}</p>
                    </div>
                    {extractQs.map(q => {
                      const globalIdx = cur.questions.findIndex(gq => gq === q);
                      const sel = getA(cur.id, globalIdx);
                      return (
                        <div key={globalIdx} style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(255,255,255,.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                            <QBadge num={q.qNum || (startQNum + globalIdx)} color={pColor} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5, flex: 1 }}>{q.q}</p>
                          </div>
                          {q.options.map((opt, oi) => {
                            const isSel = sel !== "" && Number(sel) === oi;
                            return (
                              <div key={oi} onClick={() => setA(cur.id, globalIdx, oi)}
                                style={{ padding: "9px 14px", borderRadius: 9, marginBottom: 6, cursor: "pointer", fontSize: 13, border: isSel ? `2px solid ${pColor}` : "1px solid rgba(255,255,255,.07)", background: isSel ? `${pColor}15` : "rgba(255,255,255,.01)", color: isSel ? "#f0f4ff" : "#8b9bbf", transition: "all .15s", display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: isSel ? pColor : "rgba(255,255,255,.06)", color: isSel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", border: isSel ? "none" : "1px solid rgba(255,255,255,.2)" }}>{String.fromCharCode(65 + oi)}</div>
                                <span style={{ lineHeight: 1.4 }}>{opt.replace(/^[ABC]\) /, "")}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setPartIdx(p => Math.max(0, p - 1))} disabled={partIdx === 0}
            style={{ background: "transparent", border: "none", color: partIdx === 0 ? "#2d3a4f" : "#8b9bbf", cursor: partIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <Ic n="chL" s={14} c={partIdx === 0 ? "#2d3a4f" : "#8b9bbf"} /> Prev
          </button>
          {partIdx < PARTS.length - 1
            ? <button onClick={() => setPartIdx(p => p + 1)}
                style={{ background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                Next <Ic n="chR" s={14} c="#8b9bbf" />
              </button>
            : <button onClick={submitAll} disabled={submitting}
                style={{ background: submitting ? "#1e293b" : "#1D9E75", border: "none", color: submitting ? "#4a5568" : "#fff", padding: "11px 22px", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                {submitting
                  ? <><span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} /> Submitting...</>
                  : <><Ic n="flag" s={14} c="#fff" /> Submit Test</>}
              </button>
          }
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────────
  if (view === "results" && results) {
    const { overall, totalCorrect, totalItems, cefrBand, parts } = results;
    return (
      <div style={{ animation: "fadeUp .4s ease", maxWidth: 720, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Score card */}
        <div style={{ background: "linear-gradient(135deg,#0f1f35,#182d45)", border: `1px solid ${cefrBand.color}44`, borderRadius: 16, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#8b9bbf", marginBottom: 12 }}>{selectedTest.title}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 48, fontWeight: 800, color: cefrBand.color, lineHeight: 1 }}>{overall}</div><div style={{ fontSize: 12, color: "#8b9bbf" }}>out of {MAX_SCORE}</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: cefrBand.color, lineHeight: 1 }}>{cefrBand.band}</div><div style={{ fontSize: 12, color: "#8b9bbf" }}>Band Score</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: cefrBand.color, lineHeight: 1 }}>{cefrBand.cefr}</div><div style={{ fontSize: 12, color: "#8b9bbf" }}>CEFR Level</div></div>
          </div>
          <div style={{ fontSize: 13, color: "#8b9bbf", marginBottom: 12 }}>{totalCorrect} correct of {totalItems} questions</div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((overall / MAX_SCORE) * 100)}%`, background: cefrBand.color, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Part Breakdown</p>
        {parts.map(r => {
          const pc = PART_COLORS[r.type] || "#378ADD";
          return (
            <div key={r.partId} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,.07)", borderRadius: 11, padding: "13px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: pc, background: `${pc}18`, padding: "2px 7px", borderRadius: 4 }}>P{r.partId}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{r.title}</span>
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: r.rawScore >= MAX_SCORE * 0.6 ? "#1D9E75" : "#e11d48" }}>{r.rawScore}/{MAX_SCORE}</span>
                  <span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: 5 }}>({r.correct}/{r.total}✓)</span>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.07)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${Math.round((r.rawScore / MAX_SCORE) * 100)}%`, background: r.rawScore >= MAX_SCORE * 0.6 ? "#1D9E75" : "#e11d48", borderRadius: 2 }} />
              </div>
              {r.qResults.map((qr, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < r.qResults.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{qr.isCorrect ? <Ic n="check" s={13} c="#1D9E75" /> : <Ic n="x" s={13} c="#e11d48" />}</span>
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <span style={{ color: "#8b9bbf" }}>{(qr.q || "").slice(0, 60)}{(qr.q || "").length > 60 ? "..." : ""}</span>
                    {!qr.isCorrect && <span style={{ color: "#f87171" }}> → You: <em>{qr.userAnswer}</em> · Correct: <strong style={{ color: "#5dcaa5" }}>{qr.correctAnswer}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <button onClick={() => setView("list")} style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", background: "#1D9E75", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Ic n="chL" s={14} c="#fff" /> Back to Tests
        </button>
      </div>
    );
  }

  return null;
}