import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import RunnerStage from "../../components/RunnerStage";
import api from "../../services/api";
import { checkPassFail, markLevelPassed, markLevelFailed } from "./LevelGate";

const QUESTIONS = [
  {
    question: "Which password is the STRONGEST?",
    options: ["admin123", "password", "R@h!t#2026!!", "12345678"],
    correct: 2,
    tip: "Strong passwords use uppercase, lowercase, numbers and special chars — 12+ characters long.",
  },
  {
    question: "What does 2FA protect against?",
    options: [
      "Slow internet",
      "A stolen password being enough to log in",
      "Computer viruses",
      "Data leaks",
    ],
    correct: 1,
    tip: "Even if your password is stolen, 2FA requires a second code the attacker does not have.",
  },
  {
    question: 'You get an email: "Reset your account here." What do you do?',
    options: [
      "Click the link immediately",
      "Ignore it",
      "Open a NEW tab and go to the website directly",
      "Reply asking if it is real",
    ],
    correct: 2,
    tip: "Never trust email links. Open a new tab and type the URL yourself.",
  },
  {
    question: "Which is the WORST password habit?",
    options: [
      "Using a password manager",
      "Using 2FA",
      "Using the same password on every website",
      "Changing password after a breach",
    ],
    correct: 2,
    tip: "Password reuse means one breach exposes ALL your accounts.",
  },
  {
    question: "What is a password SALT?",
    options: [
      "Makes passwords longer",
      "Random value added before hashing to defeat rainbow tables",
      "A type of encryption",
      "A hint stored with your password",
    ],
    correct: 1,
    tip: "Salting ensures two identical passwords hash differently, defeating precomputed lookup attacks.",
  },
];
const PASS_REQ = { correct: 4, total: 5 };

export default function Level1() {
  const [stage, setStage] = useState("runner");
  const [runStats, setRunStats] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(30);
  const [showTip, setShowTip] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (stage !== "quiz" || result || failed || selected !== null) return;
    if (timer <= 0) {
      handleSelect(-1);
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, result, failed, selected, stage]);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowTip(true);
    if (idx === QUESTIONS[current].correct) {
      scoreRef.current += 100 + timer * 5;
      correctRef.current++;
    }
    setTimeout(() => {
      setShowTip(false);
      if (current + 1 >= QUESTIONS.length) submitLevel();
      else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimer(30);
      }
    }, 2200);
  };

  const submitLevel = async () => {
    const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
    const accuracy = (correctRef.current / QUESTIONS.length) * 100;
    const finalScore = scoreRef.current + (runStats?.score || 0);
    const { passed } = checkPassFail(1, correctRef.current);
    if (!passed) {
      markLevelFailed(1);
      setFailed(true);
      return;
    }
    markLevelPassed(1);
    try {
      const { data } = await api.post("/game/level/submit", {
        level: 1,
        score: finalScore,
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
  };

  if (stage === "runner")
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <RunnerStage
            levelId={1}
            color="#00b8ff"
            label="💻 PASSWORD FORTRESS: RUN"
            targetScore={400}
            onComplete={(stats) => {
              setRunStats(stats);
              startRef.current = Date.now();
              setTimeout(() => setStage("quiz"), 800);
            }}
          />
        </div>
      </div>
    );

  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={1}
          reason="Answer at least 4 out of 5 security questions correctly to secure the Password Fortress."
          correct={correctRef.current}
          required={PASS_REQ.correct}
          total={PASS_REQ.total}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const q = QUESTIONS[current];
  const optStyle = (idx) => ({
    padding: "13px 18px",
    borderRadius: 8,
    border: "1px solid",
    cursor: selected === null ? "pointer" : "default",
    fontSize: 14,
    textAlign: "left",
    transition: "all .2s",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background:
      selected === null
        ? "rgba(0,0,0,.2)"
        : idx === q.correct
          ? "rgba(0,230,118,.15)"
          : idx === selected
            ? "rgba(255,23,68,.15)"
            : "rgba(0,0,0,.15)",
    borderColor:
      selected === null
        ? "var(--border)"
        : idx === q.correct
          ? "var(--green)"
          : idx === selected
            ? "var(--red)"
            : "var(--border)",
    color: "var(--text)",
    opacity:
      selected !== null && idx !== q.correct && idx !== selected ? 0.55 : 1,
  });

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={1} />}
      <div style={{ padding: "28px 32px", maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-head)",
                color: "#00b8ff",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              💻 LEVEL 1 — PASSWORD FORTRESS
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 4 }}
            >
              Question {current + 1}/{QUESTIONS.length}
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 32,
              color: timer <= 10 ? "var(--red)" : "var(--accent)",
              transition: "color .3s",
            }}
          >
            {String(timer).padStart(2, "0")}
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,214,0,.06)",
            border: "1px solid rgba(255,214,0,.2)",
            borderRadius: 8,
            padding: "8px 14px",
            marginBottom: 14,
            fontSize: 12,
            color: "var(--gold)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            🎯 Need {PASS_REQ.correct}/{PASS_REQ.total} to pass (75%)
          </span>
          <span
            style={{
              color:
                correctRef.current >= PASS_REQ.correct
                  ? "var(--green)"
                  : "var(--text-dim)",
            }}
          >
            ✅ {correctRef.current} correct
          </span>
        </div>
        <div className="progress-track" style={{ marginBottom: 18 }}>
          <div
            className="progress-fill pf-accent"
            style={{ width: `${(current / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <div
          style={{
            textAlign: "right",
            marginBottom: 12,
            fontFamily: "var(--font-head)",
            color: "var(--gold)",
            fontSize: 13,
          }}
        >
          SCORE: {scoreRef.current.toLocaleString()}
        </div>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "24px 28px",
            marginBottom: 14,
            animation: "fadeIn .3s ease",
          }}
        >
          <p style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 22 }}>
            {q.question}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={optStyle(i)}
              >
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    minWidth: 18,
                  }}
                >
                  {["A", "B", "C", "D"][i]}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
        {showTip && selected !== null && (
          <div className={selected === q.correct ? "tip-ok" : "tip-bad"}>
            <strong>
              {selected === q.correct ? "✅ Correct! " : "❌ Wrong. "}
            </strong>
            {q.tip}
          </div>
        )}
      </div>
    </div>
  );
}
