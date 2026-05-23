import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import BACKEND_URL from "./config/api";
import { 
  Video, Lock, Crown, User, Mic, MicOff, X, Volume2, VolumeX, MessageSquare, Zap,
  PhoneOff, Settings, Wifi, WifiOff
} from "lucide-react";

export default function FaceToFace({ progress, openPremiumModal }) {
  const [connecting, setConnecting]   = useState(false);
  const [inCall, setInCall]           = useState(false);
  const [micActive, setMicActive]     = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [socketError, setSocketError] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef    = useRef(null);
  const remoteVideoRef   = useRef(null);
  const localStreamRef   = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef        = useRef(null);
  const timerRef         = useRef(null);

  // ── Init media + socket (only for premium users) ────────────────────────
  useEffect(() => {
    if (!progress?.isPremium) return;

    let mounted = true;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera/mic error:", err);
      }
    };

    const initSocket = () => {
      try {
        const base = BACKEND_URL.replace("/api", "");
        const sock = io(base, {
          transports: ["websocket"],
          reconnectionAttempts: 3,
          timeout: 10000,
        });
        socketRef.current = sock;

        sock.on("connect",       () => { if (mounted) setSocketReady(true); setSocketError(false); });
        sock.on("connect_error", () => { if (mounted) { setSocketError(true); setConnecting(false); } });
        sock.on("disconnect",    () => { if (mounted) setSocketReady(false); });

        sock.on("match_found", async ({ room, caller, partnerName: pName }) => {
          if (!mounted) return;
          setConnecting(false);
          setInCall(true);
          setPartnerName(pName || "Partner");
          await setupWebRTC(caller);
        });

        sock.on("offer", async (data) => {
          if (!peerConnectionRef.current) await setupWebRTC(false);
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          sock.emit("answer", answer);
        });

        sock.on("answer", async (data) => {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
          }
        });

        sock.on("ice-candidate", async (data) => {
          if (peerConnectionRef.current) {
            try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data)); } catch {}
          }
        });

        sock.on("partner_disconnected", () => { if (mounted) endCall(); });
        sock.on('not_premium', (data) => {
          if (!mounted) return;
          setConnecting(false);
          setSocketError(true);
          alert(data?.reason === 'Premium required' ? 'Premium talab qilinadi. Iltimos, Premium sotib oling.' : 'Queue join failed: ' + (data?.reason || 'Unknown'));
        });
      } catch (err) {
        console.error("Socket init error:", err);
        setSocketError(true);
      }
    };

    initMedia();
    initSocket();

    return () => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
      socketRef.current?.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [progress?.isPremium]);

  // ── Call duration timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (inCall) {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [inCall]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── WebRTC setup ────────────────────────────────────────────────────────
  const setupWebRTC = async (isCaller) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peerConnectionRef.current = pc;

    localStreamRef.current?.getTracks().forEach(track =>
      pc.addTrack(track, localStreamRef.current)
    );

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

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        endCall();
      }
    };

    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("offer", offer);
    }
  };

  // ── Controls ────────────────────────────────────────────────────────────
  const startSearch = () => {
    if (!socketRef.current?.connected) { setSocketError(true); return; }
    setConnecting(true);
    socketRef.current.emit("join_queue", {
      username: progress?.username || "Learner",
      email: progress?.email
    });
  };

  const cancelSearch = () => {
    setConnecting(false);
    socketRef.current?.emit("leave_queue");
  };

  const endCall = () => {
    setInCall(false);
    setConnecting(false);
    setPartnerName("");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socketRef.current?.emit("leave_queue");
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !micActive; setMicActive(p => !p); }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !videoActive; setVideoActive(p => !p); }
  };

  // ── Paywall ─────────────────────────────────────────────────────────────
  if (!progress?.isPremium) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Lock size={32} color="var(--text-primary)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>Premium Speaking</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 400, margin: "0 auto 32px", fontSize: 15, lineHeight: 1.6 }}>
          Unlock high-fidelity video conversations with learners across the globe.
        </p>
        <button
          onClick={openPremiumModal}
          style={{ padding: "16px 40px", borderRadius: 16, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          Upgrade to Premium
        </button>
      </div>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>Face-to-Face</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, marginTop: 4,
            color: socketError ? "#ef4444" : socketReady ? "#30d158" : "#EF9F27" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%",
              background: socketError ? "#ef4444" : socketReady ? "#30d158" : "#EF9F27" }} />
            {socketError ? "CONNECTION ERROR" : socketReady ? "ONLINE" : "CONNECTING..."}
          </div>
        </div>
        <div style={{ padding: "8px 16px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
          <Crown size={14} color="#FFD700" /> PREMIUM
        </div>
      </div>

      {/* Video Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Local */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#000", aspectRatio: "4/3", border: "1px solid var(--border)" }}>
          <video ref={localVideoRef} autoPlay playsInline muted
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: videoActive ? 1 : 0, transition: "opacity .2s" }} />
          {!videoActive && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
              <User size={48} color="#8e8e93" />
            </div>
          )}
          <div style={{ position: "absolute", bottom: 16, left: 16, padding: "6px 12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600 }}>
            You {!micActive && "🔇"}
          </div>
        </div>

        {/* Remote */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#111", aspectRatio: "4/3", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={remoteVideoRef} autoPlay playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: inCall ? "block" : "none" }} />
          {!inCall && (
            <div style={{ textAlign: "center", color: "#8e8e93" }}>
              {connecting
                ? <>
                    <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Searching for a partner...</p>
                  </>
                : <>
                    <User size={48} />
                    <p style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                      {socketError ? "Server unavailable" : "Ready to connect"}
                    </p>
                  </>
              }
            </div>
          )}
          {inCall && (
            <>
              <div style={{ position: "absolute", bottom: 16, left: 16, padding: "6px 12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                {partnerName}
              </div>
              <div style={{ position: "absolute", top: 16, right: 16, padding: "4px 10px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
                {formatDuration(callDuration)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {inCall ? (
          <>
            <button onClick={toggleMic}
              style={{ width: 56, height: 56, borderRadius: "50%", background: micActive ? "var(--bg-secondary)" : "#ff3b30", border: "1px solid var(--border)", color: micActive ? "var(--text-primary)" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
              {micActive ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button onClick={toggleVideo}
              style={{ width: 56, height: 56, borderRadius: "50%", background: videoActive ? "var(--bg-secondary)" : "#ff3b30", border: "1px solid var(--border)", color: videoActive ? "var(--text-primary)" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
              <Video size={22} />
            </button>
            <button onClick={endCall}
              style={{ padding: "0 32px", height: 56, borderRadius: 28, background: "#ff3b30", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <PhoneOff size={20} /> End Call
            </button>
          </>
        ) : (
          <button
            onClick={connecting ? cancelSearch : startSearch}
            disabled={!connecting && (socketError || !socketReady)}
            style={{ padding: "16px 48px", borderRadius: 16, background: connecting ? "#ff3b30" : socketError ? "#374151" : "var(--text-primary)", color: connecting ? "#fff" : socketError ? "#9ca3af" : "var(--bg-primary)", border: "none", fontWeight: 700, fontSize: 16, cursor: (!connecting && (socketError || !socketReady)) ? "not-allowed" : "pointer", opacity: (!connecting && (socketError || !socketReady)) ? 0.6 : 1 }}>
            {connecting ? "Cancel Search" : socketError ? "Server Offline" : !socketReady ? "Connecting..." : "Connect with Partner"}
          </button>
        )}
      </div>

      {socketError && (
        <p style={{ textAlign: "center", color: "#ef4444", fontSize: 13, marginTop: 16, fontWeight: 600 }}>
          ⚠️ Could not connect to the server. Please try again later.
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}