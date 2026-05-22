import React, { useState, useRef, useEffect } from "react";

function pickPrize(prizes) {
  const arr = [];
  prizes.forEach(p => { for (let i = 0; i < (p.probability || 0); i++) arr.push(p); });
  if (arr.length === 0) return prizes[0];
  return arr[Math.floor(Math.random() * arr.length)];
}

const Icons = {
  spin:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>,
  trophy:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 21 12 21 16 21" /><line x1="12" y1="17" x2="12" y2="21" /><path d="M7 4H17l-1 7a5 5 0 01-4 4 5 5 0 01-4-4L7 4z" /></svg>,
  info:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  lock:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
};

const DEFAULT_PRIZES = [
  { id: "x50",    label: "50 XP",      color: "#1c1c1e", xp: 50,  probability: 2  },
  { id: "x25",    label: "25 XP",      color: "#2c2c2e", xp: 25,  probability: 8  },
  { id: "x15",    label: "15 XP",      color: "#3a3a3c", xp: 15,  probability: 15 },
  { id: "x10",    label: "10 XP",      color: "#48484a", xp: 10,  probability: 25 },
  { id: "x5",     label: "5 XP",       color: "#636366", xp: 5,   probability: 30 },
  { id: "x2",     label: "2 XP",       color: "#8e8e93", xp: 2,   probability: 15 },
  { id: "no",     label: "0 XP",       color: "#aeaeb2", xp: 0,   probability: 5  },
];

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

const SPIN_KEY = "cefr_spin_daily";

function getSpinCount() {
  try {
    const d = JSON.parse(localStorage.getItem(SPIN_KEY) || "{}");
    return d.date === getToday() ? (d.count || 0) : 0;
  } catch { return 0; }
}

function addSpinCount() {
  const t = getToday();
  const c = getSpinCount() + 1;
  localStorage.setItem(SPIN_KEY, JSON.stringify({ date: t, count: c }));
  return c;
}

export default function Spin({ progress, recordSpin, prizes }) {
  const activePrizes = prizes && prizes.length > 0 ? prizes : DEFAULT_PRIZES;

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [usedCount, setUsedCount] = useState(getSpinCount);
  const rafRef = useRef(null);

  useEffect(() => {
    const t = getToday();
    const { date, count } = progress.spinUsed || {};
    const progCount = date === t ? (count || 0) : 0;
    const localCount = getSpinCount();
    setUsedCount(Math.max(progCount, localCount));
  }, [progress.spinUsed]);

  const spinsLeft = Math.max(0, 3 - usedCount);
  const canDoSpin = spinsLeft > 0 && !spinning;
  const segCount = activePrizes.length;
  const segAngle = 360 / segCount;

  const doSpin = () => {
    if (!canDoSpin) return;

    const newCount = addSpinCount();
    setUsedCount(newCount);
    setSpinning(true);
    setShowResult(false);
    setResult(null);

    const prize = pickPrize(activePrizes);
    const prizeIdx = activePrizes.findIndex(p => p.id === prize.id);
    const targetSeg = 360 - (prizeIdx * segAngle + segAngle / 2);
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const startAngle = angle;
    const endAngle = startAngle + extraSpins + targetSeg - (startAngle % 360);

    const start = performance.now();
    const duration = 4000;

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = startAngle + (endAngle - startAngle) * ease;
      setAngle(current);

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAngle(endAngle);
        setSpinning(false);
        setResult(prize);
        setShowResult(true);
        recordSpin(prize);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ animation: "fadeUp .5s ease-out", color: "var(--text-primary)" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes spinIcon { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Fortune Drum</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Test your luck for extra XP</p>
      </div>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Arrow */}
          <div style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "24px solid var(--text-primary)", marginBottom: -10, zIndex: 10 }} />

          {/* Wheel */}
          <div style={{ position: "relative", width: 340, height: 340 }}>
            <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%", transform: `rotate(${angle}deg)`, boxShadow: "0 0 60px rgba(0,0,0,0.5)", borderRadius: "50%" }}>
              {activePrizes.map((prize, i) => {
                const sa = i * segAngle - 90;
                const r = 155, cx = 160, cy = 160;
                const rad = d => (d * Math.PI) / 180;
                const x1 = cx + r * Math.cos(rad(sa));
                const y1 = cy + r * Math.sin(rad(sa));
                const x2 = cx + r * Math.cos(rad(sa + segAngle));
                const y2 = cy + r * Math.sin(rad(sa + segAngle));
                const ma = sa + segAngle / 2;
                const tr = r * 0.7;
                const tx = cx + tr * Math.cos(rad(ma));
                const ty = cy + tr * Math.sin(rad(ma));
                return (
                  <g key={prize.id}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={prize.color} stroke="var(--bg-primary)" strokeWidth="1" />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ma + 90}, ${tx}, ${ty})`}
                      style={{ fontSize: "12px", fontWeight: 800, fill: "#fff" }}>
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="160" cy="160" r="32" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
              <text x="160" y="165" textAnchor="middle" style={{ fontSize: "24px", fill: "var(--text-primary)" }}>✦</text>
            </svg>
          </div>

          <button onClick={doSpin} disabled={!canDoSpin}
            style={{
              marginTop: 40, width: "100%", maxWidth: 280,
              padding: "16px", borderRadius: 14, border: "none",
              background: canDoSpin ? "var(--text-primary)" : "var(--bg-secondary)",
              color: canDoSpin ? "var(--bg-primary)" : "var(--text-muted)",
              fontSize: 16, fontWeight: 800, cursor: canDoSpin ? "pointer" : "not-allowed",
              boxShadow: canDoSpin ? "0 10px 20px rgba(0,0,0,0.2)" : "none"
            }}>
            {spinning ? "Spinning..." : spinsLeft === 0 ? "Come back tomorrow" : `Spin Now (${spinsLeft} left)`}
          </button>
        </div>

        <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
          {showResult && result && (
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, textAlign: "center", marginBottom: 24, animation: "popIn .3s ease-out" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{result.xp > 0 ? "✧" : "✦"}</div>
              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{result.xp > 0 ? `+${result.xp} XP` : "No Luck"}</h3>
              <p style={{ color: "var(--text-muted)" }}>{result.label}</p>
            </div>
          )}

          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              {Icons.trophy} Rewards
            </h3>
            {activePrizes.filter(p => p.xp > 0).map(prize => (
              <div key={prize.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: prize.color }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{prize.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>{prize.probability}%</span>
              </div>
            ))}
            <div style={{ marginTop: 24, padding: 16, background: "var(--bg-primary)", borderRadius: 16, fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 10 }}>
              {Icons.info} <span>Limit: 3 spins per day. Resets at 00:00.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}