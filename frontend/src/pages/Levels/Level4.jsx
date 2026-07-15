import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import api from "../../services/api";

// Each threat now has multiple response options — only one correct
const THREATS = [
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
    correctReason:
      "Rate limiting and traffic scrubbing filters malicious packets while keeping legitimate traffic flowing.",
    wrongPenalty: 15,
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
    correctReason:
      "Input sanitization removes or escapes malicious SQL characters before they reach the database query.",
    wrongPenalty: 20,
  },
  {
    type: "BRUTE FORCE",
    color: "#ff9100",
    priority: "HIGH",
    icon: "🔨",
    desc: "12,000 SSH login attempts/minute from single IP.",
    ip: "198.51.100.5",
    pts: 200,
    options: [
      "Lock Account & Block IP",
      "Disable SSH",
      "Increase Password Length",
      "Restart Router",
    ],
    correct: 0,
    correctReason:
      "Locking the account and blacklisting the source IP immediately stops the attack without disrupting legitimate users.",
    wrongPenalty: 10,
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
    correctReason:
      "Encrypting all channels with HTTPS/TLS means intercepted traffic is unreadable to the attacker.",
    wrongPenalty: 15,
  },
  {
    type: "RANSOMWARE",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🔒",
    desc: "File encryption starting on Node-03 /var/data. Spreading fast.",
    ip: "10.10.10.88",
    pts: 350,
    options: [
      "Pay the Ransom",
      "Delete All Files",
      "Isolate & Quarantine System",
      "Run Antivirus Scan",
    ],
    correct: 2,
    correctReason:
      "Immediate isolation stops the ransomware spreading to other systems. Then restore from clean backups.",
    wrongPenalty: 25,
  },
  {
    type: "ZERO-DAY EXPLOIT",
    color: "#e040fb",
    priority: "CRITICAL",
    icon: "⚡",
    desc: "CVE-2024-1337 being exploited in Apache server. Patch not yet public.",
    ip: "45.33.32.156",
    pts: 350,
    options: [
      "Reboot the Server",
      "Apply Virtual Patching & WAF Rule",
      "Change Admin Password",
      "Disable the Website",
    ],
    correct: 1,
    correctReason:
      "A Web Application Firewall rule can block the exploit pattern even before an official patch is available.",
    wrongPenalty: 20,
  },
  {
    type: "PORT SCAN",
    color: "#ff9100",
    priority: "MEDIUM",
    icon: "🔍",
    desc: "Stealth SYN scan across all 65535 TCP ports. Reconnaissance phase.",
    ip: "10.0.0.55",
    pts: 150,
    options: [
      "Close Unused Ports & Enable Firewall",
      "Restart Network",
      "Block Port 22 Only",
      "Alert the Team",
    ],
    correct: 0,
    correctReason:
      "Closing unused ports removes the attack surface. A firewall rule drops unsolicited SYN packets from that IP.",
    wrongPenalty: 8,
  },
  {
    type: "CREDENTIAL DUMP",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🗝️",
    desc: "Admin password hashes being extracted from memory via Mimikatz.",
    ip: "192.168.1.200",
    pts: 300,
    options: [
      "Change Passwords Later",
      "Force Reset All Credentials & Enable MFA",
      "Scan with Antivirus",
      "Restart Active Directory",
    ],
    correct: 1,
    correctReason:
      "Forcing immediate credential reset invalidates stolen hashes. MFA ensures even valid credentials require a second factor.",
    wrongPenalty: 20,
  },
];

const PRIORITY_COLORS = {
  CRITICAL: "var(--red)",
  HIGH: "var(--orange)",
  MEDIUM: "var(--gold)",
};

function ThreatCard({ threat, onRespond }) {
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleChoose = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    setRevealed(true);
    const isCorrect = idx === threat.correct;
    setTimeout(
      () => onRespond(isCorrect, threat.pts, threat.wrongPenalty),
      2000,
    );
  };

  return (
    <div
      style={{
        background: `${threat.color}0e`,
        border: `2px solid ${threat.color}`,
        borderRadius: 12,
        padding: "16px",
        animation: "slideInRight .3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>{threat.icon}</span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: threat.color,
                fontSize: 12,
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
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "var(--text-dim)",
          marginBottom: 6,
        }}
      >
        {threat.ip}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text)",
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        {threat.desc}
      </div>

      {/* Multiple choice response */}
      {!revealed ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div
            style={{
              fontSize: 10,
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
              onClick={() => handleChoose(i)}
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
          }}
        >
          {chosen === threat.correct
            ? `✅ Correct! ${threat.correctReason}`
            : `❌ Wrong. Correct: ${threat.options[threat.correct]}. ${threat.correctReason}`}
        </div>
      )}
    </div>
  );
}

