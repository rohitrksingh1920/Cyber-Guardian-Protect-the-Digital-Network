
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import QuizLevel from "./QuizLevel";
import { isLevelUnlocked } from "./LevelGate";

export default function Level3() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLevelUnlocked(3)) navigate("/levels");
  }, []);
  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      <QuizLevel
        levelNum={3}
        color="#ffd600"
        label="🦠 LEVEL 3 — MALWARE HUNTER"
      />
    </div>
  );
}
