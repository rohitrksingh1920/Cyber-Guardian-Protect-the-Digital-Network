import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import api from "../../services/api";
import { markLevelPassed, markLevelFailed, isLevelUnlocked } from "./LevelGate";

const PUZZLES = [
  {
    type: "CAESAR",
    typeColor: "#e040fb",
    typeDesc: "Caesar Cipher — Shift 3",
    story: "Enemy communication intercepted. Decrypt the attack keyword.",
    cipher: "KHOOR",
    answer: "HELLO",
    hint: "K→H, H→E, O→L, O→L, R→O (shift each letter back by 3)",
    fact: "Julius Caesar used this cipher ~58 BC. Shift 3 was his favourite key.",
  },
  {
    type: "ROT13",
    typeColor: "#00b8ff",
    typeDesc: "ROT13 — Rotate 13",
    story: "Hacker forum post decoded. What threat is being planned?",
    cipher: "ZNYJNER",
    answer: "MALWARE",
    hint: "ROT13 shifts each letter by 13. M→Z, A→N, L→Y, W→J, A→N, R→E, E→R",
    fact: "ROT13 is self-reversing — applying it twice gives back the original text.",
  },
  {
    type: "MORSE",
    typeColor: "#00e676",
    typeDesc: "Morse Code",
    story: "Old radio transmission captured. Decode the distress signal.",
    cipher: ".... .- -.-. -.-",
    answer: "HACK",
    hint: "H=...., A=.-, C=-.-., K=-.-, each letter separated by space",
    fact: "Morse code was invented in 1837 by Samuel Morse and used in WW2 military communications.",
  },
  {
    type: "REVERSE",
    typeColor: "#ffd600",
    typeDesc: "Reverse Cipher",
    story: "Classified document recovered. The text is written backwards.",
    cipher: "LLAWERIFC",
    answer: "CFIREWALL",
    hint: "Simply reverse the string — read it from right to left",
    fact: "Reverse cipher is a transposition cipher — it rearranges rather than substitutes characters.",
  },
  {
    type: "CAESAR",
    typeColor: "#e040fb",
    typeDesc: "Caesar Cipher — Shift 13",
    story: "Final transmission from a compromised server. Decrypt the command.",
    cipher: "VFBYNGR ABQR",
    answer: "ISOLATE NODE",
    hint: "Shift 13 (ROT13): V→I, F→S, B→O, L→L, N→A, T→G, R→E, space stays, A→N, B→O, Q→D, R→E",
    fact: "AES-256 has 2^256 possible keys — brute forcing would take longer than the age of the universe.",
  },
];

