import React, { useState, useEffect } from "react";
import { 
  Users, Send, Award, Heart, MessageSquare, Eye,
  Search, Filter, Plus, X, CheckCircle, AlertTriangle,
  BookOpen, Globe, Zap, History, ChevronRight, Edit3, Trash2
} from "lucide-react";
import BACKEND_URL from "./config/api.js";

// Sub-component for individual post to track views once on mount
const PostCard = ({ post, user, toggleLike, handleDelete }) => {

  return (
    <div key={post._id} className="post-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
           <div style={{ width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)" }}>
             {post.author?.[0]?.toUpperCase() || "?"}
           </div>
           <div>
             <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                @{post.author || "Learner"}
                {post.isStaff && <CheckCircle size={14} color="#4a9eff" fill="rgba(74,158,255,0.1)" />}
             </div>
             <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
           </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="cat-badge" style={{ 
            background: post.category === "Essay" ? "rgba(74,158,255,0.1)" : "rgba(239,159,39,0.1)",
            color: post.category === "Essay" ? "#4a9eff" : "#EF9F27",
            border: `1px solid ${post.category === "Essay" ? "rgba(74,158,255,0.2)" : "rgba(239,159,39,0.2)"}`,
            padding: "4px 8px", fontSize: 10
          }}>
            {post.category}
          </span>
          
          {user?.email === post.authorEmail && (
            <button 
              onClick={() => handleDelete(post._id)}
              style={{ background: "rgba(225,29,72,0.05)", border: "none", color: "#e11d48", padding: 6, borderRadius: 8, cursor: "pointer" }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12 }}>{post.title}</h2>
      
      <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 18, border: "1px solid rgba(255,255,255,0.03)", marginBottom: 20, fontStyle: "italic" }}>
        {post.content}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button 
            onClick={() => toggleLike(post._id)}
            style={{ 
              background: post.likes?.includes(user?.email) ? "rgba(225,29,72,0.08)" : "transparent",
              border: "none", 
              color: post.likes?.includes(user?.email) ? "#e11d48" : "#8b9bbf", 
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer", 
              fontSize: 13, fontWeight: 700, padding: "6px 10px", borderRadius: 10,
              transition: "0.2s"
            }}
          >
            <Heart size={18} fill={post.likes?.includes(user?.email) ? "#e11d48" : "none"} strokeWidth={post.likes?.includes(user?.email) ? 0 : 2.5} />
            {post.likes?.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Community({ user, progress }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({ title: "", content: "", category: "Essay" });
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Essay", "Email", "Letter", "Speaking", "Vocabulary"];

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/community/posts`);
      const d = await r.json();
      setPosts(d);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: 'info', msg: 'AI Moderator is reviewing...' });
    
    try {
      const url = `${BACKEND_URL}/api/community/post`;
      const method = "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: progress.username || user?.displayName || "Learner",
          authorEmail: user?.email,
          ...form
        })
      });
      const d = await r.json();
      
      if (d.success) {
        setStatus({ type: 'success', msg: 'Template approved and published!' });
        setForm({ title: "", content: "", category: "Essay" });
        setTimeout(() => { setShowAddModal(false); setStatus(null); }, 1500);
        fetchPosts();
      } else {
        setStatus({ type: 'error', msg: d.reason || d.error });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      const r = await fetch(`${BACKEND_URL}/api/community/delete/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorEmail: user?.email })
      });
      if (r.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      } else {
        alert("Failed to delete post.");
      }
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (postId) => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/community/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, email: user?.email })
      });
      if (r.ok) {
        // Optimistic update
        const updatedPosts = posts.map(p => {
          if (p._id === postId) {
            const hasLiked = p.likes.includes(user?.email);
            return {
              ...p,
              likes: hasLiked 
                ? p.likes.filter(em => em !== user?.email)
                : [...p.likes, user?.email]
            };
          }
          return p;
        });
        setPosts(updatedPosts);
      }
    } catch (e) { console.error(e); }
  };

  const filteredPosts = posts.filter(p => filter === "All" || p.category === filter);
  const [showCatModal, setShowCatModal] = useState(false);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .post-card { background: #131d2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 24px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .post-card:hover { border-color: rgba(74, 158, 255, 0.3); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .cat-badge { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .btn-primary { background: #4a9eff; color: #fff; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn-primary:active { transform: scale(0.95); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: #8b9bbf; border: 1px solid rgba(255,255,255,0.1); padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; }
        .sel-modal-btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; color: #fff; cursor: pointer; transition: 0.2s; }
        .sel-modal-btn:hover { background: rgba(255,255,255,0.08); border-color: #4a9eff88; }
        
        @media (max-width: 640px) {
           .post-card { padding: 18px; }
           .cat-badge { font-size: 9px; padding: 4px 8px; }
           .btn-primary, .btn-secondary { padding: 10px 16px; font-size: 14px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 14, letterSpacing: "-0.02em" }}>
            <Globe size={32} color="#4a9eff" /> Community Hub
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 15, marginTop: 4 }}>High-quality CEFR templates curated by AI</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={20} /> Share
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            style={{ 
              background: filter === c ? "#4a9eff" : "rgba(255,255,255,0.03)",
              color: filter === c ? "#fff" : "#8b9bbf",
              border: filter === c ? "none" : "1px solid rgba(255,255,255,0.05)",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "0.2s"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(74,158,255,0.1)", borderTopColor: "#4a9eff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <p style={{ color: "#8b9bbf", marginTop: 16, fontWeight: 600 }}>Syncing templates...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "rgba(255,255,255,0.01)", borderRadius: 32, border: "1px dashed rgba(255,255,255,0.08)" }}>
             <BookOpen size={48} color="#1e293b" style={{ margin: "0 auto 20px" }} />
             <p style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>No templates found in {filter} category.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              user={user} 
              toggleLike={toggleLike} 
              handleDelete={handleDelete} 
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: 32, maxWidth: 600, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, alignItems: "center" }}>
               <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Share Template</h2>
               <button onClick={() => { setShowAddModal(false); setForm({ title: "", content: "", category: "Essay" }); setStatus(null); }} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#8b9bbf", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePost}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                <div className="sel-modal-btn" onClick={() => setShowCatModal(true)}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{form.category}</span>
                  <ChevronRight size={18} color="#4a9eff" />
                </div>
              </div>
              
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Template Title</label>
                <input 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Formal Letter Structure"
                  required
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 18px", color: "#fff", outline: "none", fontSize: 15 }}
                />
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Template Content</label>
                <textarea 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  placeholder="Insert your CEFR/IELTS template here..."
                  required
                  rows={8}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "18px", color: "#fff", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.6 }}
                />
              </div>

              {status && (
                <div style={{ 
                  padding: 14, borderRadius: 16, marginBottom: 24, 
                  background: status.type === 'error' ? 'rgba(225,29,72,0.1)' : 'rgba(74,158,255,0.1)',
                  border: `1px solid ${status.type === 'error' ? '#e11d48' : '#4a9eff'}`,
                  color: status.type === 'error' ? '#e11d48' : '#4a9eff',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12
                }}>
                  {status.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                  {status.msg}
                </div>
              )}

              <div style={{ display: "flex", gap: 14 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowAddModal(false); setForm({ title: "", content: "", category: "Essay" }); setStatus(null); }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={submitting}>
                  {submitting ? "Analyzing..." : "Publish Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#131d2e", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, color: "#fff" }}>Select Template Type</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categories.filter(c => c !== "All").map(c => (
                <div 
                  key={c} 
                  onClick={() => { setForm({...form, category: c}); setShowCatModal(false); }}
                  style={{ 
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px",
                    background: form.category === c ? "rgba(74,158,255,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${form.category === c ? "#4a9eff" : "transparent"}`,
                    borderRadius: 16, cursor: "pointer", color: form.category === c ? "#4a9eff" : "#8b9bbf", fontWeight: 700,
                    transition: "0.2s"
                  }}
                >
                  {c}
                  {form.category === c && <CheckCircle size={20} />}
                </div>
              ))}
            </div>
            <button onClick={() => setShowCatModal(false)} style={{ width: "100%", marginTop: 24, padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#64748b", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
