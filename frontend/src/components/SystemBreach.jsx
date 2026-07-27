// import { useNavigate } from "react-router-dom";

// export default function SystemBreach({
//   levelNum,
//   reason,
//   correct,
//   required,
//   total,
//   onRetry,
// }) {
//   const navigate = useNavigate();
//   const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,.92)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 999,
//         backdropFilter: "blur(10px)",
//       }}
//     >
//       <div
//         style={{
//           background: "var(--bg-card)",
//           border: "1px solid var(--red)",
//           borderRadius: 14,
//           padding: "44px 52px",
//           maxWidth: 500,
//           width: "90%",
//           textAlign: "center",
//           animation: "pop .4s cubic-bezier(0.34,1.56,0.64,1)",
//           boxShadow: "0 0 60px rgba(255,23,68,.25)",
//         }}
//       >
//         <div
//           style={{
//             fontSize: 64,
//             marginBottom: 14,
//             filter: "drop-shadow(0 0 20px var(--red))",
//           }}
//         >
//           💀
//         </div>
//         <div
//           style={{
//             fontFamily: "var(--font-head)",
//             color: "var(--red)",
//             fontSize: 22,
//             letterSpacing: 2,
//             marginBottom: 6,
//           }}
//         >
//           SYSTEM BREACHED
//         </div>
//         <div
//           style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 24 }}
//         >
//           Level {levelNum} — Mission Failed
//         </div>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 10,
//             marginBottom: 20,
//           }}
//         >
//           <div
//             style={{
//               background: "rgba(255,23,68,.08)",
//               border: "1px solid rgba(255,23,68,.25)",
//               borderRadius: 8,
//               padding: "14px",
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: "var(--font-head)",
//                 fontSize: 28,
//                 color: "var(--red)",
//                 marginBottom: 3,
//               }}
//             >
//               {correct}/{total}
//             </div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: "var(--text-dim)",
//                 letterSpacing: 1,
//               }}
//             >
//               YOUR SCORE
//             </div>
//           </div>
//           <div
//             style={{
//               background: "rgba(0,230,118,.06)",
//               border: "1px solid rgba(0,230,118,.2)",
//               borderRadius: 8,
//               padding: "14px",
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: "var(--font-head)",
//                 fontSize: 28,
//                 color: "var(--green)",
//                 marginBottom: 3,
//               }}
//             >
//               {required}/{total}
//             </div>
//             <div
//               style={{
//                 fontSize: 10,
//                 color: "var(--text-dim)",
//                 letterSpacing: 1,
//               }}
//             >
//               REQUIRED TO PASS
//             </div>
//           </div>
//         </div>
//         <div style={{ marginBottom: 20 }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               fontSize: 11,
//               color: "var(--text-dim)",
//               fontFamily: "var(--font-head)",
//               letterSpacing: 1,
//               marginBottom: 5,
//             }}
//           >
//             <span>YOUR ACCURACY</span>
//             <span style={{ color: "var(--red)" }}>{pct}% (need 75%)</span>
//           </div>
//           <div
//             style={{
//               height: 8,
//               background: "var(--border)",
//               borderRadius: 4,
//               overflow: "hidden",
//               position: "relative",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 left: "75%",
//                 top: 0,
//                 bottom: 0,
//                 width: 2,
//                 background: "var(--green)",
//                 zIndex: 1,
//               }}
//             />
//             <div
//               style={{
//                 height: "100%",
//                 width: `${pct}%`,
//                 background: "var(--red)",
//                 borderRadius: 4,
//                 boxShadow: "0 0 8px var(--red)",
//               }}
//             />
//           </div>
//           <div style={{ textAlign: "right", marginTop: 3 }}>
//             <span style={{ fontSize: 10, color: "var(--green)" }}>
//               ▲ 75% pass line
//             </span>
//           </div>
//         </div>
//         {reason && (
//           <div
//             style={{
//               background: "rgba(255,23,68,.06)",
//               border: "1px solid rgba(255,23,68,.2)",
//               borderRadius: 8,
//               padding: "10px 14px",
//               fontSize: 12,
//               color: "var(--red)",
//               marginBottom: 16,
//               lineHeight: 1.6,
//             }}
//           >
//             {reason}
//           </div>
//         )}
//         <div
//           style={{
//             background: "rgba(0,0,0,.3)",
//             border: "1px solid var(--border)",
//             borderRadius: 8,
//             padding: "10px 14px",
//             fontSize: 12,
//             color: "var(--text-dim)",
//             marginBottom: 24,
//             lineHeight: 1.6,
//           }}
//         >
//           🔒 <strong style={{ color: "var(--text)" }}>Level Locked.</strong>{" "}
//           Score at least{" "}
//           <strong style={{ color: "var(--gold)" }}>
//             75% ({required}/{total})
//           </strong>{" "}
//           to pass. All forward progress reset.
//         </div>
//         <div
//           style={{
//             display: "flex",
//             gap: 10,
//             justifyContent: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           <button
//             onClick={() => navigate("/levels")}
//             style={{
//               padding: "10px 18px",
//               background: "transparent",
//               border: "1px solid var(--border)",
//               color: "var(--text-dim)",
//               fontFamily: "var(--font-head)",
//               fontSize: 11,
//               letterSpacing: 1,
//               borderRadius: 6,
//               cursor: "pointer",
//             }}
//           >
//             ← LEVEL SELECT
//           </button>
//           <button
//             onClick={onRetry || (() => window.location.reload())}
//             style={{
//               padding: "10px 22px",
//               background: "rgba(255,23,68,.2)",
//               border: "1px solid var(--red)",
//               color: "var(--red)",
//               fontFamily: "var(--font-head)",
//               fontSize: 11,
//               letterSpacing: 1,
//               borderRadius: 6,
//               cursor: "pointer",
//             }}
//           >
//             🔄 RETRY LVL {levelNum}
//           </button>
//           <button
//             onClick={() => navigate("/level/1")}
//             style={{
//               padding: "10px 18px",
//               background: "var(--red)",
//               border: "none",
//               color: "#fff",
//               fontFamily: "var(--font-head)",
//               fontSize: 11,
//               letterSpacing: 1,
//               borderRadius: 6,
//               cursor: "pointer",
//             }}
//           >
//             ▶ START FROM L1
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";

