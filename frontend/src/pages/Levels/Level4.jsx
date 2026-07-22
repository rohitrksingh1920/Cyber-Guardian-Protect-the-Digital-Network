import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import api from "../../services/api";
import { markLevelPassed, markLevelFailed, isLevelUnlocked } from "./LevelGate";

const THREAT_POOL = [
  {
    type: "DDoS FLOOD",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "💥",
    desc: "Volumetric attack — 3.2 Gbps flooding port 443.",
    ip: "185.220.101.47",
    pts: 150,
    options: [
      "Block IP Address",
      "Rate Limiting & Traffic Scrubbing",
      "Restart Web Server",
      "Disable HTTPS",
    ],
    correct: 1,
    reason:
      "Rate limiting filters malicious packets while keeping legitimate traffic flowing.",
  },
  {
    type: "SQL INJECTION",
    color: "#e040fb",
    priority: "CRITICAL",
    icon: "💉",
    desc: "Malicious SQL payload in login POST parameter.",
    ip: "203.0.113.10",
    pts: 150,
    options: [
      "Close All Ports",
      "Restart Database",
      "Sanitize & Validate Input",
      "Encrypt Database",
    ],
    correct: 2,
    reason:
      "Input sanitization removes malicious SQL characters before they reach the database.",
  },
  {
    type: "BRUTE FORCE",
    color: "#ff9100",
    priority: "HIGH",
    icon: "🔨",
    desc: "12,000 SSH login attempts per minute.",
    ip: "198.51.100.5",
    pts: 120,
    options: [
      "Lock Account & Block IP",
      "Disable SSH",
      "Increase Password Length",
      "Restart Router",
    ],
    correct: 0,
    reason:
      "Locking the account and blacklisting the IP immediately stops the attack.",
  },
  {
    type: "MITM ATTACK",
    color: "#00b8ff",
    priority: "HIGH",
    icon: "👀",
    desc: "ARP poisoning on subnet 192.168.1.0/24.",
    ip: "172.16.0.22",
    pts: 130,
    options: [
      "Restart Router",
      "Enable HTTPS & Encrypt Channel",
      "Block Port 80",
      "Change WiFi Password",
    ],
    correct: 1,
    reason:
      "Encrypting all channels with HTTPS/TLS means intercepted traffic is unreadable.",
  },
  {
    type: "RANSOMWARE",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🔒",
    desc: "File encryption starting on Node-03.",
    ip: "10.10.10.88",
    pts: 180,
    options: [
      "Pay the Ransom",
      "Delete All Files",
      "Isolate & Quarantine System",
      "Run Antivirus Scan",
    ],
    correct: 2,
    reason: "Immediate isolation stops ransomware spreading to other systems.",
  },
  {
    type: "PORT SCAN",
    color: "#ff9100",
    priority: "MEDIUM",
    icon: "🔍",
    desc: "Stealth SYN scan across all TCP ports.",
    ip: "10.0.0.55",
    pts: 100,
    options: [
      "Close Unused Ports & Enable Firewall",
      "Restart Network",
      "Block Port 22 Only",
      "Alert Team",
    ],
    correct: 0,
    reason:
      "Closing unused ports removes attack surface; firewall drops unsolicited SYN packets.",
  },
  {
    type: "ZERO-DAY",
    color: "#e040fb",
    priority: "CRITICAL",
    icon: "⚡",
    desc: "CVE-2024-1337 being exploited in Apache.",
    ip: "45.33.32.156",
    pts: 180,
    options: [
      "Reboot Server",
      "Apply Virtual Patching & WAF Rule",
      "Change Admin Password",
      "Disable Website",
    ],
    correct: 1,
    reason:
      "A WAF rule can block the exploit pattern even before an official patch is available.",
  },
  {
    type: "CREDENTIAL DUMP",
    color: "#ff1744",
    priority: "CRITICAL",
    icon: "🗝️",
    desc: "Admin hashes extracted via Mimikatz.",
    ip: "192.168.1.200",
    pts: 160,
    options: [
      "Change Passwords Later",
      "Force Reset All Credentials & Enable MFA",
      "Scan with Antivirus",
      "Restart AD",
    ],
    correct: 1,
    reason:
      "Force reset invalidates stolen hashes. MFA ensures credentials still need a second factor.",
  },
];

// Pass = block at least 6 out of 8 threats correctly
const PASS_REQ = { correct: 6, total: 8 };

