import React, { useState, useEffect, useCallback } from "react";
import BACKEND_URL from "./config/api";

// ── Icon Component ─────────────────────────────────────────────────────────────
function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", verticalAlign: "middle", flexShrink: 0 };
  const d = {
    check:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:      <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trash:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
    eye:    <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    refresh:<svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    shield: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    user:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    crown:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 20h20M3 10l3 7h12l3-7-5 3-4-6-4 6-5-3z"/></svg>,
    bell:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    plus:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    logout: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return d[n] || null;
}

const PLAN_LABELS = {
  "30_days_basic": "Premium Basic (30 days)",
  "30_days_pro":   "Premium Pro (30 days)",
  "90_days":       "Ultimate Premium (90 days)",
};

const PLAN_COLORS = {
  "30_days_basic": "#4a9eff",
  "30_days_pro":   "#1D9E75",
  "90_days":       "#EF9F27",
};

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("payments");
  const [previewImage, setPreviewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast]           = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Rejection State
  const [rejectingId, setRejectingId]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Notification State
  const [notifs, setNotifs]             = useState([]);
  const [notifForm, setNotifForm]       = useState({ title: "", message: "", type: "info" });
  const [notifLoading, setNotifLoading] = useState(false);

  // AdminPanel can be used both embedded in Dashboard (user prop) or standalone (/admin route)
  const token = localStorage.getItem("cefr_admin_token");
  const isAdmin = user?.isAdmin === true || !!token;
  const userEmail = user?.email || (token ? "xojiakbar@admin.com" : null);

  const hdrs = userEmail ? { "x-user-email": userEmail } : {};
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPayments = useCallback(async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs });
      const data = await res.json();
      if (res.ok) setPayments(data);
      else showToast(data.error || "Failed to load payments", false);
    } catch (e) { showToast("Network error", false); }
  }, [hdrs]);

  const loadUsers = useCallback(async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) { showToast("Network error", false); }
  }, [hdrs]);

  const loadNotifs = useCallback(async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs });
      const data = await res.json();
      if (res.ok) setNotifs(data);
    } catch (e) { console.error(e); }
  }, [hdrs]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([loadPayments(), loadUsers(), loadNotifs()]).finally(() => setLoading(false));
  }, [isAdmin, loadPayments, loadUsers, loadNotifs]);

  const handleLogoutAdmin = () => {
    localStorage.removeItem("cefr_admin_token");
    window.location.reload();
  };

  const handleAction = async (id, action, reason = "") => {
    setActionLoading(p => ({ ...p, [id + action]: true }));
    try {
      const isDel    = action === "delete";
      const method   = isDel ? "DELETE" : "POST";
      const endpoint = isDel
        ? `/api/payments/admin/${id}`
        : `/api/payments/admin/${id}/${action}`;

      const body = action === "reject" ? JSON.stringify({ reason }) : null;
      const res  = await fetch(`${BACKEND_URL}${endpoint}`, { 
        method, 
        headers: { ...hdrs, "Content-Type": "application/json" },
        body
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          action === "approve" ? "✅ Payment approved — Premium granted!" :
          action === "reject"  ? "❌ Payment rejected."                   :
                                 "🗑️ Record deleted."
        );
        setRejectingId(null);
        setRejectReason("");
        await loadPayments();
        if (action === "approve") await loadUsers();
      } else {
        showToast(data.error || "Action failed", false);
      }
    } catch (e) { showToast("Network error", false); }
    finally { setActionLoading(p => { const n = {...p}; delete n[id+action]; return n; }); }
  };

  const handleRemovePremium = async (email) => {
    if (!window.confirm(`Are you sure you want to remove premium from ${email}?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${encodeURIComponent(email)}/remove-premium`, {
        method: "POST",
        headers: hdrs
      });
      const data = await res.json();
      showToast(data.message || data.error, res.ok);
      if (res.ok) loadUsers();
    } catch (e) { showToast("Network error", false); }
  };

  const handleCreateNotif = async (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify(notifForm)
      });
      if (res.ok) {
        showToast("📢 Notification sent to all users!");
        setNotifForm({ title: "", message: "", type: "info" });
        loadNotifs();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed", false);
      }
    } catch (e) { showToast("Network error", false); }
    finally { setNotifLoading(false); }
  };

  const handleDeleteNotif = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, { method: "DELETE", headers: hdrs });
      if (res.ok) {
        showToast("Notification deleted");
        loadNotifs();
      }
    } catch (e) { showToast("Network error", false); }
  };

  const handleCleanup = async () => {
    if (!window.confirm("Remove premium from all expired users in the database?")) return;
    try {
      const res  = await fetch(`${BACKEND_URL}/api/payments/admin/cleanup`, { method: "POST", headers: hdrs });
      const data = await res.json();
      showToast(data.message || data.error, res.ok);
      if (res.ok) loadUsers();
    } catch (e) { showToast("Network error", false); }
  };

  const statusColor = { pending: "#EF9F27", approved: "#1D9E75", rejected: "#e11d48" };
  const statusBg    = { pending: "rgba(239,159,39,0.12)", approved: "rgba(29,158,117,0.12)", rejected: "rgba(225,29,72,0.12)" };

  const filteredPayments = filterStatus === "all"
    ? payments
    : payments.filter(p => p.status === filterStatus);

  const pendingCount  = payments.filter(p => p.status === "pending").length;
  const approvedCount = payments.filter(p => p.status === "approved").length;
  const premiumUsers  = users.filter(u => u.isPremium && u.premiumExpire && new Date(u.premiumExpire) > new Date());

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center" }}>
        <Ic n="shield" s={48} c="#e11d48" />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Access Denied</h2>
        <p style={{ color: "#8b9bbf", fontSize: 14 }}>You do not have administrator privileges.</p>
        {onBack && <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 10, background: "#4a9eff", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Back to Dashboard</button>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#131d2e", border: `1px solid ${toast.ok ? "#1D9E75" : "#e11d48"}`, borderRadius: 12, padding: "12px 24px", zIndex: 9999, fontSize: 14, color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <Ic n="shield" s={24} c="#4a9eff" /> Admin Control Panel
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 14 }}>Manage payment requests and premium users</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontWeight: 700 }}>
              ← Dashboard
            </button>
          )}
          <button onClick={handleLogoutAdmin} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(225,29,72,0.1)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.2)", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Ic n="logout" s={16} /> Log Out
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Pending",        value: pendingCount,          color: "#EF9F27" },
          { label: "Approved",       value: approvedCount,         color: "#1D9E75" },
          { label: "Active Premium", value: premiumUsers.length,   color: "#a78bfa" },
          { label: "Total Users",    value: users.length,          color: "#4a9eff" },
        ].map(s => (
          <div key={s.label} style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#8b9bbf", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "payments", label: `Payment Requests ${pendingCount > 0 ? `(${pendingCount})` : ""}` },
            { id: "users",    label: `Users` },
            { id: "notifications", label: "Notifications" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: tab === t.id ? "#4a9eff" : "#18243a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all .2s" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "payments" && (
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, background: "#18243a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, cursor: "pointer" }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
          {tab === "users" && (
            <button onClick={handleCleanup}
              style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(225,29,72,0.1)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.2)", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
              Remove Expired Premiums
            </button>
          )}
          <button onClick={() => { setLoading(true); Promise.all([loadPayments(), loadUsers()]).finally(() => setLoading(false)); }}
            style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "1px solid rgba(74,158,255,0.2)", cursor: "pointer" }}>
            <Ic n="refresh" s={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#8b9bbf" }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(74,158,255,0.2)", borderTopColor: "#4a9eff", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
          Loading data...
        </div>
      ) : tab === "payments" ? (

        /* ── PAYMENTS TABLE ─────────────────────────────────────────── */
        <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden" }}>
          {filteredPayments.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#8b9bbf" }}>
              <Ic n="shield" s={40} c="#18243a" />
              <p style={{ marginTop: 12, fontSize: 14 }}>No payment requests found.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#f0f4ff" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Date / User", "Plan & Amount", "Method", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "14px 16px", fontWeight: 700, color: "#8b9bbf", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => {
                    const planColor = PLAN_COLORS[p.planId] || "#4a9eff";
                    const planLabel = PLAN_LABELS[p.planId]  || p.planId;
                    return (
                      <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                        {/* Date / User */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: 12 }}>
                            {new Date(p.createdAt).toLocaleDateString("en-GB")} {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div style={{ color: "#8b9bbf", fontSize: 11, marginTop: 3 }}>{p.email}</div>
                          <div style={{ color: "#4a5568", fontSize: 11 }}>📞 {p.phone}</div>
                        </td>

                        {/* Plan & Amount */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 800, color: planColor, fontSize: 12 }}>{planLabel}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>{(p.amount || 0).toLocaleString()} UZS</div>
                          {p.comment && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>"{p.comment}"</div>}
                        </td>

                        {/* Method */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", fontWeight: 700 }}>
                            {p.paymentMethod}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: statusColor[p.status], background: statusBg[p.status], padding: "4px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                            {p.status}
                          </span>
                          {p.status === "approved" && p.approvedAt && (
                            <div style={{ fontSize: 10, color: "#4a5568", marginTop: 4 }}>
                              {new Date(p.approvedAt).toLocaleDateString("en-GB")}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
                            {/* View Receipt */}
                            <button onClick={() => setPreviewImage(p.receiptFileUrl.startsWith('http') ? p.receiptFileUrl : `${BACKEND_URL}${p.receiptFileUrl}`)}
                              title="View Receipt"
                              style={{ padding: "6px 10px", background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 7, color: "#4a9eff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>
                              <Ic n="eye" s={13} /> Receipt
                            </button>

                            {/* Approve (only pending) */}
                            {p.status === "pending" && (
                              <button
                                disabled={!!actionLoading[p._id + "approve"]}
                                onClick={() => handleAction(p._id, "approve")}
                                title="Approve & Grant Premium"
                                style={{ padding: "6px 10px", background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 7, color: "#1D9E75", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, opacity: actionLoading[p._id+"approve"] ? 0.5 : 1 }}>
                                <Ic n="check" s={13} /> Approve
                              </button>
                            )}

                             {/* Reject (only pending) */}
                             {p.status === "pending" && (
                               <div style={{ position: "relative" }}>
                                 {rejectingId === p._id ? (
                                   <div style={{ position: "absolute", bottom: "100%", right: 0, background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, zIndex: 10, minWidth: 200, marginBottom: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                                      <p style={{ fontSize: 11, color: "#fff", marginBottom: 8, fontWeight: 700 }}>REJECTION REASON:</p>
                                      <input 
                                        autoFocus
                                        placeholder="e.g. Invalid receipt" 
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", padding: "6px 8px", fontSize: 12, marginBottom: 8 }}
                                      />
                                      <div style={{ display: "flex", gap: 6 }}>
                                        <button onClick={() => setRejectingId(null)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8b9bbf", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                                        <button onClick={() => handleAction(p._id, "reject", rejectReason)} style={{ flex: 1, padding: "6px", borderRadius: 6, boder: "none", background: "#e11d48", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
                                      </div>
                                   </div>
                                 ) : (
                                   <button
                                     disabled={!!actionLoading[p._id + "reject"]}
                                     onClick={() => setRejectingId(p._id)}
                                     title="Reject Payment"
                                     style={{ padding: "6px 10px", background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 7, color: "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, opacity: actionLoading[p._id+"reject"] ? 0.5 : 1 }}>
                                     <Ic n="x" s={13} /> Reject
                                   </button>
                                 )}
                               </div>
                             )}

                            {/* Delete */}
                            <button
                              onClick={() => { if (window.confirm("Permanently delete this payment record?")) handleAction(p._id, "delete"); }}
                              title="Delete Record"
                              style={{ padding: "6px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#64748b", cursor: "pointer" }}>
                              <Ic n="trash" s={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      ) : tab === "users" ? (
        /* ── PREMIUM USERS GRID ─────────────────────────────────────── */
        <div>
          {users.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#8b9bbf" }}>No users found.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {users.map(u => {
                const exp     = u.premiumExpire ? new Date(u.premiumExpire) : null;
                const active  = exp && exp > new Date();
                const daysLeft = active ? Math.max(0, Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24))) : 0;
                const planLabel = PLAN_LABELS[u.premiumPlan] || u.premiumPlan;
                const planColor = PLAN_COLORS[u.premiumPlan] || "#a78bfa";
                return (
                  <div key={u._id} style={{ background: "#131d2e", border: `1px solid ${active ? planColor + "55" : "rgba(255,255,255,0.05)"}`, borderRadius: 14, padding: 16, transition: "border-color .2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: active ? planColor + "22" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Ic n="user" s={18} c={active ? planColor : "#64748b"} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username || "Learner"}</div>
                        <div style={{ fontSize: 11, color: "#8b9bbf", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 10 }}>
                      <span style={{ background: "rgba(74,158,255,0.1)", color: "#4a9eff", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{u.level || "A1"}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", color: "#8b9bbf", padding: "2px 8px", borderRadius: 20 }}>{(u.xp || 0)} XP</span>
                    </div>

                    {active ? (
                      <div style={{ background: `${planColor}12`, border: `1px solid ${planColor}33`, borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: planColor, textTransform: "uppercase" }}>⭐ Premium Active</span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{daysLeft}d left</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#8b9bbf", marginBottom: 6 }}>{planLabel}</div>
                        <div style={{ fontSize: 11, color: "#4a5568" }}>Expires: {exp.toLocaleDateString("en-GB")}</div>
                        <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, (daysLeft / 90) * 100)}%`, background: `linear-gradient(90deg, ${planColor}, ${planColor}88)` }} />
                        </div>
                        <button 
                          onClick={() => handleRemovePremium(u.email)}
                          style={{ width: "100%", marginTop: 12, padding: "6px", borderRadius: 8, background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", color: "#e11d48", fontSize: 10, fontWeight: 800, cursor: "pointer", textTransform: "uppercase" }}>
                          Remove Premium
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4a5568", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 20 }}>Free User</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── NOTIFICATIONS TAB ─────────────────────────────────────── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, alignItems: "start" }}>
          {/* Create Notif Form */}
          <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <Ic n="bell" s={18} c="#4a9eff" /> Send Global Notification
            </h3>
            <p style={{ color: "#8b9bbf", fontSize: 12, marginBottom: 20 }}>This will be visible to all users instantly.</p>
            
            <form onSubmit={handleCreateNotif} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5a6a8c", marginBottom: 6, display: "block" }}>TITLE</label>
                <input 
                  placeholder="e.g. New Update Available!" 
                  value={notifForm.title}
                  onChange={e => setNotifForm({...notifForm, title: e.target.value})}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5a6a8c", marginBottom: 6, display: "block" }}>MESSAGE</label>
                <textarea 
                  rows={3}
                  placeholder="Tell users what's happening..." 
                  value={notifForm.message}
                  onChange={e => setNotifForm({...notifForm, message: e.target.value})}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, resize: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5a6a8c", marginBottom: 6, display: "block" }}>TYPE</label>
                  <select 
                    value={notifForm.type}
                    onChange={e => setNotifForm({...notifForm, type: e.target.value})}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px", borderRadius: 10, fontSize: 14 }}>
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Orange)</option>
                    <option value="error">Critical (Red)</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" disabled={notifLoading} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#4a9eff", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {notifLoading ? <Ic n="refresh" s={14} /> : <><Ic n="plus" s={14} /> Send</>}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Notif List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Recent Notifications</h3>
             {notifs.length === 0 ? (
               <div style={{ padding: 40, textAlign: "center", color: "#4a5568", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 16 }}>No sent notifications.</div>
             ) : (
               notifs.slice(0, 10).map(n => (
                 <div key={n._id} style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                     <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{n.title}</div>
                     <div style={{ fontSize: 11, color: "#8b9bbf", lineHeight: 1.4 }}>{n.message}</div>
                     <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                   </div>
                   <button onClick={() => handleDeleteNotif(n._id)} style={{ padding: 8, background: "rgba(225,29,72,0.05)", color: "#e11d48", border: "none", borderRadius: 8, cursor: "pointer" }}>
                     <Ic n="trash" s={14} />
                   </button>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* Receipt Image Preview Modal */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button onClick={() => setPreviewImage(null)}
              style={{ position: "absolute", top: -44, right: 0, background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Ic n="x" s={18} /> Close preview
            </button>
            <img src={previewImage} alt="Payment Receipt" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,0.8)", objectFit: "contain" }} />
          </div>
        </div>
      )}
    </div>
  );
}