export default function SystemBreach({
  levelNum,
  reason,
  correct,
  required,
  total,
  onRetry,
}) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const PASS_PCT = 60; // ← 60%, not 75%

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--red)",
          borderRadius: 14,
          padding: "44px 52px",
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          animation: "pop .4s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 0 60px rgba(255,23,68,.25)",
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 14,
            filter: "drop-shadow(0 0 20px var(--red))",
          }}
        >
          💀
        </div>

        <div
          style={{
            fontFamily: "var(--font-head)",
            color: "var(--red)",
            fontSize: 22,
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          SYSTEM BREACHED
        </div>
        <div
          style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 24 }}
        >
          Level {levelNum} — Mission Failed
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "rgba(255,23,68,.08)",
              border: "1px solid rgba(255,23,68,.25)",
              borderRadius: 8,
              padding: "14px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 28,
                color: "var(--red)",
                marginBottom: 3,
              }}
            >
              {correct}/{total}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: 1,
              }}
            >
              YOUR SCORE
            </div>
          </div>
          <div
            style={{
              background: "rgba(0,230,118,.06)",
              border: "1px solid rgba(0,230,118,.2)",
              borderRadius: 8,
              padding: "14px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 28,
                color: "var(--green)",
                marginBottom: 3,
              }}
            >
              {required}/{total}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: 1,
              }}
            >
              REQUIRED TO PASS
            </div>
          </div>
        </div>

        {/* Accuracy bar — 60% pass line */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--text-dim)",
              fontFamily: "var(--font-head)",
              letterSpacing: 1,
              marginBottom: 5,
            }}
          >
            <span>YOUR ACCURACY</span>
            <span style={{ color: "var(--red)" }}>
              {pct}% (need {PASS_PCT}%)
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "var(--border)",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* 60% pass line marker */}
            <div
              style={{
                position: "absolute",
                left: `${PASS_PCT}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: "var(--green)",
                zIndex: 1,
              }}
            />
            <div
              style={{
                height: "100%",
                width: `${Math.min(pct, 100)}%`,
                background: "var(--red)",
                borderRadius: 4,
                boxShadow: "0 0 8px var(--red)",
              }}
            />
          </div>
          <div style={{ textAlign: "right", marginTop: 3 }}>
            <span style={{ fontSize: 10, color: "var(--green)" }}>
              ▲ {PASS_PCT}% pass line
            </span>
          </div>
        </div>

        {reason && (
          <div
            style={{
              background: "rgba(255,23,68,.06)",
              border: "1px solid rgba(255,23,68,.2)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--red)",
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          >
            {reason}
          </div>
        )}

        <div
          style={{
            background: "rgba(0,0,0,.3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "var(--text-dim)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          🔒 <strong style={{ color: "var(--text)" }}>Level Locked.</strong>{" "}
          Score at least{" "}
          <strong style={{ color: "var(--gold)" }}>
            {PASS_PCT}% ({required}/{total})
          </strong>{" "}
          to pass. All forward progress reset.
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/levels")}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              fontFamily: "var(--font-head)",
              fontSize: 11,
              letterSpacing: 1,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ← LEVEL SELECT
          </button>
          <button
            onClick={onRetry || (() => window.location.reload())}
            style={{
              padding: "10px 22px",
              background: "rgba(255,23,68,.2)",
              border: "1px solid var(--red)",
              color: "var(--red)",
              fontFamily: "var(--font-head)",
              fontSize: 11,
              letterSpacing: 1,
              borderRadius: 6,
              cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,23,68,.35)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,23,68,.2)")
            }
          >
            🔄 RETRY LVL {levelNum}
          </button>
          <button
            onClick={() => navigate("/level/1")}
            style={{
              padding: "10px 18px",
              background: "var(--red)",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-head)",
              fontSize: 11,
              letterSpacing: 1,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ▶ START FROM L1
          </button>
        </div>
      </div>
    </div>
  );
}
