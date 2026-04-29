export function scoreToCEFR(score, max = 40) {
  const p = (score / max) * 100;
  if (p >= 87) return { band: "9.0", cefr: "C2", color: "#fc2020ff" };
  if (p >= 83) return { band: "8.5", cefr: "C2", color: "#D4537E" };
  if (p >= 79) return { band: "8.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 75) return { band: "7.5", cefr: "C1", color: "#7F77DD" };
  if (p >= 71) return { band: "7.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 67) return { band: "6.5", cefr: "B2", color: "#D85A30" };
  if (p >= 60) return { band: "6.0", cefr: "B2", color: "#D85A30" };
  if (p >= 54) return { band: "5.5", cefr: "B1", color: "#EF9F27" };
  if (p >= 46) return { band: "5.0", cefr: "B1", color: "#EF9F27" };
  if (p >= 40) return { band: "4.5", cefr: "A2", color: "#1D9E75" };
  if (p >= 33) return { band: "4.0", cefr: "A2", color: "#1D9E75" };
  return { band: "3.5", cefr: "A1", color: "#378ADD" };
}

export function scoreToWritingBand(score, max = 75) {
  const p = (score / max) * 100;
  if (p >= 87) return { band: "9.0", cefr: "C2", color: "#D4537E" };
  if (p >= 83) return { band: "8.5", cefr: "C2", color: "#D4537E" };
  if (p >= 79) return { band: "8.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 75) return { band: "7.5", cefr: "C1", color: "#7F77DD" };
  if (p >= 67) return { band: "7.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 60) return { band: "6.5", cefr: "B2", color: "#D85A30" };
  if (p >= 54) return { band: "6.0", cefr: "B2", color: "#D85A30" };
  if (p >= 46) return { band: "5.5", cefr: "B1", color: "#EF9F27" };
  if (p >= 40) return { band: "5.0", cefr: "B1", color: "#EF9F27" };
  if (p >= 33) return { band: "4.5", cefr: "A2", color: "#1D9E75" };
  return { band: "4.0", cefr: "A1", color: "#378ADD" };
}
