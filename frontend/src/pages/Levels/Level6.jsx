import { useState, useEffect, useRef } from "react";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import api from "../../services/api";

const ALL_TASKS = [
  {
    id: "firewall",
    label: "Enable Firewall",
    icon: "🔥",
    desc: "Deploy WAF — block all unauthorized inbound traffic on all ports",
    color: "#ff1744",
    points: 300,
    duration: 4,
    drainRate: 15,
    protects: "DDoS, Port Scan, Unauthorized Access",
  },
  {
    id: "block_ip",
    label: "Block Attacker IPs",
    icon: "🚫",
    desc: "Blacklist 185.220.101.47 and related IPs on all network nodes",
    color: "#ff9100",
    points: 250,
    duration: 3,
    drainRate: 10,
    protects: "Direct Attacks, Reconnaissance",
  },
  {
    id: "patch",
    label: "Patch Zero-Day CVE",
    icon: "🩹",
    desc: "Emergency patch for CVE-2024-1337 across all servers and APIs",
    color: "#e040fb",
    points: 400,
    duration: 5,
    drainRate: 20,
    protects: "Exploit Attacks, Privilege Escalation",
  },
  {
    id: "encrypt",
    label: "Encrypt All Data",
    icon: "🔐",
    desc: "AES-256 encrypt user records, payment data, and session tokens",
    color: "#00b8ff",
    points: 350,
    duration: 5,
    drainRate: 12,
    protects: "Data Exfiltration, Theft",
  },
  {
    id: "isolate",
    label: "Isolate Node-03",
    icon: "🌐",
    desc: "Sever Node-03 from main grid — ransomware containment protocol",
    color: "#ffd600",
    points: 300,
    duration: 3,
    drainRate: 18,
    protects: "Ransomware Spread, Lateral Movement",
  },
  {
    id: "backup",
    label: "Emergency Backup",
    icon: "💾",
    desc: "Snapshot all critical servers and databases to cold-storage offsite",
    color: "#00e676",
    points: 200,
    duration: 4,
    drainRate: 8,
    protects: "Data Loss, Ransomware",
  },
];

const ATTACK_EVENTS = [
  {
    msg: "[CRITICAL] DDoS flood — 2.8 Gbps on port 443. CDN failing.",
    cls: "crit",
    taskId: "firewall",
  },
  {
    msg: "[DANGER] Ransomware encrypting /var/data/users/ on Node-03.",
    cls: "crit",
    taskId: "isolate",
  },
  {
    msg: "[ALERT] Privilege escalation via CVE-2024-1337 — root gained.",
    cls: "warn",
    taskId: "patch",
  },
  {
    msg: "[CRITICAL] 47 admin sessions hijacked via session token theft.",
    cls: "crit",
    taskId: "block_ip",
  },
  {
    msg: "[WARN] Lateral movement: 192.168.1.55 → 192.168.1.200 via SMB.",
    cls: "warn",
    taskId: null,
  },
  {
    msg: "[ALERT] Data exfiltration: 4.2 GB being sent to 91.108.4.100.",
    cls: "crit",
    taskId: "encrypt",
  },
  {
    msg: "[INFO] Attacker pivoting through DMZ into internal VLAN.",
    cls: "warn",
    taskId: null,
  },
  {
    msg: "[CRITICAL] Web process injected with reverse shell — port 4444.",
    cls: "crit",
    taskId: "patch",
  },
  {
    msg: "[WARN] SSH brute force: 15,000 attempts/min on 22 nodes.",
    cls: "warn",
    taskId: "block_ip",
  },
  {
    msg: "[ALERT] SSL stripping active on payment gateway.",
    cls: "crit",
    taskId: "encrypt",
  },
  {
    msg: "[INFO] SIEM detecting anomalous outbound spikes from Node-03.",
    cls: "warn",
    taskId: "isolate",
  },
  {
    msg: "[CRITICAL] Database credentials dumped from memory.",
    cls: "crit",
    taskId: "backup",
  },
];

