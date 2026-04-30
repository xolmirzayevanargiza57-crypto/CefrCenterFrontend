import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, CreditCard, Bell, Shield, LogOut, CheckCircle, XCircle, 
  Trash2, Eye, RefreshCw, Star, Search, Clock, Activity, UserMinus, TrendingUp, Plus
} from "lucide-react";
import BACKEND_URL from "./config/api";

const Ic = ({ icon: Icon, s = 18, c = "currentColor", ...props }) => {
  if (!Icon) return null;
  return <Icon size={s} color={c} {...props} />;
};

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "checking" });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments"); 
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Notification States
  const [notifs, setNotifs] = useState([]);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" });
  const [notifLoading, setNotifLoading] = useState(false);

  const userEmail = user?.email || "xojiakbar@admin.com";
  const hdrs = { "x-user-email": userEmail };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes, sRes, nRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/stats?email=${userEmail}`),
        fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs })
      ]);

      if (pRes.ok) setPayments(await pRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (nRes.ok) setNotifs(await nRes.json());
    } catch (e) {
      showToast("Data sync failed", false);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id, action, reason = "") => {
    try {
      const endpoint = action === "delete" ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      const method = action === "delete" ? "DELETE" : "POST";
      const body = action === "reject" ? JSON.stringify({ reason }) : null;

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method,
        headers: { ...hdrs, "Content-Type": "application/json" },
        body
      });

      if (res.ok) {
        showToast(`${action} success!`);
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error || "Action failed", false);
      }
    } catch (e) { showToast("Connection error", false); }
  };

  const handleRemovePremium = async (email) => {
    if (!window.confirm(`Cancel Premium for ${email}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${email}/remove-premium`, {
        method: "POST",
        headers: hdrs
      });
      if (res.ok) {
        showToast("Premium revoked.");
        loadData();
      }
    } catch (e) { showToast("Error", false); }
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify(notifForm)
      });
      if (res.ok) {
        showToast("Notification broadcasted!");
        setNotifForm({ title: "", message: "", type: "info" });
        loadData();
      }
    } catch (e) { showToast("Failed to send", false); }
    finally { setNotifLoading(false); }
  };

  const deleteNotif = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}?email=${userEmail}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Notification deleted.");
        loadData();
      }
    } catch (e) { showToast("Error", false); }
  };

  const filteredUsers = users.filter(u => 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", color: "#f0f4ff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, background: toast.ok ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 10000, fontWeight: 700, animation: "fadeUp 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", gap: 12 }}>
            <Ic icon={Shield} s={28} c="#4a9eff" /> System Control
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 13, marginTop: 4 }}>Administrator panel for Cefr Center</p>
        </div>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", cursor: "pointer", fontWeight: 700, transition: "0.2s" }}>
          <Ic icon={LogOut} s={16} /> Logout
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        {[
          { label: "Total Students", val: stats.totalUsers, ic: Users, c: "#4a9eff" },
          { label: "Online Now", val: stats.recentUsers, ic: Activity, c: "#10b981" },
          { label: "DB Status", val: stats.dbStatus, ic: TrendingUp, c: stats.dbStatus==="connected"?"#10b981":"#f59e0b" },
          { label: "Pending", val: payments.filter(p=>p.status==="pending").length, ic: CreditCard, c: "#a78bfa" }
        ].map((s,i)=>(
          <div key={i} style={{ background: "#131d2e", padding: "20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#8b9bbf", marginBottom:12 }}>
              <span style={{ fontSize:10, fontWeight:800 }}>{s.label.toUpperCase()}</span>
              <Ic icon={s.ic} s={16} c={s.c} />
            </div>
            <div style={{ fontSize:22, fontWeight:900 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 8, background: "#131d2e", padding: 6, borderRadius: 14, marginBottom: 28, border: "1px solid rgba(255,255,255,0.05)", width: "fit-content" }}>
        {[
          { id: "payments", label: "Payments", ic: CreditCard },
          { id: "users", label: "Students", ic: Users },
          { id: "notifications", label: "Notifications", ic: Bell }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: tab === t.id ? "rgba(74,158,255,0.15)" : "transparent", color: tab === t.id ? "#4a9eff" : "#8b9bbf", fontWeight: 700, cursor: "pointer", transition: "0.2s" }}>
            <Ic icon={t.ic} s={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ background: "#131d2e", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", minHeight: 500, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 120, textAlign: "center" }}><Ic icon={RefreshCw} className="spin" s={40} c="#4a9eff" /></div>
        ) : (
          <div style={{ padding: 24 }}>
            {tab === "payments" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                      <th style={{ padding: 18, color: "#8b9bbf", fontWeight: 800 }}>STUDENT</th>
                      <th style={{ padding: 18, color: "#8b9bbf", fontWeight: 800 }}>AMOUNT / PLAN</th>
                      <th style={{ padding: 18, color: "#8b9bbf", fontWeight: 800 }}>STATUS</th>
                      <th style={{ padding: 18, color: "#8b9bbf", fontWeight: 800 }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: 18 }}>
                          <div style={{ fontWeight: 700, color: "#f0f4ff" }}>{p.email}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{new Date(p.createdAt).toLocaleString()}</div>
                        </td>
                        <td style={{ padding: 18 }}>
                          <div style={{ fontWeight: 800, color: "#10b981" }}>{p.amount?.toLocaleString()} UZS</div>
                          <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 2 }}>{p.planId} | {p.paymentMethod}</div>
                        </td>
                        <td style={{ padding: 18 }}>
                          <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900, background: p.status === "approved" ? "rgba(16,185,129,0.1)" : p.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: p.status === "approved" ? "#10b981" : p.status === "pending" ? "#f59e0b" : "#ef4444" }}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 18 }}>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={()=>{
                              const url = p.receiptFileUrl.startsWith('http') ? p.receiptFileUrl : `${BACKEND_URL.replace('/api', '')}${p.receiptFileUrl}`;
                              setPreviewImage(url);
                            }} style={{ padding: 8, borderRadius: 10, background: "rgba(74,158,255,0.1)", border: "none", color: "#4a9eff", cursor: "pointer" }}><Ic icon={Eye} s={18}/></button>
                            {p.status === "pending" && (
                              <>
                                <button onClick={()=>handleAction(p._id, "approve")} style={{ padding: 8, borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "none", color: "#10b981", cursor: "pointer" }}><Ic icon={CheckCircle} s={18}/></button>
                                <button onClick={()=>{const r=prompt("Rejection reason?"); if(r) handleAction(p._id, "reject", r)}} style={{ padding: 8, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}><Ic icon={XCircle} s={18}/></button>
                              </>
                            )}
                            <button onClick={()=>handleAction(p._id, "delete")} style={{ padding: 8, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "none", color: "#8b9bbf", cursor: "pointer" }}><Ic icon={Trash2} s={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "users" && (
              <div>
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <Search style={{ position: "absolute", left: 16, top: 14, color: "#4a5568" }} size={20} />
                  <input type="text" placeholder="Search by email or name..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {filteredUsers.map(u => (
                    <div key={u._id} style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:u.isPremium?"linear-gradient(135deg,#fbbf24,#d97706)":"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Ic icon={u.isPremium?Star:Users} s={22} c="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight:800, fontSize:15, color: "#fff" }}>{u.username || "Student"} {u.isAdmin && "👑"}</div>
                          <div style={{ fontSize:12, color:"#64748b" }}>{u.email}</div>
                        </div>
                        {u.isPremium && <span style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900 }}>PREMIUM</span>}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#4a5568", fontWeight: 800 }}>LEVEL</div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{u.level || "A1"}</div>
                        </div>
                        <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#4a5568", fontWeight: 800 }}>XP</div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{(u.xp || 0).toLocaleString()}</div>
                        </div>
                      </div>
                      {u.isPremium && (
                        <button onClick={()=>handleRemovePremium(u.email)} style={{ width:"100%", marginTop: 16, padding: "12px", borderRadius: 12, background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <Ic icon={UserMinus} s={16} /> Cancel Premium Status
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <Ic icon={Bell} c="#4a9eff" /> New Broadcast
                  </h3>
                  <form onSubmit={handleSendNotif} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#8b9bbf", display: "block", marginBottom: 6 }}>TITLE</label>
                      <input type="text" value={notifForm.title} onChange={e=>setNotifForm({...notifForm, title:e.target.value})} placeholder="Maintenance, Discount, etc..." style={{ width:"100%", padding:14, borderRadius:12, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#8b9bbf", display: "block", marginBottom: 6 }}>MESSAGE</label>
                      <textarea value={notifForm.message} onChange={e=>setNotifForm({...notifForm, message:e.target.value})} placeholder="Detailed broadcast message..." style={{ width:"100%", height:120, padding:14, borderRadius:12, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", resize: "none" }} required />
                    </div>
                    <button type="submit" disabled={notifLoading} style={{ width: "100%", padding: 14, borderRadius: 12, background: "#4a9eff", border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      {notifLoading ? <Ic icon={RefreshCw} s={16} className="spin" /> : <Ic icon={Plus} s={18} />} Send Broadcast
                    </button>
                  </form>
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#8b9bbf", marginBottom: 20 }}>ACTIVE ANNOUNCEMENTS</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {notifs.map(n => (
                      <div key={n._id} style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{n.message}</div>
                        </div>
                        <button onClick={()=>deleteNotif(n._id)} style={{ padding: 10, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}>
                          <Ic icon={Trash2} s={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Receipt" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 16, boxShadow: "0 0 100px rgba(0,0,0,0.5)" }} />
          <button style={{ position: "absolute", top: 24, right: 24, background: "#fff", border: "none", borderRadius: "50%", padding: 12, cursor: "pointer" }} onClick={() => setPreviewImage(null)}>
            <Ic icon={XCircle} s={24} c="#000" />
          </button>
        </div>
      )}
    </div>
  );
}
