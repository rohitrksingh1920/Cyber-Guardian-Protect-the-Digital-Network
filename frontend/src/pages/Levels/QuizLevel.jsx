// /**
//  * QuizLevel.jsx — Universal quiz component backed by 600-question server bank
//  *
//  * Props:
//  *   levelNum    {number}  1-6
//  *   color       {string}  CSS color for this level's theme
//  *   label       {string}  "💻 LEVEL 1 — PASSWORD FORTRESS"
//  *   onPass      {fn}      called with { score, correct, total, pct } on pass
//  *   onFail      {fn}      called with { correct, total, pct }          on fail
//  *   extraScore  {number}  bonus score to add (e.g. runner bonus)
//  */
// import { useState, useEffect, useRef, useCallback } from "react";
// import api from "../../services/api";
// import SystemBreach from "../../components/SystemBreach";
// import ResultModal from "../../components/ResultModal";
// import { markLevelPassed, markLevelFailed } from "./LevelGate";

// // ── Timer per question (seconds) ─────────────────────────────────────────
// const Q_TIMER = 30;

// export default function QuizLevel({
//   levelNum,
//   color = "var(--accent)",
//   label = "",
//   onPass,
//   onFail,
//   extraScore = 0,
// }) {
//   const [session, setSession] = useState(null); // { session_id, questions[], total, pass_at }
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Quiz state
//   const [current, setCurrent] = useState(0);
//   const [selected, setSelected] = useState(null); // chosen option index
//   const [timer, setTimer] = useState(Q_TIMER);
//   const [showFeedback, setShowFeedback] = useState(false);
//   const [feedback, setFeedback] = useState(null); // { correct, correctIdx, explanation }
//   const [answers, setAnswers] = useState([]); // [{question_id, chosen}]

//   // Result state
//   const [submitting, setSubmitting] = useState(false);
//   const [quizResult, setQuizResult] = useState(null); // full server response
//   const [failed, setFailed] = useState(false);
//   const [resultModal, setResultModal] = useState(null); // for ResultModal (XP display)

//   const scoreRef = useRef(0);
//   const correctRef = useRef(0);
//   const startRef = useRef(Date.now());

//   // ── Load session on mount ──────────────────────────────────────────────
//   useEffect(() => {
//     api
//       .post("/quiz/session/start", { level: levelNum })
//       .then(({ data }) => {
//         setSession(data);
//         startRef.current = Date.now();
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.response?.data?.detail || "Failed to load questions");
//         setLoading(false);
//       });
//   }, [levelNum]);

//   // ── Per-question countdown ─────────────────────────────────────────────
//   useEffect(() => {
//     if (!session || showFeedback || selected !== null || failed || quizResult)
//       return;
//     if (timer <= 0) {
//       handleSelect(-1);
//       return;
//     }
//     const t = setTimeout(() => setTimer((t) => t - 1), 1000);
//     return () => clearTimeout(t);
//   }, [timer, session, showFeedback, selected, failed, quizResult]);

//   // ── Handle option selection ────────────────────────────────────────────
//   const handleSelect = useCallback(
//     (idx) => {
//       if (selected !== null || !session) return;
//       setSelected(idx);

//       const q = session.questions[current];

//       // Record answer (timeout = -1, which server treats as wrong)
//       setAnswers((prev) => [...prev, { question_id: q.id, chosen: idx }]);

//       // Show loading feedback briefly then advance
//       // (Real feedback comes from server after final submission)
//       const timedOut = idx === -1;
//       if (timedOut) {
//         setFeedback({ timedOut: true });
//       } else {
//         setFeedback({ chosen: idx });
//       }
//       setShowFeedback(true);

//       setTimeout(
//         () => {
//           setShowFeedback(false);
//           setSelected(null);
//           setFeedback(null);
//           if (current + 1 >= session.questions.length) {
//             submitQuiz([...answers, { question_id: q.id, chosen: idx }]);
//           } else {
//             setCurrent((c) => c + 1);
//             setTimer(Q_TIMER);
//           }
//         },
//         timedOut ? 1200 : 1000,
//       );
//     },
//     [selected, session, current, answers],
//   );

