import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import api from "../../services/api";

// ── Threat definitions with multiple-choice responses ──────────────────────
const THREAT_POOL = [
  {
    type: "DDoS FLOOD",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "💥",
    desc: "Volumetric attack — 3.2 Gbps flooding port 443. CDN failing.",
    ip: "185.220.101.47",
    pts: 250,
    options: [
      "Block IP Address",
      "Rate Limiting & Traffic Scrubbing",
      "Restart Web Server",
      "Disable HTTPS",
    ],
    correct: 1,
    reason:
      "Rate limiting and traffic scrubbing filters malicious packets while keeping legitimate traffic flowing.",
  },
  {
    type: "SQL INJECTION",
    color: "#e040fb",
    priority: "CRITICAL",
    icon: "💉",
    desc: "Malicious SQL payload detected in login POST parameter.",
    ip: "203.0.113.10",
    pts: 300,
    options: [
      "Close All Ports",
      "Restart Database",
      "Sanitize & Validate Input",
      "Encrypt the Database",
    ],
    correct: 2,
    reason:
      "Input sanitization removes malicious SQL characters before they reach the database query.",
  },
  {
    type: "BRUTE FORCE",
    color: "#ff9100",
    priority: "HIGH",
    icon: "🔨",
    desc: "12,000 SSH login attempts per minute from single IP.",
    ip: "198.51.100.5",
    pts: 200,
    options: [
      "Lock Account & Block IP",
      "Disable SSH",
      "Increase Password Length",
      "Restart Router",
    ],
    correct: 0,
    reason:
      "Locking the account and blacklisting the source IP immediately stops the attack.",
  },
  {
    type: "MITM ATTACK",
    color: "#00b8ff",
    priority: "HIGH",
    icon: "👀",
    desc: "ARP poisoning detected on subnet 192.168.1.0/24. Traffic being intercepted.",
    ip: "172.16.0.22",
    pts: 250,
    options: [
      "Restart Router",
      "Enable HTTPS & Encrypt Channel",
      "Block Port 80",
      "Change WiFi Password",
    ],
    correct: 1,
    reason:
      "Encrypting all channels with HTTPS/TLS means intercepted traffic is unreadable to the attacker.",
  },
  {
    type: "RANSOMWARE",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🔒",
    desc: "File encryption starting on Node-03. Spreading fast.",
    ip: "10.10.10.88",
    pts: 350,
    options: [
      "Pay the Ransom",
      "Delete All Files",
      "Isolate & Quarantine System",
      "Run Antivirus Scan",
    ],
    correct: 2,
    reason:
      "Immediate isolation stops ransomware spreading to other systems. Then restore from clean backups.",
  },
  {
    type: "PORT SCAN",
    color: "#ff9100",
    priority: "MEDIUM",
    icon: "🔍",
    desc: "Stealth SYN scan across all TCP ports. Reconnaissance phase.",
    ip: "10.0.0.55",
    pts: 150,
    options: [
      "Close Unused Ports & Enable Firewall",
      "Restart Network",
      "Block Port 22 Only",
      "Alert the Team",
    ],
    correct: 0,
    reason:
      "Closing unused ports removes attack surface. A firewall rule drops unsolicited SYN packets.",
  },
  {
    type: "ZERO-DAY EXPLOIT",
    color: "#e040fb",
    priority: "CRITICAL",
    icon: "⚡",
    desc: "CVE-2024-1337 being exploited in Apache server.",
    ip: "45.33.32.156",
    pts: 350,
    options: [
      "Reboot the Server",
      "Apply Virtual Patching & WAF Rule",
      "Change Admin Password",
      "Disable Website",
    ],
    correct: 1,
    reason:
      "A Web Application Firewall rule can block the exploit pattern even before an official patch is available.",
  },
  {
    type: "CREDENTIAL DUMP",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🗝️",
    desc: "Admin password hashes extracted from memory via Mimikatz.",
    ip: "192.168.1.200",
    pts: 300,
    options: [
      "Change Passwords Later",
      "Force Reset All Credentials & Enable MFA",
      "Scan with Antivirus",
      "Restart AD",
    ],
    correct: 1,
    reason:
      "Forcing credential reset invalidates stolen hashes. MFA ensures valid credentials still need a second factor.",
  },
];

