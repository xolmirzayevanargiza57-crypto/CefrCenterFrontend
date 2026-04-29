import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";
import { 
  User, Mail, Lock, Shield, Settings as Gear, 
  CheckCircle, AlertCircle, Camera, LogOut, 
  ChevronRight, Save, Trash2, Download, History,
  Activity, Zap, Database, RefreshCw, Award, Target,
  TrendingUp, BarChart3, Clock
} from "lucide-react";

const STORAGE_KEY = "cefr_center_progress_v1";
const SETTINGS_KEY = "cefr_center_settings_v1";
const SCORES_KEY = "cefr_scores";
import BACKEND_URL from "./config/api.js";

const DEFAULT_SETTINGS = {
  microphone: false,
  notifications: false,
  autoPlay: true,
  soundEffects: true,
  darkMode: true,
  autoSubmit: false,
  showHints: true,
};

// ── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    granted:  { label: "Granted",  color: "#1D9E75", bg: "rgba(29,158,117,0.12)" },
    denied:   { label: "Denied",   color: "#e11d48", bg: "rgba(225,29,72,0.12)"  },
    prompt:   { label: "Not set",  color: "#EF9F27", bg: "rgba(239,159,39,0.12)" },
    unknown:  { label: "Unknown",  color: "#8b9bbf", bg: "rgba(139,155,191,0.1)" },
  };
  const s = map[status] ?? map.unknown;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 9px", borderRadius: 99 }}>
      {s.label}
    </span>
  );
}

// ── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = "#e11d48", disabled = false }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? color : "rgba(255,255,255,0.1)",
        position: "relative", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background .22s ease", border: `1px solid ${checked ? color : "rgba(255,255,255,0.15)"}`,
      }}
    >
      <div style={{ position: "absolute", top: 2, left: checked ? 22 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .22s ease" }} />
    </div>
  );
}

// ── Section ─────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ color: "#4a9eff" }}>{Icon}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#8b9bbf", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title}
        </span>
      </div>
      <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────
