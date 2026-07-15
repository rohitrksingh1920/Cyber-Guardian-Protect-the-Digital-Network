import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import api from "../../services/api";

// Mixed cipher types — each puzzle is a different encryption concept
const PUZZLES = [
  {
    type: "CAESAR",
    typeColor: "#e040fb",
    typeDesc: "Caesar Cipher — Shift 3",
    story:
      "Enemy communication intercepted. Decrypt to reveal the attack keyword.",
    cipher: "KHOOR",
    answer: "HELLO",
    hint: "Each letter is shifted forward by 3. K→H, H→E, O→L, O→L, R→O",
    fact: "Julius Caesar used this cipher to communicate with generals around 58 BC. Shift 3 was his favourite key.",
    showWheel: true,
    shift: 3,
  },
  {
    type: "ROT13",
    typeColor: "#00b8ff",
    typeDesc: "ROT13 — Rotate 13",
    story: "Hacker forum post decoded. What threat is being planned?",
    cipher: "ZNYJNER",
    answer: "MALWARE",
    hint: "ROT13 shifts each letter by 13. A→N, B→O, M→Z, A→N, L→Y…",
    fact: "ROT13 is a special case of Caesar cipher where shift=13. Applying ROT13 twice returns the original text — it is self-reversing.",
    showWheel: false,
    rot13map: true,
  },
  {
    type: "MORSE",
    typeColor: "#00e676",
    typeDesc: "Morse Code",
    story: "Old radio transmission captured. Decode the distress signal.",
    cipher: ".... .- -.-. -.-",
    answer: "HACK",
    hint: "H=...., A=.-, C=-.-., K=-.-, each letter separated by space",
    fact: "Morse code was invented in 1837 by Samuel Morse. It was used in WW2 for encrypted military communications.",
    showWheel: false,
    morseRef: true,
  },
  {
    type: "REVERSE",
    typeColor: "#ffd600",
    typeDesc: "Reverse Cipher",
    story: "Classified document recovered. The text is written backwards.",
    cipher: "LLAWERIFSYBEREC",
    answer: "CYBERFIREWALL",
    hint: "Simply reverse the string — read it from right to left.",
    fact: "Reverse cipher is a transposition cipher — it rearranges characters rather than substituting them.",
    showWheel: false,
  },
  {
    type: "CAESAR",
    typeColor: "#e040fb",
    typeDesc: "Caesar Cipher — Shift 13",
    story:
      "Final transmission from a compromised server. Decrypt the emergency command.",
    cipher: "RAPVYNGR ABQR GUERR",
    answer: "ISOLATE NODE THREE",
    hint: "Shift 13 (same as ROT13). I→V, S→F, O→B… each letter back by 13.",
    fact: "Modern encryption like AES-256 uses 256-bit keys — that's 2^256 possible combinations. The universe would end before brute-forcing it.",
    showWheel: true,
    shift: 13,
  },
];

