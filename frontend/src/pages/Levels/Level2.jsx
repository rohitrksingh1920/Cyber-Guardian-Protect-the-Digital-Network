import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import api from "../../services/api";
import {
  checkPassFail,
  markLevelPassed,
  markLevelFailed,
  isLevelUnlocked,
} from "./LevelGate";

const EMAILS = [
  {
    from: "security@paypa1.com",
    subject: "URGENT: Your account is suspended!",
    body: "Your PayPal account has been suspended. Click here immediately to restore access.",
    isPhishing: true,
    clue: "'paypa1.com' uses 1 instead of L — typosquatting!",
    tip: "Always check the sender domain carefully.",
  },
  {
    from: "order-update@amazon.com",
    subject: "Your Amazon order has been shipped",
    body: "Your order #302-5581204-2938610 has shipped and arrives Thursday. Track at amazon.com/orders.",
    isPhishing: false,
    clue: "Official amazon.com domain. Real order number. No urgency.",
    tip: "Legitimate shipping emails link only to the official site.",
  },
  {
    from: "support@micros0ft-security.net",
    subject: "Windows Defender Alert: Virus Detected!",
    body: "WARNING! Our system detected TROJAN.WIN32 on your computer. Call 1-800-642-7676 IMMEDIATELY.",
    isPhishing: true,
    clue: "Fake domain (micros0ft with '0') on .net. Microsoft never cold-contacts you.",
    tip: "Tech support scams use scare tactics + phone numbers.",
  },
  {
    from: "no-reply@slack.com",
    subject: "Unrecognized sign-in to your workspace",
    body: "Someone signed in from Chrome/Windows (IP: 185.220.101.47, Russia). If not you, check slack.com/account.",
    isPhishing: false,
    clue: "Official slack.com domain. Specific IP + location. Links to slack.com.",
    tip: "Real security alerts contain specific details and link to the official site.",
  },
  {
    from: "hr@yourcompany.internal",
    subject: "Annual Bonus — Confirm Bank Details ASAP",
    body: "You qualify for a performance bonus. Reply with your bank account number and IFSC code before Friday.",
    isPhishing: true,
    clue: "HR systems NEVER request bank details via email. Spear-phishing.",
    tip: "Verify unusual requests by calling HR directly. Never send bank details via email.",
  },
  {
    from: "security@google.com",
    subject: "Critical security alert for your Google Account",
    body: "Sign-in from Samsung Galaxy S24, Bangalore (IP: 103.45.22.10). Check myaccount.google.com/security.",
    isPhishing: false,
    clue: "Official google.com. Specific device+city+IP. Links to myaccount.google.com.",
    tip: "Google really sends these. Verify the link goes to an official Google domain.",
  },
];
const PASS_REQ = { correct: 5, total: 6 };

export default function Level2() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(22);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [startTime] = useState(Date.now());
  const correctRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!isLevelUnlocked(2)) navigate("/levels");
  }, []);

  useEffect(() => {
    if (selected !== null) return;
    if (timer <= 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, selected]);

  const handleAnswer = (isPhishing) => {
    if (selected !== null) return;
    setSelected(isPhishing);
    setShowClue(true);
    const email = EMAILS[current];
    const ok = isPhishing === email.isPhishing;
    const pts = ok ? 150 + timer * 8 : 0;
    if (ok) {
      correctRef.current++;
      scoreRef.current += pts;
      setScore(scoreRef.current);
    }
    setTimeout(() => {
      setShowClue(false);
      if (current + 1 >= EMAILS.length) submitLevel();
      else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimer(22);
      }
    }, 2500);
  };

  const submitLevel = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (correctRef.current / EMAILS.length) * 100;
    const { passed } = checkPassFail(2, correctRef.current);
    if (!passed) {
      markLevelFailed(2);
      setFailed(true);
      return;
    }
    markLevelPassed(2);
    try {
      const { data } = await api.post("/game/level/submit", {
        level: 2,
        score: scoreRef.current,
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

  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={2}
          reason="Correctly classify at least 5 out of 6 emails to defend the network."
          correct={correctRef.current}
          required={PASS_REQ.correct}
          total={PASS_REQ.total}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const email = EMAILS[current];
  const ok = selected === email.isPhishing;
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={2} />}
      <div style={{ padding: "24px 32px", maxWidth: 820, margin: "0 auto" }}>
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
                color: "#00e676",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              📧 LEVEL 2 — PHISHING HUNT
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 4 }}
            >
              Email {current + 1}/{EMAILS.length}
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 30,
              color: timer <= 8 ? "var(--red)" : "#00e676",
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
            marginBottom: 12,
            fontSize: 12,
            color: "var(--gold)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            🎯 Need {PASS_REQ.correct}/{PASS_REQ.total} correct to pass
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
        <div className="progress-track" style={{ marginBottom: 12 }}>
          <div
            className="progress-fill pf-green"
            style={{ width: `${(current / EMAILS.length) * 100}%` }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-head)",
              color: "var(--gold)",
              fontSize: 13,
            }}
          >
            SCORE: {score.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            ✅ {correctRef.current} correct
          </span>
        </div>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 12,
            animation: "fadeIn .3s ease",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,.3)",
              padding: "13px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "65px 1fr",
                gap: "4px 8px",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--text-dim)" }}>From:</span>
              <strong
                style={{
                  color:
                    selected !== null
                      ? email.isPhishing
                        ? "var(--red)"
                        : "var(--green)"
                      : "var(--text)",
                }}
              >
                {email.from}
              </strong>
              <span style={{ color: "var(--text-dim)" }}>Subject:</span>
              <span>{email.subject}</span>
            </div>
          </div>
          <div style={{ padding: "18px 24px", lineHeight: 1.75, fontSize: 14 }}>
            {email.body}
          </div>
        </div>
        {showClue && selected !== null && (
          <div
            style={{
              background: ok ? "rgba(0,230,118,.08)" : "rgba(255,23,68,.08)",
              border: `1px solid ${ok ? "rgba(0,230,118,.4)" : "rgba(255,23,68,.4)"}`,
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 12,
              animation: "fadeIn .3s ease",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 13,
                color: ok ? "var(--green)" : "var(--red)",
                marginBottom: 8,
              }}
            >
              {ok
                ? "✅ Correct!"
                : `❌ Wrong — this was ${email.isPhishing ? "PHISHING" : "safe"}.`}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text)", marginBottom: 6 }}
            >
              <strong>Why:</strong> {email.clue}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                padding: "8px 12px",
                background: "rgba(0,184,255,.06)",
                borderRadius: 6,
                borderLeft: "3px solid var(--accent)",
              }}
            >
              💡 {email.tip}
            </div>
          </div>
        )}
        {!showClue && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {[
              {
                label: "✅ SAFE EMAIL",
                value: false,
                bg: "rgba(0,230,118,.1)",
                border: "var(--green)",
                color: "var(--green)",
              },
              {
                label: "🎣 PHISHING!",
                value: true,
                bg: "rgba(255,23,68,.1)",
                border: "var(--red)",
                color: "var(--red)",
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleAnswer(btn.value)}
                disabled={selected !== null}
                style={{
                  padding: "18px",
                  background: btn.bg,
                  border: `2px solid ${btn.border}`,
                  color: btn.color,
                  fontFamily: "var(--font-head)",
                  fontSize: 13,
                  letterSpacing: 2,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
