// Reading.jsx — all 5 part types
import React, { useState, useCallback } from "react";
import { scoreToWritingBand } from "./scoring";

const GROQ = import.meta.env.VITE_GROQ_API_KEY || "";
const MAX = 75;

async function ai(prompt) {
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ}` },
      body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ role: "user", content: prompt }], max_tokens: 400, temperature: 0.3 }),
    });
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "";
  } catch { return ""; }
}

function I({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const m = {
    book: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    x: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    back: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
    next: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>,
    star: <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    trash: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
    down: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>,
  };
  return m[n] || null;
}

const CLR = "#378ADD";
function norm(s) { return (s || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }

function scoreLocal(part, ans) {
  let c = 0;
  const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
  items.forEach((item, i) => {
    const ua = ans[i] ?? ("");
    if (part.type === "gap_fill" || part.type === "sentence_completion") {
      const s = typeof ua === "string" ? ua : "";
      if (norm(s) === norm(item.answer) || (item.alt || []).map(norm).includes(norm(s))) c++;
    } else if (part.type === "matching_text" || part.type === "heading_match") {
      if (ua === item.answer) c++;
    } else if (part.type === "mcq_reading") {
      if (Number(ua) === (item.answer ?? -1) && ua !== "") c++;
    }
  });
  return { correct: c, total: items.length };
}

export default function Reading({ progress, scores, saveScore, addXP, clearSectionScores, tests = [] }) {
  const [view, setView] = useState("list");
  const [sel, setSel] = useState(null);
  const [pIdx, setPIdx] = useState(0);
  const [allAns, setAllAns] = useState({});
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const openTest = (t) => { setSel(t); setPIdx(0); setAllAns({}); setResult(null); setView("test"); };
  const setAns = useCallback((pid, idx, v) => { setAllAns(p => ({ ...p, [pid]: { ...(p[pid] || {}), [idx]: v } })); }, []);
  const getAns = useCallback((pid, idx) => allAns[pid]?.[idx] ?? "", [allAns]);

  const submit = async () => {
    setChecking(true);
    const test = sel;
    let totalC = 0, totalI = 0;
    const pResults = [];
    for (const part of test.parts) {
      const ans = allAns[part.id] || {};
      const { correct, total } = scoreLocal(part, ans);
      totalC += correct; totalI += total;
      const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
      const qR = items.map((item, i) => {
        const ua = ans[i] ?? "";
        let ok = false, correctAns = item.answer || "", userAns = ua;
        if (part.type === "gap_fill" || part.type === "sentence_completion") {
          ok = norm(ua) === norm(item.answer) || (item.alt || []).map(norm).includes(norm(ua));
        } else if (part.type === "matching_text") {
          ok = ua === item.answer;
          correctAns = `${item.answer} (${part.options?.find(o => o.key === item.answer)?.name || item.answer})`;
          userAns = ua ? `${ua} (${part.options?.find(o => o.key === ua)?.name || ua})` : "—";
        } else if (part.type === "heading_match") {
          ok = ua === item.answer;
          correctAns = part.headings?.find(h => h.key === item.answer)?.label || item.answer;
          userAns = ua ? part.headings?.find(h => h.key === ua)?.label || ua : "—";
        } else if (part.type === "mcq_reading") {
          ok = Number(ua) === (item.answer ?? -1) && ua !== "";
          correctAns = item.options?.[item.answer] || item.answer;
          userAns = ua !== "" ? item.options?.[Number(ua)] || ua : "—";
        }
        return { q: item.label || `Q${item.num || i + 1}`, userAnswer: userAns || "—", correctAnswer: correctAns, isCorrect: ok };
      });
      pResults.push({ partId: part.id, title: part.title, correct, total, qResults: qR });
    }
    const overall = totalI > 0 ? Math.round((totalC / totalI) * MAX) : 0;
    const info = scoreToWritingBand(overall, MAX);
    let feedback = "Good effort! Review the incorrect answers to improve.";
    try {
      const resp = await ai(`CEFR Reading examiner. Student scored ${overall}/${MAX} (${totalC}/${totalI} correct). Give 2 sentences of constructive advice.`);
      if (resp) feedback = resp;
    } catch { }
    setResult({ pResults, overall, totalC, totalI, info, feedback });
    saveScore("reading", `${test.id}_overall`, overall);
    if (!progress.completed?.[`reading_${test.id}`]) addXP(overall, `reading_${test.id}`);
    setChecking(false);
    setView("results");
  };

  // ── LIST ─────────────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <I n="book" s={20} c={CLR} /> <span style={{ color: CLR }}>Reading</span> Practice Tests
          </h2>
          <p style={{ color: "#8b9bbf", fontSize: 13 }}>CEFR-style · 5 parts · Gap fill, Matching, MCQ & Sentence completion</p>
        </div>
        <button onClick={() => clearSectionScores("reading_")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8b9bbf", background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" }}>
          <I n="trash" s={12} c="#8b9bbf" /> Clear
        </button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {tests.map(t => {
          const saved = scores?.[`reading_${t.id}_overall`];
          const info = saved != null ? scoreToWritingBand(saved, MAX) : null;
          const done = saved != null;
          return (
            <div key={t.id} onClick={() => openTest(t)}
              style={{ background: done ? "rgba(55,138,221,0.05)" : "#18243a", border: `1px solid ${done ? CLR + "44" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CLR + "88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = done ? CLR + "44" : "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: done ? CLR : "rgba(255,255,255,0.05)", border: done ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done ? <I n="check" s={20} c="#fff" /> : <span style={{ fontSize: 13, fontWeight: 800, color: "#8b9bbf" }}>{tests.indexOf(t) + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f0f4ff", marginBottom: 4 }}>{t.title}</h3>
                  <p style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 8 }}>{t.level} · {t.totalQuestions} questions · ~{t.duration} min · {t.parts.length} parts</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {t.parts.map((p, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, color: CLR, background: `${CLR}15`, padding: "2px 8px", borderRadius: 99 }}>
                        P{p.partNum}: {p.type.replace("_", " ").toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                {info && <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: info.color }}>{saved}/{MAX}</div><div style={{ fontSize: 10, color: info.color, fontWeight: 600 }}>Band {info.band} · {info.cefr}</div></div>}
                <I n="next" s={14} c="#8b9bbf" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TEST VIEW ────────────────────────────────────────────────────────────────
  if (view === "test" && sel) {
    const part = sel.parts[pIdx];
    const isLast = pIdx === sel.parts.length - 1;
    const partAns = allAns[part.id] || {};
    const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
    const answered = items.filter((_, i) => partAns[i] != null && partAns[i] !== "").length;

    return (
      <div style={{ animation: "fadeUp .3s ease", maxWidth: 780, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            <I n="back" s={13} c="#8b9bbf" /> Tests
          </button>
          <div style={{ height: 14, width: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{sel.title}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {sel.parts.map((p, i) => {
              const hasAns = Object.keys(allAns[p.id] || {}).length > 0;
              return (
                <button key={i} onClick={() => setPIdx(i)}
                  style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${pIdx === i ? CLR : "rgba(255,255,255,0.1)"}`, background: pIdx === i ? `${CLR}22` : "transparent", color: pIdx === i ? CLR : hasAns ? "#5dcaa5" : "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  {hasAns && pIdx !== i ? <I n="check" s={9} c="#5dcaa5" /> : null}P{p.partNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part header */}
        <div style={{ background: `${CLR}0d`, border: `1px solid ${CLR}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}22`, padding: "2px 8px", borderRadius: 5 }}>PART {part.partNum}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{part.title}</span>
            <span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: "auto" }}>Q {part.questionRange}</span>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.6 }}>{part.instruction}</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${items.length > 0 ? (answered / items.length) * 100 : 0}%`, background: CLR, borderRadius: 2, transition: "width .3s" }} />
          </div>
          <span style={{ fontSize: 11, color: "#8b9bbf", whiteSpace: "nowrap" }}>{answered}/{items.length}</span>
        </div>

        {/* ── GAP FILL ── */}
        {part.type === "gap_fill" && (
          <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: "#c8d4f0", lineHeight: 2.2 }}>
              {part.passage.split(/\(([0-9]+)\)___/g).map((seg, i) => {
                if (i % 2 === 0) return <span key={i}>{seg}</span>;
                const gapNum = parseInt(seg);
                const gapIdx = gapNum - 1;
                return (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "0 2px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}20`, padding: "1px 5px", borderRadius: 4 }}>{gapNum}</span>
                    <input value={getAns(part.id, gapIdx)} onChange={e => setAns(part.id, gapIdx, e.target.value)}
                      placeholder="..."
                      style={{ width: 110, background: "rgba(55,138,221,0.07)", border: "none", borderBottom: `2px solid ${getAns(part.id, gapIdx) ? CLR : CLR + "55"}`, borderRadius: "4px 4px 0 0", padding: "2px 8px", color: "#f0f4ff", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" }} />
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MATCHING TEXT ── */}
        {part.type === "matching_text" && (
          <div>
            <div style={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Options</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 8 }}>
                {part.options.map(o => (
                  <div key={o.key} style={{ padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{o.key}</span>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{o.name}</p><p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{o.text}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {part.questions.map((q, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{q.num}</span>
                <p style={{ flex: 1, fontSize: 13, color: "#c8d4f0", lineHeight: 1.6, minWidth: 200 }}>{q.q}</p>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <select value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                    style={{ background: "#0d1624", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getAns(part.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 120, appearance: "none" }}>
                    <option value="">Select</option>
                    {part.options.map(o => <option key={o.key} value={o.key}>{o.key} — {o.name}</option>)}
                  </select>
                  <I n="down" s={10} c="#8b9bbf" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HEADING MATCH ── */}
        {part.type === "heading_match" && (
          <div>
            <div style={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 8, textTransform: "uppercase" }}>List of Headings</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
                {part.headings.map(h => <div key={h.key} style={{ fontSize: 13, color: "#c8d4f0", padding: "3px 0" }}>{h.label}</div>)}
              </div>
            </div>
            {part.paragraphs.map((para, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>Q{para.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{para.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "#8b9bbf", lineHeight: 1.65, marginBottom: 12 }}>{para.text.slice(0, 180)}...</p>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <select value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                    style={{ background: "#0d1624", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getAns(part.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 200, appearance: "none" }}>
                    <option value="">Select heading...</option>
                    {part.headings.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                  </select>
                  <I n="down" s={10} c="#8b9bbf" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MCQ READING ── */}
        {part.type === "mcq_reading" && (
          <div>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 360, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
              {part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
            </div>
            {part.questions.map((q, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{q.num}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5 }}>{q.q}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt, j) => {
                    const sel = getAns(part.id, i) !== "" && Number(getAns(part.id, i)) === j;
                    return (
                      <div key={j} onClick={() => setAns(part.id, i, j)}
                        style={{ padding: "9px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, border: sel ? `2px solid ${CLR}` : "1px solid rgba(255,255,255,0.07)", background: sel ? `${CLR}15` : "rgba(255,255,255,0.01)", color: sel ? "#f0f4ff" : "#8b9bbf", transition: "all .12s", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: sel ? CLR : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: sel ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                          {String.fromCharCode(65 + j)}
                        </div>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SENTENCE COMPLETION ── */}
        {part.type === "sentence_completion" && (
          <div>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 340, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
              {part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
            </div>
            {part.sentences.map((s, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{s.num}</span>
                  <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.6, flex: 1 }}>{s.text.replace("___", "________")}</p>
                </div>
                <input value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                  placeholder="Type your answer (max 3 words from the passage)..."
                  style={{ width: "100%", background: "#0f1a2e", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .2s" }} />
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => setPIdx(p => Math.max(0, p - 1))} disabled={pIdx === 0}
            style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: pIdx === 0 ? "#4a5568" : "#8b9bbf", fontSize: 13, cursor: pIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            <I n="back" s={13} c={pIdx === 0 ? "#4a5568" : "#8b9bbf"} /> Prev
          </button>
          {!isLast ? (
            <button onClick={() => setPIdx(p => p + 1)}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: CLR, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Next Part <I n="next" s={13} c="#fff" />
            </button>
          ) : (
            <button onClick={submit} disabled={checking}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: checking ? "#1e293b" : "#1D9E75", color: checking ? "#4a5568" : "#fff", fontSize: 13, fontWeight: 700, cursor: checking ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {checking ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} /> Grading...</> : "Submit Test"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (view === "results" && result) {
    const { pResults, overall, totalC, totalI, info, feedback } = result;
    return (
      <div style={{ animation: "fadeUp .4s ease", maxWidth: 720, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {/* Score */}
        <div style={{ background: "linear-gradient(135deg,#0f1f35,#182d45)", border: `1px solid ${info.color}44`, borderRadius: 16, padding: "24px 20px", marginBottom: 14, textAlign: "center" }}>
          <h2 style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 12 }}>{sel.title}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 48, fontWeight: 800, color: info.color, lineHeight: 1 }}>{overall}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>out of {MAX}</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: info.color, lineHeight: 1 }}>{info.band}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>Band</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: info.color, lineHeight: 1 }}>{info.cefr}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>CEFR</div></div>
          </div>
          <div style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 10 }}>{totalC}/{totalI} correct</div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(overall / MAX) * 100}%`, background: info.color, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
        </div>

        {feedback && <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}><I n="star" s={13} c="#fbbf24" /><span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>AI Feedback</span></div>
          <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.7 }}>{feedback}</p>
        </div>}

        <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Part Breakdown</p>
        {pResults.map((r, ri) => {
          const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
          return (
            <div key={ri} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: "13px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 7px", borderRadius: 4 }}>P{ri + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{r.title}</span>
                </div>
                <div><span style={{ fontSize: 14, fontWeight: 800, color: pct >= 60 ? "#1D9E75" : "#e11d48" }}>{r.correct}/{r.total}</span><span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: 5 }}>({pct}%)</span></div>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.07)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 60 ? "#1D9E75" : "#e11d48", borderRadius: 2 }} />
              </div>
              {r.qResults.map((qr, qi) => (
                <div key={qi} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: qi < r.qResults.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{qr.isCorrect ? <I n="check" s={12} c="#1D9E75" /> : <I n="x" s={12} c="#e11d48" />}</span>
                  <div style={{ flex: 1, fontSize: 11 }}>
                    <span style={{ color: "#8b9bbf" }}>{qr.q?.slice(0, 55)}{qr.q?.length > 55 ? "..." : ""}</span>
                    {!qr.isCorrect && <span style={{ color: "#f87171" }}> → You: <em>{qr.userAnswer}</em> · Correct: <strong style={{ color: "#5dcaa5" }}>{qr.correctAnswer}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openTest(sel)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#8b9bbf", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
          <button onClick={() => setView("list")} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: CLR, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <I n="back" s={13} c="#fff" /> Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return null;
}