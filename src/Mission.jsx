// Mission.jsx — CEFR Center — Daily Missions + 6-Day Streak Challenge (XP-ONLY)
import React, { useState, useEffect } from "react";

function I({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const paths = {
    target:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    check:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    fire:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 2C6.5 7 4 10.5 4 14a8 8 0 0016 0c0-4.5-3.5-8.5-8-12z"/><path d="M12 18a3 3 0 01-3-3c0-2 3-5 3-5s3 3 3 5a3 3 0 01-3 3z"/></svg>,
    bolt:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    ear:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
    book:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    pen:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
    mic:     <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    spin:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>,
    clock:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    star:    <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    trophy:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 01-4 4 5 5 0 01-4-4L7 4z"/><path d="M5 9H3a2 2 0 01-2-2V5a2 2 0 012-2h2M19 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2"/></svg>,
    lock:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  };
  return paths[n] || null;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Daily missions with XP rewards
const DAILY_MISSIONS = [
  { id: "m_xp20",    label: "Earn 20 XP today",            icon: "bolt", xp: 50,  xpReq: 20,   section: null,         desc: "Complete any test or activity to earn basic XP" },
  { id: "m_xp100",   label: "Earn 100 XP today",           icon: "target",xp: 100, xpReq: 100,  section: null,         desc: "Reach 100 XP today for a big boost" },
  { id: "m_listen",  label: "Finish a Listening test",     icon: "ear",  xp: 30,  xpReq: null, section: "listening",  desc: "Complete any listening part practice" },
  { id: "m_read",    label: "Finish a Reading test",       icon: "book", xp: 30,  xpReq: null, section: "reading",    desc: "Complete any reading part practice" },
  { id: "m_write",   label: "Submit a Writing task",       icon: "pen",  xp: 40,  xpReq: null, section: "writing",    desc: "Get feedback on a writing assignment" },
  { id: "m_speak",   label: "Finish a Speaking part",      icon: "mic",  xp: 40,  xpReq: null, section: "speaking",   desc: "Record and submit your speaking practice" },
  { id: "m_time",    label: "Study for 6 minutes",         icon: "clock",xp: 20,  xpReq: null, section: "time",       desc: "Stay active on the platform for 6 minutes" },
];

// Streak rewards (XP only)
const STREAK_DAYS = [
  { day: 1, xp: 20,  label: "Day 1" },
  { day: 2, xp: 30,  label: "Day 2" },
  { day: 3, xp: 50,  label: "Day 3" },
  { day: 4, xp: 80,  label: "Day 4" },
  { day: 5, xp: 120, label: "Day 5" },
  { day: 6, xp: 300, label: "Day 6 🔥", special: true },
];

export default function MissionsPage({ progress, scores, addXP, timeBonusClaimed, setPage }) {
  const [claimed, setClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("missions_claimed") || "{}"); } catch { return {}; }
  });
  const [toast, setToast] = useState(null);
  const [streakClaimed, setStreakClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("streak_days_claimed") || "[]"); } catch { return []; }
  });

  const todayKey = today();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const isMissionDone = (mission) => claimed[`${todayKey}_${mission.id}`] === true;

  const isMissionAchievable = (mission) => {
    if (mission.id === "m_time") return timeBonusClaimed;
    if (mission.xpReq) return (progress.todayXP || 0) >= mission.xpReq;
    
    const sectionPrefix = mission.section;
    if (["listening", "reading", "writing", "speaking"].includes(sectionPrefix)) {
      const keys = Object.keys(scores || {}).filter(k => k.startsWith(sectionPrefix));
      return keys.some(k => {
        const entry = progress._scoreTimestamps?.[k];
        return entry && entry.date === todayKey;
      });
    }
    return false;
  };

  const claimMission = (mission) => {
    if (isMissionDone(mission)) return showToast("Already claimed!", false);
    if (!isMissionAchievable(mission)) return showToast("Mission not completed yet!", false);
    
    const newClaimed = { ...claimed, [`${todayKey}_${mission.id}`]: true };
    setClaimed(newClaimed);
    localStorage.setItem("missions_claimed", JSON.stringify(newClaimed));
    addXP(mission.xp);
    showToast(`+${mission.xp} XP! Level progress increased! ⚡`, true);
  };

  const claimStreakDay = (day) => {
    if (streakClaimed.includes(day.day)) return showToast("Already claimed!", false);
    if ((progress.consecutiveDays || 0) < day.day) return showToast(`Reach a ${day.day}-day streak first!`, false);
    
    const newClaimed = [...streakClaimed, day.day];
    setStreakClaimed(newClaimed);
    localStorage.setItem("streak_days_claimed", JSON.stringify(newClaimed));
    addXP(day.xp);
    showToast(`+${day.xp} XP! ${day.special ? "🔥 Epic streak bonus!" : "Streak reward claimed!"}`, true);
  };

  const maxDailyXP = DAILY_MISSIONS.reduce((a, m) => a + m.xp, 0);
  const claimedToday = DAILY_MISSIONS.filter(m => isMissionDone(m)).length;
  const achievableCount = DAILY_MISSIONS.filter(m => isMissionAchievable(m) && !isMissionDone(m)).length;

  return (
    <div style={{ animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#131d2e", border: `1px solid ${toast.ok ? "#10b981" : "#ef4444"}`, borderRadius: 12, padding: "12px 24px", zIndex: 9999, color: "#fff", fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
          <I n="target" s={24} c="#a78bfa" /> Daily Missions
        </h1>
        <p style={{ color: "#8b9bbf", fontSize: 14 }}>Complete daily goals to accelerate your CEFR progression</p>
      </div>

      {/* Progress Card */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #111827)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa", lineHeight: 1 }}>{claimedToday}/{DAILY_MISSIONS.length}</div>
          <div style={{ fontSize: 11, color: "#8b9bbf", marginTop: 4, textTransform:"uppercase", letterSpacing:0.5 }}>Completed</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: "#8b9bbf" }}>Today's Progress</span>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>{Math.round((claimedToday/DAILY_MISSIONS.length)*100)}%</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(claimedToday/DAILY_MISSIONS.length)*100}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", transition: "width 0.5s ease" }} />
          </div>
        </div>
        <div style={{ background: "rgba(167,139,250,0.1)", padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(167,139,250,0.2)" }}>
          <div style={{ fontSize: 11, color: "#8b9bbf", marginBottom: 2 }}>Potential Reward</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            <I n="bolt" s={16} c="#a78bfa" /> +{maxDailyXP} XP
          </div>
        </div>
      </div>

      {achievableCount > 0 && (
        <div style={{ marginBottom: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "10px 16px", color: "#10b981", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, animation: "pulse 2s infinite" }}>
          <I n="check" s={16} c="#10b981" /> You have {achievableCount} mission{achievableCount > 1 ? "s" : ""} ready to claim!
        </div>
      )}

      {/* Missions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16, marginBottom: 40 }}>
        {DAILY_MISSIONS.map(m => {
          const done = isMissionDone(m);
          const canClaim = isMissionAchievable(m) && !done;
          return (
            <div key={m.id} style={{ background: "#18243a", border: `1px solid ${done ? "#10b98166" : canClaim ? "#a78bfa66" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 20, display: "flex", gap: 16, transition: "all .2s" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: done ? "#10b98115" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I n={done ? "check" : m.icon} s={24} c={done ? "#10b981" : "#a78bfa"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: done ? "#10b981" : "#fff" }}>{m.label}</h3>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#a78bfa" }}>+{m.xp} XP</div>
                </div>
                <p style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 16, lineHeight: 1.5 }}>{m.desc}</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {done ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", background: "#10b98115", padding: "4px 10px", borderRadius: 6 }}>Claimed</span>
                  ) : canClaim ? (
                    <button onClick={() => claimMission(m)} style={{ background: "#a78bfa", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Claim XP</button>
                  ) : (
                    <button onClick={() => m.section && setPage(m.section)} style={{ background: "rgba(255,255,255,0.05)", color: "#8b9bbf", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: m.section ? "pointer" : "default" }}>
                      {m.section ? "Go to Task" : "In Progress"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Challenge */}
      <div style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.1)", borderRadius: 24, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <I n="fire" s={20} c="#ef4444" /> Login Streak Challenge
            </h2>
            <p style={{ fontSize: 13, color: "#8b9bbf" }}>Earn massive XP by maintaining your daily streak</p>
          </div>
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "8px 16px", color: "#ef4444", fontWeight: 800, fontSize: 14 }}>
            {progress.consecutiveDays || 0} DAY STREAK
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
          {STREAK_DAYS.map(day => {
            const isClaimed = streakClaimed.includes(day.day);
            const isAvailable = (progress.consecutiveDays || 0) >= day.day && !isClaimed;
            const isLocked = (progress.consecutiveDays || 0) < day.day;

            return (
              <div key={day.day} onClick={() => isAvailable && claimStreakDay(day)}
                style={{ background: isClaimed ? "#10b98115" : isAvailable ? "#a78bfa15" : "transparent", border: `1px solid ${isClaimed ? "#10b98144" : isAvailable ? "#a78bfa44" : "rgba(255,255,255,0.05)"}`, borderRadius: 16, padding: "20px 10px", textAlign: "center", cursor: isAvailable ? "pointer" : "default", transition: "all .2s" }}>
                <div style={{ marginBottom: 10 }}>
                  {isClaimed ? <I n="check" s={20} c="#10b981" /> : isLocked ? <I n="lock" s={18} c="#4b5563" /> : <I n="fire" s={24} c={day.special ? "#ef4444" : "#a78bfa"} />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isLocked ? "#4b5563" : "#fff", marginBottom: 4 }}>{day.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: isLocked ? "#4b5563" : "#a78bfa" }}>{day.xp} XP</div>
                {isAvailable && <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: "#a78bfa", padding: "2px 0", borderRadius: 4, marginTop: 8 }}>CLAIM</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}