import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import SystemBreach from "../../components/SystemBreach";
import { isLevelUnlocked } from "./LevelGate";

export default function Level6() {
  const navigate = useNavigate();
  const [failData, setFailData] = useState(null);

  useEffect(() => {
    if (!isLevelUnlocked(6)) navigate("/levels");
  }, []);

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      <QuizLevel
        levelNum={6}
        color="#ff1744"
        label="💀 LEVEL 6 — GLOBAL ATTACK SIMULATION"
        onPass={() => {}}
        onFail={({ correct, total }) =>
          setFailData({ correct, total, required: Math.ceil(total * 0.6) })
        }
      />
      {failData && (
        <SystemBreach
          levelNum={6}
          reason={`You answered ${failData.correct}/${failData.total} correctly. Need ${failData.required}/${failData.total} (60%) to pass this final level.`}
          correct={failData.correct}
          required={failData.required}
          total={failData.total}
          onRetry={() => window.location.reload()}
        />
      )}
    </div>
  );
}