function TaskProgressBar({ progress, color }) {
  return (
    <div
      style={{
        height: 4,
        background: "var(--border)",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: color,
          transition: "width 1s linear",
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  );
}

export default function Level6() {
  // Randomise task order every run
  const [tasks] = useState(() =>
    [...ALL_TASKS].sort(() => Math.random() - 0.5),
  );
  const [completed, setCompleted] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [running, setRunning] = useState(null);
  const [integrity, setIntegrity] = useState(100);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(120);
  const [logs, setLogs] = useState([
    {
      msg: "[ALERT] OPERATION SHADOWBYTE detected. Initiating defense protocol...",
      cls: "crit",
    },
  ]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [result, setResult] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [startTime] = useState(Date.now());
  const logRef = useRef(null);
  const scoreRef = useRef(0);
  const completedRef = useRef(new Set());
  const integrityRef = useRef(100);
  const logIdx = useRef(0);

  const addLog = (msg, cls = "info") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLogs((prev) => [...prev.slice(-40), { msg: `${ts} ${msg}`, cls }]);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    if (timer <= 0) {
      endGame(false);
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, gameOver]);

  // Integrity drain for uncompleted tasks
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      const unfinished = tasks.filter((t) => !completedRef.current.has(t.id));
      if (unfinished.length === 0) return;
      const totalDrain = unfinished.reduce((s, t) => s + t.drainRate, 0) * 0.04;
      integrityRef.current = Math.max(0, integrityRef.current - totalDrain);
      setIntegrity(Math.round(integrityRef.current));
      if (integrityRef.current <= 0) endGame(false);
    }, 1000);
    return () => clearInterval(iv);
  }, [gameOver, tasks]);

  // Rolling attack log
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      const event = ATTACK_EVENTS[logIdx.current % ATTACK_EVENTS.length];
      const alreadyHandled =
        event.taskId && completedRef.current.has(event.taskId);
      const msg = alreadyHandled
        ? `[BLOCKED] Attack neutralized by ${tasks.find((t) => t.id === event.taskId)?.label || "defense"} ✓`
        : event.msg;
      addLog(msg, alreadyHandled ? "ok" : event.cls);
      logIdx.current++;
    }, 2800);
    return () => clearInterval(iv);
  }, [gameOver, tasks]);

  // Check victory
  useEffect(() => {
    if (completedRef.current.size === tasks.length && !gameOver) {
      addLog(
        "[SYSTEM] All attack vectors neutralized! Network secured. 🛡️",
        "ok",
      );
      setTimeout(() => endGame(true), 800);
    }
  }, [completed]);

  const doTask = (task) => {
    if (completed.has(task.id) || gameOver || running) return;
    setRunning(task.id);
    addLog(`[ACTION] Initiating: ${task.label}...`, "warn");
    let prog = 0;
    const iv = setInterval(() => {
      prog += 100 / task.duration;
      setProgress((p) => ({ ...p, [task.id]: Math.min(prog, 100) }));
      if (prog >= 100) {
        clearInterval(iv);
        scoreRef.current += task.points + Math.max(0, timer) * 2;
        setScore(scoreRef.current);
        const next = new Set([...completedRef.current, task.id]);
        completedRef.current = next;
        setCompleted(new Set(next));
        setRunning(null);
        addLog(`[SUCCESS] ${task.label} — COMPLETE ✓`, "ok");
      }
    }, 1000);
  };

  const endGame = async (won) => {
    if (gameOver) return;
    setGameOver(true);
    setVictory(won);
    setShowOutcome(true);
    if (!won)
      addLog(
        `[FAILED] ${tasks.length - completedRef.current.size} tasks incomplete. System breached.`,
        "crit",
      );
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (completedRef.current.size / tasks.length) * 100;
    setTimeout(async () => {
      try {
        const { data } = await api.post("/game/level/submit", {
          level: 6,
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
    }, 2000);
  };

  const pct = (completed.size / tasks.length) * 100;
  const defColor =
    pct < 40 ? "var(--red)" : pct < 70 ? "var(--gold)" : "var(--green)";
  const intColor =
    integrity > 70
      ? "var(--green)"
      : integrity > 40
        ? "var(--gold)"
        : "var(--red)";
  const timerColor =
    timer <= 20 ? "var(--red)" : timer <= 40 ? "var(--gold)" : "var(--accent)";

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={6} />}

      {/* Win/Lose Overlay */}
      {showOutcome && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.9)",
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
              border: `1px solid ${victory ? "var(--green)" : "var(--red)"}`,
              borderRadius: 14,
              padding: "44px 52px",
              maxWidth: 500,
              width: "90%",
              textAlign: "center",
              animation: "pop .4s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: `0 0 60px ${victory ? "rgba(0,230,118,.2)" : "rgba(255,23,68,.2)"}`,
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 14 }}>
              {victory ? "🏆" : "💀"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                color: victory ? "var(--green)" : "var(--red)",
                fontSize: 22,
                letterSpacing: 2,
                marginBottom: 6,
              }}
            >
              {victory ? "NETWORK SECURED!" : "SYSTEM BREACHED"}
            </div>
            <div
              style={{
                color: "var(--text-dim)",
                fontSize: 13,
                marginBottom: 24,
              }}
            >
              {victory
                ? "All attack vectors neutralized. Company saved."
                : "Defense failed. Servers offline. Data compromised."}
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
                  label: "Tasks Completed",
                  val: `${completed.size}/${tasks.length}`,
                  color:
                    completed.size === tasks.length
                      ? "var(--green)"
                      : "var(--orange)",
                },
                {
                  label: "Defense Integrity",
                  val: `${integrity}%`,
                  color: intColor,
                },
                {
                  label: "Time Remaining",
                  val: `${timer}s`,
                  color: timerColor,
                },
                {
                  label: "Score",
                  val: scoreRef.current.toLocaleString(),
                  color: "var(--gold)",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(0,0,0,.3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontSize: 22,
                      color: s.color,
                      marginBottom: 3,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      letterSpacing: 1,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            {!victory && (
              <div
                style={{
                  background: "rgba(255,23,68,.08)",
                  border: "1px solid rgba(255,23,68,.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--red)",
                  marginBottom: 16,
                  textAlign: "left",
                }}
              >
                <strong>Incomplete tasks:</strong>{" "}
                {tasks
                  .filter((t) => !completed.has(t.id))
                  .map((t) => t.label)
                  .join(", ")}
              </div>
            )}
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

      <div style={{ padding: "20px 28px", maxWidth: 1060, margin: "0 auto" }}>
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
                color: "var(--red)",
                fontSize: 14,
                letterSpacing: 2,
              }}
            >
              💀 LEVEL 6 — OPERATION SHADOWBYTE
            </h2>
            <div
              style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 3 }}
            >
              Click tasks to execute defenses. Tasks run for a few seconds —
              plan ahead!
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: 18,
                  color: "var(--gold)",
                }}
              >
                {scoreRef.current.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--text-dim)",
                  letterSpacing: 1,
                }}
              >
                SCORE
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 36,
                color: timerColor,
                textShadow: timer <= 20 ? `0 0 15px var(--red)` : "none",
                transition: "color .3s",
                animation: timer <= 10 ? "blink 1s infinite" : "",
              }}
            >
              {String(timer).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Dual progress bars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
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
              <span>DEFENSE PROGRESS</span>
              <span style={{ color: defColor }}>
                {completed.size}/{tasks.length} tasks
              </span>
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
                  width: `${pct}%`,
                  background: defColor,
                  transition: "width .5s ease",
                  boxShadow: `0 0 8px ${defColor}`,
                }}
              />
            </div>
          </div>
          <div>
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
              <span>DEFENSE INTEGRITY</span>
              <span style={{ color: intColor }}>{integrity}%</span>
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
                  width: `${integrity}%`,
                  background: intColor,
                  transition: "width .5s ease, background .5s",
                  boxShadow: `0 0 8px ${intColor}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Status message */}
        <div
          style={{
            background:
              integrity > 70
                ? "rgba(0,230,118,.06)"
                : integrity > 40
                  ? "rgba(255,214,0,.06)"
                  : "rgba(255,23,68,.06)",
            border: `1px solid ${intColor}30`,
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 12,
            color: intColor,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ animation: "blink 1s infinite" }}>⚠️</span>
          {integrity > 70
            ? "Network holding. Continue defense tasks."
            : integrity > 40
              ? "CRITICAL: Network integrity degrading fast. Act now!"
              : "🚨 EMERGENCY: Network about to collapse! Complete remaining tasks immediately!"}
          {running && (
            <span
              style={{
                marginLeft: "auto",
                color: "var(--accent)",
                fontFamily: "var(--font-head)",
                fontSize: 10,
              }}
            >
              ⚙️ Running: {tasks.find((t) => t.id === running)?.label}...
            </span>
          )}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}
        >
          {/* Tasks */}
          <div>
            <div className="section-label">
              DEFENSE TASKS — CLICK TO EXECUTE (one at a time)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map((task) => {
                const isDone = completed.has(task.id);
                const isRunning = running === task.id;
                const prog = progress[task.id] || 0;
                const isLocked = !isDone && running && !isRunning;
                return (
                  <div
                    key={task.id}
                    onClick={() => !isLocked && doTask(task)}
                    style={{
                      background: isDone
                        ? "rgba(0,230,118,.07)"
                        : "var(--bg-card)",
                      border: `1px solid ${isDone ? "var(--green)" : isRunning ? task.color : "var(--border)"}`,
                      borderRadius: 10,
                      padding: "14px 18px",
                      cursor: isDone || running ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      transition: "var(--transition)",
                      opacity: isLocked ? 0.5 : 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isDone && !running) {
                        e.currentTarget.style.borderColor = task.color;
                        e.currentTarget.style.background = `${task.color}08`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDone && !running) {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--bg-card)";
                      }
                    }}
                  >
                    <span style={{ fontSize: 26, flexShrink: 0 }}>
                      {isDone ? "✅" : isRunning ? "⚙️" : task.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: isDone ? "var(--green)" : "var(--text)",
                          marginBottom: 3,
                        }}
                      >
                        {task.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-dim)",
                          lineHeight: 1.4,
                        }}
                      >
                        {task.desc}
                      </div>
                      {!isDone && (
                        <div
                          style={{
                            fontSize: 10,
                            color: `${task.color}90`,
                            marginTop: 3,
                          }}
                        >
                          🛡 Protects: {task.protects}
                        </div>
                      )}
                      {isRunning && (
                        <TaskProgressBar progress={prog} color={task.color} />
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-head)",
                          color: isDone ? "var(--green)" : task.color,
                          fontSize: 13,
                        }}
                      >
                        +{task.points}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                        {task.duration}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log + Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="section-label">LIVE ATTACK LOG</div>
              <div
                ref={logRef}
                style={{
                  background: "rgba(0,0,0,.55)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px",
                  height: 270,
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              >
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        log.cls === "crit"
                          ? "var(--red)"
                          : log.cls === "warn"
                            ? "var(--gold)"
                            : log.cls === "ok"
                              ? "var(--green)"
                              : "var(--text-dim)",
                      padding: "2px 0",
                      lineHeight: 1.55,
                      animation: "fadeIn .2s ease",
                    }}
                  >
                    {log.msg}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px",
              }}
            >
              <div className="section-label" style={{ marginBottom: 10 }}>
                SYSTEM STATUS
              </div>
              {[
                ["Firewall", completed.has("firewall")],
                ["IP Blocked", completed.has("block_ip")],
                ["CVE Patched", completed.has("patch")],
                ["Data Encrypted", completed.has("encrypt")],
                ["Node-03 Isolated", completed.has("isolate")],
                ["Backup Done", completed.has("backup")],
              ].map(([label, ok]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid rgba(26,53,96,.3)",
                  }}
                >
                  <span style={{ fontSize: 12 }}>{label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: ok ? "var(--green)" : "var(--red)",
                      fontFamily: "var(--font-head)",
                      letterSpacing: 1,
                    }}
                  >
                    {ok ? "● SECURED" : "● EXPOSED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
    </div>
  );
}