const PASS_REQ = { correct: 4, total: 5 };
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function CaesarWheel({ shift, color }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginBottom: 6,
          fontFamily: "var(--font-head)",
        }}
      >
        CAESAR WHEEL — SHIFT -{shift} (encrypted → plain)
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {ALPHABET.map((c) => {
          const enc = String.fromCharCode(
            ((c.charCodeAt(0) - 65 + shift) % 26) + 65,
          );
          return (
            <div
              key={c}
              style={{
                textAlign: "center",
                background: "rgba(255,255,255,.03)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "3px 5px",
                minWidth: 30,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text)",
                  fontFamily: "var(--font-head)",
                }}
              >
                {c}
              </div>
              <div style={{ fontSize: 10, color }}>{enc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MorseRef({ color }) {
  const common = [
    ["A", ".-"],
    ["C", "-.-."],
    ["E", "."],
    ["H", "...."],
    ["I", ".."],
    ["K", "-.-"],
    ["L", ".-.."],
    ["M", "--"],
    ["N", "-."],
    ["O", "---"],
    ["R", ".-."],
    ["S", "..."],
    ["T", "-"],
    ["W", ".--"],
  ];
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: 2,
          marginBottom: 6,
          fontFamily: "var(--font-head)",
        }}
      >
        MORSE CODE REFERENCE
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {common.map(([l, c]) => (
          <div
            key={l}
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "3px 8px",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span
              style={{ fontFamily: "var(--font-head)", fontSize: 11, color }}
            >
              {l}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--text-dim)",
              }}
            >
              {c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Level5() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(50);
  const [showRef, setShowRef] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const livesRef = useRef(3);
  const startRef = useRef(Date.now());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLevelUnlocked(5)) navigate("/levels");
  }, []);

  // Timer — only runs when no feedback showing and not done
  useEffect(() => {
    if (feedback || showReport || failed || result) return;
    if (timer <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, feedback, showReport, failed, result]);

  useEffect(() => {
    if (!feedback && !showReport) inputRef.current?.focus();
  }, [current, feedback, showReport]);

  const handleTimeout = () => {
    const p = PUZZLES[current];
    livesRef.current = Math.max(0, livesRef.current - 1);
    setLives(livesRef.current);
    setFeedback({
      ok: false,
      msg: `⏰ Time up! Answer was "${p.answer}"`,
      fact: p.fact,
      advance: true,
    });
    if (livesRef.current <= 0) {
      // out of lives — check if already passed enough
      checkAndFinish();
    }
  };

  const check = () => {
    const p = PUZZLES[current];
    const val = input.trim().toUpperCase().replace(/\s+/g, " ");
    const isCorrect = val === p.answer.toUpperCase();
    setAttempts((a) => a + 1);
    if (isCorrect) {
      const pts = Math.max(50, 200 - attempts * 25) + timer * 4;
      scoreRef.current += pts;
      correctRef.current++;
      setFeedback({
        ok: true,
        msg: `✅ Correct! +${pts} pts`,
        fact: p.fact,
        advance: true,
      });
    } else {
      if (attempts >= 2) {
        // 3 wrong attempts = lose a life
        livesRef.current = Math.max(0, livesRef.current - 1);
        setLives(livesRef.current);
        setFeedback({
          ok: false,
          msg: `❌ 3 attempts used. Answer: "${p.answer}"`,
          fact: p.fact,
          advance: true,
        });
        if (livesRef.current <= 0) {
          checkAndFinish();
          return;
        }
      } else {
        setFeedback({
          ok: false,
          msg: `❌ Wrong (attempt ${attempts + 1}/3). Try again!`,
          tryAgain: true,
        });
      }
    }
  };

  const checkAndFinish = () => {
    // Called when lives run out — check current progress
    setTimeout(() => {
      const passed = correctRef.current >= PASS_REQ.correct;
      finishLevel(passed);
    }, 2000);
  };

  const advance = () => {
    setFeedback(null);
    setInput("");
    setAttempts(0);
    setHintUsed(false);
    setShowRef(false);
    if (current + 1 >= PUZZLES.length) {
      const passed = correctRef.current >= PASS_REQ.correct;
      finishLevel(passed);
    } else {
      setCurrent((c) => c + 1);
      setTimer(50);
    }
  };

  const finishLevel = async (passed) => {
    const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
    const accuracy = Math.round((correctRef.current / PUZZLES.length) * 100);
    if (!passed) {
      markLevelFailed(5);
      setFailed(true);
      return;
    }
    markLevelPassed(5);
    setShowReport(true);
    try {
      const { data } = await api.post("/game/level/submit", {
        level: 5,
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

  // ── FAILED screen (fixes blank screen bug) ────────────────────────────
  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={5}
          reason={`You decrypted ${correctRef.current} out of ${PUZZLES.length} messages. Need at least ${PASS_REQ.correct} to pass.`}
          correct={correctRef.current}
          required={PASS_REQ.correct}
          total={PASS_REQ.total}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const puzzle = PUZZLES[current];

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={5} />}

      <div style={{ padding: "24px 32px", maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
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
                color: "#e040fb",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              🔐 LEVEL 5 — ENCRYPTION LAB
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 3 }}
            >
              Puzzle {current + 1} of {PUZZLES.length} — {puzzle.typeDesc}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 20 }}>
              {"❤️".repeat(lives)}
              {"🖤".repeat(3 - lives)}
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 30,
                color: timer <= 15 ? "var(--red)" : "#e040fb",
                transition: "color .3s",
              }}
            >
              {String(timer).padStart(2, "0")}
            </div>
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
            🎯 Decrypt ≥ {PASS_REQ.correct}/{PASS_REQ.total} to pass
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

        <div className="progress-track" style={{ marginBottom: 14 }}>
          <div
            style={{
              height: "100%",
              width: `${(current / PUZZLES.length) * 100}%`,
              background: "#e040fb",
              borderRadius: 3,
              transition: "width .4s ease",
              boxShadow: "0 0 8px #e040fb",
            }}
          />
        </div>

        {/* Story briefing */}
        <div
          style={{
            background: "rgba(224,64,251,.06)",
            border: "1px solid rgba(224,64,251,.2)",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 14,
            fontSize: 13,
            color: "var(--text-dim)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 20 }}>📡</span>
          <span>
            <strong style={{ color: "var(--text)" }}>
              INCOMING TRANSMISSION:
            </strong>{" "}
            {puzzle.story}
          </span>
        </div>

        {/* Cipher display */}
        <div
          style={{
            background: "var(--bg-card)",
            border: `1px solid ${puzzle.typeColor}40`,
            borderRadius: 12,
            padding: "24px",
            marginBottom: 14,
            textAlign: "center",
            animation: "fadeIn .3s ease",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: 3,
              fontFamily: "var(--font-head)",
              marginBottom: 12,
            }}
          >
            {puzzle.typeDesc.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize:
                puzzle.cipher.length > 15
                  ? 22
                  : puzzle.cipher.length > 10
                    ? 30
                    : 42,
              letterSpacing: puzzle.cipher.length > 15 ? 3 : 6,
              color: puzzle.typeColor,
              textShadow: `0 0 20px ${puzzle.typeColor}60`,
              marginBottom: 14,
              wordBreak: "break-all",
            }}
          >
            {puzzle.cipher}
          </div>
          <button
            onClick={() => setShowRef((r) => !r)}
            style={{
              fontSize: 11,
              color: "var(--text-dim)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "5px 14px",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            {showRef ? "▲ Hide" : "▼ Show"} Reference Table
          </button>
          {showRef &&
            (puzzle.type === "CAESAR" ? (
              <CaesarWheel
                shift={puzzle.typeDesc.includes("13") ? 13 : 3}
                color={puzzle.typeColor}
              />
            ) : puzzle.type === "ROT13" ? (
              <CaesarWheel shift={13} color={puzzle.typeColor} />
            ) : puzzle.type === "MORSE" ? (
              <MorseRef color={puzzle.typeColor} />
            ) : (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "var(--text-dim)",
                }}
              >
                💡 Reverse cipher: just read the text backwards!
              </div>
            ))}
        </div>

        {/* Hint */}
        {hintUsed && (
          <div
            style={{
              background: "rgba(224,64,251,.1)",
              border: "1px solid rgba(224,64,251,.3)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
              fontSize: 13,
              color: "#e040fb",
            }}
          >
            💡 {puzzle.hint}
          </div>
        )}

        {/* Input */}
        {!feedback && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) =>
                  e.key === "Enter" && input.length > 0 && check()
                }
                placeholder="Type decrypted message..."
                autoComplete="off"
                className="input-field"
                style={{
                  fontSize: puzzle.answer.length > 12 ? 15 : 20,
                  fontFamily: "var(--font-head)",
                  letterSpacing: puzzle.answer.length > 12 ? 2 : 4,
                }}
              />
              <button
                onClick={check}
                disabled={!input}
                style={{
                  padding: "13px 22px",
                  background: "#e040fb",
                  color: "#fff",
                  fontFamily: "var(--font-head)",
                  fontSize: 12,
                  letterSpacing: 1,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  opacity: !input ? 0.6 : 1,
                }}
              >
                DECRYPT
              </button>
            </div>
            {!hintUsed && (
              <button
                onClick={() => setHintUsed(true)}
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  padding: "7px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                💡 Show Hint (-50 pts)
              </button>
            )}
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            style={{
              background: feedback.ok
                ? "rgba(0,230,118,.08)"
                : "rgba(255,23,68,.08)",
              border: `1px solid ${feedback.ok ? "rgba(0,230,118,.4)" : "rgba(255,23,68,.4)"}`,
              borderRadius: 10,
              padding: "16px 20px",
              animation: "fadeIn .3s ease",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: feedback.ok ? "var(--green)" : "var(--red)",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              {feedback.msg}
            </div>
            {feedback.fact && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  lineHeight: 1.65,
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                  marginTop: 8,
                }}
              >
                🔐{" "}
                <strong style={{ color: puzzle.typeColor }}>
                  Encryption Fact:
                </strong>{" "}
                {feedback.fact}
              </div>
            )}
            {feedback.advance && !feedback.tryAgain && (
              <button
                onClick={advance}
                style={{
                  marginTop: 12,
                  padding: "9px 22px",
                  background: feedback.ok ? "#e040fb" : "rgba(255,23,68,.2)",
                  border: `1px solid ${feedback.ok ? "#e040fb" : "var(--red)"}`,
                  color: feedback.ok ? "#fff" : "var(--red)",
                  fontFamily: "var(--font-head)",
                  fontSize: 11,
                  letterSpacing: 1,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {current + 1 < PUZZLES.length
                  ? "NEXT PUZZLE →"
                  : "VIEW RESULTS →"}
              </button>
            )}
            {feedback.tryAgain && (
              <button
                onClick={() => {
                  setFeedback(null);
                  setInput("");
                  inputRef.current?.focus();
                }}
                style={{
                  marginTop: 12,
                  padding: "9px 22px",
                  background: "rgba(255,23,68,.1)",
                  border: "1px solid var(--red)",
                  color: "var(--red)",
                  fontFamily: "var(--font-head)",
                  fontSize: 11,
                  letterSpacing: 1,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                TRY AGAIN ({2 - attempts} attempts left)
              </button>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--text-dim)",
          }}
        >
          <span
            style={{ fontFamily: "var(--font-head)", color: "var(--gold)" }}
          >
            SCORE: {scoreRef.current.toLocaleString()}
          </span>
          <span>Attempts this puzzle: {attempts}</span>
        </div>
      </div>
    </div>
  );
}