function Row({ icon: Icon, label, desc, right, last = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: last ? "none" : "0.5px solid rgba(255,255,255,0.05)", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{ color: "#8b9bbf", flexShrink: 0 }}>{Icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f4ff", marginBottom: 2 }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: "#8b9bbf", lineHeight: 1.4 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

export default function Settings({ user, progress, resetProgress, updateUsername, updateProfileData }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch { return { ...DEFAULT_SETTINGS }; }
  });

  const [status, setStatus] = useState("checking");
  const [micStatus, setMicStatus] = useState("unknown");

  const last7Days = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = progress.activityLog?.find(l => l.date === dateStr);
      days.push({
        date: dateStr,
        xp: entry ? entry.xp : 0,
        label: d.toLocaleDateString('en-US', { weekday: 'short' })[0]
      });
    }
    return days;
  }, [progress.activityLog]);

  const maxXP = Math.max(...last7Days.map(d => d.xp), 50);

  const contributionData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    const daysToShow = 21 * 7; 
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = progress.activityLog?.find(l => l.date === dateStr);
      data.push({ 
        date: dateStr, 
        xp: entry?.xp || 0, 
        month: d.toLocaleString('default', { month: 'short' }),
        day: d.getDate()
      });
    }
    return data;
  }, [progress.activityLog]);

  const monthLabels = React.useMemo(() => {
    const labels = [];
    let lastMonth = "";
    contributionData.forEach((d, i) => {
      if (i % 7 === 0 && d.month !== lastMonth) {
        labels.push({ label: d.month, index: Math.floor(i / 7) });
        lastMonth = d.month;
      }
    });
    return labels;
  }, [contributionData]);

  const [sessionSec, setSessionSec] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSessionSec(s => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getCol = (xp) => {
    if (xp === 0) return "rgba(255,255,255,0.05)";
    if (xp < 50) return "#1e3a8a";
    if (xp < 150) return "#3b82f6";
    if (xp < 250) return "#4a9eff";
    return "#93c5fd";
  };

  const [notifStatus, setNotifStatus] = useState("unknown");
  const [toast, setToast]           = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password form
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });

  // Username form
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState(progress.username || "");
  const [userLoading, setUserLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/health`);
      const d = await r.json();
      setHealth(d);
      showToast("System health: Excellent");
    } catch (e) {
      showToast("System offline", false);
    } finally {
      setCheckingHealth(false);
    }
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const GOALS = [
    { v: 20, l: "20 XP (Easy)" },
    { v: 50, l: "50 XP (Normal)" },
    { v: 100, l: "100 XP (Serious)" },
    { v: 200, l: "200 XP (Hardcore)" }
  ];

  const clearCache = () => {
    if (window.confirm("This will clear local settings and progress from this browser. Continue?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(SCORES_KEY);
      window.location.reload();
    }
  };

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  const setSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (!showUserModal || newUsername.length < 3) {
      setUserStatus(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(newUsername)}`);
        const data = await resp.json();
        setUserStatus(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newUsername, showUserModal]);

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (userStatus && !userStatus.available) return;
    setUserLoading(true);
    try {
      updateUsername(newUsername);
      showToast("Username updated!");
      setShowUserModal(false);
    } catch (err) {
      showToast("Failed to update username", false);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "microphone" }).then(p => { setMicStatus(p.state); p.onchange = () => setMicStatus(p.state); });
      navigator.permissions.query({ name: "notifications" }).then(p => { setNotifStatus(p.state); p.onchange = () => setNotifStatus(p.state); });
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) return showToast("New passwords don't match", false);
    if (passForm.next.length < 6) return showToast("Password too short (min 6 chars)", false);

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passForm.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passForm.next);
      showToast("Password updated successfully!");
      setShowPasswordModal(false);
      setPassForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      console.error(err);
      showToast(err.code === "auth/wrong-password" ? "Wrong current password" : "Failed to update password", false);
    } finally {
      setPasswordLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; borderRadius: 8px; width: 100%; marginBottom: 12px; }
        input:focus { border-color: #4a9eff; outline: none; }
        .sel-modal-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: #4a9eff88 !important; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "#131d2e", border: `1px solid ${toast.ok ? "#1D9E75" : "#e11d48"}`,
          borderRadius: 12, padding: "12px 24px", zIndex: 9999, fontSize: 14, color: "#fff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10
        }}>
          {toast.ok ? <CheckCircle size={18} color="#1D9E75" /> : <AlertCircle size={18} color="#e11d48" />}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Profile & Settings</h1>
        <p style={{ color: "#8b9bbf", fontSize: 14 }}>Manage your account, preferences, and privacy</p>
      </div>

      {/* ── PROFILE ──────────────────────────────────────────────────────── */}
      <Section title="Account" icon={<User size={18} />}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 20, borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#4a9eff", border: "3px solid #131d2e", boxShadow: "0 0 0 2px rgba(74,158,255,0.2)", overflow: "hidden" }}>
              {user?.photoURL ? <img src={user.photoURL} alt="pfp" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.displayName?.[0] || "?"}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{progress.username || user?.displayName || "Learner"}</h2>
            <p style={{ fontSize: 13, color: "#8b9bbf", display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={12} /> {user?.email}
            </p>
          </div>
        </div>
        <Row 
          icon={<User size={16} />} 
          label="Username" 
          desc="Your public name on the leaderboard"
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#4a9eff" }}>@{progress.username || "unset"}</span>
              <button 
                onClick={() => {setNewUsername(progress.username || ""); setShowUserModal(true);}}
                style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                Edit
              </button>
            </div>
          }
        />
        <Row 
          icon={<Lock size={16} />} 
          label="Password" 
          desc="Change your account password" 
          last
          right={
            <button onClick={() => setShowPasswordModal(true)} style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Change
            </button>
          }
        />
      </Section>

      {/* ── ACCOMPLISHMENTS ──────────────────────────────────────────────── */}
      <Section title="Accomplishments" icon={<Award size={18} color="#EF9F27" />}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { label: "Grandmaster", ic: <Award size={24} />, color: "#EF9F27", reached: progress.xp > 5000 },
              { label: "Perfect Week", ic: <Target size={24} />, color: "#1D9E75", reached: progress.consecutiveDays >= 7 },
              { label: "Fast Learner", ic: <TrendingUp size={24} />, color: "#378ADD", reached: progress.xp > 1000 },
              { label: "Early Bird", ic: <Clock size={24} />, color: "#D4537E", reached: true }
            ].map((a, i) => (
              <div key={i} style={{ 
                background: a.reached ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)", 
                padding: 16, borderRadius: 14, 
                border: `1px solid ${a.reached ? a.color + '44' : 'rgba(255,255,255,0.05)'}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                opacity: a.reached ? 1 : 0.4
              }}>
                <div style={{ color: a.reached ? a.color : "#64748b" }}>{a.ic}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: a.reached ? "#fff" : "#4a5568" }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PROFILE DETAILS ───────────────────────────────────────────── */}
      <Section title="Profile Details" icon={<TrendingUp size={18} color="#3b82f6" />}>
        <Row 
          icon={<Gear size={16} />} 
          label="Bio / Status" 
          desc="Tell others about your learning journey"
          right={
            <input 
              value={progress.bio || ""} 
              onChange={e => updateProfileData({ bio: e.target.value.slice(0, 50) })} 
              placeholder="I love learning English!"
              style={{ width: 140, fontSize: 13, background: "rgba(255,255,255,0.03)", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", marginBottom: 0 }}
            />
          }
        />
        <Row 
          icon={<Mail size={16} />} 
          label="Telegram Link" 
          desc="Add your telegram username without @"
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
               <span style={{ fontSize: 12, color: "#4a5568" }}>t.me/</span>
               <input 
                value={progress.telegram || ""} 
                onChange={e => updateProfileData({ telegram: e.target.value.replace("@", "").trim() })} 
                placeholder="username"
                style={{ width: 100, fontSize: 13, background: "rgba(255,255,255,0.03)", padding: "6px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", marginBottom: 0 }}
              />
            </div>
          }
        />
        <Row 
          icon={<Target size={16} />} 
          label="Daily XP Goal" 
          desc="Motivation to keep the streak going"
          last
          right={
            <div className="sel-modal-btn" onClick={() => setShowGoalModal(true)} style={{ width: 150, fontSize: 13, background: "rgba(255,255,255,0.03)", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
               <span style={{ fontWeight: 700, color: "#4a9eff" }}>{GOALS.find(g => g.v === (progress.dailyGoal || 50))?.v} XP</span>
               <ChevronRight size={14} color="#64748b" />
            </div>
          }
        />
      </Section>


      {/* ── ACTIVITY stats ────────────────────────────────────────────────── */}
      <Section title="Activity" icon={<History size={18} />}>
        <Row 
          icon={<History size={16} />} 
          label="Learning Streak" 
          desc="Number of consecutive days you've practised" 
          right={<span style={{fontSize:18, fontWeight:800, color:"#EF9F27"}}>{progress.consecutiveDays || 1} days 🔥</span>} 
        />
        <div style={{ padding: "0 20px 24px" }}>
           <div style={{ 
             display: "flex", gap: 10, height: 80, alignItems: "flex-end", padding: "10px 0",
             borderBottom: "1px solid rgba(255,255,255,0.05)"
           }}>
             {last7Days.map((d, i) => {
               const height = (d.xp / maxXP) * 100;
               const isToday = i === 6;
               return (
                 <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? "#4a9eff" : "#4a5568", marginBottom: 2 }}>{d.xp > 0 ? d.xp : ""}</div>
                    <div style={{ 
                      width: "100%", 
                      background: isToday ? "linear-gradient(to top, #1e3a5f, #4a9eff)" : "rgba(255,255,255,0.06)", 
                      height: `${Math.max(height, 5)}%`, 
                      borderRadius: "6px 6px 2px 2px",
                      boxShadow: isToday ? "0 0 10px rgba(74, 158, 255, 0.3)" : "none",
                      transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? "#fff" : "#64748b" }}>{d.label}</span>
                 </div>
               );
             })}
           </div>
           <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 12, fontWeight: 600 }}>XP Points Gained (Last 7 Days)</p>
        </div>
        

        <Row 
          icon={<Clock size={16} />} 
          label="Total Practice Time" 
          desc="Cumulative time spent learning on the platform" 
          right={<span style={{fontSize:18, fontWeight:800, color:"#1d4ed8"}}>{formatTime((progress.totalTimeSpent || 0) + sessionSec)}</span>} 
        />
        <Row 
          icon={<CheckCircle size={16} />} 
          label="Total Learning Days" 
          desc="Overall days spent on the platform" 
          right={<span style={{fontSize:18, fontWeight:800, color:"#1D9E75"}}>{progress.totalDaysActive || 1} days</span>} 
        />
        <Row 
          icon={<AlertCircle size={16} />} 
          label="Last Active" 
          desc="Your last recorded activity date" 
          last
          right={<span style={{fontSize:13, fontWeight:600, color:"#8b9bbf"}}>{progress.lastActiveDate || "Today"}</span>} 
        />
      </Section>

      {/* ── PREFERENCES ──────────────────────────────────────────────────── */}
      <Section title="Preferences" icon={<Gear size={18} />}>
        <Row icon={<Shield size={16} />} label="Microphone" desc="Status for speaking tests" right={<StatusBadge status={micStatus} />} />
        <Row icon={<Gear size={16} />} label="Sound Effects" desc="Audio feedback during lessons" right={<Toggle checked={settings.soundEffects} onChange={v => setSetting("soundEffects", v)} color="#378ADD" />} />
        <Row icon={<Gear size={16} />} label="Auto-play Audio" desc="Play audio automatically" right={<Toggle checked={settings.autoPlay} onChange={v => setSetting("autoPlay", v)} color="#1D9E75" />} />
        <Row icon={<Zap size={16} />} label="Performance Mode" desc="Reduce animations for speed" right={<Toggle checked={settings.performanceMode} onChange={v => setSetting("performanceMode", v)} color="#EF9F27" />} />
        <Row icon={<Gear size={16} />} label="Show Hints" desc="Helpful tips during exercises" last right={<Toggle checked={settings.showHints} onChange={v => setSetting("showHints", v)} color="#D4537E" />} />
      </Section>

      {/* ── SYSTEM ───────────────────────────────────────────────────────── */}
      <Section title="System" icon={<Activity size={18} />}>
        <Row 
          icon={<Activity size={16} />} 
          label="Backend Status" 
          desc={health ? `Uptime: ${health.uptime} | DB: ${health.db}` : "Check connectivity to server"} 
          right={
            <button 
              onClick={checkHealth} 
              disabled={checkingHealth}
              style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              {checkingHealth ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Activity size={14} />}
              {checkingHealth ? "Checking..." : "Verify"}
            </button>
          } 
        />
        <Row 
          icon={<Database size={16} />} 
          label="Local Storage" 
          desc="Clear temporary browser data" 
          last
          right={
            <button onClick={clearCache} style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Clear
            </button>
          } 
        />
      </Section>

      {/* ── DATA ─────────────────────────────────────────────────────────── */}
      <Section title="Data & Privacy" icon={<Shield size={18} />}>
        <Row label="Export My Data" desc="Download progress as JSON" icon={<Download size={16} />} right={<button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8b9bbf", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Export</button>} />
        <Row label="Reset Progress" desc="Permanently delete all XP and scores" icon={<Trash2 size={16} />} last right={<button onClick={() => resetProgress()} style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Reset</button>} />
      </Section>

      {/* ── PASSWORD MODAL ───────────────────────────────────────────────── */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Change Password</h3>
            <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 24 }}>Enter your current and new password securely.</p>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8b9bbf", display: "block", marginBottom: 6 }}>Current Password</label>
                <input type="password" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} placeholder="••••••••" required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8b9bbf", display: "block", marginBottom: 6 }}>New Password</label>
                <input type="password" value={passForm.next} onChange={e => setPassForm({...passForm, next: e.target.value})} placeholder="••••••••" required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8b9bbf", display: "block", marginBottom: 6 }}>Confirm New Password</label>
                <input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} placeholder="••••••••" required />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8b9bbf", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={passwordLoading} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#4a9eff", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {passwordLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── USERNAME MODAL ───────────────────────────────────────────────── */}
      {showUserModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Change Username</h3>
            <p style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 24 }}>Choose a unique name for the leaderboard.</p>
            <form onSubmit={handleUserUpdate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#8b9bbf", display: "block", marginBottom: 6 }}>New Username</label>
                <div style={{ position: "relative" }}>
                   <input 
                    type="text" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))} 
                    placeholder="learner_123" 
                    required 
                    style={{ 
                      borderColor: userStatus?.available ? "#1D9E75" : userStatus?.available === false ? "#e11d48" : "rgba(255,255,255,0.1)",
                      paddingRight: 40
                    }}
                  />
                  <div style={{ position: "absolute", right: 10, top: 12 }}>
                    {isChecking ? <div style={{ width: 16, height: 16, border: "2px solid #ccc", borderTopColor: "#4a9eff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> : null}
                  </div>
                </div>
                {userStatus?.available === false && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: "#e11d48", fontWeight: 600, marginBottom: 4 }}>Username taken. Try:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {userStatus.suggestions?.map(s => (
                        <button key={s} type="button" onClick={() => setNewUsername(s)} style={{ padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#4a9eff", fontSize: 11, cursor: "pointer" }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {userStatus?.available && <p style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, marginTop: 4 }}>Username available!</p>}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8b9bbf", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={userLoading || (userStatus && !userStatus.available)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#4a9eff", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: (userLoading || (userStatus && !userStatus.available)) ? 0.5 : 1 }}>
                  {userLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, maxWidth: 350, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Select Daily Goal</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {GOALS.map(g => (
                <div 
                  key={g.v} 
                  onClick={() => { updateProfileData({ dailyGoal: g.v }); setShowGoalModal(false); }}
                  style={{ 
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px",
                    background: (progress.dailyGoal || 50) === g.v ? "rgba(74,158,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${(progress.dailyGoal || 50) === g.v ? "#4a9eff" : "transparent"}`,
                    borderRadius: 14, cursor: "pointer", color: (progress.dailyGoal || 50) === g.v ? "#4a9eff" : "#8b9bbf", fontWeight: 700
                  }}
                >
                  {g.l}
                  {(progress.dailyGoal || 50) === g.v && <CheckCircle size={18} />}
                </div>
              ))}
            </div>
            <button onClick={() => setShowGoalModal(false)} style={{ width: "100%", marginTop: 20, padding: 12, borderRadius: 12, border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
