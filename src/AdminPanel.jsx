import React, { useState, useEffect } from "react";
import BACKEND_URL from "./config/api";

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", verticalAlign: "middle" };
  const d = {
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trash: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
    eye: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  };
  return d[n] || null;
}

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments"); // payments | users
  const [previewImage, setPreviewImage] = useState(null);
  
  const hdrs = { "x-user-email": user.email };

  const loadPayments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs });
      const data = await res.json();
      if (res.ok) setPayments(data);
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPayments(), loadUsers()]).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => { // action: approve | reject | delete (by METHOD)
    try {
      const isDel = action === 'delete';
      const method = isDel ? 'DELETE' : 'POST';
      const endpoint = isDel ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { method, headers: hdrs });
      if (res.ok) {
        loadPayments();
      } else {
        const d = await res.json();
        alert(d.error || "Error");
      }
    } catch (e) {
      alert("Network Error");
    }
  };

  const statusColor = { pending: "#EF9F27", approved: "#1D9E75", rejected: "#e11d48" };

  if (!user?.isAdmin) {
    return <div style={{ color: "red", padding: 40, textAlign: "center" }}>Forbidden: You are not an admin.</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Admin Control Panel</h1>
          <p style={{ color: "#8b9bbf", fontSize: 14 }}>Manage payments and user premium statuses</p>
        </div>
        <button onClick={onBack} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontWeight: 700 }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setTab("payments")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: tab === "payments" ? "#4a9eff" : "#18243a", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          Payment Requests
        </button>
        <button onClick={() => setTab("users")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: tab === "users" ? "#4a9eff" : "#18243a", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
          Premium Users
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#8b9bbf" }}>Loading data...</div>
      ) : tab === "payments" ? (
        <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left", color: "#f0f4ff" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "16px 20px", fontWeight: 700, color: "#8b9bbf" }}>Date / User</th>
                <th style={{ padding: "16px 20px", fontWeight: 700, color: "#8b9bbf" }}>Plan & Payment</th>
                <th style={{ padding: "16px 20px", fontWeight: 700, color: "#8b9bbf" }}>Status</th>
                <th style={{ padding: "16px 20px", fontWeight: 700, color: "#8b9bbf", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "#fff" }}>{new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString()}</div>
                    <div style={{ color: "#8b9bbf", fontSize: 12, marginTop: 4 }}>{p.email}</div>
                    <div style={{ color: "#8b9bbf", fontSize: 11 }}>UID: {p.userId.slice(-6)} | {p.phone}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 700, color: "#4a9eff" }}>{p.planId}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>{p.paymentMethod}</span>
                      <span style={{ fontWeight: 700 }}>{p.amount.toLocaleString()} UZS</span>
                    </div>
                    {p.comment && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>"{p.comment}"</div>}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: statusColor[p.status], background: statusColor[p.status]+"15", padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                      <button onClick={() => setPreviewImage(`${BACKEND_URL}${p.receiptFileUrl}`)} style={{ padding: "6px", background: "rgba(74,158,255,0.1)", border: "none", borderRadius: 6, color: "#4a9eff", cursor: "pointer" }} title="View Receipt">
                        <Ic n="eye" s={14} />
                      </button>
                      
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => handleAction(p._id, 'approve')} style={{ padding: "6px", background: "rgba(29,158,117,0.1)", border: "none", borderRadius: 6, color: "#1D9E75", cursor: "pointer" }} title="Approve">
                            <Ic n="check" s={14} />
                          </button>
                          <button onClick={() => handleAction(p._id, 'reject')} style={{ padding: "6px", background: "rgba(225,29,72,0.1)", border: "none", borderRadius: 6, color: "#e11d48", cursor: "pointer" }} title="Reject">
                            <Ic n="x" s={14} />
                          </button>
                        </>
                      )}
                      
                      <button onClick={() => { if(window.confirm("Delete record?")) handleAction(p._id, 'delete') }} style={{ padding: "6px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, color: "#94a3b8", cursor: "pointer", marginLeft: 8 }} title="Delete">
                        <Ic n="trash" s={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={4} style={{ padding: 30, textAlign: "center", color: "#8b9bbf" }}>No payment requests found.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: "#131d2e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, padding: 20 }}>
          {users.map(u => (
            <div key={u._id} style={{ background: "#18243a", border: `1px solid ${u.isPremium ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{u.username || "Learner"}</div>
              <div style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 12 }}>{u.email}</div>
              
              {u.isPremium ? (
                <div style={{ background: "rgba(167,139,250,0.1)", padding: "8px 12px", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", marginBottom: 4 }}>Premium Active</div>
                  <div style={{ fontSize: 12, color: "#f0f4ff" }}>Plan: <span style={{ fontWeight: 700 }}>{u.premiumPlan}</span></div>
                  <div style={{ fontSize: 12, color: "#8b9bbf" }}>Expires: {new Date(u.premiumExpire).toLocaleDateString()}</div>
                </div>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6 }}>Free User</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: -40, right: 0, background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Ic n="x" s={24}/></button>
            <img src={previewImage} alt="Receipt Preview" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.8)", objectFit: "contain" }} />
          </div>
        </div>
      )}

    </div>
  );
}
