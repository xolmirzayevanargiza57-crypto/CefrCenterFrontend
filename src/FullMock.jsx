  // FullMock.jsx — CEFR Center — Complete Full Mock Exam
  import React, { useState } from "react";
  import { scoreToCEFR, scoreToWritingBand } from "./scoring";
  import ListeningPage from "./Listening.jsx";
  import ReadingPage from "./Reading.jsx";
  import WritingPage from "./Writing.jsx";
  import SpeakingPage from "./Speaking.jsx";

  function Ic({ n, s = 16, c = "currentColor" }) {
    const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
    const m = {
      ear:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
      book:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
      pen:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
      mic:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
      check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
      back:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
      next:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
      mock:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
      clock: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      star:  <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      coin:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 15 9.5 15a2.5 2.5 0 005 0"/></svg>,
      bolt:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    };
    return m[n] || null;
  }

  const STEPS = [
    { key: "listening", label: "Listening",  ic: "ear",  color: "#1D9E75", duration: "~30 min", desc: "6 parts · 35 questions · Real audio" },
    { key: "reading",   label: "Reading",    ic: "book", color: "#378ADD", duration: "~60 min", desc: "5 parts · 35 questions · Gap fill, MCQ, Matching" },
    { key: "writing",   label: "Writing",    ic: "pen",  color: "#EF9F27", duration: "~60 min", desc: "3 parts · Email, Letter, Essay" },
    { key: "speaking",  label: "Speaking",   ic: "mic",  color: "#D4537E", duration: "~15 min", desc: "4 parts · Interview, Comparison, Long turn, Discussion" },
  ];

  export default function FullMock({ progress, scores, saveScore, addXP, addCoins, isPremiumActive, activatePremium, getPremiumExpiry, clearSectionScores, onBack, allTests = {} }) {
    const [phase, setPhase] = useState("intro"); // intro | active | done
    const [stepIdx, setStepIdx] = useState(0);
    const [completedSteps, setCompletedSteps] = useState({});
    const [mockScores, setMockScores] = useState({});

    const currentStep = STEPS[stepIdx];

    const handleSaveScore = (section, part, score) => {
      saveScore(section, part, score);
      setMockScores(prev => ({ ...prev, [section]: score }));
    };

    const completeStep = () => {
      setCompletedSteps(prev => ({ ...prev, [currentStep.key]: true }));
      if (stepIdx < STEPS.length - 1) {
        setStepIdx(i => i + 1);
      } else {
        setPhase("done");
      }
    };

    const commonProps = {
      progress, scores,
      saveScore: handleSaveScore,
      addXP, addCoins,
      isPremiumActive, activatePremium, getPremiumExpiry,
      clearSectionScores,
    };

    // ── INTRO ──────────────────────────────────────────────────────────────────
    if (phase === "intro") return (
      <div style={{ animation: "fadeUp .4s ease", maxWidth: 700, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#8b9bbf",cursor:"pointer",fontFamily:"inherit",fontSize:13,marginBottom:20 }}>
          <Ic n="back" s={13} c="#8b9bbf"/> Back to Dashboard
        </button>

        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,#1a1040,#0f1829,#162030)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:20, padding:"28px 24px", marginBottom:24, textAlign:"center" }}>
          <div style={{ width:64,height:64,borderRadius:18,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <Ic n="mock" s={32} c="#a78bfa"/>
          </div>
          <h1 style={{ fontSize:26,fontWeight:800,color:"#f0f4ff",marginBottom:8 }}>Full Mock Exam</h1>
          <p style={{ fontSize:14,color:"#8b9bbf",lineHeight:1.7,maxWidth:480,margin:"0 auto 20px" }}>
            Experience a complete CEFR exam. Complete all 4 sections in order: Listening, Reading, Writing, and Speaking. Your results are tracked and scored across all sections.
          </p>
          <div style={{ display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:20 }}>
            {[{ic:"clock",label:"~2.5 hours total"},{ic:"bolt",label:"Earn XP for each section"},{ic:"star",label:"Full CEFR band score"}].map(({ic,label})=>(
              <div key={label} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#a78bfa" }}>
                <Ic n={ic} s={14} c="#a78bfa"/>{label}
              </div>
            ))}
          </div>
          <button onClick={()=>setPhase("active")} style={{ padding:"14px 40px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#7c3aed,#a78bfa)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 24px rgba(167,139,250,0.4)" }}>
            Begin Full Mock →
          </button>
        </div>

        {/* Steps preview */}
        <div style={{ display:"grid",gap:12 }}>
          {STEPS.map((step,i)=>(
            <div key={step.key} style={{ background:"#18243a",border:`1px solid ${step.color}22`,borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:16 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:`${step.color}18`,border:`1px solid ${step.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <span style={{ fontSize:14,fontWeight:800,color:step.color }}>{i+1}</span>
              </div>
              <Ic n={step.ic} s={20} c={step.color}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#f0f4ff",marginBottom:2 }}>{step.label}</div>
                <div style={{ fontSize:12,color:"#64748b" }}>{step.desc}</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#8b9bbf",background:"rgba(255,255,255,0.04)",padding:"4px 10px",borderRadius:6 }}>
                <Ic n="clock" s={11} c="#8b9bbf"/>{step.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // ── ACTIVE ────────────────────────────────────────────────────────────────
    if (phase === "active") return (
      <div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Progress bar */}
        <div style={{ background:"#131d2e",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
          <span style={{ fontSize:12,fontWeight:700,color:"#a78bfa" }}>FULL MOCK</span>
          <div style={{ flex:1,display:"flex",gap:6 }}>
            {STEPS.map((s,i)=>(
              <div key={s.key} style={{ flex:1,height:5,borderRadius:3,background:completedSteps[s.key]?s.color:i===stepIdx?s.color+"66":"rgba(255,255,255,0.08)",transition:"background .3s",position:"relative" }}>
                {completedSteps[s.key] && <div style={{ position:"absolute",inset:0,background:s.color,borderRadius:3 }}/>}
              </div>
            ))}
          </div>
          <span style={{ fontSize:12,color:"#8b9bbf" }}>Section {stepIdx+1}/4</span>
        </div>

        {/* Section header */}
        <div style={{ background:`${currentStep.color}0d`,border:`1px solid ${currentStep.color}30`,borderRadius:12,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:`${currentStep.color}18`,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Ic n={currentStep.ic} s={20} c={currentStep.color}/>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:currentStep.color,textTransform:"uppercase",letterSpacing:0.5 }}>Section {stepIdx+1} of 4</div>
            <div style={{ fontSize:15,fontWeight:700,color:"#f0f4ff" }}>{currentStep.label}</div>
          </div>
          <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}>
            {Object.keys(completedSteps).map(k=>{
              const s=STEPS.find(x=>x.key===k);
              return s ? <div key={k} style={{ width:28,height:28,borderRadius:8,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center" }}><Ic n="check" s={14} c={s.color}/></div> : null;
            })}
          </div>
        </div>

        {/* Section content */}
        <div style={{ position:"relative" }}>
          {currentStep.key === "listening" && (
            <ListeningPage {...commonProps} tests={allTests.LISTENING_TESTS || []} onBack={completeStep}/>
          )}
          {currentStep.key === "reading" && (
            <ReadingPage {...commonProps} tests={allTests.READING_TESTS || []}/>
          )}
          {currentStep.key === "writing" && (
            <WritingPage {...commonProps} tests={allTests.WRITING_TESTS || []}/>
          )}
          {currentStep.key === "speaking" && (
            <div style={{textAlign:"center",padding:60,background:"#18243a",borderRadius:20,border:"1px solid rgba(225,29,72,0.2)"}}>
              <Ic n="mic" s={48} c="#e11d48"/>
              {/* vaqtinchalik fix */}
              <h2 style={{fontSize:24,fontWeight:800,marginTop:20,color:"#fff"}}>Speaking is being fixed</h2>
              <p style={{color:"#8b9bbf",marginTop:10}}>This section is temporarily unavailable for technical maintenance.</p>
              <button onClick={completeStep} style={{marginTop:24,padding:"10px 20px",borderRadius:10,background:"#1D9E75",color:"#fff",border:"none",fontWeight:700,cursor:"pointer"}}>Skip Section</button>
            </div>
          )}
        </div>

        {/* Next section button */}
        <div style={{ marginTop:28,padding:"16px 20px",background:"#131d2e",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
          <div>
            <div style={{ fontSize:12,color:"#8b9bbf",marginBottom:2 }}>{stepIdx<STEPS.length-1?"Completed this section?":"Final section done?"}</div>
            <div style={{ fontSize:13,fontWeight:600,color:"#f0f4ff" }}>{stepIdx<STEPS.length-1?`Next: ${STEPS[stepIdx+1]?.label}`:"Finish the mock exam"}</div>
          </div>
          <button onClick={completeStep} style={{ padding:"11px 24px",borderRadius:11,border:"none",background:currentStep.color,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8 }}>
            {stepIdx<STEPS.length-1?<>Next Section <Ic n="next" s={14} c="#fff"/></>:<>Finish Exam <Ic n="check" s={14} c="#fff"/></>}
          </button>
        </div>
      </div>
    );

    // ── DONE ──────────────────────────────────────────────────────────────────
    if (phase === "done") return (
      <div style={{ animation:"fadeUp .4s ease",maxWidth:600,margin:"0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,rgba(167,139,250,0.2),rgba(167,139,250,0.05))",border:"1px solid rgba(167,139,250,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <Ic n="mock" s={36} c="#a78bfa"/>
          </div>
          <h2 style={{ fontSize:24,fontWeight:800,color:"#f0f4ff",marginBottom:8 }}>Mock Exam Complete!</h2>
          <p style={{ fontSize:14,color:"#8b9bbf" }}>You have completed all 4 sections of the Full Mock Exam.</p>
        </div>

        <div style={{ display:"grid",gap:10,marginBottom:24 }}>
          {STEPS.map(step=>(
            <div key={step.key} style={{ background:"#18243a",border:`1px solid ${step.color}33`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:step.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Ic n="check" s={18} c="#fff"/>
              </div>
              <Ic n={step.ic} s={18} c={step.color}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#f0f4ff" }}>{step.label}</div>
                <div style={{ fontSize:11,color:step.color }}>Completed ✓</div>
              </div>
              {mockScores[step.key] != null && (
                <div style={{ fontSize:16,fontWeight:800,color:step.color }}>{mockScores[step.key]}/75</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:"flex",gap:12 }}>
          <button onClick={()=>{setPhase("intro");setStepIdx(0);setCompletedSteps({});setMockScores({})}} style={{ flex:1,padding:"13px",borderRadius:11,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"#8b9bbf",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
            Try Again
          </button>
          <button onClick={onBack} style={{ flex:2,padding:"13px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#7c3aed,#a78bfa)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            <Ic n="back" s={13} c="#fff"/> Back to Dashboard
          </button>
        </div>
      </div>
    );

    return null;
  }