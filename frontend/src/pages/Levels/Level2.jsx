

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import { isLevelUnlocked } from "./LevelGate";

export default function Level2() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLevelUnlocked(2)) navigate("/levels");
  }, []);
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      <QuizLevel
        levelNum={2}
        color="#00e676"
        label="📧 LEVEL 2 — PHISHING HUNT"
      />
    </div>
  );
}
