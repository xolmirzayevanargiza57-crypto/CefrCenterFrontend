import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import BACKEND_URL from "./config/api";
import { Video, Lock, Crown, User, Mic, MicOff, X, Volume2, VolumeX, MessageSquare } from "lucide-react";

const Ic = ({ icon: Icon, s = 16, c = "currentColor", className = "" }) => <Icon size={s} color={c} className={className} />;

export default function FaceToFace({ progress, openPremiumModal }) {
  const [connecting, setConnecting] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [volume, setVolume] = useState(1); // 0 to 1

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (progress?.isPremium) {
      initMedia();
      socketRef.current = io(BACKEND_URL.replace("/api", ""), { transports: ['websocket'] });

      socketRef.current.on("match_found", async ({ room, caller, partnerName }) => {
        setConnecting(false);
        setInCall(true);
        setPartnerName(partnerName);
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
          catch(e) { console.error("ICE error", e); }
        }
      });

      socketRef.current.on("partner_disconnected", () => {
        alert("Partner has left the conversation.");
        endCall();
      });
    }

    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [progress?.isPremium]);

  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const setupWebRTC = async (isCaller) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" }
      ]
    });
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
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
    socketRef.current.emit("join_queue", { username: progress?.username || "Anonymous Learner" });
  };

  const cancelSearch = () => {
    setConnecting(false);
    socketRef.current.emit("leave_queue");
  };

  const endCall = () => {
    setInCall(false);
    setConnecting(false);
    setPartnerName("");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    socketRef.current.emit("leave_queue");
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = !micActive;
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = !videoActive;
      setVideoActive(!videoActive);
    }
  };

  const handleVolume = (val) => {
    setVolume(val);
    if (remoteVideoRef.current) remoteVideoRef.current.volume = val;
  };

  if (!progress?.isPremium) {
    return (
      <div style={{ padding: 60, textAlign: "center", animation: "fUp .5s ease" }}>
        <style>{`@keyframes fUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Lock size={36} color="#a78bfa" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 16 }}>Premium Speaking Practice</h1>
        <p style={{ color: "#8b9bbf", maxWidth: 500, margin: "0 auto 32px", fontSize: 16, lineHeight: 1.6 }}>
          Experience the ultimate way to master English by speaking with real people across the globe. Unlock video conversations now.
        </p>
        <button onClick={openPremiumModal} style={{ padding: "16px 40px", borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 10px 30px rgba(124,58,237,0.4)" }}>
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", animation: "fUp .5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>Face-to-Face</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 13, fontWeight: 700, marginTop: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            REAL-TIME CONNECTION ACTIVE
          </div>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <Crown size={18} color="#fbbf24" />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>PREMIUM STUDENT</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Local Stream */}
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "#0b1120", border: "1px solid rgba(255,255,255,0.05)", aspectRatio: "16/9" }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: videoActive ? 1 : 0 }} />
          {!videoActive && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}><User size={64}/></div>}
          <div style={{ position: "absolute", bottom: 20, left: 20, padding: "8px 16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <User size={14} /> You {!micActive && <MicOff size={14} color="#ef4444"/>}
          </div>
        </div>

        {/* Remote Stream */}
        <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "#0b1120", border: "1px solid rgba(255,255,255,0.05)", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: inCall ? "block" : "none" }} />
          
          {!inCall && (
            <div style={{ textAlign: "center" }}>
              {connecting ? (
                <div style={{ position: "relative", width: 100, height: 100 }}>
                   <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #4a9eff", animation: "pulse 2s infinite" }} />
                   <div style={{ position: "absolute", inset: 15, borderRadius: "50%", background: "rgba(74,158,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Video size={32} color="#4a9eff" />
                   </div>
                </div>
              ) : (
                <div style={{ color: "#64748b", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <User size={48} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Waiting for partner...</span>
                </div>
              )}
            </div>
          )}

          <div style={{ position: "absolute", bottom: 20, left: 20, padding: "8px 16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <User size={14} /> {inCall ? partnerName : (connecting ? "Finding partner..." : "Offline")}
          </div>

          {inCall && (
            <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.5)", padding: "10px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
              <button onClick={() => handleVolume(volume === 0 ? 1 : 0)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => handleVolume(parseFloat(e.target.value))} style={{ width: 60, height: 4, accentColor: "#4a9eff" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        {inCall ? (
          <>
            <button onClick={toggleMic} style={{ width: 60, height: 60, borderRadius: 20, border: "none", background: micActive ? "rgba(255,255,255,0.05)" : "rgba(239,68,68,0.2)", color: micActive ? "#fff" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {micActive ? <Mic size={24}/> : <MicOff size={24}/>}
            </button>
            <button onClick={toggleVideo} style={{ width: 60, height: 60, borderRadius: 20, border: "none", background: videoActive ? "rgba(255,255,255,0.05)" : "rgba(239,68,68,0.2)", color: videoActive ? "#fff" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Video size={24}/>
            </button>
            <button onClick={endCall} style={{ padding: "0 40px", borderRadius: 20, border: "none", background: "#ef4444", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 10px 20px rgba(239,68,68,0.3)" }}>
              End Practice
            </button>
          </>
        ) : (
          <button 
            onClick={connecting ? cancelSearch : startSearch} 
            style={{ padding: "18px 50px", borderRadius: 20, border: "none", background: connecting ? "#ef4444" : "#4a9eff", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: connecting ? "0 10px 30px rgba(239,68,68,0.3)" : "0 10px 30px rgba(74,158,255,0.3)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {connecting ? "Cancel Search" : "Connect with Partner"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
      `}</style>
    </div>
  );
}
