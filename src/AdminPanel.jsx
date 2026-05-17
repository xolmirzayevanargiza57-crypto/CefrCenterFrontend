import React, { useState, useEffect, useCallback } from "react";
import { 
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle, 
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star
} from "lucide-react";
import BACKEND_URL from "./config/api";

// Admin security legacy module removed.

// --- MAIN ADMIN PANEL ---
export default function AdminPanel({ user, onBack }) {
  const [isVerified, setIsVerified] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === "xojiakbar@admin.com" && loginForm.password === "15203738f$DriWkl46aX[&") {
      setIsVerified(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Access denied.");
    }
  };

  const [tab, setTab] = useState("dashboard");
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "connected" });
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [securityForm, setSecurityForm] = useState({ otpCode: "", faceIdToken: "" });
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info", image: "" });

  const adminEmail = user?.email || "admin@cefr.center";
  const hdrs = { "x-user-email": adminEmail };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes, sRes, nRes, secRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/stats?email=${adminEmail}`),
        fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/security?email=${adminEmail}`, { headers: hdrs })
      ]);

      if (pRes.ok) setPayments(await pRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (nRes.ok) setNotifs(await nRes.json());
      if (secRes.ok) {
        const sec = await secRes.json();
        setSecurityForm({ otpCode: sec.otpCode, faceIdToken: sec.faceIdToken });
      }
    } catch (e) { console.error("Load failed", e); }
    finally { setLoading(false); }
  }, [adminEmail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (id, action, reason = "") => {
    try {
      const endpoint = action === "delete" ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason }) : null
      });
      if (res.ok) loadData();
    } catch (e) { alert("Action failed"); }
  };

  const handleRevokePremium = async (email) => {
    const reason = prompt(`Enter reason for revoking premium for ${email}:`);
    if (reason === null) return; // User cancelled
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${email}/remove-premium`, {
        method: "POST", 
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Administrative action" })
      });
      if (res.ok) {
        loadData();
        alert("Premium revoked and user notified.");
      }
    } catch (e) { alert("Failed to revoke"); }
  };

  const updateSecurity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/security/update`, {
        method: "POST", headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, ...securityForm })
      });
      if (res.ok) alert("Security settings updated successfully!");
    } catch (e) { alert("Update failed"); }
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", notifForm.title);
      formData.append("message", notifForm.message);
      formData.append("type", notifForm.type);
      formData.append("icon", notifForm.icon || "bell");
      if (notifForm.imageFile) {
        formData.append("imageFile", notifForm.imageFile);
      } else {
        formData.append("imageUrl", notifForm.image);
      }

      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: "POST", 
        headers: { "x-user-email": adminEmail },
        body: formData
      });
      if (res.ok) {
        setNotifForm({ title: "", message: "", type: "info", image: "", imageFile: null, icon: "bell" });
        loadData();
        alert("Broadcast sent successfully!");
      } else {
        const errData = await res.json();
        alert(`Failed to send: ${errData.error || "Unknown error"}`);
      }
    } catch (e) { alert("Connection failed. Check your network."); }
    finally { setLoading(false); }
  };

  const deleteNotif = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, { method: "DELETE", headers: hdrs });
      if (res.ok) loadData();
    } catch (e) { alert("Delete failed"); }
  };

  const Ic = ({ icon: Icon, s = 16, c = "currentColor", className = "" }) => <Icon size={s} color={c} className={className} />;

  if (!isVerified) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0b1120", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .login-card { animation: fadeIn 0.4s ease-out; }
        `}</style>
        <div className="login-card" style={{ width: "100%", maxWidth: 400, padding: 40, background: "#111827", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: "rgba(74,158,255,0.1)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#4a9eff" }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>Gatekeeper</h2>
            <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                required 
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none" }}
                placeholder="admin@cefr.center"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>AUTHENTICATION KEY</label>
              <input 
                type="password" 
                required 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none" }}
                placeholder="••••••••••••"
              />
            </div>

            {loginError && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <button type="submit" style={{ padding: 16, background: "#4a9eff", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
              Authorize Access
            </button>

            <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
              Return to System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b1120", zIndex: 1000, display: "flex", fontFamily: "Inter, sans-serif", color: "#fff" }}>
      
      {/* Sidebar */}
      <div style={{ width: 280, borderRight: "1px solid rgba(255,255,255,0.05)", padding: 32, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 40 }}>
           <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>CEFR <span style={{ color: "#4a9eff" }}>ADMIN</span></h1>
           <p style={{ fontSize: 11, color: "#64748b", fontWeight: 800, marginTop: 4 }}>v4.0 UNICORN EDITION</p>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { id: "dashboard", label: "Overview", icon: Activity },
            { id: "payments", label: "Payments", icon: CreditCard, badge: payments.filter(p=>p.status==="pending").length },
            { id: "users", label: "Students", icon: Users },
            { id: "broadcast", label: "Broadcast", icon: Bell },
            { id: "security", label: "Security", icon: Shield }
          ].map(m => (
            <button 
              key={m.id} onClick={() => setTab(m.id)}
              style={{ padding: "14px 16px", borderRadius: 14, background: tab === m.id ? "rgba(74,158,255,0.1)" : "transparent", border: "none", color: tab === m.id ? "#4a9eff" : "#8b9bbf", fontSize: 14, fontWeight: 700, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all .2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Ic icon={m.icon} s={18} /> {m.label}
              </div>
              {m.badge > 0 && (
                <div style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 20 }}>
                  {m.badge}
                </div>
              )}
            </button>
          ))}
        </nav>

        <button onClick={onBack} style={{ padding: "14px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
          <Ic icon={LogOut} s={18} /> Exit Panel
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 40 }}>
        
        {loading && <div style={{ position: "fixed", top: 40, right: 40 }}><RefreshCw className="spin" size={20} color="#4a9eff" /></div>}

        {tab === "dashboard" && (
           <div>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900 }}>System Overview</h2>
                <p style={{ color: "#64748b" }}>Live metrics from your infrastructure</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                {[
                  { label: "Total Students", value: stats.totalUsers, icon: Users, color: "#4a9eff" },
                  { label: "24h Activity", value: stats.recentUsers, icon: Activity, color: "#10b981" },
                  { label: "DB Latency", value: "24ms", icon: TrendingUp, color: "#fbbf24" },
                  { label: "Pending", value: payments.filter(p=>p.status==="pending").length, icon: CreditCard, color: "#7c3aed" }
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: 24, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                       <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: 1 }}>{s.label.toUpperCase()}</span>
                       <Ic icon={s.icon} s={16} c={s.color} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900 }}>{s.value}</div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {tab === "payments" && (
          <div>
            <div style={{ marginBottom: 32 }}>
               <h2 style={{ fontSize: 28, fontWeight: 900 }}>Verification Requests</h2>
               <p style={{ color: "#64748b" }}>Approve student payments and verify receipts</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
               <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      <th style={{ padding: 20, fontSize: 12, fontWeight: 800, color: "#64748b" }}>IDENTIFIER</th>
                      <th style={{ padding: 20, fontSize: 12, fontWeight: 800, color: "#64748b" }}>PLAN</th>
                      <th style={{ padding: 20, fontSize: 12, fontWeight: 800, color: "#64748b" }}>STATUS</th>
                      <th style={{ padding: 20, fontSize: 12, fontWeight: 800, color: "#64748b" }}>CONTROLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: 20 }}>
                           <div style={{ fontWeight: 700 }}>{p.email}</div>
                           <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{new Date(p.createdAt).toLocaleString()}</div>
                        </td>
                        <td style={{ padding: 20 }}>
                           <div style={{ fontWeight: 800, color: "#fbbf24" }}>{p.amount.toLocaleString()} UZS</div>
                        </td>
                        <td style={{ padding: 20 }}>
                           <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: p.status==="pending" ? "rgba(251,191,36,0.1)" : "rgba(16,185,129,0.1)", color: p.status==="pending" ? "#fbbf24" : "#10b981" }}>{p.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: 20 }}>
                           <div style={{ display: "flex", gap: 10 }}>
                             <button onClick={() => setPreviewImage(p.receiptFileUrl.startsWith('http') || p.receiptFileUrl.startsWith('data:') ? p.receiptFileUrl : `${BACKEND_URL.replace('/api','')}${p.receiptFileUrl}`)} style={{ padding: 10, borderRadius: 12, background: "rgba(74,158,255,0.1)", border: "none", color: "#4a9eff", cursor: "pointer" }}><Ic icon={Eye} s={16}/></button>
                             {p.status === "pending" && (
                               <>
                                 <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 10, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "none", color: "#10b981", cursor: "pointer" }}><Ic icon={CheckCircle} s={16}/></button>
                                 <button onClick={() => { const r = prompt("Reason?"); if(r) handleAction(p._id, "reject", r); }} style={{ padding: 10, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}><Ic icon={XCircle} s={16}/></button>
                               </>
                             )}
                             <button onClick={() => handleAction(p._id, "delete")} style={{ padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "none", color: "#8b9bbf", cursor: "pointer" }}><Ic icon={Trash2} s={16}/></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {tab === "broadcast" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
             <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Global Broadcast</h2>
                <p style={{ color: "#64748b", marginBottom: 32 }}>Push live notifications to all students</p>
                <form onSubmit={handleSendNotif} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   <input type="text" placeholder="Announcement Title" value={notifForm.title} onChange={e=>setNotifForm({...notifForm, title:e.target.value})} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }} required />
                   <textarea placeholder="Write your message here..." value={notifForm.message} onChange={e=>setNotifForm({...notifForm, message:e.target.value})} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", minHeight: 120 }} required />
                   
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                     <div>
                       <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 8 }}>TYPE / CATEGORY</label>
                       <select value={notifForm.type} onChange={e=>setNotifForm({...notifForm, type:e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                         <option value="update">Update</option>
                         <option value="feature">Feature</option>
                         <option value="tip">Tip</option>
                         <option value="streak">Streak</option>
                         <option value="info">Info</option>
                       </select>
                     </div>
                     <div>
                       <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 8 }}>ICON (VISUAL)</label>
                       <select value={notifForm.icon || "bell"} onChange={e=>setNotifForm({...notifForm, icon:e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                         <option value="bell">Bell (Default)</option>
                         <option value="zap">Zap (Power)</option>
                         <option value="star">Star (Special)</option>
                         <option value="award">Award (Prize)</option>
                         <option value="fire">Fire (Streak)</option>
                         <option value="book">Book (Study)</option>
                         <option value="globe">Globe (Comm)</option>
                       </select>
                     </div>
                   </div>

                   <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 8 }}>ATTACH IMAGE (FROM GALLERY)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setNotifForm({ ...notifForm, imageFile: e.target.files[0] })}
                        style={{ width: "100%", padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", color: "#8b9bbf", cursor: "pointer" }}
                      />
                      <div style={{ marginTop: 8, fontSize: 11, color: "#4a5568" }}>OR USE EXTERNAL URL</div>
                      <input type="text" placeholder="https://image-link.com/photo.jpg" value={notifForm.image} onChange={e=>setNotifForm({...notifForm, image:e.target.value, imageFile: null})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", marginTop: 8 }} />
                   </div>
                   <button type="submit" disabled={loading} style={{ padding: 16, borderRadius: 16, background: "#4a9eff", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
                      {loading ? <RefreshCw className="spin" size={18} /> : <Plus size={18} />} 
                      {loading ? "Publishing..." : "Publish Broadcast"}
                   </button>
                </form>
             </div>
             <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#64748b", marginBottom: 20 }}>LIVE ANNOUNCEMENTS</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   {notifs.map(n => (
                     <div key={n._id} style={{ padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                        <div>
                           <div style={{ fontWeight: 800 }}>{n.title}</div>
                           <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{n.message}</div>
                           {n.image && (
                             <img 
                               src={n.image.startsWith('http') || n.image.startsWith('data:') ? n.image : `${BACKEND_URL.replace('/api','')}${n.image}`} 
                               style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 12, marginTop: 12 }} 
                             />
                           )}
                        </div>
                        <button onClick={() => deleteNotif(n._id)} style={{ padding: 8, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}><Ic icon={Trash2} s={16} /></button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {tab === "security" && (
          <div style={{ maxWidth: 500 }}>
             <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Infrastructure Safety</h2>
             <p style={{ color: "#64748b", marginBottom: 32 }}>Rotate security tokens and OTP certificates</p>
             <form onSubmit={updateSecurity} style={{ display: "flex", flexDirection: "column", gap: 24, background: "rgba(255,255,255,0.02)", padding: 32, borderRadius: 28, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 12 }}>6-DIGIT AUTHORIZATION CODE</label>
                   <input type="text" value={securityForm.otpCode} onChange={e=>setSecurityForm({...securityForm, otpCode:e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 12, background: "#000", border: "1px solid rgba(255,255,255,0.05)", color: "#fbbf24", fontSize: 20, fontWeight: 900, letterSpacing: 4 }} placeholder="887766" />
                </div>
                <div>
                   <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 12 }}>BIOMETRIC FACE TOKEN (ENCRYPTED)</label>
                   <input type="password" value={securityForm.faceIdToken} onChange={e=>setSecurityForm({...securityForm, faceIdToken:e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff" }} placeholder="********" />
                </div>
                <button type="submit" style={{ padding: 16, borderRadius: 16, background: "#fff", border: "none", color: "#000", fontWeight: 900, cursor: "pointer" }}>Save Security Updates</button>
             </form>
          </div>
        )}

        {tab === "users" && (
           <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Student Directory</h2>
              <p style={{ color: "#64748b", marginBottom: 32 }}>Manage student profiles and premium access</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                 {users.map(u => (
                   <div key={u.email} style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                      {u.isPremium && <div style={{ position: "absolute", top: 12, right: 12 }}><Star size={18} color="#fbbf24" fill="#fbbf24" /></div>}
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                         <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {u.photoURL ? <img src={u.photoURL} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={20} color="#4a9eff" />}
                         </div>
                         <div>
                            <div style={{ fontWeight: 800 }}>{u.username || "New User"}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                         </div>
                      </div>
                      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                         {u.isPremium ? (
                           <button onClick={() => handleRevokePremium(u.email)} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Revoke Premium</button>
                         ) : (
                           <button style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(74,158,255,0.1)", border: "none", color: "#4a9eff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Assign manually</button>
                         )}
                         <button style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "none", borderRadius: 12, color: "#fff" }}><Settings size={16}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zSource: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }} onClick={() => setPreviewImage(null)}>
           <img src={previewImage} alt="Receipt" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 24, boxShadow: "0 0 100px rgba(0,0,0,0.5)" }} />
           <button style={{ position: "absolute", top: 32, right: 32, background: "#fff", border: "none", borderRadius: "50%", width: 50, height: 50, cursor: "pointer" }} onClick={() => setPreviewImage(null)}><XCircle size={32} color="#000" /></button>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
