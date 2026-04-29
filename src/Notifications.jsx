// Notifications.jsx — CEFR Center — Public Announcements
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "cefr_notifications_v1";
const READ_KEY = "cefr_notif_read_v1";

// Default built-in notifications (admin-set)
const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif_001",
    type: "update",
    title: "New Listening Tests Added",
    message: "We've added 2 new listening tests with audio. Try Test 2 — City Tour!",
    date: "2026-04-15",
    icon: "headphones",
    pinned: true,
  },
  {
    id: "notif_002",
    type: "tip",
    title: "Daily Bonus: 6 Minutes = 5 Coins",
    message: "Spend at least 6 minutes on the platform each day to earn 5 free coins. Coins reset daily!",
    date: "2026-04-14",
    icon: "coin",
    pinned: false,
  },
  {
    id: "notif_003",
    type: "feature",
    title: "Speaking Premium Launched",
    message: "You can now unlock Speaking Practice for 70 coins. Get AI feedback on fluency, vocabulary and grammar.",
    date: "2026-04-13",
    icon: "mic",
    pinned: false,
  },
  {
    id: "notif_004",
    type: "streak",
    title: "10-Day Streak Reward",
    message: "Log in for 10 consecutive days to earn a bonus of 100 coins! Keep your streak going.",
    date: "2026-04-12",
    icon: "fire",
    pinned: false,
  },
  {
    id: "notif_005",
    type: "tip",
    title: "Fortune Drum Tips",
    message: "Spin the Fortune Drum up to 3 times daily. Each spin costs 5 coins. Max prize is 15 coins — good luck!",
    date: "2026-04-11",
    icon: "star",
    pinned: false,
  },
  {
    id: "notif_006",
    type: "update",
    title: "Writing Premium Available",
    message: "Unlock Writing tasks 1.2 and 2 for 50 coins — valid for 3 days. Get detailed error analysis and vocabulary upgrades.",
    date: "2026-04-10",
    icon: "pen",
    pinned: false,
  },
];

const TYPE_CONFIG = {
  update:  { color: "#378ADD", bg: "rgba(55,138,221,0.08)",  label: "Update"  },
  tip:     { color: "#1D9E75", bg: "rgba(29,158,117,0.08)",  label: "Tip"     },
  feature: { color: "#7F77DD", bg: "rgba(127,119,221,0.08)", label: "Feature" },
  streak:  { color: "#EF9F27", bg: "rgba(239,159,39,0.08)",  label: "Streak"  },
  info:    { color: "#D4537E", bg: "rgba(212,83,126,0.08)",  label: "Info"    },
};

// Icon renderer
function NotifIcon({ name, color, size = 18 }) {
  const s = { width: size, height: size };
  const icons = {
    headphones: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>,
    coin: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 15a2.5 2.5 0 005 0"/></svg>,
    mic: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
    fire: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2C6.5 7 4 10.5 4 14a8 8 0 0016 0c0-4.5-3.5-8.5-8-12z" /><path d="M12 18a3 3 0 01-3-3c0-2 3-5 3-5s3 3 3 5a3 3 0 01-3 3z"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    pen: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" /></svg>,
    bell: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    zap: <svg style={s} viewBox="0 0 24 24" fill={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    award: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>,
    book: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    heart: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    activity: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
  };
  return icons[name] || icons.bell;
}

import BACKEND_URL from "./config/api.js";

export default function Notifications() {
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/notifications`)
      .then(r => r.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const saveRead = (ids) => {
    setReadIds(ids);
    try { localStorage.setItem(READ_KEY, JSON.stringify(ids)); } catch {}
  };

  const markRead = (id) => {
    if (!readIds.includes(id)) saveRead([...readIds, id]);
  };

  const markAllRead = () => {
    saveRead(notifications.map(n => n.id || n._id));
  };

  const filtered = notifications
    .filter(n => filter === "all" || n.type === filter)
    .filter(n => !showUnreadOnly || !readIds.includes(n.id || n._id))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date) - new Date(a.date);
    });

  const unreadCount = notifications.filter(n => !readIds.includes(n.id || n._id)).length;

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(74,158,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <NotifIcon name="bell" color="#4a9eff" size={16} />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#e11d48", padding: "2px 8px", borderRadius: 99 }}>{unreadCount}</span>
            )}
          </h2>
          <p style={{ color: "#8b9bbf", fontSize: 13 }}>Platform updates, tips, and announcements for all users</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(74,158,255,0.3)", background: "rgba(74,158,255,0.08)", color: "#4a9eff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "update", "feature", "tip", "streak"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${filter === f ? "#4a9eff" : "rgba(255,255,255,0.1)"}`,
              background: filter === f ? "rgba(74,158,255,0.15)" : "transparent",
              color: filter === f ? "#4a9eff" : "#8b9bbf",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : TYPE_CONFIG[f]?.label || f}
          </button>
        ))}
        <button
          onClick={() => setShowUnreadOnly(p => !p)}
          style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${showUnreadOnly ? "#EF9F27" : "rgba(255,255,255,0.1)"}`,
            background: showUnreadOnly ? "rgba(239,159,39,0.12)" : "transparent",
            color: showUnreadOnly ? "#EF9F27" : "#8b9bbf",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Unread only
        </button>
      </div>

      {/* Notification list */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#8b9bbf", padding: 40 }}>Loading notifications...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>
            <NotifIcon name="bell" color="#8b9bbf" size={40} />
          </div>
          <p style={{ fontSize: 15, color: "#4a5568", fontWeight: 600 }}>
            {showUnreadOnly ? "All notifications read!" : "No notifications here yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(notif => {
            const nid = notif.id || notif._id;
            const isRead = readIds.includes(nid);
            const tc = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            return (
              <div
                key={nid}
                onClick={() => markRead(nid)}
                style={{
                  background: isRead ? "#18243a" : "#1a2a44",
                  border: `1px solid ${isRead ? "rgba(255,255,255,0.07)" : tc.color + "33"}`,
                  borderRadius: 14, padding: 18, cursor: "pointer",
                  transition: "all .2s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Unread dot */}
                {!isRead && (
                  <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: tc.color }} />
                )}

                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <NotifIcon name={notif.icon} color={tc.color} size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: tc.color, background: tc.bg, padding: "2px 7px", borderRadius: 5 }}>
                        {tc.label}
                      </span>
                      <span style={{ fontSize: 11, color: "#4a5568" }}>{notif.date}</span>
                      {notif.pinned && <span style={{ fontSize: 9, fontWeight: 700, color: "#EF9F27" }}>• PINNED</span>}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: isRead ? "#8b9bbf" : "#f0f4ff", marginBottom: 4 }}>{notif.title}</h3>
                    <p style={{ fontSize: 13, color: isRead ? "#4a5568" : "#8b9bbf", lineHeight: 1.6, marginBottom: notif.image ? 12 : 0 }}>{notif.message}</p>
                    
                    {/* Image support */}
                    {notif.image && (
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginTop: 12, background: "#000" }}>
                        <img src={notif.image} alt="news" style={{ width: "100%", height: "auto", display: "block", maxHeight: 500 }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: 14, background: "rgba(74,158,255,0.04)", border: "1px solid rgba(74,158,255,0.1)", borderRadius: 10 }}>
        <p style={{ fontSize: 12, color: "#4a5568", textAlign: "center" }}>
          Notifications are visible to all users. New announcements appear here automatically.
        </p>
      </div>
    </div>
  );
}