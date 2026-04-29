// Speaking.jsx — v17 — FIXED: sequential questions, correct timings, dual scoring, backend API
import React, { useState, useRef, useEffect, useCallback } from "react";

import BACKEND_URL from "./config/api.js";

const STYLES = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes voicePulse { 0% { transform: scaleY(1); } 50% { transform: scaleY(1.8); } 100% { transform: scaleY(1); } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
function I({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const m = {
    mic:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    play:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    stop:  <svg style={st} viewBox="0 0 24 24" fill={c}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    back:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    next:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    star:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    bolt:  <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    brain: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  };
  return m[n] || null;
}

const TING_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

function getTTS(t) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(t)}`;
}

function playTing() {
  new Audio(TING_URL).play().catch(() => {});
}

function playTTS(t) {
  if (!t) return;
  const a = new Audio(getTTS(t));
  a.play().catch(() => {});
  return a;
}

// ─── Score → band/color mapping ───────────────────────────────────────────────
function overallToBand(overall) {
  const pct = overall / 75;
  if (pct >= 0.87) return { band: "9.0", cefr: "C2", color: "#D4537E" };
  if (pct >= 0.83) return { band: "8.5", cefr: "C2", color: "#D4537E" };
  if (pct >= 0.79) return { band: "8.0", cefr: "C1", color: "#7F77DD" };
  if (pct >= 0.75) return { band: "7.5", cefr: "C1", color: "#7F77DD" };
  if (pct >= 0.67) return { band: "7.0", cefr: "C1", color: "#7F77DD" };
  if (pct >= 0.60) return { band: "6.5", cefr: "B2", color: "#D85A30" };
  if (pct >= 0.54) return { band: "6.0", cefr: "B2", color: "#D85A30" };
  if (pct >= 0.46) return { band: "5.5", cefr: "B1", color: "#EF9F27" };
  if (pct >= 0.40) return { band: "5.0", cefr: "B1", color: "#EF9F27" };
  if (pct >= 0.33) return { band: "4.5", cefr: "A2", color: "#1D9E75" };
  return                  { band: "4.0", cefr: "A1", color: "#378ADD" };
}

const CRIT_MAX = 18.75; // 75 / 4

const CRITERIA = [
  { key: "fluency",       label: "Fluency & Coherence",  color: "#4a9eff" },
  { key: "vocabulary",    label: "Lexical Resource",      color: "#1D9E75" },
  { key: "grammar",       label: "Grammatical Range",     color: "#EF9F27" },
  { key: "pronunciation", label: "Pronunciation",         color: "#D4537E" },
];

// ─── Client-side heuristic scorer ─────────────────────────────────────────────
function clientScore(transcript) {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wc = words.length;

  // STRICT: If no English words or too short, return 0
  const englishCheck = /[a-zA-Z]{2,}/;
  if (wc < 4 || !englishCheck.test(transcript)) {
    return { fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0 };
  }

  // Unique word ratio → vocabulary
  const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ""))).size;
  const uniqueRatio = unique / wc;

  // Connectors → fluency
  const connectors = ["however","moreover","furthermore","therefore","although","because","since","while","whereas","consequently","nevertheless","additionally","in addition","on the other hand","for instance","for example"];
  const connectorCount = connectors.filter(c => transcript.toLowerCase().includes(c)).length;

  // Long words → vocabulary
  const longWords = words.filter(w => w.length > 7).length;

  // Sentence variety → grammar
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const avgSentLen = wc / Math.max(sentences.length, 1);

  // Scoring (each 0-25)
  const fluency = Math.min(25, Math.round(
    (Math.min(wc, 150) / 150) * 12 +
    Math.min(connectorCount * 2, 8) +
    (avgSentLen > 5 && avgSentLen < 25 ? 5 : 2)
  ));
  const vocabulary = Math.min(25, Math.round(
    uniqueRatio * 12 +
    (longWords / Math.max(wc, 1)) * 30 +
    Math.min(connectorCount, 3) * 1.5
  ));
  const grammar = Math.min(25, Math.round(
    (sentences.length > 2 ? 8 : 4) +
    (avgSentLen >= 8 && avgSentLen <= 20 ? 10 : 5) +
    Math.min(wc / 10, 7)
  ));
  const pronunciation = Math.min(25, Math.round(10 + uniqueRatio * 8 + Math.min(wc / 20, 7)));

  return { fluency, vocabulary, grammar, pronunciation };
}

function CriterionBar({ crit, score }) {
  const pct = Math.round((score / 25) * 100);
  const label = score >= 21 ? "Excellent" : score >= 17 ? "Good" : score >= 13 ? "Fair" : "Needs Work";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#c8d4f0", fontWeight: 600 }}>{crit.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: crit.color, background: `${crit.color}18`, padding: "1px 8px", borderRadius: 10, fontWeight: 700 }}>{label}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: crit.color }}>{score}<span style={{ fontSize: 11, color: "#4a5568" }}>/{CRIT_MAX}</span></span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, Math.round((score / CRIT_MAX) * 100))}%`, background: crit.color, borderRadius: 3, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

// ─── REAL AUDIO WAVEFORM ──────────────────────────────────────────────────────
function AudioWaveform({ isRecording }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const BAR_COUNT = 40;

  useEffect(() => {
    if (!isRecording) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e){} }
      analyserRef.current = null; streamRef.current = null; audioCtxRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const W = canvas.width, H = canvas.height;
        const barW = Math.floor(W / BAR_COUNT) - 2;
        for (let i = 0; i < BAR_COUNT; i++) {
          const x = i * (barW + 2) + 1;
          ctx.fillStyle = "rgba(74,158,255,0.2)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, (H - 2) / 2, barW, 2, 1);
          else ctx.rect(x, (H - 2) / 2, barW, 2);
          ctx.fill();
        }
      }
      return;
    }
    let active = true;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.7;
        analyserRef.current = analyser;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const dataArr = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
          if (!active || !analyserRef.current) return;
          animRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArr);
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          const W = canvas.width, H = canvas.height;
          ctx.clearRect(0, 0, W, H);
          const barW = Math.floor(W / BAR_COUNT) - 2;
          for (let i = 0; i < BAR_COUNT; i++) {
            const val = dataArr[Math.floor((i / BAR_COUNT) * Math.min(dataArr.length, BAR_COUNT))] / 255;
            const barH = Math.max(2, val * H * 0.92);
            const x = i * (barW + 2) + 1;
            const r = Math.round(val * 180), g = Math.round(140 + val * 60), b = Math.round(255 - val * 180);
            ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x, (H - barH) / 2, barW, barH, 2);
            else ctx.rect(x, (H - barH) / 2, barW, barH);
            ctx.fill();
          }
        };
        draw();
      })
      .catch(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const fb = () => {
          if (!active) return;
          animRef.current = requestAnimationFrame(fb);
          const ctx = canvas.getContext("2d");
          const W = canvas.width, H = canvas.height;
          ctx.clearRect(0, 0, W, H);
          const barW = Math.floor(W / BAR_COUNT) - 2;
          const t = Date.now() / 300;
          for (let i = 0; i < BAR_COUNT; i++) {
            const val = 0.1 + 0.12 * Math.abs(Math.sin(t + i * 0.5));
            const barH = Math.max(2, val * H);
            const x = i * (barW + 2) + 1;
            ctx.fillStyle = "rgba(74,158,255,0.5)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x, (H - barH) / 2, barW, barH, 2);
            else ctx.rect(x, (H - barH) / 2, barW, barH);
            ctx.fill();
          }
        };
        fb();
      });
    return () => {
      active = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e){} }
    };
  }, [isRecording]);

  return (
    <canvas ref={canvasRef} width={320} height={56}
      style={{ display: "block", borderRadius: 10, background: "rgba(0,0,0,0.2)", margin: "0 auto" }}
    />
  );
}

