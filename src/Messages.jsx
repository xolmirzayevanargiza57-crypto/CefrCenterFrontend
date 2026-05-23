import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, XCircle, Info, Trash2, ArrowLeft } from "lucide-react";
import BACKEND_URL from "./config/api.js";
import { io } from "socket.io-client";

export default function Messages({ user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // init socket for realtime messages
    try {
      const base = BACKEND_URL.replace('/api', '');
      const sock = io(base, { transports: ['websocket'] });
      socketRef.current = sock;
      sock.on('connect', () => {});
      sock.on('new_message', ({ email, message }) => {
        if (email && user?.email && email === user.email) {
          setMessages(prev => [message, ...prev]);
          try {
            if (Notification && Notification.permission === 'granted') {
              new Notification(message.title || 'New message', { body: message.body?.slice(0, 120) });
            } else if (Notification && Notification.permission !== 'denied') {
              Notification.requestPermission().then(p => { if (p === 'granted') new Notification(message.title || 'New message', { body: message.body?.slice(0, 120) }); });
            }
          } catch (e) { /* ignore */ }
        }
      });
    } catch (e) { console.warn('Socket init failed', e); }

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const fetchMessages = async () => {
    if (!user?.email) return;
    try {
      const resp = await fetch(`${BACKEND_URL}/api/messages?email=${encodeURIComponent(user.email)}`);
      const data = await resp.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/messages/${id}/read`, { method: "POST" });
      setMessages(messages.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (e) { console.error(e); }
  };

  const deleteMessage = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/messages/${id}`, { method: "DELETE" });
      setMessages(messages.filter(m => m._id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div style={{ color: "#8b9bbf", textAlign: "center", padding: "40px" }}>Loading messages...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#f0f4ff", cursor: "pointer" }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>My Messages {messages.filter(m => !m.read).length > 0 && <span style={{ background: "#e11d48", padding: "2px 8px", borderRadius: 10, fontSize: 13, marginLeft: 10 }}>{messages.filter(m => !m.read).length} New</span>}</h2>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <AnimatePresence>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
              No messages found. Let's start studying!
            </div>
          ) : (
            messages.map(msg => {
              const Icon = msg.type === "success" ? CheckCircle : msg.type === "error" ? XCircle : Info;
              const color = msg.type === "success" ? "#4ade80" : msg.type === "error" ? "#f87171" : "#38bdf8";

              return (
                <motion.div 
                  key={msg._id} 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ background: msg.read ? "#0d1b2e" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.read ? 'rgba(255,255,255,0.05)' : color+'40'}`, borderRadius: 14, padding: "20px", display: "flex", gap: 16, cursor: "pointer", overflow: "hidden" }}
                  onClick={() => !msg.read && markAsRead(msg._id)}
                >
                  <div style={{ color: color, marginTop: 2 }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: msg.read ? "#94a3b8" : "#f0f4ff", marginBottom: 6 }}>{msg.title}</h3>
                    <p style={{ fontSize: 14, color: "#8b9bbf", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.body}</p>
                    <div style={{ fontSize: 11, color: "#4a5568", marginTop: 8 }}>{new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }} style={{ background: "transparent", border: "none", color: "#4a5568", cursor: "pointer", padding: "4px" }}>
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
