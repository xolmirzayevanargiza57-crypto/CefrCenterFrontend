import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import BACKEND_URL from "./config/api";

function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", verticalAlign: "middle" };
  const d = {
    video: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    lock: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    crown: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    user: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    mic: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    micOff: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    x: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return d[n] || null;
}

export default function FaceToFace({ progress, openPremiumModal }) {
  const [connecting, setConnecting] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only capture local media if user is premium
    if (progress?.isPremium) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStreamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Media access error:", err));
      
      socketRef.current = io(BACKEND_URL.replace("/api", ""), { transports: ['polling', 'websocket'] });

      socketRef.current.on("match_found", async ({ room, caller, partnerName }) => {
        setConnecting(false);
        setInCall(true);
        socketRef.current.partnerName = partnerName;
        setupWebRTC(caller);
      });

      socketRef.current.on("offer", async (data) => {
        if (!peerConnectionRef.current) setupWebRTC(false);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current.emit("answer", answer);
      });

      socketRef.current.on("answer", async (data) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
        }
      });

      socketRef.current.on("ice-candidate", async (data) => {
        if (peerConnectionRef.current) {
          try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data)); }
          catch(e) { console.error("Error adding ice candidate", e); }
        }
      });

      socketRef.current.on("partner_disconnected", () => {
        alert("Partner disconnected.");
        endCall();
      });
    }

    return () => {
      // Cleanup
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [progress?.isPremium]);

  const setupWebRTC = async (isCaller) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    });
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      console.log("Remote stream received...");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(e => console.error("Play failed", e));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", event.candidate);
      }
    };

    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);
    }
  };

  const startSearch = () => {
    setConnecting(true);
    socketRef.current.emit("join_queue", { username: progress?.username || "Learner" });
  };

  const cancelSearch = () => {
    setConnecting(false);
    socketRef.current.emit("leave_queue");
  };

  const endCall = () => {
    setInCall(false);
    setConnecting(false);
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    peerConnectionRef.current = null;
    socketRef.current.emit("leave_queue"); // Notify backend to drop from rooms, backend handles it via disconnect mostly but we can add a custom 'end_call' later
    // To gracefully clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.load(); // Force reset
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  // Lockdown UI
  if (!progress?.isPremium) {
    return (
      <div style={{ animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(124,58,237,0.1))", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Ic n="lock" s={36} c="#a78bfa" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
          Face to Face is a <span style={{ color: "#a78bfa" }}>Premium</span> Feature
        </h1>
        <p style={{ fontSize: 15, color: "#8b9bbf", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Practice speaking randomly with other real students in real-time. Upgrade your account to unlock live WebRTC video and audio conversations.
        </p>
        <button onClick={openPremiumModal} style={{ padding: "16px 36px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 32px rgba(124,58,237,0.3)", display: "flex", alignItems: "center", gap: 10, margin: "0 auto" }}>
          <Ic n="crown" s={20} c="#fff" /> Unlock Premium
        </button>
      </div>
    );
  }

  // Active Premium UI
  return (
    <div style={{ animation: "fadeUp .4s ease", maxWidth: 1000, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRing { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Ic n="video" s={24} c="#4a9eff" /> Face to Face
          </h1>
          <p style={{ color: "#8b9bbf", fontSize: 14 }}>Random real-time video speaking practice</p>
        </div>
        <div style={{ padding: "6px 12px", background: "rgba(167,139,250,0.15)", borderRadius: 8, border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          <Ic n="crown" s={14} /> PREMIUM ACTIVE
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        
        {/* Local Stream */}
        <div style={{ background: "#131d2e", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            You {!micActive && <Ic n="micOff" s={12} c="#e11d48"/>}
          </div>
        </div>

        {/* Remote Stream */}
        <div style={{ background: "#131d2e", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: inCall ? "block" : "none" }} />
          
          {!inCall && (
            connecting ? (
              <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "rgba(74,158,255,0.2)", animation: "pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite" }} />
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#4a9eff", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="user" s={20} c="#fff" />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#64748b" }}>
                <Ic n="user" s={40} />
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>Partner Camera</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Not connected</div>
              </div>
            )
          )}
          
          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {inCall ? `Partner: ${socketRef.current.partnerName || "Real Student"}` : (connecting ? "Searching..." : "Idle")}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {inCall ? (
          <>
            <button onClick={toggleMic} style={{ width: 50, height: 50, borderRadius: 14, border: "none", background: micActive ? "rgba(255,255,255,0.1)" : "rgba(225,29,72,0.2)", color: micActive ? "#fff" : "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic n={micActive ? "mic" : "micOff"} s={20} />
            </button>
            <button onClick={endCall} style={{ padding: "0 30px", borderRadius: 14, border: "none", background: "#e11d48", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Ic n="x" s={20} /> End Call
            </button>
          </>
        ) : (
           <button onClick={connecting ? cancelSearch : startSearch} style={{ padding: "14px 30px", borderRadius: 14, border: "none", background: connecting ? "#e11d48" : "#4a9eff", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all .2s" }}>
             {connecting ? "Stop Searching" : "Find Random Partner"}
           </button>
        )}
      </div>
    </div>
  );
}