function ThreatCard({ threat, onAnswer }) {
  const [chosen, setChosen] = useState(null);
  const pick = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    setTimeout(() => onAnswer(idx === threat.correct), 2000);
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
                background: `rgba(255,255,255,.05)`,
                border: `1px solid ${threat.color}50`,
                color: threat.color,
                fontFamily: "var(--font-head)",
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

export default function Level4() {
  const navigate = useNavigate();
  const [threats, setThreats] = useState([]);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [missed, setMissed] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(70);
  const [gameOver, setGameOver] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [startTime] = useState(Date.now());

  const uidRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const blockedRef = useRef(0);
  const missedRef = useRef(0);
  const wrongRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isLevelUnlocked(4)) navigate("/levels");
  }, []);

  // Spawn threats every 3s
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      if (doneRef.current) return;
      setThreats((prev) => {
        if (prev.length >= 4) return prev;
        const pick =
          THREAT_POOL[Math.floor(Math.random() * THREAT_POOL.length)];
        return [
          ...prev,
          { ...pick, uid: uidRef.current++, life: 10, maxLife: 10 },
        ];
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [gameOver]);

  // Drain life bars, remove expired threats
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      if (doneRef.current) return;
      setThreats((prev) => {
        let drain = 0,
          newMissed = 0;
        const alive = [];
        prev.forEach((t) => {
          const newLife = t.life - 0.5;
          if (newLife <= 0) {
            drain +=
              t.priority === "CRITICAL" ? 15 : t.priority === "HIGH" ? 10 : 5;
            newMissed++;
          } else alive.push({ ...t, life: newLife });
        });
        if (drain > 0) {
          healthRef.current = Math.max(0, healthRef.current - drain);
          setHealth(Math.round(healthRef.current));
          missedRef.current += newMissed;
          setMissed(missedRef.current);
          if (healthRef.current <= 0 && !doneRef.current) {
            doneRef.current = true;
            setGameOver(true);
            setTimeout(() => endGame(), 300);
          }
        }
        return alive;
      });
    }, 500);
    return () => clearInterval(iv);
  }, [gameOver]);

  // Countdown
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        setGameOver(true);
        setTimeout(() => endGame(), 300);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  const handleAnswer = (uid, pts, isCorrect) => {
    setThreats((prev) => prev.filter((t) => t.uid !== uid));
    if (isCorrect) {
      scoreRef.current += pts;
      blockedRef.current++;
      setScore(scoreRef.current);
      setBlocked(blockedRef.current);
    } else {
      healthRef.current = Math.max(0, healthRef.current - 10);
      setHealth(Math.round(healthRef.current));
      wrongRef.current++;
      setWrong(wrongRef.current);
      if (healthRef.current <= 0 && !doneRef.current) {
        doneRef.current = true;
        setGameOver(true);
        setTimeout(() => endGame(), 300);
      }
    }
  };

  const endGame = async () => {
    setShowReport(true);
    const total = blockedRef.current + missedRef.current;
    const accuracy = total > 0 ? (blockedRef.current / total) * 100 : 0;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const passed = blockedRef.current >= PASS_REQ.correct;

    if (!passed) {
      markLevelFailed(4);
      setTimeout(() => setFailed(true), 2500);
      return;
    }
    markLevelPassed(4);
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
  };

  const healthColor =
    health > 70 ? "var(--green)" : health > 40 ? "var(--gold)" : "var(--red)";
  const timerColor =
    timeLeft <= 15 ? "var(--red)" : timeLeft <= 30 ? "var(--gold)" : "#ff9100";

  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={4}
          reason={`You only blocked ${blockedRef.current} threats. Need at least ${PASS_REQ.correct} to secure the network.`}
          correct={blockedRef.current}
          required={PASS_REQ.correct}
          total={PASS_REQ.total}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={4} />}

      {showReport && !failed && !result && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
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
              padding: "36px 44px",
              maxWidth: 440,
              width: "90%",
              textAlign: "center",
              animation: "pop .4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: health > 0 ? "var(--green)" : "var(--red)",
                fontSize: 18,
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              {health > 0 ? "NETWORK DEFENDED" : "SYSTEM BREACHED"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                { l: "Blocked", v: blocked, c: "var(--green)" },
                { l: "Missed", v: missed, c: "var(--red)" },
                { l: "Wrong", v: wrong, c: "var(--orange)" },
                { l: "Health", v: `${health}%`, c: healthColor },
              ].map((s) => (
                <div
                  key={s.l}
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
                      color: s.c,
                      marginBottom: 3,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "var(--text-dim)",
                      letterSpacing: 1,
                    }}
                  >
                    {s.l}
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
              Processing...
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 28px", maxWidth: 1000, margin: "0 auto" }}>
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
              transition: "color .3s",
            }}
          >
            {String(timeLeft).padStart(2, "0")}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {[
            { l: "SCORE", v: score.toLocaleString(), c: "var(--gold)" },
            { l: "BLOCKED", v: blocked, c: "var(--green)" },
            { l: "MISSED", v: missed, c: "var(--red)" },
            { l: "WRONG", v: wrong, c: "var(--orange)" },
            { l: "HEALTH", v: `${health}%`, c: healthColor },
          ].map((s) => (
            <div key={s.l} className="stat-card" style={{ padding: "10px" }}>
              <div className="stat-val" style={{ color: s.c, fontSize: 20 }}>
                {s.v}
              </div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "rgba(255,214,0,.06)",
            border: "1px solid rgba(255,214,0,.2)",
            borderRadius: 8,
            padding: "8px 14px",
            marginBottom: 10,
            fontSize: 12,
            color: "var(--gold)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            🎯 Block ≥ {PASS_REQ.correct}/{PASS_REQ.total} threats correctly to
            pass
          </span>
          <span
            style={{
              color:
                blocked >= PASS_REQ.correct
                  ? "var(--green)"
                  : "var(--text-dim)",
            }}
          >
            ✅ {blocked} blocked
          </span>
        </div>

        <div style={{ marginBottom: 12 }}>
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
              height: 8,
              background: "var(--border)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${health}%`,
                background: healthColor,
                borderRadius: 4,
                transition: "width .4s ease, background .4s",
                boxShadow: `0 0 8px ${healthColor}`,
              }}
            />
          </div>
        </div>

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
              <div>Network monitoring active...</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Incidents incoming (~3s)
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
                onAnswer={(ok) => handleAnswer(t.uid, t.pts, ok)}
              />
            ))}
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
}
