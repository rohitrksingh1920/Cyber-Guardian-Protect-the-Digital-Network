import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import {
  isLevelUnlocked,
  isLevelPassed,
  getAllLevelStatuses,
} from "./Levels/LevelGate";

const LEVELS = [
  {
    id: 1,
    name: "Personal Device Security",
    icon: "💻",
    color: "#00b8ff",
    desc: "Password safety, 2FA, safe browsing, phishing awareness.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
  {
    id: 2,
    name: "Email & Communication",
    icon: "📧",
    color: "#00e676",
    desc: "Detect phishing emails, malicious links, secure comms.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
  {
    id: 3,
    name: "Malware Defense System",
    icon: "🦠",
    color: "#ffd600",
    desc: "Viruses, malware detection, antivirus tools.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
  {
    id: 4,
    name: "Network Security Ops",
    icon: "🌐",
    color: "#ff9100",
    desc: "Firewalls, intrusion detection, suspicious activity.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
  {
    id: 5,
    name: "Advanced Cyber Defense",
    icon: "🔐",
    color: "#e040fb",
    desc: "Encryption, ciphers, data protection.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
  {
    id: 6,
    name: "Global Attack Simulation",
    icon: "💀",
    color: "#ff1744",
    desc: "Coordinate all defenses to survive a full-scale attack.",
    mechanic: "10 Random Questions",
    req: "6/10 correct (60%)",
  },
];

export default function LevelSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const statuses = getAllLevelStatuses();
  const numPassed = statuses.filter((s) => s.passed).length;

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .35s ease" }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD" />
      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 26,
              color: "var(--accent)",
              letterSpacing: 3,
            }}
          >
            SELECT MISSION
          </h1>
          <p style={{ color: "var(--text-dim)", marginTop: 8 }}>
            Score 60%+ on each level to unlock the next one
          </p>
        </div>

        {user && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: 2,
              }}
            >
              OVERALL PROGRESS
            </span>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div className="progress-track">
                <div
                  className="progress-fill pf-accent"
                  style={{ width: `${(numPassed / 6) * 100}%` }}
                />
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-head)",
                color: "var(--accent)",
                fontSize: 12,
              }}
            >
              {numPassed} / 6 Passed
            </span>
          </div>
        )}

        {/* 60% rule banner */}
        <div
          style={{
            background: "rgba(0,184,255,.07)",
            border: "1px solid rgba(0,184,255,.25)",
            borderRadius: 8,
            padding: "9px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--accent)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span>🎯</span>
          <span>
            <strong>60% Rule:</strong> Answer 6 out of 10 questions correctly to
            unlock the next level. Failing resets forward progress — you must
            retry from this level.
          </span>
        </div>

        <div className="grid-3">
          {LEVELS.map((lvl, i) => {
            const s = statuses.find((x) => x.level === lvl.id);
            const unlocked = s?.unlocked;
            const passed = s?.passed;
            return (
              <div
                key={lvl.id}
                onClick={() => unlocked && navigate(`/level/${lvl.id}`)}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${passed ? lvl.color : unlocked ? `${lvl.color}50` : "var(--border)"}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  transition: "all .25s",
                  position: "relative",
                  overflow: "hidden",
                  opacity: unlocked ? 1 : 0.5,
                  boxShadow: passed ? `0 0 20px ${lvl.color}20` : "none",
                  animation: `fadeIn .4s ${i * 0.07}s ease both`,
                }}
                onMouseEnter={(e) => {
                  if (unlocked) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 8px 30px ${lvl.color}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = passed
                    ? `0 0 20px ${lvl.color}20`
                    : "";
                }}
              >
                {/* Status badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  {passed && (
                    <span className="badge badge-green" style={{ fontSize: 9 }}>
                      ✓ PASSED
                    </span>
                  )}
                  {!passed && unlocked && lvl.id === 1 && (
                    <span
                      className="badge badge-accent"
                      style={{ fontSize: 9 }}
                    >
                      START HERE
                    </span>
                  )}
                  {!unlocked && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: "rgba(0,0,0,.4)",
                        border: "1px solid var(--border)",
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-head)",
                        letterSpacing: 1,
                      }}
                    >
                      🔒 LOCKED
                    </span>
                  )}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    fontFamily: "var(--font-head)",
                    fontSize: 10,
                    color: unlocked ? lvl.color : "var(--text-dim)",
                    letterSpacing: 1,
                  }}
                >
                  LVL.{lvl.id}
                </div>

                <div style={{ marginTop: 22 }}>
                  <div
                    style={{
                      fontSize: 42,
                      marginBottom: 12,
                      filter: `drop-shadow(0 0 8px ${unlocked ? lvl.color + "60" : "transparent"})`,
                    }}
                  >
                    {unlocked ? lvl.icon : "🔒"}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      color: unlocked ? lvl.color : "var(--text-dim)",
                      fontSize: 12,
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {lvl.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-dim)",
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}
                  >
                    {lvl.desc}
                  </p>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      marginBottom: 4,
                      fontFamily: "var(--font-head)",
                      letterSpacing: 1,
                    }}
                  >
                    ⚙ {lvl.mechanic}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: passed
                        ? "var(--green)"
                        : unlocked
                          ? "var(--gold)"
                          : "var(--text-dim)",
                      marginBottom: 14,
                      fontFamily: "var(--font-head)",
                      letterSpacing: 1,
                    }}
                  >
                    {passed ? "✅ " : "🎯 "}
                    {lvl.req}
                  </div>
                  {unlocked ? (
                    <div
                      style={{
                        padding: "7px 14px",
                        background: `${lvl.color}18`,
                        border: `1px solid ${lvl.color}`,
                        color: lvl.color,
                        fontFamily: "var(--font-head)",
                        fontSize: 10,
                        letterSpacing: 1,
                        borderRadius: 6,
                        display: "inline-block",
                      }}
                    >
                      {passed ? "🔄 REPLAY" : "▶ ENTER ZONE"}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "7px 14px",
                        background: "rgba(0,0,0,.3)",
                        border: "1px solid var(--border)",
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-head)",
                        fontSize: 10,
                        letterSpacing: 1,
                        borderRadius: 6,
                        display: "inline-block",
                      }}
                    >
                      🔒 PASS LVL {lvl.id - 1} FIRST
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 12,
            color: "var(--text-dim)",
          }}
        >
          Want to start over?{" "}
          <span
            style={{ color: "var(--accent)", cursor: "pointer" }}
            onClick={() => navigate("/settings")}
          >
            Settings → Danger Zone → Reset All Progress
          </span>
        </div>
      </div>
    </div>
  );
}
