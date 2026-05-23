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

  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

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
        setUsernameStatus({ available: true });
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
      // Admin login — goes to /dashboard where AdminPanel is accessible via sidebar
      if (email.trim().toLowerCase() === "xojiakbar@admin.com" && password.trim() === "15203738f$DriWkl46aX[&") {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (adminErr) {
          if (adminErr.code === "auth/user-not-found" || adminErr.code === "auth/invalid-credential") {
            try {
              const cred = await createUserWithEmailAndPassword(auth, email, password);
              await updateProfile(cred.user, { displayName: "Admin" });
            } catch (createErr) {
              setError("Admin credentials error. Please check password.");
              setLoading(false);
              return;
            }
          } else {
            setError(getErrorMessage(adminErr.code));
            setLoading(false);
            return;
          }
        }
        // Navigate to dashboard — admin panel is accessible from the sidebar
        navigate("/dashboard", { replace: true });
        setLoading(false);
        return;
      }

      if (isLoginMode) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate("/dashboard");
        } catch (signInErr) {
          setError(getErrorMessage(signInErr.code));
        }
      } else {
        if (!username) {
          setError("Please enter a username to register.");
          setLoading(false);
          return;
        }
        if (usernameStatus && !usernameStatus.available) {
          setError("This username is taken. Please choose another.");
          setLoading(false);
          return;
        }
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: username });
          updateUsername(username);
          navigate("/dashboard");
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
      const result = await signInWithPopup(auth, provider);
      // After Google sign-in, navigate to dashboard.
      // US.jsx (onboarding) will show if the user hasn't completed setup.
      navigate("/dashboard");
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
      <button className="back-btn" onClick={() => navigate("/about")} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to About
      </button>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon"><Zap size={28} fill="currentColor" /></div>
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
                  {isCheckLoading ? <Loader2 className="animate-spin" size={16} color="var(--text-muted)" /> : (
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
                  {usernameStatus.suggestions?.map(s => (
                    <button key={s} type="button" onClick={() => setUsername(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="input-group-container">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="input-group-container">
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
    </div>
  );
}