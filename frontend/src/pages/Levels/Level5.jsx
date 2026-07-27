import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import { isLevelUnlocked } from "./LevelGate";

export default function Level5() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLevelUnlocked(5)) navigate("/levels");
  }, []);
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      <QuizLevel
        levelNum={5}
        color="#e040fb"
        label="🔐 LEVEL 5 — ENCRYPTION LAB"
      />
    </div>
  );
}
