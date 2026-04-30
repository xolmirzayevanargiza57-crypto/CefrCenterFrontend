import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, CreditCard, Bell, Shield, LogOut, CheckCircle, XCircle, 
  Trash2, Eye, RefreshCw, Star, Search, Clock, Activity, UserMinus, TrendingUp
} from "lucide-react";
import BACKEND_URL from "./config/api";

const Ic = ({ icon: Icon, s = 18, c = "currentColor", ...props }) => {
  if (!Icon) return null;
  return <Icon size={s} color={c} {...props} />;
};

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "checking", uptime: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments"); 
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
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
      console.error("Admin Load Error:", e);
      showToast("Data loading failed", false);
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
    } catch (e) { showToast("Error connecting to server", false); }
  };

  const handleRemovePremium = async (email) => {
    if (!window.confirm(`Are you sure you want to remove Premium from ${email}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${email}/remove-premium`, {
        method: "POST",
        headers: hdrs
      });
      if (res.ok) {
        showToast("Premium removed.");
        loadData();
      }
    } catch (e) { showToast("Error removing premium", false); }
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
    } catch (e) { showToast("Failed to send notification", false); }
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
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "#0b1120", color: "#f0f4ff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spin { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toast.ok ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 9999, fontWeight: 700, animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 12 }}>
            <Ic icon={Shield} s={28} c="#4a9eff" /> CEFR ADMIN
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 13 }}>System Management & Verification</p>
        </div>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
          <Ic icon={LogOut} s={16} /> Exit
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Users", val: stats.totalUsers, ic: Users, c: "#4a9eff" },
          { label: "Active 24h", val: stats.recentUsers, ic: Activity, c: "#10b981" },
          { label: "Database", val: stats.dbStatus, ic: TrendingUp, c: stats.dbStatus==="connected"?"#10b981":"#f59e0b" },
          { label: "Pending", val: payments.filter(p=>p.status==="pending").length, ic: CreditCard, c: "#a78bfa" }
        ].map((s,i)=>(
          <div key={i} style={{ background: "#131d2e", padding: 20, borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:11, color:"#8b9bbf", fontWeight:700 }}>{s.label}</span>
              <Ic icon={s.ic} s={16} c={s.c} />
            </div>
            <div style={{ fontSize:22, fontWeight:900 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, background: "#131d2e", padding: 5, borderRadius: 12, marginBottom: 24, border: "0.5px solid rgba(255,255,255,0.1)", width: "fit-content" }}>
        {[
          { id: "payments", label: "Payments", ic: CreditCard },
          { id: "users", label: "Users", ic: Users },
          { id: "notifications", label: "Broadcast", ic: Bell }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, border: "none", background: tab === t.id ? "rgba(74,158,255,0.15)" : "transparent", color: tab === t.id ? "#4a9eff" : "#8b9bbf", fontWeight: 700, cursor: "pointer" }}>
            <Ic icon={t.ic} s={14} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#131d2e", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.1)", minHeight: 400 }}>
        {loading ? (
          <div style={{ padding: 100, textAlign: "center" }}><Ic icon={RefreshCw} className="spin" s={32} c="#4a9eff" /></div>
        ) : (
          <div style={{ padding: 20 }}>
            {tab === "payments" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                      <th style={{ padding: "16px" }}>User</th>
                      <th style={{ padding: "16px" }}>Amount</th>
                      <th style={{ padding: "16px" }}>Status</th>
                      <th style={{ padding: "16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: 16 }}>
                          <div style={{ fontWeight: 700 }}>{p.email}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: 16 }}>
                          <div style={{ fontWeight: 800 }}>{p.amount?.toLocaleString()} UZS</div>
                          <div style={{ fontSize: 10, color: "#a78bfa" }}>{p.planId}</div>
                        </td>
                        <td style={{ padding: 16 }}>
                          <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 900, background: p.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "approved" ? "#10b981" : "#f59e0b" }}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 16 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={()=>setPreviewImage(p.receiptFileUrl.startsWith('http') ? p.receiptFileUrl : `${BACKEND_URL}${p.receiptFileUrl}`)} style={{ padding: 6, borderRadius: 6, background: "rgba(74,158,255,0.1)", border: "none", color: "#4a9eff", cursor: "pointer" }}><Ic icon={Eye} s={16}/></button>
                            {p.status === "pending" && (
                              <>
                                <button onClick={()=>handleAction(p._id, "approve")} style={{ padding: 6, borderRadius: 6, background: "rgba(16,185,129,0.1)", border: "none", color: "#10b981", cursor: "pointer" }}><Ic icon={CheckCircle} s={16}/></button>
                                <button onClick={()=>handleAction(p._id, "reject")} style={{ padding: 6, borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}><Ic icon={XCircle} s={16}/></button>
                              </>
                            )}
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
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <Search style={{ position: "absolute", left: 12, top: 12, color: "#4a5568" }} size={16} />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {filteredUsers.map(u => (
                    <div key={u._id} style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:u.isPremium?"#fbbf24":"#1e3a5f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Ic icon={u.isPremium?Star:Users} s={16} c="#fff" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight:800, fontSize:14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username || "Student"}</div>
                          <div style={{ fontSize:11, color:"#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                        </div>
                      </div>
                      {u.isPremium && (
                        <button onClick={()=>handleRemovePremium(u.email)} style={{ width:"100%", padding:8, borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", fontSize:11, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                          <Ic icon={UserMinus} s={13} /> Remove Premium
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Receipt" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10 }} />
        </div>
      )}
    </div>
  );
}
