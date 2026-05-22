import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import BACKEND_URL from "./config/api";
import { 
  Video, Lock, Crown, User, Mic, MicOff, X, Volume2, VolumeX, MessageSquare, Zap
} from "lucide-react";

const Ic = ({ icon: Icon, s = 16, c = "currentColor", className = "" }) => <Icon size={s} color={c} className={className} />;

export default function FaceToFace({ progress, openPremiumModal }) {
  const [connecting, setConnecting] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [volume, setVolume] = useState(1);
  const [socketError, setSocketError] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (progress?.isPremium) {
      initMedia();
      try {
        socketRef.current = io(BACKEND_URL.replace("/api", ""), { transports: ['websocket'] });
        socketRef.current.on("connect_error", (err) => { setSocketError(true); setConnecting(false); });
        socketRef.current.on("match_found", async ({ room, caller, partnerName }) => { setConnecting(false); setInCall(true); setPartnerName(partnerName); setupWebRTC(caller); });
        socketRef.current.on("offer", async (data) => { if (!peerConnectionRef.current) setupWebRTC(false); await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data)); const answer = await peerConnectionRef.current.createAnswer(); await peerConnectionRef.current.setLocalDescription(answer); socketRef.current.emit("answer", answer); });
        socketRef.current.on("answer", async (data) => { if (peerConnectionRef.current) await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data)); });
        socketRef.current.on("ice-candidate", async (data) => { if (peerConnectionRef.current) try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data)); } catch(e){} });
        socketRef.current.on("partner_disconnected", () => { endCall(); });
      } catch (err) { setSocketError(true); }
    }
    return () => { if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop()); if (peerConnectionRef.current) peerConnectionRef.current.close(); if (socketRef.current) socketRef.current.disconnect(); };
  }, [progress?.isPremium]);

  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  };

  const setupWebRTC = async (isCaller) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerConnectionRef.current = pc;
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    pc.ontrack = (event) => { if (remoteVideoRef.current && event.streams[0]) remoteVideoRef.current.srcObject = event.streams[0]; };
    pc.onicecandidate = (event) => { if (event.candidate && socketRef.current) socketRef.current.emit("ice-candidate", event.candidate); };
    if (isCaller) { const offer = await pc.createOffer(); await pc.setLocalDescription(offer); socketRef.current.emit("offer", offer); }
  };

  const startSearch = () => { setConnecting(true); socketRef.current.emit("join_queue", { username: progress?.username || "Learner" }); };
  const cancelSearch = () => { setConnecting(false); socketRef.current.emit("leave_queue"); };
  const endCall = () => { setInCall(false); setConnecting(false); setPartnerName(""); if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; } if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; socketRef.current.emit("leave_queue"); };

  const toggleMic = () => { if (localStreamRef.current) { localStreamRef.current.getAudioTracks()[0].enabled = !micActive; setMicActive(!micActive); } };
  const toggleVideo = () => { if (localStreamRef.current) { localStreamRef.current.getVideoTracks()[0].enabled = !videoActive; setVideoActive(!videoActive); } };

  if (!progress?.isPremium) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }} className="animate-fade-up">
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Lock size={32} color="var(--text-primary)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Premium Speaking</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 400, margin: "0 auto 32px", fontSize: 15, lineHeight: 1.6 }}>Unlock high-fidelity video conversations with learners across the globe.</p>
        <button onClick={openPremiumModal} style={{ padding: "16px 40px", borderRadius: 16, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Upgrade to Premium</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }} className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Face-to-Face</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#30d158", fontSize: 12, fontWeight: 700, marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30d158" }} /> ONLINE
          </div>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 13, fontWeight: 700 }}>
          <Crown size={14} color="#FFD700" style={{ verticalAlign: "middle", marginRight: 6 }} /> PREMIUM
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#000", aspectRatio: "4/3", border: "1px solid var(--border)" }}>
           <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: videoActive ? 1 : 0 }} />
           {!videoActive && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><User size={48} color="#8e8e93" /></div>}
           <div style={{ position: "absolute", bottom: 16, left: 16, padding: "6px 12px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600 }}>You</div>
        </div>

        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#000", aspectRatio: "4/3", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: inCall ? "block" : "none" }} />
           {!inCall && (
             <div style={{ textAlign: "center", color: "#8e8e93" }}>
                {connecting ? <div className="loader-mini" /> : <User size={48} />}
                <p style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>{connecting ? "Searching..." : "Ready to connect"}</p>
             </div>
           )}
           <div style={{ position: "absolute", bottom: 16, left: 16, padding: "6px 12px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600 }}>{inCall ? partnerName : "Partner"}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {inCall ? (
          <>
            <button onClick={toggleMic} style={{ width: 56, height: 56, borderRadius: "50%", background: micActive ? "var(--bg-secondary)" : "#ff3b30", border: "none", color: micActive ? "var(--text-primary)" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic icon={micActive ? Mic : MicOff} s={22}/></button>
            <button onClick={toggleVideo} style={{ width: 56, height: 56, borderRadius: "50%", background: videoActive ? "var(--bg-secondary)" : "#ff3b30", border: "none", color: videoActive ? "var(--text-primary)" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic icon={Video} s={22}/></button>
            <button onClick={endCall} style={{ padding: "0 32px", borderRadius: 28, background: "#ff3b30", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>End Call</button>
          </>
        ) : (
          <button onClick={connecting ? cancelSearch : startSearch} style={{ padding: "16px 48px", borderRadius: 16, background: connecting ? "#ff3b30" : "var(--text-primary)", color: connecting ? "#fff" : "var(--bg-primary)", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>{connecting ? "Cancel" : "Connect with Partner"}</button>
        )}
      </div>

      <style>{`
        .loader-mini { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #fff; borderRadius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
