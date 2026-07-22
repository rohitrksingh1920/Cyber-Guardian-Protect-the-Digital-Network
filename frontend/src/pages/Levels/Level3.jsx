import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import api from "../../services/api";
import { markLevelPassed, markLevelFailed, isLevelUnlocked } from "./LevelGate";

const FILES = [
  {
    name: "quarterly_report.pdf",
    icon: "📄",
    isMalware: false,
    reason: "Safe — standard PDF from a trusted source.",
  },
  {
    name: "invoice_2024.xlsx",
    icon: "📊",
    isMalware: false,
    reason: "Safe — standard Excel spreadsheet.",
  },
  {
    name: "free_antivirus_setup.exe",
    icon: "⚠️",
    isMalware: true,
    reason: "MALWARE — unsigned .exe from unofficial source.",
  },
  {
    name: "resume_final.docx",
    icon: "📝",
    isMalware: false,
    reason: "Safe — standard Word document.",
  },
  {
    name: "movie_HD_crack.exe",
    icon: "💀",
    isMalware: true,
    reason: "MALWARE — pirated cracks bundle trojans & ransomware.",
  },
  {
    name: "photo_vacation.jpg",
    icon: "🖼️",
    isMalware: false,
    reason: "Safe — images cannot execute code.",
  },
  {
    name: "update_windows_urgent.bat",
    icon: "☠️",
    isMalware: true,
    reason:
      "MALWARE — .bat scripts run commands; fake updates drop ransomware.",
  },
  {
    name: "company_logo.png",
    icon: "🎨",
    isMalware: false,
    reason: "Safe — standard PNG image.",
  },
  {
    name: "bank_statement_viewer.scr",
    icon: "⚡",
    isMalware: true,
    reason:
      "MALWARE — .scr files execute as programs; classic keylogger disguise.",
  },
  {
    name: "presentation_q3.pptx",
    icon: "📑",
    isMalware: false,
    reason: "Safe — standard PowerPoint.",
  },
];

// Pass = catch at least 3 out of 4 malware AND no more than 1 false positive
const MALWARE_FILES = FILES.filter((f) => f.isMalware);
const PASS_CAUGHT_MIN = 3; // need to catch at least 3 of 4
const PASS_FP_MAX = 1; // allow at most 1 false positive