//   // ── Submit to server ───────────────────────────────────────────────────
//   const submitQuiz = async (finalAnswers) => {
//     setSubmitting(true);
//     const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
//     try {
//       const { data } = await api.post("/quiz/session/submit", {
//         session_id: session.session_id,
//         level: levelNum,
//         answers: finalAnswers,
//         time_taken: timeTaken,
//       });

//       setQuizResult(data);

//       // Apply level gate logic
//       if (data.passed) {
//         markLevelPassed(levelNum);
//         // Show ResultModal with XP info
//         setResultModal({
//           xp_earned: data.xp_earned,
//           new_level: data.new_level,
//           new_total_xp: data.new_total_xp,
//           new_total_score: data.new_total_score,
//           achievements_unlocked: data.achievements_unlocked,
//           level_up: data.level_up,
//         });
//         onPass?.({
//           score: data.score + extraScore,
//           correct: data.correct,
//           total: data.total,
//           pct: data.pct,
//         });
//       } else {
//         markLevelFailed(levelNum);
//         setFailed(true);
//         onFail?.({ correct: data.correct, total: data.total, pct: data.pct });
//       }
//     } catch (err) {
//       setError("Failed to submit. Please check your connection.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Loading ──────────────────────────────────────────────────────────
//   if (loading)
//     return (
//       <div className="page-loading">
//         <div className="loading-spinner" />
//         <div className="page-loading-text">LOADING QUESTIONS...</div>
//       </div>
//     );

//   if (error)
//     return (
//       <div style={{ padding: 32, textAlign: "center", color: "var(--red)" }}>
//         <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
//         <div
//           style={{
//             fontFamily: "var(--font-head)",
//             fontSize: 14,
//             letterSpacing: 2,
//           }}
//         >
//           {error}
//         </div>
//         <button
//           className="btn-ghost"
//           onClick={() => window.location.reload()}
//           style={{ marginTop: 16 }}
//         >
//           RETRY
//         </button>
//       </div>
//     );

//   // ── Failed screen ────────────────────────────────────────────────────
//   if (failed && quizResult)
//     return (
//       <SystemBreach
//         levelNum={levelNum}
//         reason={`You answered ${quizResult.correct} out of ${quizResult.total} correctly (${quizResult.pct}%). Need ${quizResult.pass_at}/${quizResult.total} (60%) to pass.`}
//         correct={quizResult.correct}
//         required={quizResult.pass_at}
//         total={quizResult.total}
//         onRetry={() => window.location.reload()}
//       />
//     );

//   // ── ResultModal (pass) ───────────────────────────────────────────────
//   if (resultModal)
//     return (
//       <>
//         <ResultModal result={resultModal} levelNum={levelNum} />
//         {/* Show review behind modal */}
//         {quizResult && (
//           <QuizReview result={quizResult} color={color} label={label} />
//         )}
//       </>
//     );

//   // ── Submitting ───────────────────────────────────────────────────────
//   if (submitting)
//     return (
//       <div className="page-loading">
//         <div className="loading-spinner" />
//         <div className="page-loading-text">SUBMITTING RESULTS...</div>
//       </div>
//     );

//   const q = session.questions[current];
//   const pct = Math.round((current / session.questions.length) * 100);

//   // ── Quiz UI ──────────────────────────────────────────────────────────
//   return (
//     <div
//       style={{
//         padding: "24px 32px",
//         maxWidth: 740,
//         margin: "0 auto",
//         animation: "fadeIn .3s ease",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 14,
//         }}
//       >
//         <div>
//           <h2
//             style={{
//               fontFamily: "var(--font-head)",
//               color,
//               fontSize: 14,
//               letterSpacing: 2,
//             }}
//           >
//             {label}
//           </h2>
//           <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 3 }}>
//             Question {current + 1} of {session.questions.length}
//           </div>
//         </div>
//         <div
//           style={{
//             fontFamily: "var(--font-head)",
//             fontSize: 32,
//             color: timer <= 8 ? "var(--red)" : color,
//             textShadow: timer <= 8 ? "0 0 15px var(--red)" : "none",
//             transition: "color .3s",
//           }}
//         >
//           {String(timer).padStart(2, "0")}
//         </div>
//       </div>