function ProminentVisualizer({ isRecording }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 40 }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ 
          width: 4, 
          height: 12 + Math.random() * 20, 
          background: isRecording ? "#22c55e" : "#334155", 
          borderRadius: 2,
          animation: isRecording ? `voicePulse ${0.4 + Math.random() * 0.4}s infinite ease-in-out` : "none",
          animationDelay: `${i * 0.05}s`
        }} />
      ))}
    </div>
  );
}

// ─── Countdown circle ─────────────────────────────────────────────────────────
function CountdownCircle({ sec, total, color = "#4a9eff", size = 80 }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ * (sec / total);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg style={{ width: size, height: size, transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ - offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.28, fontWeight: 900, color, fontVariantNumeric: "tabular-nums" }}>{sec}</div>
    </div>
  );
}

// ─── Prep Phase ───────────────────────────────────────────────────────────────
function PrepPhase({ total, question, images, pN_main, onEnd }) {
  const [sec, setSec] = useState(total);
  const ref = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setSec(total);
    // Play TTS for question
    if (question) {
      audioRef.current = playTTS(question);
    }
    
    ref.current = setInterval(() => setSec(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => {
      clearInterval(ref.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [total, question]);

  useEffect(() => { 
    if (sec === 0) { 
      clearInterval(ref.current); 
      playTing(); // Ting sound at end of prep
      onEnd?.(); 
    } 
  }, [sec]);

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      {/* Visual Progress Bar (1-2-3) */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 30 }}>
         {[1, 2, 3].map(n => (
           <React.Fragment key={n}>
             <div style={{ 
               width: 50, height: 50, borderRadius: "50%", 
               background: n === pN_main ? "#22c55e" : (n < pN_main ? "rgba(34,197,94,0.3)" : "#334155"), 
               color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
               fontSize: 20, fontWeight: 900, border: n === pN_main ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
               boxShadow: n === pN_main ? "0 0 15px rgba(34,197,94,0.4)" : "none"
             }}>{n}</div>
             {n < 3 && <div style={{ width: 80, height: 4, background: n < pN_main ? "#22c55e" : "#334155" }} />}
           </React.Fragment>
         ))}
      </div>

      <div style={{ background: "#18243a", borderRadius: 16, padding: 30, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20, textAlign: "center" }}>
        {images?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: images.length > 1 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }}>
            {images.map((img, i) => (
              <img key={i} src={img} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14, border: "2px solid rgba(255,255,255,0.1)" }} alt={`img${i+1}`} />
            ))}
          </div>
        )}
        <h3 style={{ fontSize: 24, color: "#f0f4ff", fontWeight: 900, marginBottom: 10, lineHeight: 1.4 }}>{question}</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 140, height: 140 }}>
           <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle cx="70" cy="70" r="65" fill="none" stroke="#4a9eff" strokeWidth="8"
                strokeDasharray={2 * Math.PI * 65} strokeDashoffset={(2 * Math.PI * 65) - (2 * Math.PI * 65 * (sec / total))} />
           </svg>
           <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "#fff" }}>
              {sec}
           </div>
        </div>
        <p style={{ color: "#8b9bbf", fontSize: 13, fontWeight: "bold" }}>PREPARING TO ANSWER...</p>
      </div>
    </div>
  );
}

