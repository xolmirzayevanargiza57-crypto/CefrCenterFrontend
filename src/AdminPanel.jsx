import React, { useState, useEffect, useCallback } from "react";
import BACKEND_URL from "./config/api";

export default function AdminPanel({ user, onBack }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "checking" });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payments"); 
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [notifs, setNotifs] = useState([]);
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "info", image: "" });
  const [notifLoading, setNotifLoading] = useState(false);

  const userEmail = user?.email || "admin@cefr.com";
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
      showToast("Error loading data", false);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (id, action, reason = "") => {
    try {
      const endpoint = action === "delete" ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason }) : null
      });

      if (res.ok) {
        showToast("Success!");
        loadData();
      }
    } catch (e) { showToast("Error", false); }
  };

  const handleRemovePremium = async (email) => {
    if (!window.confirm("Remove Premium?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${email}/remove-premium`, {
        method: "POST",
        headers: hdrs
      });
      if (res.ok) {
        showToast("Premium removed.");
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
        showToast("Sent!");
        setNotifForm({ title: "", message: "", type: "info", image: "" });
        loadData();
      }
    } catch (e) { showToast("Failed", false); }
    finally { setNotifLoading(false); }
  };

  const deleteNotif = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}?email=${userEmail}`, { method: "DELETE" });
      if (res.ok) { showToast("Deleted"); loadData(); }
    } catch (e) { showToast("Error", false); }
  };

  const filteredUsers = users.filter(u => 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", color: "#fff", fontFamily: "sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, background: "#4a9eff", padding: "10px", borderRadius: 8 }}>{toast.msg}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Admin Panel</h2>
        <button onClick={onBack} style={{ padding: "8px 16px", cursor: "pointer" }}>Back</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTab("payments")} style={{ padding: "10px", background: tab === "payments" ? "#4a9eff" : "#131d2e", color: "#fff", border: "none", cursor: "pointer" }}>Payments</button>
        <button onClick={() => setTab("users")} style={{ padding: "10px", background: tab === "users" ? "#4a9eff" : "#131d2e", color: "#fff", border: "none", cursor: "pointer" }}>Users</button>
        <button onClick={() => setTab("notifications")} style={{ padding: "10px", background: tab === "notifications" ? "#4a9eff" : "#131d2e", color: "#fff", border: "none", cursor: "pointer" }}>Notifications</button>
      </div>

      <div style={{ background: "#131d2e", padding: 20, borderRadius: 10 }}>
        {loading ? <p>Loading...</p> : (
          <>
            {tab === "payments" && (
              <table style={{ width: "100%", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={{ padding: "10px 0" }}>{p.email}</td>
                      <td>{p.amount} UZS</td>
                      <td>{p.status}</td>
                      <td>
                        <button onClick={() => setPreviewImage(p.receiptFileUrl.startsWith('http') ? p.receiptFileUrl : `${BACKEND_URL.replace('/api', '')}${p.receiptFileUrl}`)}>View</button>
                        {p.status === "pending" && <button onClick={() => handleAction(p._id, "approve")}>Approve</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "users" && (
              <div>
                <input type="text" placeholder="Search..." onChange={e => setSearchTerm(e.target.value)} style={{ padding: 10, width: "100%", marginBottom: 10 }} />
                {filteredUsers.map(u => (
                  <div key={u._id} style={{ padding: 10, borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }}>
                    <span>{u.email} {u.isPremium && "⭐"}</span>
                    {u.isPremium && <button onClick={() => handleRemovePremium(u.email)}>Remove Premium</button>}
                  </div>
                ))}
              </div>
            )}

            {tab === "notifications" && (
              <div>
                <form onSubmit={handleSendNotif} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
                  <input type="text" placeholder="Title" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required />
                  <textarea placeholder="Message" value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} required />
                  <input type="text" placeholder="Image URL" value={notifForm.image} onChange={e => setNotifForm({ ...notifForm, image: e.target.value })} />
                  <button type="submit" disabled={notifLoading}>Send Broadcast</button>
                </form>
                <div style={{ marginTop: 20 }}>
                  {notifs.map(n => (
                    <div key={n._id} style={{ padding: 10, borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }}>
                      <span>{n.title}</span>
                      <button onClick={() => deleteNotif(n._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} style={{ maxWidth: "90%", maxHeight: "90%" }} />
        </div>
      )}
    </div>
  );
}
