// useProgress.js — Full MongoDB sync by email — all fields saved
import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "./firebase";

export const LEVEL_THRESHOLDS = [
  { code: "A1", label: "Beginner",     minXP: 0    },
  { code: "A2", label: "Elementary",   minXP: 200  },
  { code: "B1", label: "Intermediate", minXP: 450  },
  { code: "B2", label: "Upper-Int",    minXP: 750  },
  { code: "C1", label: "Advanced",     minXP: 1100 },
  { code: "C2", label: "Mastery",      minXP: 1500 },
];

export const CEFR_META = {
  A1: { color: "#378ADD", bg: "rgba(55,138,221,0.12)",  tc: "#85b7eb" },
  A2: { color: "#1D9E75", bg: "rgba(29,158,117,0.12)",  tc: "#5dcaa5" },
  B1: { color: "#EF9F27", bg: "rgba(239,159,39,0.12)",  tc: "#fac775" },
  B2: { color: "#D85A30", bg: "rgba(216,90,48,0.12)",   tc: "#f0997b" },
  C1: { color: "#7F77DD", bg: "rgba(127,119,221,0.12)", tc: "#afa9ec" },
  C2: { color: "#D4537E", bg: "rgba(212,83,126,0.12)",  tc: "#ed93b1" },
};

import BACKEND_URL from "./config/api.js";

// LocalStorage keys
const SK  = "cefr_prog_v7";
const SCK = "cefr_scores_v6";
const PMK = "cefr_prem_v3";
const DK  = "cefr_daily_v3";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function rd(k, fb) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } }
function wr(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function lvlFor(xp) {
  let l = "A1";
  for (const t of LEVEL_THRESHOLDS) { if (xp >= t.minXP) l = t.code; }
  return l;
}

function calculateStreak(log) {
  if (!log || !Array.isArray(log) || log.length === 0) return 0;
  const sorted = [...log].filter(l => l.xp > 0);
  if (sorted.length === 0) return 0;
  
  let streak = 0;
  let current = new Date();
  const todayStr = today();
  
  const hasToday = sorted.some(l => l.date === todayStr);
  if (!hasToday) {
    current.setDate(current.getDate() - 1);
  }

  // Iterate backwards day by day to count the continuous streak
  for (let i = 0; i < 1000; i++) { // Max 1000 days safety limit
    const checkStr = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}`;
    const hasDay = sorted.some(l => l.date === checkStr);
    if (hasDay) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const DEF = {
  xp: 0, level: "A1",
  username: "",
  completed: {}, purchased: [], onboarded: false,
  spinUsed: { date: "", count: 0 },
  consecutiveDays: 0, lastLogin: "", streakClaimed: {},
  todayXP: 0, _scoreTimestamps: {}, lastXPReset: "",
  vocabulary: [],
  totalDaysActive: 1,
  activityLog: [],
  totalTimeSpent: 0,
  lastActiveDate: "",
  bio: "",
  telegram: "",
  instagram: "",
  dailyGoal: 50,
};

// ─── Sync entire state to MongoDB ────────────────────────────────────────────
async function syncToMongoDB(progress, scores, email) {
  if (!email) return;
  try {
    const payload = {
      email,
      username:         progress.username         ?? "",
      xp:               progress.xp               ?? 0,
      level:            progress.level             ?? "A1",
      completed:        progress.completed         ?? {},
      purchased:        progress.purchased         ?? [],
      onboarded:        progress.onboarded         ?? false,
      consecutiveDays:  progress.consecutiveDays   ?? 0,
      lastLogin:        progress.lastLogin         ?? "",
      scores:           scores                     ?? {},
      spinUsed:         progress.spinUsed          ?? { date: "", count: 0 },
      streakClaimed:    progress.streakClaimed     ?? {},
      _scoreTimestamps: progress._scoreTimestamps  ?? {},
      todayXP:          progress.todayXP           ?? 0,
      lastXPReset:      progress.lastXPReset       ?? "",
      vocabulary:       progress.vocabulary        ?? [],
      totalDaysActive:  progress.totalDaysActive   ?? 1,
      activityLog:      progress.activityLog       ?? [],
      totalTimeSpent:   progress.totalTimeSpent    ?? 0,
      lastActiveDate:   progress.lastActiveDate    ?? "",
      bio:              progress.bio               ?? "",
      telegram:         progress.telegram          ?? "",
      instagram:        progress.instagram         ?? "",
      dailyGoal:        progress.dailyGoal         ?? 50,
    };
    await fetch(`${BACKEND_URL}/api/user/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("MongoDB sync failed:", e.message);
  }
}

