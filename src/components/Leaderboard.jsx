import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, User, Zap, ChevronRight, TrendingUp, Award, Flame } from "lucide-react";
import BACKEND_URL from "../config/api.js";

const COLORS = {
  gold: "#fbbf24",
  silver: "#94a3b8",
  bronze: "#b45309",
  premium: "#4a9eff",
  bg: "#131d2e",
  border: "rgba(255,255,255,0.08)"
};

export default function Leaderboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(-1);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/leaderboard?email=${encodeURIComponent(currentUser?.email || "")}`);
      const data = await resp.json();
      setUsers(data.users || []);
      setUserRank(data.userRank);
    } catch (e) {
      console.error("Leaderboard error", e);
    } finally {
      setLoading(false);
    }
  };

  const top3 = users.slice(0, 3);
  const others = users.slice(3);

  const PodiumItem = ({ user, rank, delay }) => {
    if (!user) return <div style={{ flex: 1 }} />;
    const isMe = user?.email === currentUser?.email;
    const height = rank === 1 ? 160 : (rank === 2 ? 120 : 100);
    const color = rank === 1 ? COLORS.gold : (rank === 2 ? COLORS.silver : COLORS.bronze);
    const order = rank === 1 ? 2 : (rank === 2 ? 1 : 3);

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", order, animation: `slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`, opacity: 0 }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ 
            width: rank === 1 ? 80 : 66, height: rank === 1 ? 80 : 66, 
            borderRadius: "50%", border: rank === 1 ? `4px solid ${color}` : `2px solid ${color}44`,
            padding: 4, overflow: "hidden", position: "relative", zIndex: 2, background: COLORS.bg,
            boxShadow: rank === 1 ? `0 0 40px ${color}44` : "none"
          }}>
            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <User size={rank === 1 ? 36 : 28} color="#64748b" />}
          </div>
          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", zIndex: 3, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
            {rank === 1 && <Crown size={32} color={color} fill={color} />}
            {rank === 2 && <Award size={24} color={color} fill={color} />}
            {rank === 3 && <Award size={24} color={color} fill={color} />}
          </div>
        </div>
        <div className="podium-user-name" style={{ fontSize: 14, fontWeight: 900, color: isMe ? COLORS.premium : "#fff", marginBottom: 12, textAlign: "center", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
          {user.username || "User"}
        </div>
        <div style={{ 
          width: "100%", height, 
          background: `linear-gradient(180deg, ${color}22, transparent)`, 
          borderRadius: "20px 20px 0 0", 
          border: `1px solid ${color}33`, 
          borderBottom: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          position: "relative"
        }}>
          <div style={{ position: "absolute", top: -12, background: color, color: "#000", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 10 }}>#{rank}</div>
          <div className="podium-xp" style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{user.xp}</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Points</div>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-container" style={{ background: "#0b1120", borderRadius: 32, border: "1px solid rgba(255,255,255,0.06)", padding: 32, boxShadow: "0 40px 100px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .others-scroll::-webkit-scrollbar { width: 4px; }
        .others-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        @media (max-width: 640px) {
          .leaderboard-container { padding: 20px !important; }
          .leaderboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .podium-section { gap: 8px !important; padding: 0 !important; min-height: 220px !important; }
          .podium-user-name { font-size: 11px !important; }
          .podium-xp { font-size: 16px !important; }
          .user-rank-summary { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>

      {/* Hero Header */}
      <div className="leaderboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
             <div style={{ background: "rgba(251,191,36,0.1)", p: 8, borderRadius: 12, display: "flex", p: 8 }}>
               <Trophy size={28} color="#fbbf24" style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.3))" }} />
             </div>
             <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>Global Rankings</h2>
           </div>
           <p style={{ color: "#8b9bbf", fontSize: 14, fontWeight: 600 }}>The top 100 high-performers active this month</p>
        </div>
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <Flame size={18} color="#10b981" />
          <span style={{ color: "#10b981", fontSize: 13, fontWeight: 800 }}>LIVE SHOW</span>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
           <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.05)", borderTopColor: COLORS.premium, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
           <p style={{ color: "#64748b", fontSize: 14, fontWeight: 700 }}>Recalculating Rankings...</p>
           <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Podium Section */}
          <div className="podium-section" style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 48, padding: "0 20px", minHeight: 280 }}>
             <PodiumItem user={top3[1]} rank={2} delay={0.15} />
             <PodiumItem user={top3[0]} rank={1} delay={0} />
             <PodiumItem user={top3[2]} rank={3} delay={0.3} />
          </div>

          {/* List Section */}
          <div className="others-scroll" style={{ maxHeight: 400, overflowY: "auto", paddingRight: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            {others.map((u, i) => {
              const rank = i + 4;
              const isMe = u.email === currentUser?.email;
              return (
                <div key={u.email} style={{ 
                  display: "flex", alignItems: "center", gap: 16, 
                  padding: "16px 20px", borderRadius: 20, 
                  background: isMe ? "rgba(74,158,255,0.08)" : "rgba(255,255,255,0.03)", 
                  border: isMe ? `1px solid ${COLORS.premium}44` : "1px solid transparent",
                  transition: "transform 0.2s, background 0.2s"
                }}>
                  <div style={{ width: 36, fontSize: 14, fontWeight: 900, color: isMe ? COLORS.premium : "rgba(255,255,255,0.15)" }}>{rank}</div>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#131d2e", border: "2px solid rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
                     {u.photoURL ? <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={20} color="#64748b" style={{ margin: 12 }}/>}
                     {u.isPremium && <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, background: COLORS.premium, borderRadius: "50%", border: "2px solid #131d2e" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isMe ? COLORS.premium : "#fff" }}>{u.username || "Learner"}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{u.level || "A1"} Proficiency</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: isMe ? COLORS.premium : "#fff" }}>{u.xp.toLocaleString()}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Total XP</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Specific Rank Summary */}
          {userRank > 0 && (
            <div className="user-rank-summary" style={{ marginTop: 32, padding: "20px 24px", borderRadius: 24, background: "linear-gradient(90deg, #1e293b, #0f172a)", border: "1px solid rgba(74,158,255,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                 <div style={{ width: 48, height: 48, borderRadius: 14, background: COLORS.premium, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", boxShadow: `0 0 20px ${COLORS.premium}44` }}>#{userRank}</div>
                 <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Status: {userRank <= 10 ? "Elite Learner" : "Active Master"}</div>
                    <div style={{ fontSize: 12, color: "#8b9bbf" }}>You are in the top {Math.max(1, Math.ceil((userRank/users.length)*100))}% are learners</div>
                 </div>
              </div>
              <button onClick={fetchLeaderboard} style={{ background: "rgba(74,158,255,0.1)", border: "none", color: COLORS.premium, borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                Refresh <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 32, textAlign: "center", padding: "16px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Zap size={18} color="#fbbf24" fill="#fbbf24" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#8b9bbf" }}>Weekly champion receives a <span style={{ color: "#fbbf24" }}>Diamond Certificate Portfolio</span>!</span>
      </div>
    </div>
  );
}
