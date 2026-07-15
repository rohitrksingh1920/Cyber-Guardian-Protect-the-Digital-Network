import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState("");

  const load = (code = "") => {
    setLoading(true);
    const url = code
      ? `/leaderboard/?limit=50&school_code=${code}`
      : "/leaderboard/?limit=50";
    api
      .get(url)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const rankColor = (r) =>
    r === 1
      ? "#ffd600"
      : r === 2
        ? "#b0bec5"
        : r === 3
          ? "#bf7c3a"
          : "var(--text-dim)";

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .35s ease" }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD" />
      <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 26,
              color: "var(--accent)",
              letterSpacing: 3,
            }}
          >
            📊 LEADERBOARD
          </h1>
          <p style={{ color: "var(--text-dim)", marginTop: 8 }}>
            Top Cyber Defenders
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Filter by school code..."
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(school)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={() => load(school)}>
            FILTER
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setSchool("");
              load("");
            }}
          >
            RESET
          </button>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "50px 1fr 80px 90px 110px",
              padding: "12px 20px",
              background: "rgba(0,0,0,.3)",
              fontSize: 11,
              color: "var(--text-dim)",
              letterSpacing: 1,
              fontFamily: "var(--font-head)",
            }}
          >
            <span>RANK</span>
            <span>AGENT</span>
            <span style={{ textAlign: "center" }}>LEVEL</span>
            <span style={{ textAlign: "center" }}>XP</span>
            <span style={{ textAlign: "right" }}>SCORE</span>
          </div>

          {loading ? (
            <div className="page-loading" style={{ minHeight: 200 }}>
              <div className="loading-spinner" />
              <div className="page-loading-text">LOADING AGENTS...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">NO AGENTS FOUND</div>
            </div>
          ) : (
            data.map((entry, i) => {
              const isMe = user && entry.username === user.username;
              return (
                <div
                  key={entry.rank}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 80px 90px 110px",
                    alignItems: "center",
                    padding: "13px 20px",
                    borderBottom: "1px solid rgba(26,53,96,.3)",
                    background: isMe ? "rgba(0,184,255,.06)" : "transparent",
                    transition: "background .2s",
                    animation: `fadeIn .3s ${i * 0.03}s ease both`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMe)
                      e.currentTarget.style.background = "rgba(0,184,255,.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isMe) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: `2px solid ${rankColor(entry.rank)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-head)",
                      fontSize: 11,
                      color: rankColor(entry.rank),
                    }}
                  >
                    {entry.rank}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 20 }}>{entry.avatar}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: isMe ? "var(--accent)" : "var(--text)",
                      }}
                    >
                      {entry.username}
                      {isMe && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--accent)",
                            marginLeft: 6,
                          }}
                        >
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--accent)",
                      fontFamily: "var(--font-head)",
                      fontSize: 12,
                    }}
                  >
                    {entry.level}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-dim)",
                      fontSize: 12,
                    }}
                  >
                    {entry.xp.toLocaleString()}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      color: "var(--green)",
                      fontFamily: "var(--font-head)",
                      fontSize: 14,
                    }}
                  >
                    {entry.total_score.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