const PRIORITY_COLORS = {
  CRITICAL: "var(--red)",
  HIGH: "var(--orange)",
  MEDIUM: "var(--gold)",
};

// ── Single threat card with A/B/C/D response ──────────────────────────────
function ThreatCard({ threat, onAnswer }) {
  const [chosen, setChosen] = useState(null);

  const pick = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    const ok = idx === threat.correct;
    // Show result for 2s then report back
    setTimeout(() => onAnswer(ok), 2000);
  };

  return (
    <div
      style={{
        background: `${threat.color}0d`,
        border: `2px solid ${threat.color}`,
        borderRadius: 12,
        padding: "14px",
        animation: "fadeIn .35s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>{threat.icon}</span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: threat.color,
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              {threat.type}
            </div>
            <span
              style={{
                fontSize: 9,
                padding: "1px 7px",
                borderRadius: 10,
                background: `${PRIORITY_COLORS[threat.priority]}15`,
                border: `1px solid ${PRIORITY_COLORS[threat.priority]}`,
                color: PRIORITY_COLORS[threat.priority],
                fontFamily: "var(--font-head)",
                letterSpacing: 1,
              }}
            >
              {threat.priority}
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-head)",
            color: threat.color,
            fontSize: 12,
          }}
        >
          +{threat.pts}
        </span>
      </div>

      {/* Info */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "var(--text-dim)",
          marginBottom: 5,
        }}
      >
        {threat.ip}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text)",
          lineHeight: 1.45,
          marginBottom: 10,
        }}
      >
        {threat.desc}
      </div>

      {/* Life bar */}
      <div
        style={{
          height: 3,
          background: "rgba(0,0,0,.3)",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(threat.life / threat.maxLife) * 100}%`,
            background: threat.color,
            transition: "width 0.5s linear",
          }}
        />
      </div>

      {/* Response options */}
      {chosen === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div
            style={{
              fontSize: 9,
              color: "var(--text-dim)",
              fontFamily: "var(--font-head)",
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            CHOOSE RESPONSE:
          </div>
          {threat.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              style={{
                padding: "6px 10px",
                background: "rgba(0,0,0,.3)",
                border: `1px solid ${threat.color}50`,
                color: "var(--text)",
                fontSize: 11,
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${threat.color}20`;
                e.currentTarget.style.borderColor = threat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,.3)";
                e.currentTarget.style.borderColor = `${threat.color}50`;
              }}
            >
              <span
                style={{
                  color: threat.color,
                  fontFamily: "var(--font-head)",
                  fontSize: 10,
                  marginRight: 6,
                }}
              >
                {["A", "B", "C", "D"][i]}
              </span>
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: 11,
            padding: "8px 10px",
            borderRadius: 7,
            background:
              chosen === threat.correct
                ? "rgba(0,230,118,.12)"
                : "rgba(255,23,68,.12)",
            border: `1px solid ${chosen === threat.correct ? "var(--green)" : "var(--red)"}`,
            color: chosen === threat.correct ? "var(--green)" : "var(--red)",
            lineHeight: 1.5,
          }}
        >
          {chosen === threat.correct
            ? `✅ Correct! ${threat.reason}`
            : `❌ Wrong. Correct: "${threat.options[threat.correct]}". ${threat.reason}`}
        </div>
      )}
    </div>
  );
}