//       {/* Pass threshold reminder */}
//       <div
//         style={{
//           background: "rgba(255,214,0,.06)",
//           border: "1px solid rgba(255,214,0,.2)",
//           borderRadius: 8,
//           padding: "7px 14px",
//           marginBottom: 12,
//           fontSize: 12,
//           color: "var(--gold)",
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//       >
//         <span>
//           🎯 Need {session.pass_at}/{session.total} to pass (60%+)
//         </span>
//         <span style={{ color: "var(--text-dim)" }}>
//           Bank: 100 questions · Session: {session.total} random
//         </span>
//       </div>

//       {/* Progress bar */}
//       <div className="progress-track" style={{ marginBottom: 18 }}>
//         <div
//           style={{
//             height: "100%",
//             width: `${pct}%`,
//             background: color,
//             borderRadius: 3,
//             transition: "width .4s ease",
//             boxShadow: `0 0 8px ${color}`,
//           }}
//         />
//       </div>

//       {/* Question card */}
//       <div
//         style={{
//           background: "var(--bg-card)",
//           border: `1px solid ${color}30`,
//           borderRadius: 12,
//           padding: "24px 28px",
//           marginBottom: 14,
//           animation: "fadeIn .25s ease",
//         }}
//       >
//         <div
//           style={{
//             fontSize: 11,
//             color: "var(--text-dim)",
//             fontFamily: "var(--font-head)",
//             letterSpacing: 2,
//             marginBottom: 10,
//           }}
//         >
//           Q{current + 1}
//         </div>
//         <p
//           style={{
//             fontSize: 16,
//             lineHeight: 1.7,
//             marginBottom: 22,
//             color: "var(--text)",
//           }}
//         >
//           {q.q}
//         </p>
//         <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//           {q.opts.map((opt, i) => {
//             let bg = "rgba(0,0,0,.2)";
//             let border = "var(--border)";
//             let opacity = 1;

//             if (showFeedback && selected !== null) {
//               if (i === selected) {
//                 bg = `${color}15`;
//                 border = color;
//               } else {
//                 opacity = 0.45;
//               }
//             }

