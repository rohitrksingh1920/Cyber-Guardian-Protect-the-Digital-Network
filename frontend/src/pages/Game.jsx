import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/**
 * Game — hosts the standalone, endless "Cyber Dash: Firewall Runner" HTML5 game
 * (public/games/cyber-guardian-game.html) inside an iframe.
 *
 * The embedded game loops its 6 sectors forever (Subway-Surfers style — no
 * "victory" screen, it just keeps going and gets a little harder each lap)
 * and only stops when the player runs out of lives. It posts messages back
 * to this page on each sector clear and on game over; on game over we submit
 * that run's score to the backend so XP / level / achievements update, then
 * let the player retry immediately inside the game without leaving this page.
 */
export default function Game() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const runStartRef = useRef(Date.now());
  const submittingRef = useRef(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    runStartRef.current = Date.now();

    const onMessage = async (e) => {
      const data = e.data;
      if (!data || typeof data !== "object" || !String(data.type || "").startsWith("CYBER_GUARDIAN_")) {
        return;
      }

      if (data.type === "CYBER_GUARDIAN_LEVEL_PASS") {
        setLastEvent(`Sector ${data.level} secured — score ${data.score}`);
        return;
      }

      if (data.type === "CYBER_GUARDIAN_LOOP_COMPLETE") {
        setLastEvent(`Lap ${data.cycle} complete — score ${data.score}. Difficulty is stepping up!`);
        return;
      }

      if (data.type === "CYBER_GUARDIAN_GAMEOVER") {
        setLastEvent(`Breach detected on sector ${data.level} — final score ${data.score}`);
        if (submittingRef.current) return;
        submittingRef.current = true;
        const timeTaken = Math.floor((Date.now() - runStartRef.current) / 1000);
        try {
          const { data: res } = await api.post("/game/level/submit", {
            level: data.level || 1,
            score: data.score || 0,
            accuracy: 100,
            time_taken: timeTaken,
            difficulty: "agent",
          });
          setBanner({
            xp: res.xp_earned,
            levelUp: res.level_up,
            newLevel: res.new_level,
            achievements: res.achievements_unlocked || [],
          });
          await refreshUser();
        } catch {
          // If the submit fails (e.g. offline), don't block the player from retrying.
        } finally {
          submittingRef.current = false;
          runStartRef.current = Date.now(); // next run starts timing fresh
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [refreshUser]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar />

      <div
        style={{
          padding: "16px 24px 0",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 18px",
            background: "rgba(0,0,0,.3)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 6,
            fontFamily: "var(--font-head)",
            fontSize: 11,
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          ← EXIT TO DASHBOARD
        </button>
        {lastEvent && (
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{lastEvent}</div>
        )}
      </div>

      {banner && (
        <div
          style={{
            maxWidth: 900,
            margin: "12px auto 0",
            width: "100%",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--accent)",
              borderRadius: 8,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--gold)", fontFamily: "var(--font-head)" }}>
              +{banner.xp} XP
            </span>
            {banner.levelUp && (
              <span style={{ color: "var(--green)" }}>
                ⬆ Level up! You're now Level {banner.newLevel}
              </span>
            )}
            {banner.achievements.length > 0 && (
              <span style={{ color: "var(--gold)" }}>
                🏅 {banner.achievements.join(", ")}
              </span>
            )}
            <button
              onClick={() => setBanner(null)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "16px 24px 32px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            aspectRatio: "3 / 2",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 0 30px rgba(0,184,255,.15)",
            background: "#000",
          }}
        >
          <iframe
            title="Cyber Dash: Firewall Runner"
            src="/games/cyber-guardian-game.html"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="autoplay; fullscreen"
          />
        </div>
      </div>
    </div>
  );
}