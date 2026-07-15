import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";

const InfoCard = ({ icon, title, desc }) => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "22px",
      transition: "var(--transition)",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
  >
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
    <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>{title}</h3>
    <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
      {desc}
    </p>
  </div>
);

const FLOW = [
  ["🔒", "Select Difficulty"],
  ["⚔", "Defend Network"],
  ["🏆", "Score Points"],
  ["📋", "Climb Leaderboard"],
];

export default function HowToPlay() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .35s ease" }}>
      <Topbar showBack />
      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 26,
              letterSpacing: 3,
            }}
          >
            📖 HOW TO PLAY
          </h1>
          <p style={{ color: "var(--text-dim)", marginTop: 8 }}>
            Master the art of cyber defense
          </p>
        </div>

        {/* Mission flow — no Fragment key warning */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "22px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            MISSION FLOW
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {FLOW.map(([icon, label], i) => (
              <div key={label} style={{ display: "contents" }}>
                <div
                  style={{
                    padding: "10px 20px",
                    background: "rgba(0,85,204,.2)",
                    border: "1px solid var(--accent2)",
                    borderRadius: 6,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  {icon} {label}
                </div>
                {i < FLOW.length - 1 && (
                  <span style={{ color: "var(--text-dim)", fontSize: 18 }}>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core mechanics */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            CORE MECHANICS
          </div>
          <div className="grid-3">
            <InfoCard
              icon="🎯"
              title="Identify Threats"
              desc="Spot phishing attempts, malware, and intrusions. Your accuracy directly impacts your score multiplier."
            />
            <InfoCard
              icon="⚡"
              title="Make Fast Decisions"
              desc="Threats have timers. Respond quickly to maximize speed bonuses before the clock runs out."
            />
            <InfoCard
              icon="🔧"
              title="Deploy Security Tools"
              desc="Use firewalls, antivirus, encryption, and monitoring tools to neutralize threats."
            />
            <InfoCard
              icon="⭐"
              title="Earn & Upgrade"
              desc="Collect Security Points to upgrade systems and unlock advanced capabilities."
            />
            <InfoCard
              icon="👾"
              title="Boss Battles"
              desc="Each zone ends with a large-scale cyber attack. Coordinate all tools to defeat it."
            />
            <InfoCard
              icon="🏆"
              title="Climb the Ranks"
              desc="High scores and fast clears earn a spot on the Leaderboard. Challenge classmates!"
            />
          </div>
        </div>

        {/* Scoring */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            SCORING
          </div>
          <div className="grid-3">
            <InfoCard
              icon="⚡"
              title="Speed Bonus"
              desc="Faster threat neutralization earns more bonus points on top of the base score."
            />
            <InfoCard
              icon="🎯"
              title="Accuracy Bonus"
              desc="Correct identification without mistakes multiplies your score by up to 3×."
            />
            <InfoCard
              icon="🔥"
              title="Combo Chain"
              desc="Defeating multiple threats in quick succession builds a combo multiplier for massive gains."
            />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn-green"
            onClick={() => navigate(user ? "/levels" : "/register")}
            style={{ padding: "15px 48px", fontSize: 14 }}
          >
            ▶ READY — START GAME
          </button>
        </div>
      </div>
    </div>
  );
}
