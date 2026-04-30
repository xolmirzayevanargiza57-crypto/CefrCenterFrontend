import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, ChevronUp, ChevronDown, User, Zap } from "lucide-react";

import BACKEND_URL from "../config/api.js";

export default function Leaderboard({ currentUser }) {
  const [period, setPeriod] = useState("all"); // all, month, today
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(-1);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/leaderboard?period=${period}&email=${encodeURIComponent(currentUser?.email || "")}`);
      const data = await resp.json();
      setUsers(data.users || []);
      setUserRank(data.userRank);
    } catch (e) {
      console.error("Leaderboard fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-container" style={{
      background: "linear-gradient(135deg, #131d2e 0%, #0b1120 100%)",
      borderRadius: "24px",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "24px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .period-tab {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          background: transparent;
        }
        .period-tab.active {
          background: rgba(74, 158, 255, 0.1);
          color: #4a9eff;
          border-color: rgba(74, 158, 255, 0.2);
        }
        .period-tab:not(.active) {
          color: #64748b;
        }
        .period-tab:hover:not(.active) {
          background: rgba(255,255,255,0.03);
          color: #94a3b8;
        }
        .rank-card {
           display: flex;
           align-items: center;
           gap: 16px;
           padding: 12px 16px;
           border-radius: 16px;
           background: rgba(255,255,255,0.02);
           margin-bottom: 8px;
           transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rank-card:hover {
           background: rgba(255,255,255,0.04);
           transform: scale(1.02);
           box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .rank-card.me {
           border: 1px solid rgba(74, 158, 255, 0.3);
           background: rgba(74, 158, 255, 0.05);
        }
        @media (max-width: 480px) {
          .leaderboard-container { padding: 16px !important; }
          .rank-card { gap: 10px !important; padding: 10px !important; }
          .rank-card span { font-size: 10px !important; }
          .rank-card h4 { font-size: 13px !important; }
          .period-tab { padding: 6px 10px !important; font-size: 11px !important; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={22} className="text-yellow-400" /> Hall of Fame
          </h2>
          <p style={{ fontSize: 12, color: "#64748b" }}>Top learners competing for mastery</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 14 }}>
          <button className={`period-tab ${period === "today" ? "active" : ""}`} onClick={() => setPeriod("today")}>Today</button>
          <button className={`period-tab ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>Month</button>
          <button className={`period-tab ${period === "all" ? "active" : ""}`} onClick={() => setPeriod("all")}>All</button>
        </div>
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>Loading rankings...</div>
        ) : (
          <>
            {users.map((u, idx) => {
              const rank = idx + 1;
              const isMe = u.email === currentUser?.email;
              const daysActive = u.totalDaysActive || 1;
              
              return (
                <div key={u.email} className={`rank-card ${isMe ? "me" : ""}`} style={{
                  animation: `slideIn 0.4s ease backwards ${idx * 0.05}s`
                }}>
                  <div style={{ width: 32, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {rank === 1 && <Crown size={22} color="#fbbf24" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.4))" }} />}
                    {rank === 2 && <Medal size={20} color="#94a3b8" fill="#94a3b8" />}
                    {rank === 3 && <Medal size={20} color="#b45309" fill="#b45309" />}
                    {rank > 3 && <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.2)" }}>#{rank}</span>}
                  </div>
                  
                  <div style={{ position: "relative" }}>
                    <div style={{ 
                      width: 38, height: 38, borderRadius: "50%", 
                      background: rank === 1 ? "linear-gradient(135deg, #fbbf24, #d97706)" : (isMe ? "#4a9eff" : "#1e3a5f"), 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 900, color: "#fff",
                      textTransform: "uppercase",
                      boxShadow: rank === 1 ? "0 4px 12px rgba(217,119,6,0.3)" : "none",
                      overflow: "hidden",
                      border: isMe ? "2px solid #4a9eff" : "2px solid rgba(255,255,255,0.05)"
                    }}>
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        u.username?.[0] || u.email?.[0] || "?"
                      )}
                    </div>
                    {u.isPremium && (
                      <div style={{ position: "absolute", bottom: -2, right: -2, background: "#EF9F27", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #131d2e" }}>
                        <Star size={8} fill="#fff" color="#fff" />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isMe ? "#4a9eff" : "#f0f4ff", display: "flex", alignItems: "center", gap: 6 }}>
                      {u.username || u.email.split("@")[0]}
                      {isMe && <span style={{ fontSize: 9, background: "rgba(74,158,255,0.2)", padding: "2px 6px", borderRadius: 4 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 8 }}>
                      <span>Level {u.level || "A1"}</span>
                      <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                      <span>{daysActive}d active</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: rank === 1 ? "#fbbf24" : "#fff" }}>{u.xp.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>XP</div>
                  </div>
                </div>
              );
            })}
            
            {users.length === 0 && !loading && (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: 13 }}>No rankings yet for today.</p>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ 
        marginTop: 20, padding: "16px", borderRadius: "16px", 
        background: "rgba(74, 158, 255, 0.05)", border: "1px solid rgba(74, 158, 255, 0.1)",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "12px", background: "rgba(74, 158, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={18} className="text-blue-400" fill="#4a9eff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f4ff" }}>Ready up!</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Rank #1 gets 2x daily bonus!</div>
        </div>
      </div>
    </div>
  );
}
