


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import { isLevelUnlocked } from "./LevelGate";

export default function Level4() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLevelUnlocked(4)) navigate("/levels");
  }, []);
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      <QuizLevel
        levelNum={4}
        color="#ff9100"
        label="🌐 LEVEL 4 — NETWORK GUARDIAN"
      />
    </div>
  );
}
