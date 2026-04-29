import React, { useState, useEffect } from "react";
import { 
  Zap, Brain, RefreshCw, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, BookOpen, Star,
  Trophy, History, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Flashcards({ vocabulary = [] }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    if (vocabulary.length > 0) {
      // Shuffle cards
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
      setCards(shuffled);
    }
  }, [vocabulary]);

  const handleNext = (mastered) => {
    if (mastered) setLearnedCount(prev => prev + 1);
    setIsFlipped(false);
    
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setCards([...vocabulary].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setLearnedCount(0);
    setGameFinished(false);
    setIsFlipped(false);
  };

  if (vocabulary.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, animation: "fadeUp 0.4s ease" }}>
         <BookOpen size={64} color="#1e293b" style={{ margin: "0 auto 24px" }} />
         <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 12 }}>No Words to Practice</h2>
         <p style={{ color: "#8b9bbf", maxWidth: 400, margin: "0 auto" }}>Save some words from the dictionary or exercises to start using smart flashcards!</p>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div style={{ textAlign: "center", padding: 60, animation: "fadeUp 0.4s ease" }}>
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           style={{ background: "#131d2e", padding: 40, borderRadius: 32, border: "1px solid rgba(74,158,255,0.1)", maxWidth: 400, margin: "0 auto" }}
         >
           <Trophy size={64} color="#EF9F27" style={{ margin: "0 auto 24px" }} />
           <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>Session Finished!</h2>
           <p style={{ color: "#8b9bbf", marginBottom: 32 }}>Excellent work! You've reviewed <b>{cards.length}</b> words.</p>
           
           <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
             <button 
               onClick={resetGame}
               style={{ background: "#4a9eff", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
             >
               <RefreshCw size={18} /> Replay
             </button>
           </div>
         </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px" }}>
      <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
            <Brain color="#4a9eff" /> Smart Cards
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ width: 100, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`, height: "100%", background: "#4a9eff", transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{currentIndex + 1} / {cards.length}</span>
          </div>
        </div>
        <div style={{ background: "rgba(29, 158, 117, 0.1)", padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(29, 158, 117, 0.2)", fontSize: 13, fontWeight: 700, color: "#1D9E75" }}>
          LVL 1
        </div>
      </header>

      {/* Card Container */}
      <div style={{ perspective: "1000px", height: 350, position: "relative", marginBottom: 40 }}>
        <motion.div 
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ 
            width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", cursor: "pointer"
          }}
        >
          {/* Front Side */}
          <div style={{ 
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            background: "#131d2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 32,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 40, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
             <span style={{ fontSize: 14, fontWeight: 800, color: "#4a9eff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Word</span>
             <h2 style={{ fontSize: 42, fontWeight: 900, color: "#fff" }}>{currentCard?.word || "..."}</h2>
             <span style={{ color: "#64748b", fontSize: 16, marginTop: 12 }}>{currentCard?.phonetic || "/.../"}</span>
             
             <div style={{ position: "absolute", bottom: 40, color: "#4a5568", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
               <RefreshCw size={14} /> Tap to reveal meaning
             </div>
          </div>

          {/* Back Side */}
          <div style={{ 
            position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #1e3a8a, #131d2e)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 32,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 40, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
          }}>
             <span style={{ fontSize: 14, fontWeight: 800, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Definition</span>
             <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{currentCard?.definition || "No definition available."}</p>
             {currentCard?.example && (
               <div style={{ marginTop: 24, padding: "12px 20px", background: "rgba(0,0,0,0.2)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", fontStyle: "italic", color: "#94a3b8", fontSize: 14 }}>
                 "{currentCard.example}"
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 16 }}>
        <button 
          onClick={() => handleNext(false)}
          style={{ flex: 1, background: "rgba(225,29,72,0.1)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.2)", height: 60, borderRadius: 20, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(225,29,72,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(225,29,72,0.1)"}
        >
          <XCircle size={22} /> Still Learning
        </button>
        <button 
          onClick={() => handleNext(true)}
          style={{ flex: 1.2, background: "linear-gradient(to right, #1D9E75, #10b981)", color: "#fff", border: "none", height: 60, borderRadius: 20, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)" }}
        >
          <CheckCircle size={22} /> Mastered
        </button>
      </div>

      <p style={{ textAlign: "center", color: "#4a5568", fontSize: 13, marginTop: 32, fontWeight: 600 }}>
        Practice everyday to move words to long-term memory.
      </p>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
