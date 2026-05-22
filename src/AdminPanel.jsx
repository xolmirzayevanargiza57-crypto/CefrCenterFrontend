import React, { useState, useEffect, useCallback } from "react";
import { 
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle, 
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star
} from "lucide-react";
import BACKEND_URL from "./config/api";

// Global Helper
const Ic = ({ icon: Icon, s = 16, c = "currentColor", className = "" }) => <Icon size={s} color={c} className={className} />;

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
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info", image: "", icon: "bell" });

  const adminEmail = user?.email || "xojiakbar@admin.com";
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
        setSecurityForm({ otpCode: sec.otpCode || "", faceIdToken: sec.faceIdToken || "" });
      }
    } catch (e) { console.error("Load failed", e); }
    finally { setLoading(false); }
  }, [adminEmail]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const [sideOpen, setSideOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  if (!isVerified) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg-primary)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 400, padding: 40, background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: "var(--text-primary)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--bg-primary)" }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Admin Access</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14 }}>Security clearance required</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} style={{ width: "100%", padding: "16px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-primary)", outline: "none" }} placeholder="Email" />
            <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={{ width: "100%", padding: "16px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-primary)", outline: "none" }} placeholder="Password" />
            {loginError && <p style={{ color: "#ff3b30", fontSize: 13, textAlign: "center" }}>{loginError}</p>}
            <button type="submit" style={{ padding: 18, background: "var(--text-primary)", border: "none", borderRadius: 16, color: "var(--bg-primary)", fontWeight: 700, cursor: "pointer" }}>Unlock</button>
            <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>Go Back</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-primary)", zIndex: 1000, display: "flex", flexDirection: isMobile ? "column" : "row", color: "var(--text-primary)", overflow: "hidden" }}>
      <div style={{ width: isMobile ? "100%" : 260, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 40 }}><h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin</h1></div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "payments", label: "Payments", icon: CreditCard },
            { id: "users", label: "Students", icon: Users },
            { id: "security", label: "Security", icon: Shield }
          ].map(m => (
            <button key={m.id} onClick={() => setTab(m.id)} style={{ padding: "14px", borderRadius: 12, background: tab === m.id ? "var(--text-primary)" : "transparent", border: "none", color: tab === m.id ? "var(--bg-primary)" : "var(--text-primary)", fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </nav>
        <button onClick={onBack} style={{ padding: "14px", borderRadius: 12, background: "rgba(255,59,48,0.1)", border: "none", color: "#ff3b30", fontWeight: 700, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}><LogOut size={18}/> Logout</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: matches => isMobile ? 20 : 40 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {tab === "dashboard" && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Overview</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                {[
                  { label: "Students", value: stats.totalUsers, icon: Users },
                  { label: "Active", value: stats.recentUsers, icon: Activity },
                  { label: "Pending", value: payments.filter(p=>p.status==="pending").length, icon: CreditCard }
                ].map((s, i) => (
                  <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 8 }}>{s.label}</p><p style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</p></div>
                    <s.icon size={24} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "payments" && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Payments</h2>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(142,142,147,0.05)" }}>
                      <th style={{ padding: 16, textAlign: "left" }}>STUDENT</th>
                      <th style={{ padding: 16, textAlign: "left" }}>AMOUNT</th>
                      <th style={{ padding: 16, textAlign: "left" }}>STATUS</th>
                      <th style={{ padding: 16, textAlign: "left" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: 16 }}>{p.email}</td>
                        <td style={{ padding: 16 }}>{p.amount.toLocaleString()}</td>
                        <td style={{ padding: 16 }}><span style={{ color: p.status==="pending" ? "#ff9f0a" : "#30d158" }}>{p.status.toUpperCase()}</span></td>
                        <td style={{ padding: 16 }}>
                          <button onClick={() => { if(p.receiptFileUrl) setPreviewImage(p.receiptFileUrl.startsWith('h') ? p.receiptFileUrl : `${BACKEND_URL.replace('/api','')}${p.receiptFileUrl}`) }} style={{ padding: 8, background: "var(--border)", border: "none", borderRadius: 8, cursor: "pointer", marginRight: 8 }}><Eye size={16}/></button>
                          {p.status === "pending" && (
                            <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 8, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 8, cursor: "pointer" }}><CheckCircle size={16}/></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="animate-fade-up">
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Directory</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {users.map(u => (
                  <div key={u.email} className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={20}/></div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{u.username || "Student"}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div></div>
                    {u.isPremium && <Star size={18} color="#FFD700" fill="#FFD700" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
