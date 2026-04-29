// Spin.jsx — CEFR Center — Fortune Drum, STRICT 3 spins/day, XP Only
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
  { id: "x50",    label: "50 XP",      color: "#F59E0B", xp: 50,  probability: 2  },
  { id: "x25",    label: "25 XP",      color: "#EF9F27", xp: 25,  probability: 8  },
  { id: "x15",    label: "15 XP",      color: "#1D9E75", xp: 15,  probability: 15 },
  { id: "x10",    label: "10 XP",      color: "#378ADD", xp: 10,  probability: 25 },
  { id: "x5",     label: "5 XP",       color: "#7F77DD", xp: 5,   probability: 30 },
  { id: "x2",     label: "2 XP",       color: "#4a9eff", xp: 2,   probability: 15 },
  { id: "no",     label: "Try Again!", color: "#4a5568", xp: 0,   probability: 5  },
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

export default function Spin({ progress, canSpin, recordSpin, prizes }) {
  const activePrizes = prizes && prizes.length > 0 ? prizes : DEFAULT_PRIZES;

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [usedCount, setUsedCount] = useState(getSpinCount);
  const rafRef = useRef(null);

  // Sync from progress too
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

    // Immediately block further spins
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
      // Cubic ease-out for smooth deceleration
      const ease = 1 - Math.pow(1 - t, 3);
      const current = startAngle + (endAngle - startAngle) * ease;
      setAngle(current);

      if (t < 1) {
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
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes spinIcon { to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>{Icons.spin}</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f6ff", margin: 0 }}>Fortune Drum</h2>
            <p style={{ fontSize: 13, color: "#8b9bbf", margin: 0 }}>Win daily XP rewards to level up faster!</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 10, padding: "8px 14px" }}>
            <span style={{ color: "#a78bfa" }}>{Icons.spin}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa" }}>{spinsLeft}/3</span>
            <span style={{ fontSize: 12, color: "#8b9bbf" }}>daily spins</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%",
                background: i < spinsLeft ? "#a78bfa" : "rgba(255,255,255,0.1)",
                border: i < spinsLeft ? "none" : "1px solid rgba(255,255,255,0.2)",
                transition: "all .3s",
              }}/>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Arrow pointer */}
          <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "24px solid #a78bfa", marginBottom: -8, zIndex: 10, position: "relative", filter: "drop-shadow(0 2px 4px rgba(167,139,250,0.5))" }} />

          {/* Wheel */}
          <div style={{ position: "relative", width: "min(320px, 90vw)", height: "min(320px, 90vw)" }}>
            <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%", transform: `rotate(${angle}deg)`, filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}>
              {activePrizes.map((prize, i) => {
                const sa = i * segAngle - 90;
                const r = 150, cx = 160, cy = 160;
                const rad = d => (d * Math.PI) / 180;
                const x1 = cx + r * Math.cos(rad(sa));
                const y1 = cy + r * Math.sin(rad(sa));
                const x2 = cx + r * Math.cos(rad(sa + segAngle));
                const y2 = cy + r * Math.sin(rad(sa + segAngle));
                const ma = sa + segAngle / 2;
                const tr = r * 0.65;
                const tx = cx + tr * Math.cos(rad(ma));
                const ty = cy + tr * Math.sin(rad(ma));
                return (
                  <g key={prize.id}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={prize.color} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ma + 90}, ${tx}, ${ty})`}
                      style={{ fontSize: "11px", fontWeight: 700, fill: "#fff" }}>
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="160" cy="160" r="30" fill="#0b1120" stroke="#a78bfa" strokeWidth="2" />
              <text x="160" y="165" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "20px", fill: "#a78bfa", fontWeight: 800 }}>⚡</text>
            </svg>
          </div>

          {/* Spin button */}
          <button onClick={doSpin} disabled={!canDoSpin}
            style={{
              marginTop: 24, display: "flex", alignItems: "center", gap: 10,
              padding: "14px 44px", borderRadius: 14, border: "none",
              background: canDoSpin ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "rgba(255,255,255,0.05)",
              color: canDoSpin ? "#fff" : "#4a5568",
              fontSize: 16, fontWeight: 800,
              cursor: canDoSpin ? "pointer" : "not-allowed",
              transition: "background .2s, box-shadow .2s",
              boxShadow: canDoSpin ? "0 4px 20px rgba(167,139,250,0.4)" : "none",
              fontFamily: "inherit",
            }}>
            <span style={{ display: "inline-flex", animation: spinning ? "spinIcon 0.5s linear infinite" : "none" }}>{Icons.spin}</span>
            {spinning ? "Spinning..." : spinsLeft === 0 ? "Daily limit reached" : "Spin Now"}
          </button>

          {spinsLeft === 0 && !spinning && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: "#8b9bbf", fontSize: 13 }}>
              {Icons.lock} <span>Resets at midnight</span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 14 }}>
          {showResult && result && (
            <div style={{
              background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 20, padding: 24, textAlign: "center", animation: "popIn .4s ease",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{result.xp > 0 ? "⚡" : "😅"}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                {result.xp > 0 ? `+${result.xp} XP Earned!` : "Try again tomorrow!"}
              </h3>
              <p style={{ fontSize: 13, color: "#8b9bbf" }}>{result.label}</p>
            </div>
          )}

          <div style={{ background: "#18243a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ color: "#a78bfa" }}>{Icons.trophy}</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Potential Rewards</span>
            </div>
            {activePrizes.filter(p => p.xp > 0).map(prize => (
              <div key={prize.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: prize.color }} />
                  <span style={{ fontSize: 13, color: "#cbd5e1" }}>{prize.label}</span>
                </div>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{prize.probability}%</span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#a78bfa" }}>
              {Icons.info} <span style={{ fontSize: 13, fontWeight: 700 }}>Drum Info</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12, color: "#8b9bbf", display: "grid", gap: 8 }}>
              <li>• Everyone gets <strong style={{color:"#fff"}}>3 free spins</strong> every 24 hours</li>
              <li>• Spin counts reset at midnight local time</li>
              <li>• Rewards are added instantly to your XP total</li>
              <li>• Consistent daily spins help you reach C1 faster</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}