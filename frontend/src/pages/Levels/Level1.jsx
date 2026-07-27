
/**
 * Level1.jsx — Password Fortress
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import RunnerStage from "../../components/RunnerStage";
import QuizLevel from "./QuizLevel";

export default function Level1() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("runner");
  const [runStats, setRunStats] = useState(null);

  // Stage 1: Runner
  if (stage === "runner")
    return (
      <div style={{ minHeight: "100vh" }}>
        <Topbar showBack backTo="/levels" backLabel="LEVELS" />
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <RunnerStage
            levelId={1}
            color="#00b8ff"
            label="💻 PASSWORD FORTRESS: RUN"
            targetScore={400}
            onComplete={(stats) => {
              setRunStats(stats);
              setStage("quiz");
            }}
          />
        </div>
      </div>
    );

  // Stage 2: Quiz — QuizLevel handles PASS (ResultModal) and FAIL (SystemBreach) internally
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />

      {runStats && (
        <div
          style={{
            background: "rgba(0,184,255,.08)",
            borderBottom: "1px solid rgba(0,184,255,.2)",
            padding: "9px 24px",
            fontSize: 13,
            color: "var(--accent)",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span>🏃 Run complete!</span>
          <span style={{ color: "var(--green)" }}>
            +{runStats.score} run bonus
          </span>
          <span style={{ color: "var(--text-dim)" }}>
            Now answer 10 security questions to pass the level
          </span>
        </div>
      )}

      <QuizLevel
        levelNum={1}
        color="#00b8ff"
        label="💻 LEVEL 1 — PASSWORD FORTRESS"
        extraScore={runStats?.score || 0}
      />
    </div>
  );
}
