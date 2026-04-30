import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, User, Zap, ChevronRight, TrendingUp } from "lucide-react";
import BACKEND_URL from "../config/api.js";

export default function Leaderboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(-1);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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
    const isMe = user?.email === currentUser?.email;
    const height = rank === 1 ? 140 : (rank === 2 ? 110 : 90);
    const order = rank === 1 ? 2 : (rank === 2 ? 1 : 3);

    if (!user) return <div style={{ flex: 1 }} />;

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", order, animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}s`, opacity: 0 }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ 
            width: rank === 1 ? 70 : 60, height: rank === 1 ? 70 : 60, 
            borderRadius: "50%", border: rank === 1 ? "4px solid #fbbf24" : "3px solid rgba(255,255,255,0.1)",
            padding: 3, overflow: "hidden", position: "relative", zIndex: 2, background: "#131d2e",
            boxShadow: rank === 1 ? "0 0 30px rgba(251,191,36,0.3)" : "none"
          }}>
            {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <User size={rank === 1 ? 40 : 30} color="#64748b" />}
          </div>
          <div style={{ position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
            {rank === 1 && <Crown size={28} color="#fbbf24" fill="#fbbf24" />}
            {rank === 2 && <Medal size={22} color="#94a3b8" fill="#94a3b8" />}
            {rank === 3 && <Medal size={22} color="#b45309" fill="#b45309" />}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: isMe ? "#4a9eff" : "#fff", marginBottom: 8, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.username || "User"}
        </div>
        <div style={{ 
          width: "100%", height, background: rank === 1 ? "linear-gradient(180deg, rgba(251,191,36,0.2), transparent)" : "linear-gradient(180deg, rgba(255,255,255,0.05), transparent)", 
          borderRadius: "16px 16px 0 0", border: "1px solid rgba(255,255,255,0.05)", borderBottom: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: rank === 1 ? "#fbbf24" : "#fff" }}>{user.xp}</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>XP</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#0b1120", borderRadius: 28, border: "1px solid rgba(255,255,255,0.05)", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .others-row::-webkit-scrollbar { width: 4px; }
        .others-row::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
           <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
             <Trophy size={26} color="#fbbf24" /> Top Leaders
           </h2>
           <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>The elite learners of CEFR Center</p>
        </div>
        <TrendingUp color="#10b981" size={20} />
      </div>

      {loading ? (
        <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading Leaders...</div>
      ) : (
        <>
          {/* Podium */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 40, padding: "0 10px", minHeight: 220 }}>
             <PodiumItem user={top3[1]} rank={2} delay={0.1} />
             <PodiumItem user={top3[0]} rank={1} delay={0} />
             <PodiumItem user={top3[2]} rank={3} delay={0.2} />
          </div>

          {/* Others List */}
          <div className="others-row" style={{ maxHeight: 350, overflowY: "auto", paddingRight: 8 }}>
            {others.map((u, i) => {
              const rank = i + 4;
              const isMe = u.email === currentUser?.email;
              return (
                <div key={u.email} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 16, background: isMe ? "rgba(74,158,255,0.05)" : "rgba(255,255,255,0.02)", border: isMe ? "1px solid rgba(74,158,255,0.2)" : "1px solid transparent", marginBottom: 8 }}>
                  <div style={{ width: 40, fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.2)" }}>#{rank}</div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#131d2e", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                     {u.photoURL ? <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color="#64748b" style={{ margin: 9 }}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isMe ? "#4a9eff" : "#fff" }}>{u.username || "Learner"}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{u.level || "A1"} Level</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{u.xp.toLocaleString()}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#64748b" }}>XP</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current User Rank Bar */}
          {userRank > 50 && (
            <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4a9eff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>#{userRank}</div>
                 <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Your Current Position</div>
              </div>
              <ChevronRight size={18} color="#4a9eff" />
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 24, textAlign: "center", padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Zap size={16} color="#fbbf24" fill="#fbbf24" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#8b9bbf" }}>Top 1 leader gets <span style={{ color: "#fbbf24" }}>Golden Hall Pass</span>!</span>
      </div>
    </div>
  );
}
