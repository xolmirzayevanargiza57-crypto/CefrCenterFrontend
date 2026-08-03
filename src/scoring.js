// scoring.js
export function scoreToWritingBand(score, max = 75) {
  const p = (score / max) * 100;
  
  let band, cefr, color;
  
  if (p >= 87) {
    band = "9.0";
    cefr = "C2";
    color = "#D4537E";
  } else if (p >= 83) {
    band = "8.5";
    cefr = "C2";
    color = "#D4537E";
  } else if (p >= 79) {
    band = "8.0";
    cefr = "C1";
    color = "#7F77DD";
  } else if (p >= 75) {
    band = "7.5";
    cefr = "C1";
    color = "#7F77DD";
  } else if (p >= 67) {
    band = "7.0";
    cefr = "C1";
    color = "#7F77DD";
  } else if (p >= 60) {
    band = "6.5";
    cefr = "B2";
    color = "#D85A30";
  } else if (p >= 54) {
    band = "6.0";
    cefr = "B2";
    color = "#D85A30";
  } else if (p >= 46) {
    band = "5.5";
    cefr = "B1";
    color = "#EF9F27";
  } else if (p >= 40) {
    band = "5.0";
    cefr = "B1";
    color = "#EF9F27";
  } else if (p >= 33) {
    band = "4.5";
    cefr = "A2";
    color = "#1D9E75";
  } else {
    band = "4.0";
    cefr = "A1";
    color = "#378ADD";
  }
  
  return { band, cefr, color };
}

export function scoreToCEFR(score, max = 40) {
  const p = (score / max) * 100;
  if (p >= 90) return { band: "9.0", cefr: "C2", color: "#D4537E" };
  if (p >= 85) return { band: "8.5", cefr: "C2", color: "#D4537E" };
  if (p >= 78) return { band: "8.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 72) return { band: "7.5", cefr: "C1", color: "#7F77DD" };
  if (p >= 65) return { band: "7.0", cefr: "C1", color: "#7F77DD" };
  if (p >= 58) return { band: "6.5", cefr: "B2", color: "#D85A30" };
  if (p >= 50) return { band: "6.0", cefr: "B2", color: "#D85A30" };
  if (p >= 42) return { band: "5.5", cefr: "B1", color: "#EF9F27" };
  if (p >= 35) return { band: "5.0", cefr: "B1", color: "#EF9F27" };
  if (p >= 28) return { band: "4.5", cefr: "A2", color: "#1D9E75" };
  if (p >= 20) return { band: "4.0", cefr: "A2", color: "#1D9E75" };
  return { band: "3.5", cefr: "A1", color: "#378ADD" };
}