// ─── Recording Phase ──────────────────────────────────────────────────────────
function RecordPhase({ question, images, pN_main, speakTime, transcript, onDone }) {
  const [sec, setSec] = useState(speakTime);
  const [stopped, setStopped] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSec(speakTime);
    setStopped(false);
    ref.current = setInterval(() => setSec(s => (s <= 1 ? 0 : s-1)), 1000);
    return () => clearInterval(ref.current);
  }, [speakTime, question]);

  useEffect(() => {
    if (sec === 0 && !stopped) {
       clearInterval(ref.current);
       setStopped(true);
       playTing(); // Ting sound at end of speaking
       onDone?.(); // Immediate auto-next for performance
    }
  }, [sec, stopped]);

  const progress = (sec / speakTime) * 100;

  return (
    <div style={{ animation: "slideIn .3s ease" }}>
      {/* Visual Progress Bar (1-2-3) */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 30 }}>
         {[1, 2, 3].map(n => (
           <React.Fragment key={n}>
             <div style={{ 
               width: 50, height: 50, borderRadius: "50%", 
               background: n === pN_main ? "#22c55e" : (n < pN_main ? "rgba(34,197,94,0.3)" : "#334155"), 
               color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
               fontSize: 20, fontWeight: 900, border: n === pN_main ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
               boxShadow: n === pN_main ? "0 0 15px rgba(34,197,94,0.4)" : "none"
             }}>{n}</div>
             {n < 3 && <div style={{ width: 80, height: 4, background: n < pN_main ? "#22c55e" : "#334155" }} />}
           </React.Fragment>
         ))}
      </div>

      <div style={{ background: "#18243a", padding: 30, borderRadius: 20, border: "2px solid #4a9eff55", marginBottom: 20, textAlign: "center" }}>
        {images?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: images.length > 1 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }}>
            {images.map((img, i) => (
              <img key={i} src={img} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 14 }} alt={`img${i+1}`} />
            ))}
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
           <ProminentVisualizer isRecording={!stopped} />
        </div>
        
        <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto" }}>
          <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
            <circle cx="90" cy="90" r="80" fill="none" stroke="#22c55e" strokeWidth="12"
              strokeDasharray={2 * Math.PI * 80} strokeDashoffset={(2 * Math.PI * 80) - (2 * Math.PI * 80 * (sec / speakTime))} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, color: "#fff" }}>
            {sec}
          </div>
        </div>
      </div>

      <div style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", minHeight: 60 }}>
        <span style={{ color: "#4a9eff", fontSize: 11, fontWeight: 800, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Live Listening:</span>
        <span style={{ color: "#f0f4ff", fontSize: 14, lineHeight: 1.6 }}>{transcript || "..."}</span>
      </div>
    </div>
  );
}