//             return (
//               <button
//                 key={i}
//                 onClick={() => handleSelect(i)}
//                 disabled={selected !== null || showFeedback}
//                 style={{
//                   padding: "13px 18px",
//                   borderRadius: 8,
//                   border: `1px solid ${border}`,
//                   cursor: selected !== null ? "default" : "pointer",
//                   fontSize: 14,
//                   textAlign: "left",
//                   transition: "all .18s",
//                   background: bg,
//                   color: "var(--text)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   opacity,
//                 }}
//                 onMouseEnter={(e) => {
//                   if (selected === null) {
//                     e.currentTarget.style.background = `${color}10`;
//                     e.currentTarget.style.borderColor = color;
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (selected === null) {
//                     e.currentTarget.style.background = "rgba(0,0,0,.2)";
//                     e.currentTarget.style.borderColor = "var(--border)";
//                   }
//                 }}
//               >
//                 <span
//                   style={{
//                     fontFamily: "var(--font-head)",
//                     fontSize: 11,
//                     color: "var(--text-dim)",
//                     minWidth: 18,
//                   }}
//                 >
//                   {["A", "B", "C", "D"][i]}
//                 </span>
//                 <span>{opt}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Minimal feedback during quiz (full feedback shown in review) */}
//       {showFeedback && (
//         <div
//           style={{
//             padding: "10px 14px",
//             borderRadius: 8,
//             background: "rgba(0,184,255,.08)",
//             border: "1px solid rgba(0,184,255,.2)",
//             fontSize: 13,
//             color: "var(--text-dim)",
//             animation: "fadeIn .2s ease",
//           }}
//         >
//           {feedback?.timedOut
//             ? "⏰ Time up! Moving to next question..."
//             : "✔ Answer recorded — moving on..."}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Post-quiz review screen (shown behind ResultModal) ─────────────────
// function QuizReview({ result, color, label }) {
//   return (
//     <div
//       style={{
//         padding: "24px 32px",
//         maxWidth: 740,
//         margin: "0 auto",
//         opacity: 0.3,
//       }}
//     >
//       <h3
//         style={{
//           fontFamily: "var(--font-head)",
//           color,
//           fontSize: 13,
//           letterSpacing: 2,
//           marginBottom: 16,
//         }}
//       >
//         {label} — RESULTS REVIEW
//       </h3>
//       <div
//         style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}
//       >
//         <span
//           style={{
//             fontFamily: "var(--font-head)",
//             color: "var(--green)",
//             fontSize: 13,
//           }}
//         >
//           ✅ Correct: {result.correct}
//         </span>
//         <span
//           style={{
//             fontFamily: "var(--font-head)",
//             color: "var(--red)",
//             fontSize: 13,
//           }}
//         >
//           ❌ Wrong: {result.total - result.correct}
//         </span>
//         <span
//           style={{
//             fontFamily: "var(--font-head)",
//             color: "var(--gold)",
//             fontSize: 13,
//           }}
//         >
//           Score: {result.score}
//         </span>
//       </div>
//     </div>
//   );
// }

/**
 * QuizLevel.jsx — Universal quiz component backed by 600-question server bank
 * FIX: blank screen after passing — ResultModal now renders with proper container
 */
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import SystemBreach from "../../components/SystemBreach";
import ResultModal from "../../components/ResultModal";
import { markLevelPassed, markLevelFailed } from "./LevelGate";

const Q_TIMER = 30;

export default function QuizLevel({
  levelNum,
  color = "var(--accent)",
  label = "",
  onPass,
  onFail,
  extraScore = 0,
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(Q_TIMER);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const [passed, setPassed] = useState(false);
  const [resultData, setResultData] = useState(null);

  const startRef = useRef(Date.now());

  // Load session
  useEffect(() => {
    api
      .post("/quiz/session/start", { level: levelNum })
      .then(({ data }) => {
        setSession(data);
        startRef.current = Date.now();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load questions");
        setLoading(false);
      });
  }, [levelNum]);

  // Timer
  useEffect(() => {
    if (
      !session ||
      showFeedback ||
      selected !== null ||
      failed ||
      passed ||
      submitting
    )
      return;
    if (timer <= 0) {
      handleSelect(-1);
      return;
    }
    const t = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, session, showFeedback, selected, failed, passed, submitting]);

  // Select answer
  const handleSelect = useCallback(
    (idx) => {
      if (selected !== null || !session) return;
      setSelected(idx);
      const q = session.questions[current];
      const newAnswers = [...answers, { question_id: q.id, chosen: idx }];
      setAnswers(newAnswers);
      setFeedback({ timedOut: idx === -1 });
      setShowFeedback(true);
      setTimeout(
        () => {
          setShowFeedback(false);
          setSelected(null);
          setFeedback(null);
          if (current + 1 >= session.questions.length) {
            submitQuiz(newAnswers);
          } else {
            setCurrent((c) => c + 1);
            setTimer(Q_TIMER);
          }
        },
        idx === -1 ? 1200 : 900,
      );
    },
    [selected, session, current, answers],
  );

  // Submit
  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startRef.current) / 1000);
    try {
      const { data } = await api.post("/quiz/session/submit", {
        session_id: session.session_id,
        level: levelNum,
        answers: finalAnswers,
        time_taken: timeTaken,
      });
      setQuizResult(data);
      if (data.passed) {
        markLevelPassed(levelNum);
        setResultData({
          xp_earned: data.xp_earned,
          new_level: data.new_level,
          new_total_xp: data.new_total_xp,
          new_total_score: data.new_total_score,
          achievements_unlocked: data.achievements_unlocked || [],
          level_up: data.level_up,
        });
        setPassed(true);
        onPass?.({
          score: data.score + extraScore,
          correct: data.correct,
          total: data.total,
          pct: data.pct,
        });
      } else {
        markLevelFailed(levelNum);
        setFailed(true);
        onFail?.({ correct: data.correct, total: data.total, pct: data.pct });
      }
    } catch (err) {
      setError(
        "Submission failed. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading)
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <div className="page-loading-text">LOADING QUESTIONS...</div>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--red)" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 14,
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
        <button className="btn-ghost" onClick={() => window.location.reload()}>
          RETRY
        </button>
      </div>
    );

  // PASS — ResultModal over dim background (fixes blank screen bug)
  if (passed && resultData)
    return (
      <div style={{ minHeight: "calc(100vh - 57px)", position: "relative" }}>
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            opacity: 0.2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-head)",
              color,
              fontSize: 20,
              letterSpacing: 3,
            }}
          >
            MISSION COMPLETE
          </div>
          {quizResult && (
            <div
              style={{ marginTop: 12, fontSize: 14, color: "var(--text-dim)" }}
            >
              {quizResult.correct}/{quizResult.total} correct · {quizResult.pct}
              % accuracy
            </div>
          )}
        </div>
        <ResultModal result={resultData} levelNum={levelNum} />
      </div>
    );

  // FAIL — SystemBreach
  if (failed && quizResult)
    return (
      <SystemBreach
        levelNum={levelNum}
        reason={`You answered ${quizResult.correct} out of ${quizResult.total} correctly (${quizResult.pct}%). Need ${quizResult.pass_at}/${quizResult.total} (60%) to pass.`}
        correct={quizResult.correct}
        required={quizResult.pass_at}
        total={quizResult.total}
        onRetry={() => window.location.reload()}
      />
    );

  // SUBMITTING
  if (submitting)
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <div className="page-loading-text">SUBMITTING RESULTS...</div>
      </div>
    );

  // QUIZ UI
  const q = session.questions[current];
  const pct = Math.round((current / session.questions.length) * 100);

  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: 740,
        margin: "0 auto",
        animation: "fadeIn .3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-head)",
              color,
              fontSize: 14,
              letterSpacing: 2,
            }}
          >
            {label}
          </h2>
          <div style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 3 }}>
            Question {current + 1} of {session.questions.length}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 32,
            color: timer <= 8 ? "var(--red)" : color,
            textShadow: timer <= 8 ? "0 0 15px var(--red)" : "none",
            transition: "color .3s",
          }}
        >
          {String(timer).padStart(2, "0")}
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,214,0,.06)",
          border: "1px solid rgba(255,214,0,.2)",
          borderRadius: 8,
          padding: "7px 14px",
          marginBottom: 12,
          fontSize: 12,
          color: "var(--gold)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          🎯 Need {session.pass_at}/{session.total} to pass (60%+)
        </span>
        <span style={{ color: "var(--text-dim)" }}>
          Bank: 100 questions · Session: {session.total} random
        </span>
      </div>

      <div className="progress-track" style={{ marginBottom: 18 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width .4s ease",
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          border: `1px solid ${color}30`,
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 14,
          animation: "fadeIn .25s ease",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            fontFamily: "var(--font-head)",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          Q{current + 1}
        </div>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            marginBottom: 22,
            color: "var(--text)",
          }}
        >
          {q.q}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.opts.map((opt, i) => {
            let bg = "rgba(0,0,0,.2)",
              border = "var(--border)",
              opacity = 1;
            if (showFeedback && selected !== null) {
              if (i === selected) {
                bg = `${color}15`;
                border = color;
              } else opacity = 0.45;
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null || showFeedback}
                style={{
                  padding: "13px 18px",
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  cursor: selected !== null ? "default" : "pointer",
                  fontSize: 14,
                  textAlign: "left",
                  transition: "all .18s",
                  background: bg,
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity,
                }}
                onMouseEnter={(e) => {
                  if (selected === null) {
                    e.currentTarget.style.background = `${color}10`;
                    e.currentTarget.style.borderColor = color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected === null) {
                    e.currentTarget.style.background = "rgba(0,0,0,.2)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    minWidth: 18,
                  }}
                >
                  {["A", "B", "C", "D"][i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(0,184,255,.08)",
            border: "1px solid rgba(0,184,255,.2)",
            fontSize: 13,
            color: "var(--text-dim)",
            animation: "fadeIn .2s ease",
          }}
        >
          {feedback?.timedOut
            ? "⏰ Time up! Moving to next question..."
            : "✔ Answer recorded — moving on..."}
        </div>
      )}
    </div>
  );
}
