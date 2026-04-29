// App.jsx — CEFR Center
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import About      from "./About";
import Us         from "./US";
import Dashboard  from "./Dashboard";
import Login      from "./Login";
import LevelSelect from "./LevelSelect";
import Admin       from "./Admin";

import { useProgress }    from "./useProgress";
import { auth }           from "./firebase";

// ── Loading spinner ───────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{
      minHeight:      "100vh",
      background:     "#060d1a",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            16,
    }}>
      <div style={{
        width:       40,
        height:      40,
        border:      "3px solid rgba(59,130,246,0.15)",
        borderTop:   "3px solid #3b82f6",
        borderRadius:"50%",
        animation:   "spin 0.9s linear infinite",
      }} />
      <p style={{
        color:       "#475569",
        fontSize:    13,
        fontWeight:  600,
        letterSpacing: 0.4,
      }}>
        Loading...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Root — auth + onboarding logic ───────────────────────────────────────────
function Root() {
  const { progress, setInitialLevel, isLoaded } = useProgress();
  const [authReady, setAuthReady]     = useState(false);
  const [user, setUser]               = useState(null);
  const navigate                      = useNavigate();

  // If user is logged in, sync from cloud
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Checking Auth
  if (!authReady || !isLoaded) return <Loader />;

  // Not logged in → About page
  if (!user) return <About />;

  // Logged in, but no level selected → US (Onboarding)
  if (!progress.onboarded) {
    return (
      <Us
        onSelect={(levelCode, username) => {
          setInitialLevel(levelCode, username);
          navigate("/dashboard", { replace: true });
        }}
      />
    );
  }

  // All set → Redirect to Dashboard
  return <Navigate to="/dashboard" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Root />} />
        <Route path="/login"       element={<LoginWrapper />} />
        <Route path="/admin"       element={<Admin />} />
        <Route path="/us"          element={<Us />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function LoginWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}