// ── Main Level 4 ───────────────────────────────────────────────────────────
export default function Level4() {
  const [threats, setThreats] = useState([]); // active threat cards
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [missed, setMissed] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(70);
  const [gameOver, setGameOver] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  const uidRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const blockedRef = useRef(0);
  const missedRef = useRef(0);
  const gameOverRef = useRef(false);

  // ── Spawn a threat every 3 seconds ────────────────────────────────────
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      if (gameOverRef.current) return;
      setThreats((prev) => {
        if (prev.length >= 4) return prev; // max 4 visible at once
        const pick =
          THREAT_POOL[Math.floor(Math.random() * THREAT_POOL.length)];
        const maxLife = 10;
        return [
          ...prev,
          { ...pick, uid: uidRef.current++, life: maxLife, maxLife },
        ];
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [gameOver]);

  // ── Drain life bar on active threats every 500ms ──────────────────────
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      if (gameOverRef.current) return;
      setThreats((prev) => {
        const alive = [];
        let drain = 0;
        let newMissed = 0;
        prev.forEach((t) => {
          const newLife = t.life - 0.5;
          if (newLife <= 0) {
            // Threat expired without response
            drain +=
              t.priority === "CRITICAL" ? 18 : t.priority === "HIGH" ? 10 : 5;
            newMissed++;
          } else {
            alive.push({ ...t, life: newLife });
          }
        });
        if (drain > 0) {
          healthRef.current = Math.max(0, healthRef.current - drain);
          setHealth(Math.round(healthRef.current));
          missedRef.current += newMissed;
          setMissed(missedRef.current);
          if (healthRef.current <= 0 && !gameOverRef.current) {
            gameOverRef.current = true;
            setGameOver(true);
            setTimeout(() => setShowReport(true), 300);
          }
        }
        return alive;
      });
    }, 500);
    return () => clearInterval(iv);
  }, [gameOver]);

  // ── Game countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      if (!gameOverRef.current) {
        gameOverRef.current = true;
        setGameOver(true);
        setTimeout(() => setShowReport(true), 300);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  // ── Submit when report shown ───────────────────────────────────────────
  useEffect(() => {
    if (!showReport) return;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const total = blockedRef.current + missedRef.current;
    const accuracy = total > 0 ? (blockedRef.current / total) * 100 : 0;
    api
      .post("/game/level/submit", {
        level: 4,
        score: scoreRef.current,
        accuracy,
        time_taken: timeTaken,
        difficulty: "agent",
      })
      .then(({ data }) => setResult(data))
      .catch(() =>
        setResult({
          xp_earned: 0,
          new_level: 1,
          achievements_unlocked: [],
          level_up: false,
          new_total_xp: 0,
          new_total_score: 0,
        }),
      );
  }, [showReport]);

  // ── Handle player response ─────────────────────────────────────────────
  const handleAnswer = (uid, pts, isCorrect) => {
    // Remove the answered threat
    setThreats((prev) => prev.filter((t) => t.uid !== uid));

    if (isCorrect) {
      scoreRef.current += pts;
      blockedRef.current++;
      setScore(scoreRef.current);
      setBlocked(blockedRef.current);
    } else {
      // Wrong answer: drain health
      const penalty = 10;
      healthRef.current = Math.max(0, healthRef.current - penalty);
      setHealth(Math.round(healthRef.current));
      setWrong((w) => w + 1);
      if (healthRef.current <= 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        setGameOver(true);
        setTimeout(() => setShowReport(true), 300);
      }
    }
  };

  const healthColor =
    health > 70 ? "var(--green)" : health > 40 ? "var(--gold)" : "var(--red)";
  const timerColor =
    timeLeft <= 15 ? "var(--red)" : timeLeft <= 30 ? "var(--gold)" : "#ff9100";
  const grade =
    health >= 90 && wrong === 0
      ? "S"
      : health >= 70
        ? "A"
        : health >= 50
          ? "B"
          : "C";
  const gradeColor =
    grade === "S"
      ? "var(--gold)"
      : grade === "A"
        ? "var(--green)"
        : grade === "B"
          ? "var(--accent)"
          : "var(--red)";

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={4} />}

      {/* End Report */}
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
              border: `1px solid ${health > 0 ? "var(--accent)" : "var(--red)"}`,
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
                color: gradeColor,
                marginBottom: 8,
              }}
            >
              {grade}
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: health > 0 ? "var(--green)" : "var(--red)",
                fontSize: 18,
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              {health > 0 ? "NETWORK DEFENDED" : "SYSTEM BREACHED"}
            </div>
            <div
              style={{
                color: "var(--text-dim)",
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              Network Guardian — Mission Report
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
                  label: "Attacks Blocked",
                  val: blocked,
                  color: "var(--green)",
                },
                { label: "Threats Missed", val: missed, color: "var(--red)" },
                {
                  label: "Wrong Responses",
                  val: wrong,
                  color: "var(--orange)",
                },
                {
                  label: "Network Health",
                  val: `${health}%`,
                  color: healthColor,
                },
                {
                  label: "Score",
                  val: scoreRef.current.toLocaleString(),
                  color: "var(--gold)",
                },
                { label: "Security Grade", val: grade, color: gradeColor },
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
                      fontSize: 20,
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
            {!result && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  animation: "pulse 1.5s infinite",
                }}
              >
                Submitting score...
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: "20px 28px", maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-head)",
                color: "#ff9100",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              🌐 LEVEL 4 — NETWORK GUARDIAN
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 3 }}
            >
              Choose the correct response to neutralize each threat!
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 34,
              color: timerColor,
              textShadow: timeLeft <= 10 ? "0 0 15px var(--red)" : "none",
              transition: "color .3s",
            }}
          >
            {String(timeLeft).padStart(2, "0")}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {[
            {
              label: "SCORE",
              val: score.toLocaleString(),
              color: "var(--gold)",
            },
            { label: "BLOCKED", val: blocked, color: "var(--green)" },
            { label: "MISSED", val: missed, color: "var(--red)" },
            { label: "WRONG", val: wrong, color: "var(--orange)" },
            { label: "HEALTH", val: `${health}%`, color: healthColor },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ padding: "10px" }}
            >
              <div
                className="stat-val"
                style={{ color: s.color, fontSize: 20 }}
              >
                {s.val}
              </div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Network health bar */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "var(--text-dim)",
              fontFamily: "var(--font-head)",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            <span>NETWORK HEALTH</span>
            <span style={{ color: healthColor }}>{health}%</span>
          </div>
          <div
            style={{
              height: 10,
              background: "var(--border)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${health}%`,
                background: healthColor,
                borderRadius: 5,
                transition: "width .4s ease, background .4s",
                boxShadow: `0 0 8px ${healthColor}`,
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>
            {health > 70
              ? "🛡️ Network Stable"
              : health > 40
                ? "⚠️ Network Under Stress"
                : "🚨 CRITICAL — Network Failing!"}
          </div>
        </div>

        {/* Threats area */}
        <div
          style={{
            background: "rgba(0,0,0,.3)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px",
            minHeight: 320,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--text-dim)",
              letterSpacing: 2,
              fontFamily: "var(--font-head)",
              marginBottom: 12,
            }}
          >
            🖧 INCIDENT RESPONSE CENTER —{" "}
            {threats.length > 0
              ? `${threats.length} ACTIVE INCIDENT${threats.length > 1 ? "S" : ""}`
              : "MONITORING..."}
          </div>

          {threats.length === 0 && !gameOver && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                textAlign: "center",
                color: "var(--text-dim)",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🛡️</div>
              <div style={{ fontSize: 14 }}>Network monitoring active...</div>
              <div style={{ fontSize: 11, marginTop: 5 }}>
                Incidents incoming
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 12,
            }}
          >
            {threats.map((t) => (
              <ThreatCard
                key={t.uid}
                threat={t}
                onAnswer={(isCorrect) => handleAnswer(t.uid, t.pts, isCorrect)}
              />
            ))}
          </div>
        </div>

        {/* Priority legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 10,
            fontSize: 11,
            color: "var(--text-dim)",
          }}
        >
          {[
            ["CRITICAL", "var(--red)"],
            ["HIGH", "var(--orange)"],
            ["MEDIUM", "var(--gold)"],
          ].map(([p, c]) => (
            <span key={p}>
              <span style={{ color: c }}>●</span> {p}
            </span>
          ))}
          <span style={{ marginLeft: "auto" }}>First incident in ~3s</span>
        </div>
      </div>
    </div>
  );
}