export default function Level3() {
  const navigate = useNavigate();
  const [files] = useState(() => [...FILES].sort(() => Math.random() - 0.5));
  const [flagged, setFlagged] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const caughtRef = useRef(0);
  const fpRef = useRef(0);

  useEffect(() => {
    if (!isLevelUnlocked(3)) {
      navigate("/levels");
    }
  }, []);

  useEffect(() => {
    if (submitted) return;
    if (timer <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, submitted]);

  const toggle = (name) => {
    if (submitted) return;
    setFlagged((prev) => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    const malwareNames = MALWARE_FILES.map((f) => f.name);
    let caught = 0,
      missed = 0,
      fp = 0;
    flagged.forEach((n) => (malwareNames.includes(n) ? caught++ : fp++));
    malwareNames.forEach((n) => !flagged.has(n) && missed++);
    caughtRef.current = caught;
    fpRef.current = fp;

    const pts = Math.max(0, caught * 200 - fp * 100 - missed * 50);
    const accuracy =
      MALWARE_FILES.length > 0 ? (caught / MALWARE_FILES.length) * 100 : 0;
    setScore(pts);
    setFeedback({ caught, missed, fp, pts });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Pass condition: caught ≥ 3 AND false positives ≤ 1
    const passed = caught >= PASS_CAUGHT_MIN && fp <= PASS_FP_MAX;

    setTimeout(async () => {
      if (!passed) {
        markLevelFailed(3);
        setFailed(true);
        return;
      }
      markLevelPassed(3);
      try {
        const { data } = await api.post("/game/level/submit", {
          level: 3,
          score: pts,
          accuracy,
          time_taken: timeTaken,
          difficulty: "agent",
        });
        setResult(data);
      } catch {
        setResult({
          xp_earned: 0,
          new_level: 1,
          achievements_unlocked: [],
          level_up: false,
          new_total_xp: 0,
          new_total_score: 0,
        });
      }
    }, 1800);
  };

  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={3}
          reason={`You caught ${caughtRef.current}/${MALWARE_FILES.length} malware (need ≥ ${PASS_CAUGHT_MIN}) with ${fpRef.current} false positives (max ${PASS_FP_MAX} allowed).`}
          correct={caughtRef.current}
          required={PASS_CAUGHT_MIN}
          total={MALWARE_FILES.length}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const fileStyle = (file) => {
    const isFlagged = flagged.has(file.name);
    if (!submitted)
      return {
        background: isFlagged ? "rgba(255,214,0,.08)" : "rgba(0,0,0,.2)",
        border: `1px solid ${isFlagged ? "var(--gold)" : "var(--border)"}`,
      };
    if (file.isMalware && isFlagged)
      return {
        background: "rgba(0,230,118,.08)",
        border: "1px solid var(--green)",
      };
    if (file.isMalware && !isFlagged)
      return {
        background: "rgba(255,23,68,.1)",
        border: "1px dashed var(--red)",
      };
    if (!file.isMalware && isFlagged)
      return {
        background: "rgba(255,145,0,.08)",
        border: "1px solid var(--orange)",
      };
    return {
      background: "rgba(0,230,118,.05)",
      border: "1px solid rgba(0,230,118,.25)",
    };
  };

  const fileLabel = (file) => {
    if (!submitted) return flagged.has(file.name) ? "🚩 FLAGGED" : "";
    if (file.isMalware && flagged.has(file.name)) return "☠️ CAUGHT";
    if (file.isMalware && !flagged.has(file.name)) return "💀 MISSED";
    if (!file.isMalware && flagged.has(file.name)) return "⚠️ FALSE+";
    return "✅ SAFE";
  };

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={3} />}
      <div style={{ padding: "24px 32px", maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-head)",
                color: "#ffd600",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              🦠 LEVEL 3 — MALWARE HUNTER
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 4 }}
            >
              Flag all malicious files · {flagged.size} flagged ·{" "}
              {MALWARE_FILES.length} threats hidden
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 30,
              color: timer <= 15 ? "var(--red)" : "#ffd600",
              transition: "color .3s",
            }}
          >
            {String(timer).padStart(2, "0")}
          </div>
        </div>

        {/* Pass requirement */}
        <div
          style={{
            background: "rgba(255,214,0,.06)",
            border: "1px solid rgba(255,214,0,.2)",
            borderRadius: 8,
            padding: "8px 14px",
            marginBottom: 12,
            fontSize: 12,
            color: "var(--gold)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            🎯 Catch ≥ {PASS_CAUGHT_MIN}/{MALWARE_FILES.length} malware, max{" "}
            {PASS_FP_MAX} false positive to pass
          </span>
          <span>🚩 {flagged.size} flagged</span>
        </div>

        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div
            className="progress-fill pf-gold"
            style={{ width: `${submitted ? 100 : (timer / 60) * 100}%` }}
          />
        </div>

        <div
          style={{
            background: "rgba(255,214,0,.07)",
            border: "1px solid rgba(255,214,0,.25)",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 13,
            color: "var(--gold)",
            marginBottom: 14,
          }}
        >
          ⚠️ Click files to flag 🚩 · Click again to unflag · False positives
          cost points AND can cause fail!
        </div>

        <div className="grid-2" style={{ marginBottom: 14 }}>
          {files.map((file) => (
            <div
              key={file.name}
              onClick={() => toggle(file.name)}
              style={{
                ...fileStyle(file),
                borderRadius: 8,
                padding: "12px 14px",
                cursor: submitted ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "var(--transition)",
                userSelect: "none",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{file.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 2,
                    wordBreak: "break-all",
                  }}
                >
                  {file.name}
                </div>
                {submitted && (
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 3,
                      color: file.isMalware ? "var(--red)" : "var(--green)",
                      lineHeight: 1.4,
                    }}
                  >
                    {file.reason}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-head)",
                  flexShrink: 0,
                  color: submitted
                    ? file.isMalware
                      ? "var(--red)"
                      : "var(--green)"
                    : "var(--gold)",
                  whiteSpace: "nowrap",
                }}
              >
                {fileLabel(file)}
              </span>
            </div>
          ))}
        </div>

        {feedback && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 14,
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--green)" }}>
              ✅ Caught: <strong>{feedback.caught}</strong>
            </span>
            <span style={{ color: "var(--red)" }}>
              💀 Missed: <strong>{feedback.missed}</strong>
            </span>
            <span style={{ color: "var(--orange)" }}>
              ⚠️ False+: <strong>{feedback.fp}</strong>
            </span>
            <span
              style={{ fontFamily: "var(--font-head)", color: "var(--gold)" }}
            >
              +{feedback.pts} pts
            </span>
          </div>
        )}

        {!submitted && (
          <button
            onClick={handleSubmit}
            className="btn-green"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 13,
              letterSpacing: 2,
            }}
          >
            🔍 SUBMIT SCAN RESULTS ({flagged.size} flagged)
          </button>
        )}
      </div>
    </div>
  );
}
