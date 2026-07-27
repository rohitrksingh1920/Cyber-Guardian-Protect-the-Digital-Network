// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Topbar from "../../components/Topbar";
// import QuizLevel from "./QuizLevel";
// import SystemBreach from "../../components/SystemBreach";
// import { isLevelUnlocked } from "./LevelGate";

// export default function Level5() {
//   const navigate = useNavigate();
//   const [failData, setFailData] = useState(null);

//   useEffect(() => {
//     if (!isLevelUnlocked(5)) navigate("/levels");
//   }, []);

//   return (
//     <div style={{ minHeight: "100vh", animation: "fadeIn .3s ease" }}>
//       <Topbar showBack backTo="/levels" backLabel="LEVELS" />
//       <QuizLevel
//         levelNum={5}
//         color="#e040fb"
//         label="🔐 LEVEL 5 — ENCRYPTION LAB"
//         onPass={() => {}}
//         onFail={({ correct, total }) =>
//           setFailData({ correct, total, required: Math.ceil(total * 0.6) })
//         }
//       />
//       {failData && (
//         <SystemBreach
//           levelNum={5}
//           reason={`You answered ${failData.correct}/${failData.total} correctly. Need ${failData.required}/${failData.total} (60%) to pass.`}
//           correct={failData.correct}
//           required={failData.required}
//           total={failData.total}
//           onRetry={() => window.location.reload()}
//         />
//       )}
//     </div>
//   );
// }




























































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
