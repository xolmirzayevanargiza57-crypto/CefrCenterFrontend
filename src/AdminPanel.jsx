// AdminPanel.jsx — Fixed: CSS variables for theming, proper layout
import React, { useState, useEffect, useCallback } from "react";
import {
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star
} from "lucide-react";
import BACKEND_URL from "./config/api";

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

  const adminEmail = user?.email || "xojiakbar@admin.com";
  const hdrs = { "x-user-email": adminEmail };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes, sRes, nRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/stats?email=${adminEmail}`),
        fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs }),
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (nRes.ok) setNotifs(await nRes.json());
    } catch (e) { console.error("Load failed", e); }
    finally { setLoading(false); }
  }, [adminEmail]);

  useEffect(() => { if (isVerified) loadData(); }, [loadData, isVerified]);

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === "delete" ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: hdrs,
      });
      if (res.ok) loadData();
    } catch (e) { alert("Action failed"); }
  };

  // Login screen
  if (!isVerified) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "var(--bg-primary)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: "100%", maxWidth: 400, padding: 40,
          background: "var(--bg-secondary)",
          borderRadius: 24,
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.1)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64,
              background: "var(--text-primary)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--bg-primary)"
            }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Admin Access</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 14 }}>Security clearance required</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="email" required value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-primary)", outline: "none", fontFamily: "inherit", fontSize: 14 }}
              placeholder="Email"
            />
            <input
              type="password" required value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-primary)", outline: "none", fontFamily: "inherit", fontSize: 14 }}
              placeholder="Password"
            />
            {loginError && <p style={{ color: "#ff3b30", fontSize: 13, textAlign: "center" }}>{loginError}</p>}
            <button type="submit" style={{ padding: 16, background: "var(--text-primary)", border: "none", borderRadius: 14, color: "var(--bg-primary)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 15 }}>
              Unlock
            </button>
            <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
              Go Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "payments",  label: "Payments",  icon: CreditCard },
    { id: "users",     label: "Students",  icon: Users },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--bg-primary)",
      zIndex: 1000,
      display: "flex",
      color: "var(--text-primary)",
      overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        padding: 24, display: "flex", flexDirection: "column", flexShrink: 0
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>Admin Panel</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{adminEmail}</p>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {TABS.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)} style={{
              padding: "12px 14px", borderRadius: 12,
              background: tab === m.id ? "var(--text-primary)" : "transparent",
              border: "none",
              color: tab === m.id ? "var(--bg-primary)" : "var(--text-primary)",
              fontWeight: 600, textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "inherit", fontSize: 14
            }}>
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={loadData} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", fontFamily: "inherit", fontSize: 14 }}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button onClick={onBack} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,59,48,0.1)", border: "none", color: "#ff3b30", fontWeight: 700, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", fontFamily: "inherit", fontSize: 14 }}>
            <LogOut size={18} /> Exit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--text-muted)" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {/* Dashboard Tab */}
            {tab === "dashboard" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Total Students", value: stats.totalUsers || users.length, icon: Users },
                    { label: "Active (30d)", value: stats.recentUsers, icon: Activity },
                    { label: "Pending Payments", value: payments.filter(p => p.status === "pending").length, icon: CreditCard },
                    { label: "Notifications", value: notifs.length, icon: Bell },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>{s.label}</p>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
                      </div>
                      <s.icon size={24} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>

                {/* Recent payments */}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Recent Pending Payments</h3>
                {payments.filter(p => p.status === "pending").slice(0, 5).map(p => (
                  <div key={p._id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{p.email}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.amount?.toLocaleString()} UZS</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#ff9f0a", fontWeight: 700, background: "rgba(255,159,10,0.1)", padding: "3px 10px", borderRadius: 99 }}>PENDING</span>
                    <button onClick={() => { if (p.receiptFileUrl) setPreviewImage(p.receiptFileUrl.startsWith('h') ? p.receiptFileUrl : `${BACKEND_URL}${p.receiptFileUrl}`); }} style={{ padding: 8, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-primary)" }}>
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 8, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <CheckCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Payments Tab */}
            {tab === "payments" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>All Payments</h2>
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                        {["Student", "Amount", "Status", "Actions"].map(h => (
                          <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No payments found</td></tr>
                      ) : payments.map(p => (
                        <tr key={p._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontSize: 14 }}>{p.email}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontSize: 14 }}>{p.amount?.toLocaleString()}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ color: p.status === "pending" ? "#ff9f0a" : "#30d158", fontSize: 13, fontWeight: 700 }}>
                              {(p.status || "").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
                            <button onClick={() => { if (p.receiptFileUrl) setPreviewImage(p.receiptFileUrl.startsWith('h') ? p.receiptFileUrl : `${BACKEND_URL}${p.receiptFileUrl}`); }} style={{ padding: 8, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-primary)" }}>
                              <Eye size={16} />
                            </button>
                            {p.status === "pending" && (
                              <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 8, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === "users" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>Student Directory</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                  {users.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No students found.</p>
                  ) : users.map(u => (
                    <div key={u.email} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username || "Student"}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                      </div>
                      {u.isPremium && <Star size={18} color="#FFD700" fill="#FFD700" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img src={previewImage} alt="Receipt" style={{ maxWidth: "90%", maxHeight: "90vh", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
        </div>
      )}
    </div>
  );
}