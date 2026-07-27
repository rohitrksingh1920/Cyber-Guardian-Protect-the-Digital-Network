


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import { isLevelUnlocked } from "./LevelGate";

export default function Level6() {
  const navigate = useNavigate();
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
      />
    </div>
  );
}