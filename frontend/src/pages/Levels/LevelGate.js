export const PASS_THRESHOLD = 0.75;

export const LEVEL_PASS_REQUIREMENTS = {
  1: { total: 5, minPass: 4, label: "4 out of 5 questions" },
  2: { total: 6, minPass: 5, label: "5 out of 6 emails" },
  3: { total: 6, minPass: 5, label: "5 out of 6 malware caught" },
  4: { total: 8, minPass: 6, label: "6 out of 8 threats blocked" },
  5: { total: 5, minPass: 4, label: "4 out of 5 ciphers" },
  6: { total: 6, minPass: 5, label: "5 out of 6 tasks complete" },
};

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem("cg-progress") || "{}");
  } catch {
    return {};
  }
}
function saveProgress(p) {
  localStorage.setItem("cg-progress", JSON.stringify(p));
}

export function markLevelPassed(n) {
  const p = getProgress();
  p[n] = { passed: true, ts: Date.now() };
  saveProgress(p);
}
export function markLevelFailed(n) {
  const p = getProgress();
  for (let i = n; i <= 6; i++) delete p[i];
  saveProgress(p);
}
export function isLevelPassed(n) {
  return !!getProgress()[n]?.passed;
}
export function isLevelUnlocked(n) {
  if (n === 1) return true;
  for (let i = 1; i < n; i++) if (!isLevelPassed(i)) return false;
  return true;
}
export function checkPassFail(levelNum, correct) {
  const req = LEVEL_PASS_REQUIREMENTS[levelNum];
  if (!req) return { passed: true, correct, required: 0, pct: 100 };
  return {
    passed: correct >= req.minPass,
    correct,
    required: req.minPass,
    total: req.total,
    pct: Math.round((correct / req.total) * 100),
    label: req.label,
  };
}
export function getAllLevelStatuses() {
  return [1, 2, 3, 4, 5, 6].map((n) => ({
    level: n,
    unlocked: isLevelUnlocked(n),
    passed: isLevelPassed(n),
  }));
}
export function resetAllProgress() {
  localStorage.removeItem("cg-progress");
}