export function useProgress() {
  const [P, setP]   = useState(() => ({ ...DEF, ...rd(SK, DEF) }));
  const [S, setS]   = useState(() => rd(SCK, {}));
  const [PR, setPR] = useState(() => rd(PMK, {}));

  const syncTimer   = useRef(null);
  const emailRef    = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isReady     = useRef(false); // true after cloud fetch completes

  // ── Fetch from MongoDB on login ─────────────────────────────────────────
  const fetchFromCloud = useCallback(async (email) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/user/progress?email=${encodeURIComponent(email)}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const local = rd(SK, DEF);
      const localS = rd(SCK, {});

      if (data && !data.newUser && !data._offline) {
        // Smart merge: take the HIGHER value for numeric fields
        const merged = {
          ...DEF,
          ...local,   // local first
          ...data,    // cloud overwrites
          xp:               Math.max(local.xp || 0, data.xp || 0),
          username:         data.username || local.username || "",
          consecutiveDays:  Math.max(local.consecutiveDays || 0, data.consecutiveDays || 0),
          todayXP:          Math.max(local.todayXP || 0, data.todayXP || 0),
          completed:        { ...(local.completed || {}), ...(data.completed || {}) },
          purchased:        [...new Set([...(local.purchased || []), ...(data.purchased || [])])],
          _scoreTimestamps: { ...(local._scoreTimestamps || {}), ...(data._scoreTimestamps || {}) },
          streakClaimed:    { ...(local.streakClaimed || {}),    ...(data.streakClaimed || {}) },
          vocabulary: mergeVocab(local.vocabulary || [], data.vocabulary || []),
          totalDaysActive: Math.max(local.totalDaysActive || 1, data.totalDaysActive || 1),
          activityLog: data.activityLog || local.activityLog || [],
          totalTimeSpent: Math.max(local.totalTimeSpent || 0, data.totalTimeSpent || 0),
          lastActiveDate: data.lastActiveDate || local.lastActiveDate || "",
          bio: data.bio || local.bio || "",
          telegram: data.telegram || local.telegram || "",
          instagram: data.instagram || local.instagram || "",
          dailyGoal: data.dailyGoal || local.dailyGoal || 50,
        };
        merged.level = lvlFor(merged.xp);
        merged.consecutiveDays = calculateStreak(merged.activityLog);

        const mergedS = { ...localS, ...(data.scores || {}) };

        setP(merged);
        setS(mergedS);
        wr(SK, merged);
        wr(SCK, mergedS);
        console.log("📥 Cloud data synced for:", email);

        isReady.current = true;
        setIsLoaded(true);
        await syncToMongoDB(merged, mergedS, email);
      } else {
        console.log("🆕 No cloud data — using local for:", email);
        isReady.current = true;
        setIsLoaded(true);
        await syncToMongoDB(local, localS, email);
      }
    } catch (e) {
      console.error("Cloud fetch failed:", e.message);
      isReady.current = true;
      setIsLoaded(true);
    }
  }, []);

  function mergeVocab(local, cloud) {
    const map = new Map();
    [...cloud, ...local].forEach(v => { if (v?.word) map.set(v.word.toLowerCase(), v); });
    return Array.from(map.values());
  }

  // ── Auth listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user?.email) {
        emailRef.current = user.email;
        isReady.current = false;
        fetchFromCloud(user.email);
      } else {
        emailRef.current = null;
        isReady.current = true;
        setIsLoaded(true);
      }
    });
    return unsub;
  }, [fetchFromCloud]);

  // ── Debounced sync ─────────────────────────────────────────────────────
  const scheduleSync = useCallback((prog, scores) => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (emailRef.current && isReady.current) {
        syncToMongoDB(prog, scores, emailRef.current);
      }
    }, 800);
  }, []);

  // ── Persist helpers ────────────────────────────────────────────────────
  const sp = useCallback((v) => { wr(SK, v);  setP(v);  scheduleSync(v, rd(SCK, {})); }, [scheduleSync]);
  const ss = useCallback((v) => { wr(SCK, v); setS(v);  scheduleSync(rd(SK, DEF), v); }, [scheduleSync]);
  const spr = (v) => { wr(PMK, v); setPR(v); };

  // ── Daily reset / streak ───────────────────────────────────────────────
  useEffect(() => {
    const t = today();
    let next = { ...P };
    let changed = false;

    if (P.lastXPReset !== t) {
      next.todayXP = 0;
      next.lastXPReset = t;
      changed = true;
    }

    if (P.lastLogin !== t) {
      next.lastLogin = t;
      next.totalDaysActive = (P.totalDaysActive || 0) + 1;
      next.lastActiveDate = new Date().toLocaleString();
      // Track login as activity even if 0 XP gained
      next.activityLog = logActivity(P.activityLog, t, 0);
      next.consecutiveDays = calculateStreak(next.activityLog);
      changed = true;
    }

    if (changed) sp(next);
  }, []); // eslint-disable-line

  // ── Session Timer (Usage tracking) ────────────────────────────────────
  useEffect(() => {
    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      if (sec >= 30) { // Sync every 30 seconds instead of 60 for better "real-time" feel
        sec = 0;
        if (emailRef.current && isReady.current) {
          setP(prev => {
            const next = { 
              ...prev, 
              totalTimeSpent: (prev.totalTimeSpent || 0) + 30,
              lastActiveDate: new Date().toLocaleString()
            };
            wr(SK, next);
            return next;
          });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []); 

  const forceSyncNow = useCallback(() => {
    const email = emailRef.current || auth?.currentUser?.email;
    if (email) syncToMongoDB(P, S, email);
  }, [P, S]);

  const nextLevelXP = useCallback(() => {
    const i = LEVEL_THRESHOLDS.findIndex(t => t.code === P.level);
    return i < 0 || i === LEVEL_THRESHOLDS.length - 1 ? null : LEVEL_THRESHOLDS[i + 1].minXP;
  }, [P.level]);

  const currentThreshold = useCallback(() => {
    const t = LEVEL_THRESHOLDS.find(t => t.code === P.level);
    return t ? t.minXP : 0;
  }, [P.level]);

  // ── addXP ─────────────────────────────────────────────────────────────
  const addXP = useCallback((amount, key) => {
    setP(prev => {
      if (prev.completed?.[key]) return prev;
      const t = today();
      const xp = prev.xp + amount;
      const txp = prev.todayXP + amount;
      const next = {
        ...prev, xp, level: lvlFor(xp), todayXP: txp,
        completed: { ...prev.completed, [key]: true },
        _scoreTimestamps: { ...prev._scoreTimestamps, [key]: { date: t, xp: amount } },
        activityLog: logActivity(prev.activityLog, t, amount),
      };
      next.consecutiveDays = calculateStreak(next.activityLog);
      wr(SK, next);
      scheduleSync(next, rd(SCK, {}));
      return next;
    });
  }, [scheduleSync]);

  function logActivity(log = [], date, amount) {
    const existing = log.find(l => l.date === date);
    let newLog = [];
    if (existing) {
      newLog = log.map(l => l.date === date ? { ...l, xp: (l.xp || 0) + amount } : l);
    } else {
      newLog = [...log, { date, xp: amount }];
    }
    // Keep more history for GitHub-style heatmap (approx 6 months)
    return newLog.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 200);
  }

  // ── Spin ──────────────────────────────────────────────────────────────
  const canSpin = useCallback(() => {
    const t = today();
    const { date, count } = P.spinUsed || {};
    return date !== t ? true : (count || 0) < 3;
  }, [P.spinUsed]);

  const getSpinsLeft = useCallback(() => {
    const t = today();
    const { date, count } = P.spinUsed || {};
    return date !== t ? 3 : Math.max(0, 3 - (count || 0));
  }, [P.spinUsed]);

  const recordSpin = useCallback((prize) => {
    setP(prev => {
      const t = today();
      const { date, count } = prev.spinUsed || {};
      const nc = date === t ? (count || 0) + 1 : 1;
      if (date === t && (count || 0) >= 3) return prev;
      const xp = prev.xp + (prize.xp || 0);
      const next = {
        ...prev, xp, level: lvlFor(xp),
        spinUsed: { date: t, count: nc },
      };
      wr(SK, next);
      scheduleSync(next, rd(SCK, {}));
      return next;
    });
  }, [scheduleSync]);

  // ── Time bonus ────────────────────────────────────────────────────────
  const claimTimeBonus = useCallback(() => {
    const t = today();
    // Use P.claimedTimeBonus instead of local storage for cross-device sync
    if (P.claimedTimeBonus === t) return false;
    setP(prev => {
      const next = { 
        ...prev, 
        xp: prev.xp + 10,
        claimedTimeBonus: t 
      };
      wr(SK, next);
      scheduleSync(next, rd(SCK, {}));
      return next;
    });
    return true;
  }, [P.claimedTimeBonus, scheduleSync]);

  const hasClaimedTimeBonus = useCallback(() => {
    return P.claimedTimeBonus === today();
  }, [P.claimedTimeBonus]);

  // ── Premium ───────────────────────────────────────────────────────────
  const isPremiumActive = useCallback((type) => {
    const data = PR[`${type}_premium`];
    if (!data) return false;
    return new Date(data.expiry) > new Date();
  }, [PR]);

  const activatePremium = useCallback((type, days) => {
    const k = `${type}_premium`;
    const exp = new Date(); exp.setDate(exp.getDate() + days);
    spr({ ...PR, [k]: { activated: new Date().toISOString(), expiry: exp.toISOString(), days } });
  }, [PR]);

  const getPremiumExpiry = useCallback((type) => {
    const data = PR[`${type}_premium`];
    if (!data) return null;
    const exp = new Date(data.expiry);
    return exp > new Date() ? exp : null;
  }, [PR]);

  // ── saveScore ──────────────────────────────────────────────────────────
  const saveScore = useCallback((section, part, score) => {
    const t = today();
    const key = `${section}_${part}`;
    setS(prev => {
      const next = { ...prev, [key]: score };
      wr(SCK, next);
      scheduleSync(rd(SK, DEF), next);
      return next;
    });
    setP(prev => {
      const next = { ...prev, _scoreTimestamps: { ...prev._scoreTimestamps, [key]: { date: t, score } } };
      wr(SK, next);
      return next;
    });
  }, [scheduleSync]);

  const removeScore = useCallback((key) => {
    setS(prev => { const next = { ...prev }; delete next[key]; wr(SCK, next); return next; });
  }, []);

  const clearSectionScores = useCallback((prefix) => {
    setS(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(prefix)));
      wr(SCK, next);
      return next;
    });
  }, []);

  const setInitialLevel = useCallback((code, username) => {
    // XP always starts at 0 as requested by USER
    const next = { ...P, level: code, xp: 0, username: username || P.username || "", onboarded: true };
    sp(next);
  }, [P, sp]);

  const updateUsername = useCallback((name) => {
    const next = { ...P, username: name };
    sp(next);
  }, [P, sp]);

  const resetProgress = useCallback(() => { sp(DEF); ss({}); spr({}); }, [sp, ss]);

  // ── Vocabulary ────────────────────────────────────────────────────────
  const saveVocabulary = useCallback((word, definition, sentence) => {
    setP(prev => {
      const vocab = prev.vocabulary || [];
      if (vocab.some(v => v.word?.toLowerCase() === word.toLowerCase())) return prev;
      const next = { ...prev, vocabulary: [...vocab, { word, definition, sentence, date: today() }] };
      wr(SK, next);
      scheduleSync(next, rd(SCK, {}));
      return next;
    });
  }, [scheduleSync]);

  return {
    progress: P, scores: S, premiums: PR,
    nextLevelXP, currentThreshold, setInitialLevel,
    addXP,
    canSpin, getSpinsLeft, recordSpin,
    claimTimeBonus, hasClaimedTimeBonus,
    isPremiumActive, activatePremium, getPremiumExpiry,
    saveScore, removeScore, clearSectionScores,
    resetProgress, forceSyncNow, saveVocabulary,
    updateUsername,
    updateProfileData: (fields) => {
      setP(prev => {
        const next = { ...prev, ...fields };
        wr(SK, next);
        scheduleSync(next, rd(SCK, {}));
        return next;
      });
    },
    isLoaded
  };
}

export async function fetchLeaderboard(sortBy = "xp") {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/leaderboard?sort=${sortBy}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json.users || [];
  } catch (e) {
    console.warn("Leaderboard fetch failed:", e.message);
    return [];
  }
}