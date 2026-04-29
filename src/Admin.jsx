import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Plus, Trash2, Image as ImageIcon, 
  Send, ArrowLeft, LogOut, ShieldCheck, 
  Type, MessageSquare, Pin, X, Check, User,
  Headphones, Mic, Pen, Coins, Flame, Star,
  Zap, Award, BookOpen, Activity, Heart, Globe
} from "lucide-react";

import BACKEND_URL from "./config/api.js";

const TYPES = [
  { id: "update",  label: "Update",  color: "#378ADD" },
  { id: "feature", label: "Feature", color: "#7F77DD" },
  { id: "tip",     label: "Tip",     color: "#1D9E75" },
  { id: "streak",  label: "Streak",  color: "#EF9F27" },
  { id: "info",    label: "Info",    color: "#D4537E" },
];

const ICONS = [
  { id: "bell",       icon: <Bell size={18} /> },
  { id: "headphones", icon: <Headphones size={18} /> },
  { id: "mic",        icon: <Mic size={18} /> },
  { id: "pen",        icon: <Pen size={18} /> },
  { id: "coin",       icon: <Coins size={18} /> },
  { id: "fire",       icon: <Flame size={18} /> },
  { id: "star",       icon: <Star size={18} /> },
  { id: "zap",        icon: <Zap size={18} /> },
  { id: "award",      icon: <Award size={18} /> },
  { id: "book",       icon: <BookOpen size={18} /> },
  { id: "heart",      icon: <Heart size={18} /> },
  { id: "activity",   icon: <Activity size={18} /> },
  { id: "globe",      icon: <Globe size={18} /> },
];

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState([]);
  const [allLessons, setAllLessons] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "...", uptime: 0 });
  
  // Selection Modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "update",
    icon: "bell",
    pinned: false,
    image: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("notifs");

  // Content Manager State
  const [cmType, setCmType] = useState("listening");
  const [cmForm, setCmForm] = useState({
    title: "", level: "B1–C1", duration: 30, totalQuestions: 35,
    prompt: "", tips: "", imgUrl: "", audioUrl: "", 
    partId: 1, partLabel: "Part 1", partTitle: "", partType: "mcq_short",
    questions: [{ id: 1, text: "", answer: "" }],
    // Vocabulary specific
    word: "", definition: "", sentence: "", translation: ""
  });
  const [cmSubmitting, setCmSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cefr_admin_token");
    if (!token) {
      navigate("/login");
    } else {
      setIsAdmin(true);
      fetchNotifs();
      fetchStats();
      fetchLessons();
    }
  }, [navigate]);

  const fetchLessons = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/lessons`);
      const data = await r.json();
      setAllLessons(data);
    } catch (e) {
      console.error("Fetch lessons error:", e);
    }
  };

  const fetchStats = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await r.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifs = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/notifications`);
      const data = await r.json();
      setNotifs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (type, id) => {
    if (!window.confirm("Delete this entire Test Unit?")) return;
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/lessons/${type.split('_')[0].toLowerCase()}/${id}`, { method: "DELETE" });
      if (r.ok) fetchLessons();
    } catch (e) {
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cefr_admin_token");
    navigate("/login");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200; // Increased for better quality
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        
        const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.85); // Adjusted quality
        setForm({ ...form, image: optimizedBase64 });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (r.ok) {
        setForm({ title: "", message: "", type: "update", icon: "bell", pinned: false, image: "" });
        fetchNotifs();
        alert("Published successfully!");
      }
    } catch (e) {
      alert("Failed to add notification");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await fetch(`${BACKEND_URL}/api/notifications/${id}`, { method: "DELETE" });
      fetchNotifs();
    } catch (e) {
      alert("Delete failed");
    }
  };

  const handleCmSubmit = async (e) => {
    e.preventDefault();
    setCmSubmitting(true);
    try {
      if (cmType === "vocab") {
        const r = await fetch(`${BACKEND_URL}/api/admin/add-vocab`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            word: cmForm.word, 
            definition: cmForm.definition, 
            sentence: cmForm.sentence,
            uz: cmForm.translation // Match vocabulary.json schema
          })
        });
        if (r.ok) {
          alert("Vocabulary added!");
          setCmForm({ ...cmForm, word: "", definition: "", sentence: "", translation: "" });
        }
      } else {
        // Build lesson object
        const lesson = {
          title: cmForm.title,
          level: cmForm.level || "B1-C1",
          duration: parseInt(cmForm.duration) || 30,
          totalQuestions: parseInt(cmForm.totalQuestions) || 40,
          parts: [{
            id: parseInt(cmForm.partId) || 1,
            label: cmForm.partLabel || `Part ${cmForm.partId}`,
            title: cmForm.partTitle || "Sample Part",
            type: cmForm.partType || (cmType === "listening" ? "mcq_short" : "note"),
            audioUrl: cmForm.audioUrl,
            imageUrl: cmForm.imgUrl,
            prompt: cmForm.prompt,
            questions: cmForm.questions.filter(q => q.text.trim()),
            tips: cmForm.tips.split('\n').filter(t => t.trim())
          }]
        };
        const r = await fetch(`${BACKEND_URL}/api/admin/add-lesson`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: cmType, lesson })
        });
        if (r.ok) {
          alert("Lesson added successfully! All users will see it now.");
          setCmForm({
            title: "", level: "B1–C1", duration: 30, totalQuestions: 35,
            prompt: "", tips: "", imgUrl: "", audioUrl: "", 
            partId: 1, partLabel: "Part 1", partTitle: "", partType: "mcq_short",
            questions: [{ id: 1, text: "", answer: "" }],
            word: "", definition: "", sentence: "", translation: ""
          });
          fetchLessons();
        } else {
          const err = await r.json();
          alert("Server error: " + (err.error || "Unknown error"));
        }
      }
    } catch (e) {
      alert("Failed to save content");
    } finally {
      setCmSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0b1120", color: "#f0f4ff", fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-card { background: #131d2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; transition: all 0.3s; }
        .admin-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; color: #fff; font-size: 14px; outline: none; }
        .admin-input:focus { border-color: #4a9eff; background: rgba(255,255,255,0.06); }
        .sel-btn { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; color: #f0f4ff; }
        @media (max-width: 850px) { 
          .admin-grid { grid-template-columns: 1fr !important; } 
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .admin-header { flex-direction: column; align-items: flex-start !important; }
          .admin-tabs { width: 100%; overflow-x: auto; padding-bottom: 5px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .admin-card { padding: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30, flexWrap: "wrap", gap: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ width: 44, height: 44, background: "#4a9eff20", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a9eff" }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
              <p style={{ fontSize: 13, color: "#64748b" }}>Manage app content & users</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
             <button onClick={() => setActiveTab("notifs")} style={{ padding: "10px 18px", borderRadius: 12, border: activeTab === "notifs" ? "1px solid #4a9eff" : "1px solid rgba(255,255,255,0.1)", background: activeTab === "notifs" ? "#4a9eff20" : "transparent", color: activeTab === "notifs" ? "#4a9eff" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Notifications</button>
             <button onClick={handleLogout} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "#e11d48", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, marginLeft: 10 }}>Exit Admin</button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Users", val: stats.totalUsers, col: "#4a9eff", icon: <User size={20} /> },
            { label: "Active (24h)", val: stats.recentUsers, col: "#1D9E75", icon: <Activity size={20} /> },
            { label: "DB Status", val: stats.dbStatus, col: stats.dbStatus === "connected" ? "#1D9E75" : "#e11d48", icon: <Globe size={20} /> },
            { label: "Uptime", val: Math.floor(stats.uptime / 3600) + "h", col: "#EF9F27", icon: <Zap size={20} /> }
          ].map((s, i) => (
            <div key={i} className="admin-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ padding: 10, background: `${s.col}15`, color: s.col, borderRadius: 12 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{s.val}</h4>
              </div>
            </div>
          ))}
        </div>

        {activeTab === "notifs" ? (
          <div className="admin-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>

          
          {/* Creator */}
          <div className="admin-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Plus size={20} color="#4a9eff" /> Draft New Announcement
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
                <input className="admin-input" type="text" placeholder="Something new happened..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Message</label>
                <textarea className="admin-input" rows={4} placeholder="Details about this news..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required style={{ resize: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Category</label>
                  <div className="sel-btn" onClick={() => setShowTypeModal(true)}>
                    <span>{TYPES.find(t=>t.id===form.type)?.label}</span>
                    <Type size={14} color="#64748b" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>Visual Icon</label>
                  <div className="sel-btn" onClick={() => setShowIconModal(true)}>
                    <span>{ICONS.find(i=>i.id===form.icon)?.id}</span>
                    <div style={{ color: "#64748b" }}>{ICONS.find(i=>i.id===form.icon)?.icon}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 14, border: "0.5px solid rgba(255,255,255,0.05)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Feature Photo</span>
                    <button type="button" onClick={() => document.getElementById("img-up").click()} style={{ fontSize: 11, background: "#4a9eff15", border: "1px solid #4a9eff30", color: "#4a9eff", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>
                      {form.image ? "Change Photo" : "Upload Image"}
                    </button>
                    <input id="img-up" type="file" hidden accept="image/*" onChange={handleImage} />
                 </div>
                 {form.image && (
                   <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 10, overflow: "hidden", background: "#000" }}>
                      <img src={form.image} alt="prev" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      <button type="button" onClick={() => setForm({...form, image: ""})} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", padding: 6, cursor: "pointer", color: "#fff" }}><X size={14} /></button>
                   </div>
                 )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setForm({...form, pinned: !form.pinned})}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: form.pinned ? "#EF9F27" : "#1e293b", position: "relative", transition: "0.3s" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.pinned ? 19 : 3, transition: "0.3s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Pin at top of feed</span>
              </div>

              <button type="submit" disabled={submitting} style={{ background: "#4a9eff", color: "#fff", padding: 14, borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 }}>
                {submitting ? "Publishing..." : <><Send size={18} /> Push Announcement</>}
              </button>
            </form>
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="admin-card" style={{ padding: 20 }}>
               <h3 style={{ fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 15 }}>Recent Posts</h3>
               <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                 {notifs.map(n => (
                   <div key={n._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "0.5px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", background: "#000", flexShrink: 0 }}>
                        {n.image ? <img src={n.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b" }}><Bell size={14} color="#64748b" /></div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</h4>
                        <p style={{ fontSize: 10, color: "#64748b" }}>{n.type} · {n.date}</p>
                      </div>
                      <button onClick={() => deleteNotif(n._id)} style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", color: "#e11d48", cursor: "pointer" }}><Trash2 size={16} /></button>
                   </div>
                 ))}
                 {notifs.length === 0 && <p style={{ textAlign: "center", color: "#4a5568", marginTop: 20, fontSize: 12 }}>No posts yet.</p>}
                </div>
             </div>
           </div>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 40, textAlign: "center" }}>
             <Activity size={48} color="#4a9eff" style={{ opacity: 0.1, marginBottom: 20 }} />
             <h2 style={{ fontSize: 20, color: "#94a3b8" }}>Notification Center</h2>
             <p style={{ color: "#64748b", marginTop: 10 }}>Select a tab to manage student communications.</p>
          </div>
        )}

      {/* SELECT MODALS */}
      {(showTypeModal || showIconModal) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#131d2e", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: 24, maxWidth: 350, width: "100%" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>{showTypeModal ? "Select Category" : "Select Icon"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {showTypeModal ? TYPES.map(t => (
                <div key={t.id} onClick={() => { setForm({...form, type: t.id}); setShowTypeModal(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: form.type === t.id ? `${t.color}15` : "rgba(255,255,255,0.03)", borderRadius: 10, cursor: "pointer", border: `1px solid ${form.type === t.id ? t.color : "transparent"}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: form.type === t.id ? t.color : "#94a3b8" }}>{t.label}</span>
                  {form.type === t.id && <Check size={14} color={t.color} />}
                </div>
              )) : ICONS.map(i => (
                <div key={i.id} onClick={() => { setForm({...form, icon: i.id}); setShowIconModal(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: form.icon === i.id ? "#4a9eff15" : "rgba(255,255,255,0.03)", borderRadius: 10, cursor: "pointer", border: `1px solid ${form.icon === i.id ? "#4a9eff" : "transparent"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ color: form.icon === i.id ? "#4a9eff" : "#64748b" }}>{i.icon}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: form.icon === i.id ? "#4a9eff" : "#94a3b8" }}>{i.id}</span>
                  </div>
                  {form.icon === i.id && <Check size={14} color="#4a9eff" />}
                </div>
              ))}
            </div>
            <button onClick={() => { setShowTypeModal(false); setShowIconModal(false); }} style={{ width: "100%", marginTop: 20, padding: 12, borderRadius: 10, border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