const MORSE_TABLE = {
  ".-": "A",
  "-.-.": "C",
  "-.": "D",
  ".": "E",
  "..-.": "F",
  "--.": "G",
  "....": "H",
  "..": "I",
  ".---": "J",
  "-.-": "K",
  ".-..": "L",
  "--": "M",
  "-.": "N",
  "---": "O",
  ".--.": "P",
  "--.-": "Q",
  ".-.": "R",
  "...": "S",
  "-": "T",
  "..-": "U",
  "...-": "V",
  ".--": "W",
  "-..-": "X",
  "-.--": "Y",
  "--..": "Z",
  ".----": "1",
  "..---": "2",
  "...--": "3",
  "....-": "4",
  ".....": "5",
  "-....": "6",
  "--...": "7",
  "---..": "8",
  "----.": "9",
  "-----": "0",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function CipherDisplay({ puzzle }) {
  const lines = puzzle.cipher.includes("\n")
    ? puzzle.cipher.split("\n")
    : [puzzle.cipher];
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-dim)",
          letterSpacing: 3,
          fontFamily: "var(--font-head)",
          marginBottom: 10,
        }}
      >
        {puzzle.typeDesc.toUpperCase()}
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: "var(--font-head)",
            fontSize: line.length > 15 ? 22 : line.length > 10 ? 30 : 42,
            letterSpacing: line.length > 15 ? 3 : 6,
            color: puzzle.typeColor,
            textShadow: `0 0 20px ${puzzle.typeColor}60`,
            marginBottom: 8,
            wordBreak: "break-all",
          }}
        >
          {line}
        </div>
      ))}
      {/* Letter tiles for short ciphers */}
      {puzzle.cipher.length <= 10 && !puzzle.cipher.includes(" ") && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          {puzzle.cipher.split("").map((c, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: `${puzzle.typeColor}18`,
                  border: `1px solid ${puzzle.typeColor}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-head)",
                  color: puzzle.typeColor,
                  fontSize: 16,
                }}
              >
                {c}
              </div>
              {puzzle.shift && (
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--text-dim)",
                    marginTop: 2,
                  }}
                >
                  -{puzzle.shift}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReferencePanel({ puzzle }) {
  if (puzzle.showWheel) {
    const shift = puzzle.shift || 3;
    return (
      <div style={{ marginTop: 14, animation: "fadeIn .2s ease" }}>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 6,
            fontFamily: "var(--font-head)",
          }}
        >
          CAESAR WHEEL — SHIFT -{shift}
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
                <div style={{ fontSize: 10, color: puzzle.typeColor }}>
                  {enc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (puzzle.morseRef) {
    const common = [
      ["A", ".-"],
      ["B", "-..."],
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
      <div style={{ marginTop: 14 }}>
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
          {common.map(([letter, code]) => (
            <div
              key={letter}
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
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: 11,
                  color: puzzle.typeColor,
                }}
              >
                {letter}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "var(--text-dim)",
                }}
              >
                {code}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (puzzle.rot13map) {
    return (
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 6,
            fontFamily: "var(--font-head)",
          }}
        >
          ROT13 TABLE (A↔N, B↔O, C↔P…)
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {ALPHABET.slice(0, 13).map((c) => {
            const pair = String.fromCharCode(c.charCodeAt(0) + 13);
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
                <div style={{ fontSize: 10, color: puzzle.typeColor }}>
                  {pair}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export default function Level5() {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(50);
  const [showRef, setShowRef] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [solveTime, setSolveTime] = useState([]);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const startRef = useRef(Date.now());
  const qStartRef = useRef(Date.now());
  const inputRef = useRef(null);

  useEffect(() => {
    if (feedback) return;
    if (timer <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, feedback]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [current]);

  const check = () => {
    const p = PUZZLES[current];
    const val = input.trim().toUpperCase().replace(/\s+/g, " ");
    const isCorrect = val === p.answer.toUpperCase();
    setAttempts((a) => a + 1);
    if (isCorrect) {
      const elapsed = Math.round((Date.now() - qStartRef.current) / 1000);
      setSolveTime((t) => [...t, elapsed]);
      const speedBonus = Math.max(0, (50 - elapsed) * 4);
      const hintPenalty = hintUsed ? 50 : 0;
      const attemptPenalty = attempts * 25;
      const pts = Math.max(50, 200 + speedBonus - hintPenalty - attemptPenalty);
      scoreRef.current += pts;
      correctRef.current++;
      setFeedback({
        ok: true,
        pts,
        speedBonus,
        msg: `✅ Correct! +${pts} pts${speedBonus > 0 ? ` (⚡ speed bonus +${speedBonus})` : ""}`,
        fact: p.fact,
      });
    } else {
      if (attempts >= 2) {
        setLives((l) => l - 1);
        if (lives <= 1) {
          setFeedback({
            ok: false,
            msg: `❌ Wrong — answer was "${p.answer}". Moving on.`,
            fact: p.fact,
            force: true,
          });
          return;
        }
      }
      setFeedback({
        ok: false,
        msg: `❌ Wrong${attempts >= 1 ? ` (attempt ${attempts + 1}/3)` : ""}. Try again!`,
        tryAgain: attempts < 2,
      });
    }
  };

  const handleTimeout = () => {
    const p = PUZZLES[current];
    setLives((l) => l - 1);
    setFeedback({
      ok: false,
      msg: `⏰ Time up! Answer was "${p.answer}"`,
      fact: p.fact,
      force: true,
    });
  };

  const advance = () => {
    setFeedback(null);
    setInput("");
    setAttempts(0);
    setHintUsed(false);
    setShowRef(false);
    if (current + 1 >= PUZZLES.length) {
      setShowReport(true);
    } else {
      setCurrent((c) => c + 1);
      setTimer(50);
      qStartRef.current = Date.now();
    }
  };

  const submitLevel = async () => {
    setShowReport(false);
    const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
    const accuracy = Math.round((correctRef.current / PUZZLES.length) * 100);
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

  const puzzle = PUZZLES[current];
  const avgTime =
    solveTime.length > 0
      ? Math.round(solveTime.reduce((a, b) => a + b, 0) / solveTime.length)
      : 0;
  const rank =
    correctRef.current === PUZZLES.length && lives > 0
      ? "S"
      : correctRef.current >= 4
        ? "A"
        : correctRef.current >= 3
          ? "B"
          : "C";
  const rankColor =
    rank === "S"
      ? "var(--gold)"
      : rank === "A"
        ? "var(--green)"
        : rank === "B"
          ? "var(--accent)"
          : "var(--red)";

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={5} />}

      {/* Final Report */}
      {showReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--purple)",
              borderRadius: 14,
              padding: "40px 48px",
              maxWidth: 480,
              width: "90%",
              textAlign: "center",
              animation: "pop .4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 72,
                color: rankColor,
                marginBottom: 8,
              }}
            >
              {rank}
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: "var(--purple)",
                fontSize: 18,
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              ENCRYPTION LAB
            </div>
            <div
              style={{
                color: "var(--text-dim)",
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              Mission Debrief
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "Decrypted",
                  val: `${correctRef.current}/${PUZZLES.length}`,
                  color: "var(--green)",
                },
                {
                  label: "Accuracy",
                  val: `${Math.round((correctRef.current / PUZZLES.length) * 100)}%`,
                  color: "var(--gold)",
                },
                {
                  label: "Avg Time",
                  val: `${avgTime}s`,
                  color: "var(--accent)",
                },
                {
                  label: "Lives Left",
                  val: `${"❤️".repeat(lives)}${"🖤".repeat(3 - lives)}`,
                  color: "var(--red)",
                },
                {
                  label: "Score",
                  val: scoreRef.current.toLocaleString(),
                  color: "var(--gold)",
                },
                {
                  label: "Ciphers Used",
                  val: "Caesar, ROT13, Morse",
                  color: "var(--purple)",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(0,0,0,.25)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontSize: 16,
                      color: s.color,
                      marginBottom: 3,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "var(--text-dim)",
                      letterSpacing: 1,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "rgba(224,64,251,.07)",
                border: "1px solid rgba(224,64,251,.25)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "var(--text-dim)",
                marginBottom: 16,
                textAlign: "left",
                lineHeight: 1.6,
              }}
            >
              🔐{" "}
              <strong style={{ color: "var(--purple)" }}>Did you know?</strong>{" "}
              Modern AES-256 encryption would take longer than the age of the
              universe to crack by brute force — even with all computers on
              Earth working together.
            </div>
            <button
              onClick={submitLevel}
              style={{
                padding: "12px 32px",
                background: "var(--purple)",
                color: "#fff",
                fontFamily: "var(--font-head)",
                fontSize: 12,
                letterSpacing: 2,
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
              }}
            >
              COLLECT XP →
            </button>
          </div>
        </div>
      )}

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
            <div style={{ fontSize: 18 }}>
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

        {/* Progress */}
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
            padding: "28px",
            marginBottom: 16,
            animation: "fadeIn .3s ease",
          }}
        >
          <CipherDisplay puzzle={puzzle} />
          <div style={{ marginTop: 16, textAlign: "center" }}>
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
                transition: "var(--transition)",
              }}
            >
              {showRef ? "▲ Hide" : "▼ Show"} Reference Table
            </button>
          </div>
          {showRef && <ReferencePanel puzzle={puzzle} />}
        </div>

        {/* Input */}
        {!feedback && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
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
                  fontSize: puzzle.answer.length > 10 ? 15 : 20,
                  fontFamily: "var(--font-head)",
                  letterSpacing: puzzle.answer.length > 10 ? 2 : 5,
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
                💡 Show Hint (-50 pts): {puzzle.hint.substring(0, 40)}...
              </button>
            )}
            {hintUsed && (
              <div
                style={{
                  fontSize: 13,
                  color: "#e040fb",
                  background: "rgba(224,64,251,.08)",
                  border: "1px solid rgba(224,64,251,.25)",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                💡 {puzzle.hint}
              </div>
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
                fontSize: 14,
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
            {!feedback.tryAgain && (
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

        {/* Score */}
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
