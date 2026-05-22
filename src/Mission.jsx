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
    spin:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>,
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

const DAILY_MISSIONS = [
  { id: "m_xp20",    label: "Earn 20 XP today",            icon: "bolt", xp: 50,  xpReq: 20,   section: null,         desc: "Complete any test or activity to earn basic XP" },
  { id: "m_xp100",   label: "Earn 100 XP today",           icon: "target",xp: 100, xpReq: 100,  section: null,         desc: "Reach 100 XP today for a big boost" },
  { id: "m_listen",  label: "Finish a Listening test",     icon: "ear",  xp: 30,  xpReq: null, section: "listening",  desc: "Complete any listening part practice" },
  { id: "m_read",    label: "Finish a Reading test",       icon: "book", xp: 30,  xpReq: null, section: "reading",    desc: "Complete any reading part practice" },
  { id: "m_write",   label: "Submit a Writing task",       icon: "pen",  xp: 40,  xpReq: null, section: "writing",    desc: "Get feedback on a writing assignment" },
  { id: "m_speak",   label: "Finish a Speaking part",      icon: "mic",  xp: 40,  xpReq: null, section: "speaking",   desc: "Record and submit your speaking practice" },
  { id: "m_time",    label: "Study for 6 minutes",         icon: "clock",xp: 20,  xpReq: null, section: "time",       desc: "Stay active on the platform for 6 minutes" },
];

const STREAK_DAYS = [
  { day: 1, xp: 20,  label: "Day 1" },
  { day: 2, xp: 30,  label: "Day 2" },
  { day: 3, xp: 50,  label: "Day 3" },
  { day: 4, xp: 80,  label: "Day 4" },
  { day: 5, xp: 120, label: "Day 5" },
  { day: 6, xp: 300, label: "Day 6", special: true },
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
    showToast(`+${mission.xp} XP!`, true);
  };

  const claimStreakDay = (day) => {
    if (streakClaimed.includes(day.day)) return showToast("Already claimed!", false);
    if ((progress.consecutiveDays || 0) < day.day) return showToast(`Not ready!`, false);
    
    const newClaimed = [...streakClaimed, day.day];
    setStreakClaimed(newClaimed);
    localStorage.setItem("streak_days_claimed", JSON.stringify(newClaimed));
    addXP(day.xp);
    showToast(`+${day.xp} XP Streak bonus!`, true);
  };

  const claimedToday = DAILY_MISSIONS.filter(m => isMissionDone(m)).length;
  const pct = Math.round((claimedToday/DAILY_MISSIONS.length)*100);

  return (
    <div style={{ animation: "fadeUp .4s ease-out", maxWidth: 900, margin: "0 auto", color: "var(--text-primary)" }}>
      {toast && (
        <div style={{ position: "fixed", top: 32, left: "50%", transform: "translateX(-50%)", background: "var(--text-primary)", color: "var(--bg-primary)", borderRadius: 12, padding: "12px 24px", zIndex: 9999, fontWeight: 700, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Missions</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Your daily progress targets</p>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: 24, padding: 32, marginBottom: 32, border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Completion</span>
          <span style={{ fontSize: 24, fontWeight: 900 }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: "var(--bg-primary)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--text-primary)", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: "var(--text-muted)" }}>
          <span>{claimedToday} of {DAILY_MISSIONS.length} goals</span>
          <span>Earn extra XP every day</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 48 }}>
        {DAILY_MISSIONS.map(m => {
          const done = isMissionDone(m);
          const canClaim = isMissionAchievable(m) && !done;
          return (
            <div key={m.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, display: "flex", gap: 16, opacity: done ? 0.6 : 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I n={done ? "check" : m.icon} s={22} c={done ? "#30d158" : "var(--text-primary)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>{m.label}</h3>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>+{m.xp} XP</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{m.desc}</p>
                {done ? (
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#30d158" }}>Claimed</span>
                ) : canClaim ? (
                  <button onClick={() => claimMission(m)} style={{ width: "100%", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", padding: "8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Claim Reward</button>
                ) : (
                  <button onClick={() => m.section && setPage(m.section)} style={{ width: "100%", background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)", padding: "8px", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: m.section ? "pointer" : "default" }}>
                    {m.section ? "Start Now" : "In Progress"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 24, padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Streak Challenge</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Maintain your daily momentum</p>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10 }}>
          {STREAK_DAYS.map(day => {
            const isClaimed = streakClaimed.includes(day.day);
            const isAvailable = (progress.consecutiveDays || 0) >= day.day && !isClaimed;
            const isLocked = (progress.consecutiveDays || 0) < day.day;

            return (
              <div key={day.day} onClick={() => isAvailable && claimStreakDay(day)}
                style={{ minWidth: 100, flex: 1, background: isClaimed ? "var(--bg-primary)" : isAvailable ? "var(--text-primary)" : "transparent", border: `1px solid var(--border)`, borderRadius: 16, padding: "20px 10px", textAlign: "center", cursor: isAvailable ? "pointer" : "default", color: isAvailable ? "var(--bg-primary)" : "var(--text-primary)", opacity: isLocked ? 0.4 : 1 }}>
                <div style={{ marginBottom: 8 }}>
                  {isClaimed ? <I n="check" s={20} c="#30d158" /> : isLocked ? <I n="lock" s={18} c="var(--text-muted)" /> : <I n="fire" s={22}/>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>Day {day.day}</div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>{day.xp} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}