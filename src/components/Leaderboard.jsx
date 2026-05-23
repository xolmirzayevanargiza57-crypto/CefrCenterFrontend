import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, User, Zap, ChevronRight, TrendingUp, Award, Flame, Target } from "lucide-react";
import BACKEND_URL from "../config/api.js";

const COLORS = {
  gold: "#1D9E75",
  silver: "#10b981",
  bronze: "#059669",
  premium: "#4a9eff",
  bg: "#0f172a",
  accent: "#1D9E75"
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
    const height = rank === 1 ? 180 : (rank === 2 ? 140 : 120);
    const color = rank === 1 ? COLORS.gold : (rank === 2 ? COLORS.silver : COLORS.bronze);
    const order = rank === 1 ? 2 : (rank === 2 ? 1 : 3);

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", order, animation: `podiumIn 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${delay}s`, opacity: 0 }}>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{ 
            width: rank === 1 ? 90 : 76, height: rank === 1 ? 90 : 76, 
            borderRadius: "50%", border: `3px solid ${color}`,
            padding: 4, overflow: "hidden", position: "relative", zIndex: 2, background: "#1e293b",
            boxShadow: `0 10px 40px ${color}33`,
            transition: "0.3s"
          }}>
            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <User size={rank === 1 ? 40 : 32} color="#94a3b8" style={{ margin: "auto" }} />}
          </div>
          <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
            {rank === 1 && <Crown size={36} color={color} fill={color} style={{ filter: "drop-shadow(0 4px 10px rgba(251,191,36,0.6))" }} />}
            {rank === 2 && <Medal size={28} color={color} fill={color} />}
            {rank === 3 && <Medal size={28} color={color} fill={color} />}
          </div>
        </div>
        
        <div style={{ 
          width: "100%", height, 
          background: rank === 1 ? `linear-gradient(180deg, ${color}22, transparent)` : "rgba(255,255,255,0.03)", 
          borderRadius: "24px 24px 12px 12px", 
          border: `1px solid ${color}44`, 
          borderBottom: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          position: "relative",
          boxShadow: rank === 1 ? "0 -20px 40px rgba(0,0,0,0.4)" : "none"
        }}>
          <div style={{ position: "absolute", top: -14, background: color, color: "#000", fontSize: 12, fontWeight: 900, padding: "2px 10px", borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>#{rank}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: isMe ? COLORS.premium : "#fff", textAlign: "center", maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username || "User"}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{user.xp}</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Points</div>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-card" style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(20px)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", padding: 40, boxShadow: "0 40px 100px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes podiumIn { from { opacity: 0; transform: translateY(60px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .lb-scroll::-webkit-scrollbar { width: 5px; }
        .lb-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        
        @media (max-width: 640px) {
          .leaderboard-card { padding: 20px 10px !important; border-radius: 20px !important; }
          .lb-header { flex-direction: column !important; gap: 15px !important; margin-bottom: 30px !important; }
          .podium-wrap { gap: 8px !important; padding: 0 5px !important; min-height: 280px !important; transform: scale(0.95); }
          .rank-item { padding: 12px !important; gap: 12px !important; border-radius: 16px !important; }
          .rank-item h3 { font-size: 14px !important; }
          .rank-item .xp { font-size: 16px !important; }
        }
      `}</style>

      {/* Decorative Orbs */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(74,158,255,0.05) 0%, transparent 70%)", zIndex: 0 }} />

      <div className="lb-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
             <div style={{ background: "rgba(251,191,36,0.1)", p: 10, borderRadius: 16, display: "flex", padding: 10 }}>
               <Trophy size={32} color="#fbbf24" style={{ filter: "drop-shadow(0 0 12px rgba(251,191,36,0.4))" }} />
             </div>
             <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Hall of Fame</h2>
           </div>
           <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>Battle for the top spot. Refreshes every hour.</p>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
             <TrendingUp size={18} color={COLORS.gold} />
             <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Season 4</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 450, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
           <div style={{ width: 50, height: 50, border: "4px solid rgba(255,255,255,0.05)", borderTopColor: COLORS.premium, borderRadius: "50%", animation: "lb-spin 1s linear infinite" }} />
           <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600, letterSpacing: 0.5 }}>Syncing world records...</p>
           <style>{`@keyframes lb-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          <div className="podium-wrap" style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 60, padding: "0 40px", minHeight: 320, position: "relative", zIndex: 1 }}>
             <PodiumItem user={top3[1]} rank={2} delay={0.2} />
             <PodiumItem user={top3[0]} rank={1} delay={0} />
             <PodiumItem user={top3[2]} rank={3} delay={0.4} />
          </div>

          <div className="lb-scroll" style={{ maxHeight: 450, overflowY: "auto", paddingRight: 12, display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
            {others.map((u, i) => {
              const rank = i + 4;
              const isMe = u.email === currentUser?.email;
              return (
                <div key={u.email} className="rank-item" style={{ 
                  display: "flex", alignItems: "center", gap: 20, 
                  padding: "18px 24px", borderRadius: 24, 
                  background: isMe ? "rgba(74,158,255,0.12)" : "rgba(255,255,255,0.02)", 
                  border: isMe ? `1px solid ${COLORS.premium}55` : "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `slideIn 0.5s ease-out forwards ${0.5 + (i * 0.05)}s`,
                  opacity: 0
                }}>
                  <div style={{ width: 40, fontSize: 16, fontWeight: 900, color: isMe ? COLORS.premium : "#475569" }}>{rank}</div>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1e293b", border: "2px solid rgba(255,255,255,0.1)", overflow: "hidden", position: "relative" }}>
                     {u.photoURL ? <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={22} color="#64748b" style={{ margin: "13px" }}/>}
                     {u.isPremium && <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, background: COLORS.premium, borderRadius: "50%", border: "2.5px solid #1e293b" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isMe ? COLORS.premium : "#fff" }}>{u.username || "Candidate"}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{u.level || "A1"} Explorer</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: isMe ? COLORS.premium : "#fff" }}>{u.xp.toLocaleString()}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>XP</div>
                  </div>
                </div>
              );
            })}
          </div>

          {userRank > 0 && (
            <div style={{ marginTop: 40, padding: "24px 32px", borderRadius: 28, background: "linear-gradient(90deg, #1e1b4b, #0f172a)", border: "1px solid rgba(74,158,255,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                 <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", boxShadow: "0 10px 20px rgba(79,70,229,0.4)" }}>#{userRank}</div>
                 <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Your Current Position</div>
                    <div style={{ fontSize: 13, color: "#8b9bbf", fontWeight: 500 }}>Ranked globally among {users.length * 10}+ students</div>
                 </div>
              </div>
              <button onClick={fetchLeaderboard} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 16, padding: "12px 24px", cursor: "pointer", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 10, transition: "0.2s" }}>
                Update <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 48, textAlign: "center", padding: "20px", background: "rgba(29,158,117,0.05)", borderRadius: 24, border: "1px solid rgba(29,158,117,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, position: "relative", zIndex: 1 }}>
        <div style={{ background: "#1D9E75", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <Target size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#8b9bbf" }}>Top 3 learners win <span style={{ color: "#1D9E75", fontWeight: 800 }}>Premium Plus</span> for the next season!</span>
      </div>
    </div>
  );
}
