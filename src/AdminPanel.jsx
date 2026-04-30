import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, CreditCard, Bell, Shield, LogOut, CheckCircle, XCircle, 
  Trash2, Eye, RefreshCw, Star, Search, Clock, ChevronRight, AlertCircle,
  TrendingUp, Activity, UserMinus
} from "lucide-react";
import BACKEND_URL from "./config/api";

const Ic = ({ icon: Icon, s = 18, c = "currentColor", ...props }) => (
  <Icon size={s} color={c} {...props} />
);

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "checking", uptime: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments"); // payments | users | notifications
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Notification State
  const [notifs, setNotifs] = useState([]);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info" });
  const [notifLoading, setNotifLoading] = useState(false);

  // Authenticated email for auth headers
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
      showToast("Connection failed", false);
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
        showToast(action.charAt(0).toUpperCase() + action.slice(1) + " success!");
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error || "Action failed", false);
      }
    } catch (e) { showToast("Error", false); }
  };

  const handleRemovePremium = async (email) => {
    if (!window.confirm(`Are you sure you want to remove Premium from ${email}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${email}/remove-premium`, {
        method: "POST",
        headers: hdrs
      });
      if (res.ok) {
        showToast("Premium removed successfully");
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
        showToast("Notification sent!");
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
        showToast("Deleted");
        loadData();
      }
    } catch (e) { showToast("Error", false); }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh", color: "#f0f4ff", fontFamily: "Inter, sans-serif" }}>
      
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.ok ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 9999, fontWeight: 700, animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 12 }}>
            <Ic icon={Shield} s={32} c="#4a9eff" /> Admin Center
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 14 }}>Manage platform users, payments, and global notifications</p>
        </div>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", cursor: "pointer", fontWeight: 700, transition: "all 0.2s" }}>
          <Ic icon={LogOut} s={18} /> Exit Admin
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Users", val: stats.totalUsers, ic: Users, c: "#4a9eff" },
          { label: "Active (24h)", val: stats.recentUsers, ic: Activity, c: "#10b981" },
          { label: "Database", val: stats.dbStatus, ic: TRENDING_UP, c: stats.dbStatus==="connected"?"#10b981":"#f59e0b" },
          { label: "Pending Payments", val: payments.filter(p=>p.status==="pending").length, ic: CreditCard, c: "#a78bfa" }
        ].map((s,i)=>(
          <div key={i} style={{ background: "#131d2e", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:12, color:"#8b9bbf", fontWeight:700 }}>{s.label.toUpperCase()}</span>
              <Ic icon={s.ic} s={16} c={s.c} />
            </div>
            <div style={{ fontSize:24, fontWeight:900 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#131d2e", padding: 6, borderRadius: 14, marginBottom: 24, border: "1px solid rgba(255,255,255,0.05)", width: "fit-content" }}>
        {[
          { id: "payments", label: "Payments", ic: CreditCard },
          { id: "users", label: "Users List", ic: Users },
          { id: "notifications", label: "Broadcast", ic: Bell }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: tab === t.id ? "rgba(74,158,255,0.1)" : "transparent", color: tab === t.id ? "#4a9eff" : "#8b9bbf", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            <Ic icon={t.ic} s={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: "#131d2e", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        
        {loading ? (
          <div style={{ padding: 100, textAlign: "center" }}><Ic icon={RefreshCw} className="spin" s={40} c="#4a9eff" /></div>
        ) : (
          <div>
            {tab === "payments" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                      <th style={{ padding: 16 }}>User / Date</th>
                      <th style={{ padding: 16 }}>Plan / Amount</th>
                      <th style={{ padding: 16 }}>Method</th>
                      <th style={{ padding: 16 }}>Status</th>
                      <th style={{ padding: 16 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: 16 }}>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.email}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(p.createdAt).toLocaleString()}</div>
                        </td>
                        <td style={{ padding: 16 }}>
                          <div style={{ fontWeight: 800 }}>{p.planId}</div>
                          <div style={{ fontSize: 11, color: "#10b981" }}>{p.amount?.toLocaleString()} UZS</div>
                        </td>
                        <td style={{ padding: 16, textTransform: "uppercase", fontWeight: 700, color: "#8b9bbf" }}>{p.paymentMethod}</td>
                        <td style={{ padding: 16 }}>
                          <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900, background: p.status === "approved" ? "rgba(16,185,129,0.1)" : p.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: p.status === "approved" ? "#10b981" : p.status === "pending" ? "#f59e0b" : "#ef4444" }}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 16 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={()=>setPreviewImage(p.receiptFileUrl.startsWith('http') ? p.receiptFileUrl : `${BACKEND_URL}${p.receiptFileUrl}`)} style={{ padding: 8, borderRadius: 8, background: "rgba(74,158,255,0.1)", border: "none", color: "#4a9eff", cursor: "pointer" }} title="View Receipt"><Ic icon={Eye} s={16}/></button>
                            {p.status === "pending" && (
                              <>
                                <button onClick={()=>handleAction(p._id, "approve")} style={{ padding: 8, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "none", color: "#10b981", cursor: "pointer" }} title="Approve"><Ic icon={CheckCircle} s={16}/></button>
                                <button onClick={()=>{const r=prompt("Reason for rejection?"); if(r) handleAction(p._id, "reject", r)}} style={{ padding: 8, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }} title="Reject"><Ic icon={XCircle} s={16}/></button>
                              </>
                            )}
                            <button onClick={()=>handleAction(p._id, "delete")} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", color: "#8b9bbf", cursor: "pointer" }} title="Delete Record"><Ic icon={Trash2} s={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "users" && (
              <div style={{ padding: 20 }}>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <Search style={{ position: "absolute", left: 14, top: 12, color: "#4a5568" }} size={18} />
                  <input type="text" placeholder="Search by email or username..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {filteredUsers.map(u => (
                    <div key={u._id} style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                        <div style={{ width:40, height:40, borderRadius:"50%", background:u.isPremium?"#fbbf24":"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Ic icon={u.isPremium?Star:Users} s={20} c="#fff" />
                        </div>
                        <div>
                          <div style={{ fontWeight:800, fontSize:15 }}>{u.username || "Learner"}</div>
                          <div style={{ fontSize:12, color:"#64748b" }}>{u.email}</div>
                        </div>
                        {u.isPremium && <span style={{ marginLeft: "auto", background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "4px 8px", borderRadius: 6, fontSize: 9, fontWeight: 900 }}>PREMIUM</span>}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                        <div style={{ background:"rgba(0,0,0,0.2)", padding:8, borderRadius:10, textAlign:"center" }}>
                          <div style={{ fontSize:9, color:"#4a5568" }}>LEVEL</div>
                          <div style={{ fontWeight:800 }}>{u.level || "A1"}</div>
                        </div>
                        <div style={{ background:"rgba(0,0,0,0.2)", padding:8, borderRadius:10, textAlign:"center" }}>
                          <div style={{ fontSize:9, color:"#4a5568" }}>XP</div>
                          <div style={{ fontWeight:800 }}>{u.xp || 0}</div>
                        </div>
                      </div>
                      {u.isPremium ? (
                        <div style={{ padding:10, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.1)", borderRadius:12 }}>
                           <div style={{ fontSize:11, color:"#8b9bbf", marginBottom:6 }}>Expires: {u.premiumExpire ? new Date(u.premiumExpire).toLocaleDateString() : 'N/A'}</div>
                           <button onClick={()=>handleRemovePremium(u.email)} style={{ width:"100%", padding:8, borderRadius:8, background:"#ef4444", border:"none", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                             <Ic icon={UserMinus} s={14} /> Remove Premium
                           </button>
                        </div>
                      ) : (
                        <div style={{ fontSize:11, color:"#4a5568", textAlign:"center" }}>Regular student access</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, padding: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><Ic icon={Bell} c="#4a9eff" /> Send Broadcast</h3>
                  <form onSubmit={handleSendNotif} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:"#8b9bbf", display:"block", marginBottom:4 }}>TITLE</label>
                      <input type="text" value={notifForm.title} onChange={e=>setNotifForm({...notifForm, title:e.target.value})} placeholder="Maintenance update..." style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }} required />
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:"#8b9bbf", display:"block", marginBottom:4 }}>MESSAGE</label>
                      <textarea value={notifForm.message} onChange={e=>setNotifForm({...notifForm, message:e.target.value})} placeholder="Broadcast details here..." style={{ width:"100%", height:100, padding:12, borderRadius:10, background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", resize:"none" }} required />
                    </div>
                    <button type="submit" disabled={notifLoading} style={{ padding:14, borderRadius:12, border:"none", background:"#4a9eff", color:"#fff", fontWeight:800, cursor:"pointer", boxShadow:"0 4px 12px rgba(74,158,255,0.3)" }}>
                      {notifLoading ? "Sending..." : "Send to All Users"}
                    </button>
                  </form>
                </div>
                <div>
                   <h3 style={{ fontSize: 13, fontWeight: 700, color: "#8b9bbf", marginBottom: 16 }}>ACTIVE NOTIFICATIONS</h3>
                   <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                     {notifs.map(n => (
                       <div key={n._id} style={{ background:"rgba(255,255,255,0.03)", padding:16, borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                         <div>
                            <div style={{ fontWeight:800, fontSize:14, color:"#fff" }}>{n.title}</div>
                            <div style={{ fontSize:12, color:"#64748b" }}>{n.message.slice(0, 50)}...</div>
                         </div>
                         <button onClick={()=>deleteNotif(n._id)} style={{ padding:8, borderRadius:8, background:"rgba(239,68,68,0.1)", border:"none", color:"#ef4444", cursor:"pointer" }}><Ic icon={Trash2} s={16} /></button>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Receipt Preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, boxShadow: "0 0 50px rgba(0,0,0,0.5)" }} />
          <button style={{ position: "absolute", top: 20, right: 20, background: "#fff", border: "none", borderRadius: "50%", padding: 10, cursor: "pointer" }} onClick={() => setPreviewImage(null)}><Ic icon={XCircle} s={24} c="#000" /></button>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
