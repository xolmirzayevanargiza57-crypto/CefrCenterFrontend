import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithPopup,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, provider } from "./firebase";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Zap, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { useProgress } from "./useProgress";
import "./Login.css";

import BACKEND_URL from "./config/api.js";

export default function Login() {
  const navigate = useNavigate();
  const { updateUsername } = useProgress();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Username status
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  const [showAdminVerify, setShowAdminVerify] = useState(false);
  const [adminVerifyStep, setAdminVerifyStep] = useState(0); 
  const [adminOtp, setAdminOtp] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    if (isLoginMode) {
      setUsernameStatus(null);
      setError("");
      return;
    }
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckLoading(true);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await resp.json();
        setUsernameStatus(data);
      } catch (e) {
        console.error("Username check error", e);
      } finally {
        setIsCheckLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, isLoginMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      // Special Admin Login Check
      if (email.trim().toLowerCase() === "xojiakbar@admin.com" && password.trim() === "admin2026") {
        setShowAdminVerify(true);
        setAdminVerifyStep(0);
        setTimeout(() => {
          setAdminVerifyStep(1); // Face ID Done, show OTP
        }, 2500);
        setLoading(false);
        return;
      }

      if (isLoginMode) {
        // Just Sign In
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate("/");
        } catch (signInErr) {
          setError(getErrorMessage(signInErr.code));
        }
      } else {
        // Sign Up
        if (!username) {
          setError("Please enter a username to register.");
          setLoading(false);
          return;
        }
        if (usernameStatus && !usernameStatus.available) {
          setError("This Username is taken. Please choose another.");
          setLoading(false);
          return;
        }

        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: username });
          updateUsername(username);
          navigate("/");
        } catch (createErr) {
          setError(getErrorMessage(createErr.code));
        }
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-credential": return "Incorrect email or password.";
      case "auth/wrong-password": return "The password you entered is incorrect.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/weak-password": return "Password should be at least 6 characters.";
      case "auth/email-already-in-use": return "This email is already registered. Try logging in.";
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/user-disabled": return "This account has been disabled.";
      default: return "Authentication failed. Please try again.";
    }
  };

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => navigate("/about")} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to About
      </button>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon"><Zap size={28} fill="#fff" /></div>
          <h2>{isLoginMode ? "Welcome Back" : "Join CEFR Center"}</h2>
          <p>{isLoginMode ? "Sign in to continue your learning" : "Start your learning journey today"}</p>
        </div>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: 18, height: 18 }} />
          Continue with Google
        </button>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleAuth} className="login-form">
          {!isLoginMode && (
            <div className="input-group-container">
              <div className="input-group" style={{ 
                borderColor: usernameStatus?.available ? "#4ade80" : usernameStatus?.available === false ? "#f87171" : "",
                position: "relative"
              }}>
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Choose a Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))} 
                  style={{ paddingRight: usernameStatus ? 100 : 40 }}
                />
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 6 }}>
                  {isCheckLoading ? <Loader2 className="animate-spin" size={16} color="#94a3b8" /> : (
                    <>
                      {usernameStatus?.available && <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>Available</span>}
                      {usernameStatus?.available === false && <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>Taken</span>}
                      {usernameStatus?.available && <CheckCircle2 size={16} color="#4ade80" />}
                    </>
                  )}
                </div>
              </div>
              {usernameStatus?.available === false && (
                 <div className="username-suggestions">
                   <span>Taken. Suggestions:</span>
                   {usernameStatus.suggestions.map(s => (
                     <button key={s} type="button" onClick={() => setUsername(s)}>{s}</button>
                   ))}
                 </div>
              )}
            </div>
          )}

          <div className="input-group-container">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group-container">
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-text">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>{isLoginMode ? "Sign In" : "Create Account"} <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="toggle-mode" onClick={() => { setIsLoginMode(!isLoginMode); setError(""); }}>
          {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </p>
      </div>
      {showAdminVerify && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#1e293b", padding: 30, borderRadius: 20, width: "90%", maxWidth: 360, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            
            {adminVerifyStep === 0 && (
              <div style={{ padding: "20px 0" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74, 158, 255, 0.1)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, border: "2px solid #4a9eff", borderRadius: "50%", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                  <User size={40} color="#4a9eff" />
                </div>
                <h3 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>Face ID Verification</h3>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Scanning to confirm identity...</p>
              </div>
            )}

            {adminVerifyStep === 1 && (
              <div style={{ padding: "10px 0" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#10b98122", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={32} color="#10b981" />
                </div>
                <h3 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>Face ID Confirmed</h3>
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>One-Time Password (OTP) sent to admin device.</p>
                
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit OTP" 
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 18, textAlign: "center", letterSpacing: 8, marginBottom: 16 }}
                />

                {adminError && <p style={{ color: "#f87171", fontSize: 12, marginBottom: 16 }}>{adminError}</p>}

                <button 
                  onClick={() => {
                    if (adminOtp.length === 6) {
                      localStorage.setItem("cefr_admin_token", "admin_authenticated_" + Date.now());
                      navigate("/admin");
                    } else {
                      setAdminError("Invalid OTP. Must be 6 digits.");
                    }
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#4a9eff", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  Verify & Access Panel
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}