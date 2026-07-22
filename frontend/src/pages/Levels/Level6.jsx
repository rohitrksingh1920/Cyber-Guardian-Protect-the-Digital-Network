import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import ResultModal from "../../components/ResultModal";
import SystemBreach from "../../components/SystemBreach";
import api from "../../services/api";
import { markLevelPassed, markLevelFailed, isLevelUnlocked } from "./LevelGate";

const TASKS = [
  {
    id: "firewall",
    label: "Enable Firewall",
    icon: "🔥",
    desc: "Block all unauthorized inbound connections on all ports",
    color: "#ff1744",
    points: 300,
    duration: 4,
  },
  {
    id: "block_ip",
    label: "Block Attacker IPs",
    icon: "🚫",
    desc: "Blacklist 185.220.101.47 and related IPs across all nodes",
    color: "#ff9100",
    points: 250,
    duration: 3,
  },
  {
    id: "patch",
    label: "Patch Zero-Day CVE",
    icon: "🩹",
    desc: "Emergency patch for CVE-2024-1337 across all servers",
    color: "#e040fb",
    points: 400,
    duration: 5,
  },
  {
    id: "encrypt",
    label: "Encrypt All Data",
    icon: "🔐",
    desc: "AES-256 encrypt all sensitive database files and sessions",
    color: "#00b8ff",
    points: 350,
    duration: 5,
  },
  {
    id: "isolate",
    label: "Isolate Node-03",
    icon: "🌐",
    desc: "Sever Node-03 from main grid — ransomware containment",
    color: "#ffd600",
    points: 300,
    duration: 3,
  },
  {
    id: "backup",
    label: "Emergency Backup",
    icon: "💾",
    desc: "Snapshot all critical servers to cold-storage offsite",
    color: "#00e676",
    points: 200,
    duration: 4,
  },
];

const LOGS = [
  "⚠️  [ALERT] DDoS attack detected from 185.220.101.47",
  "🔴 [CRITICAL] Ransomware spreading on Node-03",
  "⚡ [INFO] 47,200 requests/sec flooding the network",
  "💀 [DANGER] Attacker attempting privilege escalation",
  "📡 [ALERT] Data exfiltration attempt on /etc/passwd",
  "🔓 [WARNING] Firewall rules bypassed on port 8080",
  "🦠 [CRITICAL] Malware injected into web server process",
  "📊 [INFO] 3 additional attack vectors detected",
];

// Pass = complete at least 5 out of 6 tasks before time runs out
const PASS_REQ = { correct: 5, total: 6 };