// ─── MAIN SPEAKING ─────────────────────────────────────────────────────────────
export default function Speaking({ progress, scores, saveScore, addXP, addCoins, tests = [] }) {
  const [view, setView]         = useState("list");
  const [selTest, setSelTest]   = useState(null);
  const [pIdx, setPIdx]         = useState(0);
  const [phase, setPhase]       = useState("intro"); // intro | prep | recording | submitting | result
  const [qIdx, setQIdx]         = useState(0);       // current question index within part
  const [answers, setAnswers]   = useState({});      // { qId: transcript }
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [transcript, setTranscript] = useState("");

  const recRef        = useRef(null);
  const stopRef       = useRef(null);
  const transcriptRef = useRef("");
  const isStoppedRef  = useRef(false);

  const selPart = selTest ? selTest.parts[pIdx] : null;

  // ── Build flat question list per part type ──────────────────────────────────
  const getQuestions = useCallback(() => {
    if (!selPart) return [];
    
    // PART 1 SPECIAL LOGIC: 6 questions (3 text, 3 images)
    if (selPart.part === 1 || selPart.title?.toLowerCase().includes("part 1")) {
      const qs = selPart.questions || [];
      return [0, 1, 2, 3, 4, 5].map(i => {
        const q = qs[i] || { question: "Tell me more about this topic." };
        let prep = 5;
        let speak = 30;
        let img = [];

        const TrafficImg1 = "https://images.unsplash.com/photo-1545147418-40391217e27e?auto=format&fit=crop&q=80&w=1200";
        const TrafficImg2 = "https://images.unsplash.com/photo-1594910260407-1607f232cc2c?auto=format&fit=crop&q=80&w=1200";
        const BusImg      = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200";

        if (i === 3) { prep = 10; speak = 45; img = [TrafficImg1, TrafficImg2]; }
        else if (i === 4) { prep = 5; speak = 30; img = [TrafficImg1]; }
        else if (i === 5) { prep = 5; speak = 30; img = [BusImg]; }

        return {
          id: `p1_q${i}`,
          question: q.question || q,
          prepTime: prep,
          speakTime: speak,
          images: img,
        };
      });
    }

    const type = selPart.type;

    if (type === "interview") {
      return (selPart.questions || []).map(q => ({
        id: q.id || `q${Math.random()}`,
        question: q.question,
        prepTime: 5,
        speakTime: q.speakTime || 30,
        images: [],
        guidingPoints: q.tips || [],
      }));
    }

    if (type === "comparison") {
      return (selPart.questions || []).map((q, i) => ({
        id: q.id || `cq${i}`,
        question: q.question,
        prepTime: 10,
        speakTime: q.speakTime || 40,
        images: i === 0 ? (selPart.images || []) : [],
        guidingPoints: q.tips || [],
      }));
    }

    if (type === "long_turn") {
      return [{
        id: "lt_main",
        question: selPart.prompt,
        prepTime: 15,
        speakTime: selPart.speakTime || 60,
        images: selPart.images || [],
        guidingPoints: selPart.guidingPoints || [],
      }];
    }

    if (type === "discussion") {
      return [{
        id: "disc_main",
        question: selPart.statement || selPart.prompt,
        prepTime: 60,
        speakTime: selPart.speakTime || 120,
        images: [],
        guidingPoints: [],
        argumentsFor: selPart.argumentsFor,
        argumentsAgainst: selPart.argumentsAgainst,
      }];
    }

    return [{ id: "main", question: selPart.prompt || "Speak...", prepTime: 5, speakTime: 60, images: [] }];
  }, [selPart]);

  const questions = getQuestions();
  const curQ      = questions[qIdx] || questions[0];
  const pc        = selPart?.color || "#4a9eff";

  const isPartDone = (testId, partId) => !!scores?.[`speaking_${testId}_${partId}`];
  const isTestDone = (t) => t.parts.every(p => isPartDone(t.id, p.id));

  const openTest = (t) => {
    setSelTest(t);
    const firstIncomplete = t.parts.findIndex(p => !isPartDone(t.id, p.id));
    setPIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
    setQIdx(0); setAnswers({}); setResult(null); setError("");
    setTranscript(""); transcriptRef.current = "";
    isStoppedRef.current = false;
    setPhase("intro"); setView("part");
  };

  // ── Speech recognition ──────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    isStoppedRef.current = true;
    if (recRef.current) { try { recRef.current.stop(); } catch(e) {} recRef.current = null; }
    clearTimeout(stopRef.current);
  }, []);

  const startRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech Recognition not supported. Use Chrome or Edge."); return; }
    if (recRef.current) { try { recRef.current.stop(); } catch(e) {} recRef.current = null; }

    transcriptRef.current = "";
    setTranscript("");
    isStoppedRef.current = false;

    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      const combined = (final + interim).trim();
      transcriptRef.current = combined;
      setTranscript(combined);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed") setError("Microphone access denied.");
      if (e.error === "no-speech" && !isStoppedRef.current && recRef.current) {
        try { rec.start(); } catch(err) {}
      }
    };

    rec.onend = () => {
      if (!isStoppedRef.current && recRef.current) { try { rec.start(); } catch(err) {} }
    };

    recRef.current = rec;
    try { rec.start(); } catch(e) { setError("Failed to start mic. Check permissions."); }
  }, []);

  // ── User stopped early → save answer for this Q ────────────────────────────
  const handleStopEarly = useCallback(() => {
    stopRecording();
    setAnswers(prev => ({ ...prev, [curQ.id]: transcriptRef.current }));
  }, [stopRecording, curQ]);

  // ── Move to next question or end part ──────────────────────────────────────
  const handleQuestionDone = useCallback(() => {
    const saved = { ...answers, [curQ.id]: transcriptRef.current };
    setAnswers(saved);

    if (qIdx < questions.length - 1) {
      setQIdx(q => q + 1);
      setTranscript(""); transcriptRef.current = "";
      isStoppedRef.current = false;
      setPhase("prep");
    } else {
      // Part done -> show "Next Part" screen
      setPhase("part_done");
    }
  }, [qIdx, questions, curQ, answers]);

  const goToNextPart = () => {
    if (pIdx < selTest.parts.length - 1) {
      const nextIdx = pIdx + 1;
      setPIdx(nextIdx);
      setQIdx(0);
      setTranscript(""); transcriptRef.current = "";
      setPhase("intro");
    } else {
      submitAll(answers);
    }
  };

  // ── Submit final test results (AI) ──────────────────────────────────────────
  const submitAll = useCallback(async (finalAnswers) => {
    setPhase("submitting");

    // Flatten all answers from all parts
    const assessmentQuestions = selTest.parts.flatMap(p => {
       if (p.part === 1 || p.title?.toLowerCase().includes("part 1")) {
         return [0,1,2,3,4,5].map(i => ({ id: `p1_q${i}`, question: p.questions[i]?.question || p.questions[i] }));
       }
       return (p.questions || []).map(q => ({ id: q.id || `q${Math.random()}`, question: q.question }));
    });

    const speakingTranscript = assessmentQuestions.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${finalAnswers[q.id] || "[no response]"}`).join("\n\n");
    const wordCount = speakingTranscript.split(/\s+/).filter(w => w.length > 0).length;

    // Client-side score 
    const clientSc = clientScore(speakingTranscript);
    const clientOverall = clientSc.fluency + clientSc.vocabulary + clientSc.grammar + clientSc.pronunciation;

    const allText = speakingTranscript; 

    try {
      const resp = await fetch(`${BACKEND_URL}/api/ai/speaking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: speakingTranscript,
          partTitle:  selPart.title,
          partKey:    selPart.part || selPart.id,
          partLevel:  selPart.level,
          totalWords: wordCount,
        }),
      });

      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();

      const aiSc = data.scores || { fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0 };

      // Blend AI + client (60% AI, 40% client) for robustness
      const blend = (a, c) => Math.round(a * 0.6 + c * 0.4);
      const blendedSc = {
        fluency:       blend(aiSc.fluency || 0,       clientSc.fluency),
        vocabulary:    blend(aiSc.vocabulary || 0,    clientSc.vocabulary),
        grammar:       blend(aiSc.grammar || 0,       clientSc.grammar),
        pronunciation: blend(aiSc.pronunciation || 0, clientSc.pronunciation),
      };

      const overall = blendedSc.fluency + blendedSc.vocabulary + blendedSc.grammar + blendedSc.pronunciation;
      const bandInfo = overallToBand(overall);

      const finalResult = {
        scores:      blendedSc,
        clientScores: clientSc,
        aiScores:    aiSc,
        overall,
        band:        data.band    || bandInfo.band,
        cefr:        data.cefr    || bandInfo.cefr,
        color:       bandInfo.color,
        critique:    String(data.critique    || "").trim(),
        feedback:    String(data.feedback    || "").trim(),
        modelAnswer: String(data.modelAnswer || "").trim(),
      };

      setResult(finalResult);

      if (overall > 0 && wordCount >= 5) {
        const scoreKey = `${selTest.id}_${selPart.id}`;
        saveScore?.("speaking", scoreKey, overall);
        addXP?.(Math.max(1, Math.round(overall * 0.4)), `speaking_${scoreKey}`);
        addCoins?.(Math.ceil(overall / 20), `Speaking: ${selPart.title}`);
      }

    } catch (e) {
      console.error("Speaking submit error:", e);

      // Fallback: use client score only
      const overall = clientOverall;
      const bandInfo = overallToBand(overall);
      setResult({
        scores: clientSc,
        clientScores: clientSc,
        aiScores: null,
        overall,
        band: bandInfo.band,
        cefr: bandInfo.cefr,
        color: bandInfo.color,
        critique: "AI evaluation unavailable. Score based on transcript analysis.",
        feedback: wordCount < 20 ? "Try to speak more — longer answers score higher." : "Good effort! Check your internet connection for full AI feedback.",
        modelAnswer: "",
      });

      if (wordCount >= 5) {
        const scoreKey = `${selTest.id}_${selPart.id}`;
        saveScore?.("speaking", scoreKey, overall);
        addXP?.(Math.max(1, Math.round(overall * 0.4)), `speaking_${scoreKey}`);
        addCoins?.(Math.ceil(overall / 20), `Speaking: ${selPart.title}`);
      }
    }

    setPhase("result");
  }, [questions, selPart, selTest, saveScore, addXP, addCoins]);

  // ── Start recording when phase = "recording" ───────────────────────────────
  useEffect(() => {
    if (phase === "recording") {
      isStoppedRef.current = false;
      setTranscript(""); transcriptRef.current = "";
      startRec();
    }
    return () => {
      if (phase !== "recording") stopRecording();
    };
  }, [phase, qIdx]); // eslint-disable-line

  const nextPart = () => {
    if (pIdx < selTest.parts.length - 1) {
      setPIdx(p => p + 1); setQIdx(0); setResult(null);
      setTranscript(""); transcriptRef.current = "";
      isStoppedRef.current = false;
      setPhase("intro");
    } else {
      setView("list");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "list") return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{STYLES}</style>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <I n="mic" s={22} c="#D4537E"/> <span style={{ color: "#D4537E" }}>Speaking</span> Assessment
        </h2>
        <p style={{ color: "#8b9bbf", fontSize: 13 }}>Interactive mock tests · AI + client evaluation · Real-time transcript</p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {tests.map((t, ti) => {
          const done = isTestDone(t);
          const allScores = t.parts.map(p => scores?.[`speaking_${t.id}_${p.id}`]).filter(s => s != null);
          const bestScore = allScores.length ? Math.max(...allScores) : null;
          return (
            <div key={t.id} onClick={() => openTest(t)}
              style={{ background: done ? "rgba(212,83,126,0.05)" : "#18243a", border: `1px solid ${done ? "rgba(212,83,126,0.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all .15s", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#D4537E77"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = done ? "rgba(212,83,126,0.35)" : "rgba(255,255,255,0.07)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: done ? "#D4537E" : "rgba(255,255,255,0.05)", border: done ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done ? <I n="check" s={18} c="#fff"/> : <span style={{ fontSize: 13, fontWeight: 800, color: "#8b9bbf" }}>{ti + 1}</span>}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{t.title}</h3>
                    {done && <span style={{ fontSize: 10, background: "rgba(29,158,117,0.15)", color: "#1D9E75", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>✓ Done</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "#8b9bbf" }}>{t.level} · {t.parts?.length || 0} parts · {t.duration}</p>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {t.parts?.map((p, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: isPartDone(t.id, p.id) ? "#1D9E75" : "rgba(255,255,255,0.12)" }}/>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {bestScore != null && <div style={{ fontSize: 14, fontWeight: 800, color: "#D4537E" }}>{bestScore}/75</div>}
                <I n="next" s={14} c="#8b9bbf"/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PART VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "part" && selPart) return (
    <div style={{ animation: "fadeUp .3s ease", maxWidth: 660, margin: "0 auto" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => { stopRecording(); setView("list"); }}
          style={{ color: "#4a9eff", background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <I n="back" s={14} c="#4a9eff"/> Back
        </button>
        <span style={{ color: "#8b9bbf", fontSize: 13 }}>Part {pIdx + 1} of {selTest.parts.length}</span>
      </div>

      {/* Part tabs removed by user request */}

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div style={{ background: "#18243a", padding: 60, borderRadius: 20, textAlign: "center", border: "1px solid rgba(74,158,255,0.2)", animation: "fadeUp .4s ease" }}>
          {/* Visual Progress Bar (1-2-3) */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 40 }}>
             {[1, 2, 3].map(n => {
               const pNum = selPart.part || (pIdx + 1);
               return (
                 <React.Fragment key={n}>
                   <div style={{ 
                     width: 50, height: 50, borderRadius: "50%", 
                     background: n === pNum ? "#22c55e" : (n < pNum ? "rgba(34,197,94,0.3)" : "#334155"), 
                     color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                     fontSize: 20, fontWeight: 900, border: n === pNum ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
                     boxShadow: n === pNum ? "0 0 15px rgba(34,197,94,0.4)" : "none"
                   }}>{n}</div>
                   {n < 3 && <div style={{ width: 80, height: 4, background: n < pNum ? "#22c55e" : "#334155" }} />}
                 </React.Fragment>
               );
             })}
          </div>

          <h1 style={{ color: "#fff", fontSize: 62, fontWeight: 950, marginBottom: 20 }}>Part {pIdx + 1}</h1>
          <p style={{ color: "#8b9bbf", marginBottom: 40, fontSize: 18, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 40px" }}>
            {selPart.description || "In this part, I'm going to ask you some questions..."}
          </p>

          <button onClick={() => { setQIdx(0); setPhase("prep"); }}
            style={{ width: "fit-content", margin: "0 auto", padding: "16px 48px", borderRadius: 14, background: "#4a9eff", color: "#000", fontWeight: 900, border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: 18, boxShadow: "0 10px 30px rgba(74,158,255,0.3)" }}>
            CONTINUE <I n="next" s={20} c="#000"/>
          </button>
          
          <IntroAudio text={selPart.description || "Part 1 intro"} />
        </div>
      )}

      {/* ── PREP ── */}
      {phase === "prep" && curQ && (
        <PrepPhase
          total={curQ.prepTime || 5}
          question={curQ.question}
          images={curQ.images}
          pN_main={selPart.part || (pIdx + 1)}
          onEnd={() => setPhase("recording")}
        />
      )}

      {/* ── RECORDING ── */}
      {phase === "recording" && curQ && (
        <RecordPhase
          question={curQ.question}
          images={curQ.images}
          pN_main={selPart.part || (pIdx + 1)}
          speakTime={curQ.speakTime || 30}
          transcript={transcript}
          onDone={handleQuestionDone}
        />
      )}

      {/* ── PART DONE ── */}
      {phase === "part_done" && (
        <div style={{ background: "#18243a", padding: 60, borderRadius: 20, textAlign: "center", border: "2px solid #22c55e", animation: "fadeUp .4s ease" }}>
           <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <I n="check" s={32} c="#22c55e"/>
           </div>
           <h2 style={{ color: "#fff", marginBottom: 10 }}>Part {pIdx + 1} Completed!</h2>
           <p style={{ color: "#8b9bbf", marginBottom: 30 }}>You have finished all questions for this section.</p>
           
           <button onClick={goToNextPart}
            style={{ width: "fit-content", margin: "0 auto", padding: "16px 48px", borderRadius: 14, background: "#22c55e", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: 18, boxShadow: "0 10px 30px rgba(34,197,94,0.3)" }}>
            {pIdx < selTest.parts.length - 1 ? "NEXT PART" : "SUBMIT TEST"} <I n="next" s={20} c="#fff"/>
           </button>
        </div>
      )}

      {/* ── SUBMITTING ── */}
      {phase === "submitting" && (
        <div style={{ color: "#8b9bbf", textAlign: "center", padding: 60, animation: "fadeUp .4s ease" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(74,158,255,0.2)", borderTopColor: "#4a9eff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}/>
          <h3 style={{ color: "#f0f4ff", marginBottom: 8 }}>Evaluating your speech...</h3>
          <p style={{ fontSize: 13 }}>AI + client analysis in progress...</p>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === "result" && result && (
        <div style={{ textAlign: "center", animation: "fadeUp .4s ease" }}>
          {/* Score hero */}
          <div style={{ background: `${result.color}12`, border: `1px solid ${result.color}33`, borderRadius: 16, padding: 30, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: result.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Speaking Result</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: result.color, lineHeight: 1 }}>{result.overall}</div>
            <div style={{ fontSize: 11, color: "#8b9bbf", marginBottom: 8 }}>/100 total score</div>
            <div style={{ fontSize: 18, color: "#f0f4ff", fontWeight: "bold" }}>Band {result.band} · {result.cefr}</div>

            {/* Dual scorer info */}
            {result.aiScores && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 20, fontSize: 12, color: "#8b9bbf" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <I n="brain" s={12} c="#4a9eff"/> AI: {Object.values(result.aiScores).reduce((a,b)=>a+b,0)}/100
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  📊 Client: {Object.values(result.clientScores).reduce((a,b)=>a+b,0)}/100
                </span>
                <span style={{ color: result.color, fontWeight: 700 }}>Final: {result.overall}/100</span>
              </div>
            )}
          </div>

          {/* Criteria bars */}
          <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px", marginBottom: 16, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <I n="star" s={15} c="#D4537E"/>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Score Breakdown</span>
              <span style={{ fontSize: 11, color: "#4a5568", marginLeft: "auto" }}>4 × 25 pts</span>
            </div>
            {CRITERIA.map(cr => <CriterionBar key={cr.key} crit={cr} score={result.scores[cr.key] || 0} />)}
          </div>

          {/* Feedback panels */}
          <div style={{ display: "grid", gap: 16, textAlign: "left" }}>
            {result.critique && (
              <div style={{ background: "#18243a", padding: 22, borderRadius: 12, borderLeft: `4px solid ${result.color}` }}>
                <h4 style={{ color: result.color, marginTop: 0 }}><I n="star" s={16} c={result.color}/> Examiner Feedback</h4>
                <p style={{ fontSize: 14, color: "#c8d4f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result.critique}</p>
              </div>
            )}
            {result.feedback && (
              <div style={{ background: "rgba(251,191,36,0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(251,191,36,0.1)" }}>
                <h4 style={{ color: "#fbbf24", marginTop: 0 }}><I n="bolt" s={14} c="#fbbf24"/> How to Improve</h4>
                <p style={{ fontSize: 14, color: "#c8d4f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result.feedback}</p>
              </div>
            )}
            {result.modelAnswer && (
              <div style={{ background: "rgba(74,158,255,0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(74,158,255,0.1)" }}>
                <h4 style={{ color: "#4a9eff", marginTop: 0 }}>📝 Model Answer</h4>
                <p style={{ fontSize: 14, color: "#c8d4f0", lineHeight: 1.6, fontStyle: "italic", whiteSpace: "pre-wrap" }}>{result.modelAnswer}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { stopRecording(); setView("list"); }}
              style={{ flex: 1, padding: "14px", borderRadius: 10, border: "1px solid #334155", background: "none", color: "#8b9bbf", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <I n="back" s={16} c="#8b9bbf"/> Leave
            </button>
            <button onClick={nextPart}
              style={{ flex: 2, padding: "14px", borderRadius: 10, background: "#4a9eff", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              {pIdx < selTest.parts.length - 1 ? "Next Part" : "Finish Test"} <I n="next" s={16} c="#000"/>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "#e11d48", marginTop: 20, textAlign: "center", padding: 15, background: "rgba(225,29,72,0.1)", borderRadius: 8 }}>{error}</div>
      )}
    </div>
  );
}

function IntroAudio({ text }) {
  useEffect(() => {
    const a = playTTS(text);
    return () => { if (a) a.pause(); };
  }, [text]);
  return null;
}