export default function Level4() {
  const [active, setActive] = useState([]);
  const [networkHealth, setNetworkHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [missed, setMissed] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(70);
  const [showReport, setShowReport] = useState(false);
  const [startTime] = useState(Date.now());
  const nextId = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const blockedRef = useRef(0);
  const missedRef = useRef(0);
  const usedIds = useRef(new Set());

  // Spawn with increasing difficulty
  useEffect(() => {
    if (gameOver) return;
    const spawnRate = timeLeft > 50 ? 3500 : timeLeft > 25 ? 2500 : 1800;
    const maxActive = timeLeft > 50 ? 2 : timeLeft > 25 ? 4 : 6;
    const iv = setInterval(() => {
      const available = THREATS.filter((t) => !usedIds.current.has(t.type));
      if (available.length === 0) return;
      setActive((prev) => {
        if (prev.length >= maxActive) return prev;
        const t = available[Math.floor(Math.random() * available.length)];
        usedIds.current.add(t.type);
        setTimeout(() => usedIds.current.delete(t.type), 15000);
        return [...prev, { ...t, uid: nextId.current++ }];
      });
    }, spawnRate);
    return () => clearInterval(iv);
  }, [gameOver, timeLeft]);

  // Life drain for unresponded threats
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      setActive((prev) => {
        const expiring = prev.filter((t) => (t.lifeMs || 8000) <= 500);
        expiring.forEach((t) => {
          missedRef.current++;
          setMissed(missedRef.current);
          const drain =
            t.priority === "CRITICAL" ? 20 : t.priority === "HIGH" ? 12 : 7;
          healthRef.current = Math.max(0, healthRef.current - drain);
          setNetworkHealth(healthRef.current);
          if (healthRef.current <= 0) endGame();
        });
        return prev
          .map((t) => ({ ...t, lifeMs: (t.lifeMs || 8000) - 500 }))
          .filter((t) => (t.lifeMs || 8000) > 0);
      });
    }, 500);
    return () => clearInterval(iv);
  }, [gameOver]);

  // Game timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  const handleRespond = (uid, isCorrect, pts, penalty) => {
    setActive((prev) => prev.filter((t) => t.uid !== uid));
    if (isCorrect) {
      scoreRef.current += pts;
      setScore(scoreRef.current);
      blockedRef.current++;
      setBlocked(blockedRef.current);
    } else {
      setWrongAnswers((w) => w + 1);
      healthRef.current = Math.max(0, healthRef.current - penalty);
      setNetworkHealth(healthRef.current);
      if (healthRef.current <= 0) endGame();
    }
  };

  const endGame = async () => {
    if (gameOver) return;
    setGameOver(true);
    setShowReport(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const total = blockedRef.current + missedRef.current;
    const accuracy = total > 0 ? (blockedRef.current / total) * 100 : 0;
    setTimeout(async () => {
      try {
        const { data } = await api.post("/game/level/submit", {
          level: 4,
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
    }, 2500);
  };

  const healthColor =
    networkHealth > 70
      ? "var(--green)"
      : networkHealth > 40
        ? "var(--gold)"
        : "var(--red)";
  const grade =
    networkHealth >= 90 && wrongAnswers === 0
      ? "S"
      : networkHealth >= 70
        ? "A"
        : networkHealth >= 50
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
              border: "1px solid var(--accent)",
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
                color: "var(--accent)",
                fontSize: 18,
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              {networkHealth > 0 ? "NETWORK DEFENDED" : "SYSTEM BREACHED"}
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
                  val: wrongAnswers,
                  color: "var(--orange)",
                },
                {
                  label: "Network Health",
                  val: `${networkHealth}%`,
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
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                animation: "pulse 1.5s infinite",
              }}
            >
              Submitting score...
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 28px", maxWidth: 1020, margin: "0 auto" }}>
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
              color:
                timeLeft <= 15
                  ? "var(--red)"
                  : timeLeft <= 30
                    ? "var(--gold)"
                    : "#ff9100",
              transition: "color .3s",
              textShadow: timeLeft <= 10 ? "0 0 15px var(--red)" : "none",
            }}
          >
            {String(timeLeft).padStart(2, "0")}
          </div>
        </div>

        {/* Stats row */}
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
              val: scoreRef.current.toLocaleString(),
              color: "var(--gold)",
            },
            { label: "BLOCKED", val: blocked, color: "var(--green)" },
            { label: "MISSED", val: missed, color: "var(--red)" },
            { label: "WRONG", val: wrongAnswers, color: "var(--orange)" },
            { label: "HEALTH", val: `${networkHealth}%`, color: healthColor },
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

        {/* Network Health Bar */}
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
            <span style={{ color: healthColor }}>{networkHealth}%</span>
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
                width: `${networkHealth}%`,
                background: healthColor,
                borderRadius: 5,
                transition: "width .5s ease, background .5s",
                boxShadow: `0 0 10px ${healthColor}`,
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>
            {networkHealth > 70
              ? "🛡️ Network Stable"
              : networkHealth > 40
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
            minHeight: 300,
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
            {active.length > 0
              ? `${active.length} ACTIVE INCIDENTS`
              : "MONITORING..."}
          </div>
          {active.length === 0 && !gameOver && (
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
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
              <div>Network monitoring active...</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
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
            {active.map((t) => (
              <ThreatCard
                key={t.uid}
                threat={t}
                onRespond={(ok, pts, pen) => handleRespond(t.uid, ok, pts, pen)}
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
          <span style={{ marginLeft: "auto", color: "var(--text-dim)" }}>
            Scroll for more incidents
          </span>
        </div>
      </div>
    </div>
  );
}