export default function Level6() {
  const navigate = useNavigate();
  const [tasks] = useState(() => [...TASKS].sort(() => Math.random() - 0.5));
  const [completed, setCompleted] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [running, setRunning] = useState(null);
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
  const [showOutcome, setShowOutcome] = useState(false);
  const [result, setResult] = useState(null); // only set on PASS
  const [failed, setFailed] = useState(false); // only set on FAIL
  const [startTime] = useState(Date.now());

  const logRef = useRef(null);
  const scoreRef = useRef(0);
  const completedRef = useRef(new Set());
  const logIdx = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isLevelUnlocked(6)) navigate("/levels");
  }, []);

  const addLog = (msg, cls = "info") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLogs((prev) => [...prev.slice(-40), { msg: `${ts} ${msg}`, cls }]);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  // Countdown timer
  useEffect(() => {
    if (gameOver) return;
    if (timer <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        setGameOver(true);
        endGame(false);
      }
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, gameOver]);

  // Rolling attack log
  useEffect(() => {
    if (gameOver) return;
    const iv = setInterval(() => {
      addLog(
        LOGS[logIdx.current % LOGS.length],
        logIdx.current % 2 === 0 ? "crit" : "warn",
      );
      logIdx.current++;
    }, 2800);
    return () => clearInterval(iv);
  }, [gameOver]);

  // Check victory when all tasks done
  useEffect(() => {
    if (completedRef.current.size === tasks.length && !doneRef.current) {
      addLog(
        "[SYSTEM] All attack vectors neutralized! Network secured. 🛡️",
        "ok",
      );
      doneRef.current = true;
      setGameOver(true);
      setTimeout(() => endGame(true), 800);
    }
  }, [completed]);

  const doTask = (task) => {
    if (completed.has(task.id) || gameOver || running) return;
    setRunning(task.id);
    addLog(`[ACTION] Executing: ${task.label}...`, "warn");
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
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (completedRef.current.size / tasks.length) * 100;
    const passed = completedRef.current.size >= PASS_REQ.correct && won;

    setVictory(passed);
    setShowOutcome(true);

    if (!passed) {
      // ── FAIL path ── mark failed, then show SystemBreach (NOT ResultModal)
      markLevelFailed(6);
      setTimeout(() => {
        setShowOutcome(false);
        setFailed(true);
      }, 3000);
      return;
    }

    // ── PASS path ── mark passed, submit to backend, show ResultModal
    markLevelPassed(6);
    try {
      const { data } = await api.post("/game/level/submit", {
        level: 6,
        score: scoreRef.current,
        accuracy,
        time_taken: timeTaken,
        difficulty: "agent",
      });
      // Only set result (shows ResultModal) when PASSED
      setTimeout(() => {
        setShowOutcome(false);
        setResult(data);
      }, 2000);
    } catch {
      setTimeout(() => {
        setShowOutcome(false);
        setResult({
          xp_earned: 0,
          new_level: 1,
          achievements_unlocked: [],
          level_up: false,
          new_total_xp: 0,
          new_total_score: 0,
        });
      }, 2000);
    }
  };

  const pct = (completed.size / tasks.length) * 100;
  const defColor =
    pct < 40 ? "var(--red)" : pct < 70 ? "var(--gold)" : "var(--green)";
  const timerColor =
    timer <= 20 ? "var(--red)" : timer <= 40 ? "var(--gold)" : "var(--accent)";

  // ── FAILED screen (fixes Mission Complete showing after breach) ─────────
  if (failed)
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <SystemBreach
          levelNum={6}
          reason={`You completed ${completedRef.current.size} out of ${tasks.length} defense tasks. Need at least ${PASS_REQ.correct} to secure the network.`}
          correct={completedRef.current.size}
          required={PASS_REQ.correct}
          total={PASS_REQ.total}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />

      {/* ResultModal ONLY shown when passed=true */}
      {result && <ResultModal result={result} levelNum={6} />}

      {/* Win/Lose intermediate overlay */}
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
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: "Tasks Completed",
                  val: `${completed.size}/${tasks.length}`,
                  color:
                    completed.size >= PASS_REQ.correct
                      ? "var(--green)"
                      : "var(--red)",
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
                {
                  label: "Result",
                  val: victory ? "PASSED" : "FAILED",
                  color: victory ? "var(--green)" : "var(--red)",
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
                      fontSize: 18,
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
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                animation: "pulse 1.5s infinite",
              }}
            >
              {victory ? "Collecting XP..." : "Processing result..."}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 28px", maxWidth: 1040, margin: "0 auto" }}>
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
              Complete defense tasks before time runs out!
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
                textShadow: timer <= 20 ? "0 0 15px var(--red)" : "none",
                transition: "color .3s",
                animation: timer <= 10 ? "blink 1s infinite" : "",
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
            🎯 Complete ≥ {PASS_REQ.correct}/{PASS_REQ.total} tasks to pass
          </span>
          <span
            style={{
              color:
                completed.size >= PASS_REQ.correct
                  ? "var(--green)"
                  : "var(--text-dim)",
            }}
          >
            ✅ {completed.size} done
          </span>
        </div>

        {/* Dual bars */}
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
                {completed.size}/{tasks.length}
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
              <span>TIME REMAINING</span>
              <span style={{ color: timerColor }}>{timer}s</span>
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
                  width: `${(timer / 120) * 100}%`,
                  background: timerColor,
                  transition: "width 1s linear",
                  boxShadow: `0 0 8px ${timerColor}`,
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}
        >
          {/* Tasks */}
          <div>
            <div className="section-label">
              DEFENSE TASKS — CLICK TO EXECUTE
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
                    }}
                    onMouseEnter={(e) => {
                      if (!isDone && !running)
                        e.currentTarget.style.borderColor = task.color;
                    }}
                    onMouseLeave={(e) => {
                      if (!isDone && !running)
                        e.currentTarget.style.borderColor = "var(--border)";
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
                      {isRunning && (
                        <div
                          style={{
                            height: 3,
                            background: "var(--border)",
                            borderRadius: 2,
                            overflow: "hidden",
                            marginTop: 8,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${prog}%`,
                              background: task.color,
                              transition: "width 1s linear",
                              boxShadow: `0 0 6px ${task.color}`,
                            }}
                          />
                        </div>
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
              <div className="section-label">ATTACK LOG</div>
              <div
                ref={logRef}
                style={{
                  background: "rgba(0,0,0,.55)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px",
                  height: 260,
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
                ["Encryption", completed.has("encrypt")],
                ["Network", completed.has("isolate")],
                ["Backup", completed.has("backup")],
                ["IP Blocked", completed.has("block_ip")],
                ["CVE Patched", completed.has("patch")],
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
