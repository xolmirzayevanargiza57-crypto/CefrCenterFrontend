import React, { useState } from "react";
import { 
  Trophy, 
  MapPin, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  Compass, 
  GraduationCap, 
  Rocket, 
  Zap, 
  BookOpen,
  Info
} from "lucide-react";
import { LEVEL_THRESHOLDS, CEFR_META } from "./useProgress";

const LEVEL_DETAILS = {
  A1: {
    title: "Beginner",
    icon: Star,
    desc: "I am just starting to learn English. I know basic words and simple phrases.",
    examples: ["Hello, my name is...", "I am from...", "How are you?"],
  },
  A2: {
    title: "Elementary",
    icon: BookOpen,
    desc: "I can form simple sentences and talk about everyday topics.",
    examples: ["I usually wake up at 7.", "I like pizza.", "Where is the bank?"],
  },
  B1: {
    title: "Intermediate",
    icon: Compass,
    desc: "I can discuss many topics and communicate about travel and work.",
    examples: ["I have been working here for 2 years.", "What do you think about...?"],
  },
  B2: {
    title: "Upper-Intermediate",
    icon: GraduationCap,
    desc: "I understand complex texts and can speak fluently with native speakers.",
    examples: ["Despite the challenges, I managed to...", "It's worth considering that..."],
  },
  C1: {
    title: "Advanced",
    icon: Rocket,
    desc: "I understand almost everything and can express myself clearly and fluently.",
    examples: ["The implications of this phenomenon are...", "Notwithstanding the fact that..."],
  },
  C2: {
    title: "Mastery",
    icon: Trophy,
    desc: "I know English at a native level and can communicate freely on any topic.",
    examples: ["Suffice it to say...", "The nuances of this argument suggest..."],
  },
};

export default function LevelSelect({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? selected;

  return (
    <div className="main-container" style={{ minHeight: "100vh", background: "#060b18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Sora','Inter',sans-serif", padding: "32px 16px", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%{box-shadow:0 0 0px var(--glow)} 50%{box-shadow:0 0 20px var(--glow)} 100%{box-shadow:0 0 0px var(--glow)} }
        
        .level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 840px;
        }

        @media (max-width: 768px) {
          .level-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          h1 { fontSize: 28px !important; }
        }

        @media (max-width: 480px) {
          .level-grid {
            grid-template-columns: 1fr;
          }
          h1 { fontSize: 24px !important; }
          .post-card { padding: 18px !important; }
          .main-container { padding: 20px 12px !important; }
        }
      `}</style>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, animation: "fadeUp .6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #e11d48, #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(225,29,72,0.3)' }}>
          <Zap size={24} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px" }}>CEFR<span style={{color: '#e11d48'}}>CENTER</span></span>
      </div>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp .6s .1s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-1px", lineHeight: 1.1 }}>
          Choose Your Journey
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", maxWidth: 440, fontWeight: 500 }}>
          What is your current level of English? We will personalize your experience based on this choice.
        </p>
      </div>

      {/* Level cards */}
      <div className="level-grid" style={{ marginBottom: 32, animation: "fadeUp .6s .2s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        {LEVEL_THRESHOLDS.map((l) => {
          const m = CEFR_META[l.code];
          const det = LEVEL_DETAILS[l.code];
          const isSelected = selected === l.code;
          const isActive = active === l.code;
          const Icon = det.icon;
          
          return (
            <div key={l.code} 
              onClick={() => setSelected(l.code)} 
              onMouseEnter={() => setHovered(l.code)} 
              onMouseLeave={() => setHovered(null)}
              style={{ 
                background: isSelected ? `${m.color}15` : "rgba(255,255,255,0.02)", 
                border: isSelected ? `2px solid ${m.color}` : isActive ? `2px solid ${m.color}40` : "1.5px solid rgba(255,255,255,0.06)", 
                borderRadius: 20, 
                padding: "24px 20px", 
                cursor: "pointer", 
                transition: "all .25s ease", 
                position: "relative",
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: isSelected ? `0 12px 24px ${m.color}20` : 'none',
                transform: isActive ? 'translateY(-4px)' : 'none'
              }}>
              
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, 
                background: isSelected ? m.color : 'rgba(255,255,255,0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isSelected ? '#fff' : m.color,
                transition: 'all .25s'
              }}>
                <Icon size={24} />
              </div>

              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{l.code}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.tc, marginTop: 4 }}>{det.title}</div>
              </div>

              <p style={{ fontSize: 13, color: isSelected ? '#94a3b8' : '#64748b', lineHeight: 1.5, margin: 0 }}>{det.desc}</p>
              
              {isSelected && (
                <div style={{ position: "absolute", top: 12, right: 12, color: m.color }}>
                  <CheckCircle2 size={20} fill={m.color} color="#fff" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Examples Context */}
      <div style={{ width: "100%", maxWidth: 840, minHeight: 84, marginBottom: 32, animation: "fadeUp .6s .3s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
        {active ? (
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1.5px solid ${CEFR_META[active].color}30`, borderRadius: 20, padding: "20px 24px", display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
              <Info size={16} /> <span>Typical sentences at {active} level:</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {LEVEL_DETAILS[active].examples.map((ex, i) => (
                <div key={i} style={{ fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.04)', padding: "8px 16px", borderRadius: 12, fontStyle: "italic", border: '1px solid rgba(255,255,255,0.05)' }}>
                  "{ex}"
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: 14, fontStyle: 'italic' }}>
            Hover a level to see example sentences
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ animation: "fadeUp .6s .4s cubic-bezier(0.16, 1, 0.3, 1) both", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={() => selected && onSelect(selected)} 
          disabled={!selected}
          style={{ 
            background: selected ? 'linear-gradient(135deg, #e11d48, #be123c)' : "#1e293b", 
            color: "#fff", 
            border: "none", 
            padding: "16px 56px", 
            borderRadius: 16, 
            fontSize: 17, 
            fontWeight: 800, 
            cursor: selected ? "pointer" : "not-allowed", 
            transition: "all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            fontFamily: "inherit",
            boxShadow: selected ? '0 10px 25px rgba(225,29,72,0.3)' : 'none',
            opacity: selected ? 1 : 0.5
          }}>
          {selected ? `Get Started as ${selected}` : "Please Select Your Level"}
          <ChevronRight size={20} />
        </button>
        <p style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
          You can always adjust your level later in settings.
        </p>
      </div>
    </div>
  );
}