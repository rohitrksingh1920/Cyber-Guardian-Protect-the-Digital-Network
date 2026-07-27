import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api from "../services/api";

// Badge tier definitions
const BADGE_TIERS = [
  {
    min: 0,
    max: 2,
    tier: "BRONZE",
    color: "#bf7c3a",
    bg: "rgba(191,124,58,.12)",
    glow: "rgba(191,124,58,.3)",
    icon: "🥉",
  },
  {
    min: 3,
    max: 5,
    tier: "SILVER",
    color: "#b0bec5",
    bg: "rgba(176,190,197,.12)",
    glow: "rgba(176,190,197,.3)",
    icon: "🥈",
  },
  {
    min: 6,
    max: 8,
    tier: "GOLD",
    color: "#ffd600",
    bg: "rgba(255,214,0,.12)",
    glow: "rgba(255,214,0,.3)",
    icon: "🥇",
  },
  {
    min: 9,
    max: 10,
    tier: "PLATINUM",
    color: "#00e5ff",
    bg: "rgba(0,229,255,.12)",
    glow: "rgba(0,229,255,.3)",
    icon: "💎",
  },
  {
    min: 11,
    max: 11,
    tier: "DIAMOND",
    color: "#e040fb",
    bg: "rgba(224,64,251,.12)",
    glow: "rgba(224,64,251,.3)",
    icon: "💠",
  },
  {
    min: 12,
    max: 999,
    tier: "LEGENDARY",
    color: "#ff6d00",
    bg: "rgba(255,109,0,.12)",
    glow: "rgba(255,109,0,.3)",
    icon: "🔱",
  },
];

function getBadgeTier(unlockedCount) {
  return (
    BADGE_TIERS.find((t) => unlockedCount >= t.min && unlockedCount <= t.max) ||
    BADGE_TIERS[0]
  );
}

function BadgeTierCard({ tier, unlockedCount, total }) {
  const pct = Math.min(100, Math.round((unlockedCount / total) * 100));
  return (
    <div
      style={{
        background: `${tier.bg}`,
        border: `1px solid ${tier.color}40`,
        borderRadius: 12,
        padding: "20px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 0 24px ${tier.glow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: tier.color,
          opacity: 0.07,
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          fontSize: 48,
          marginBottom: 8,
          filter: `drop-shadow(0 0 14px ${tier.color})`,
        }}
      >
        {tier.icon}
      </div>
      <div
        style={{
          fontFamily: "var(--font-head)",
          color: tier.color,
          fontSize: 16,
          letterSpacing: 2,
          marginBottom: 4,
        }}
      >
        {tier.tier}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
        {unlockedCount} / {total} achievements
      </div>
      <div
        style={{
          height: 6,
          background: "var(--border)",
          borderRadius: 3,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`,
            borderRadius: 3,
            transition: "width .8s ease",
            boxShadow: `0 0 8px ${tier.color}`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: tier.color,
          fontFamily: "var(--font-head)",
          letterSpacing: 1,
        }}
      >
        {pct}% COMPLETE
      </div>

      {/* Tier ladder */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {BADGE_TIERS.map((t) => (
          <div
            key={t.tier}
            title={t.tier}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: `2px solid ${unlockedCount >= t.min ? t.color : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              background:
                unlockedCount >= t.min ? `${t.color}15` : "transparent",
              transition: "all .3s",
            }}
          >
            {unlockedCount >= t.min ? t.icon : "○"}
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementCard({ a, index }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${a.unlocked ? "rgba(0,184,255,.35)" : "var(--border)"}`,
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        opacity: a.unlocked ? 1 : 0.45,
        transition: "var(--transition)",
        animation: `fadeIn .35s ${Math.min(index * 0.04, 0.5)}s ease both`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (a.unlocked) e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      {a.unlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            background: "rgba(0,230,118,.08)",
            borderBottomLeftRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          ✓
        </div>
      )}
      <div
        style={{
          fontSize: 30,
          filter: a.unlocked ? "none" : "grayscale(1)",
          flexShrink: 0,
        }}
      >
        {a.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {a.title}
          {a.unlocked && (
            <span
              style={{
                fontSize: 10,
                padding: "1px 7px",
                borderRadius: 10,
                background: "rgba(0,230,118,.1)",
                border: "1px solid rgba(0,230,118,.3)",
                color: "var(--green)",
                fontFamily: "var(--font-head)",
              }}
            >
              EARNED
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          {a.description}
        </div>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 11,
            color: a.unlocked ? "var(--gold)" : "var(--text-dim)",
          }}
        >
          +{a.pts_reward} pts
        </div>
        {a.unlocked && a.unlocked_at && (
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>
            🗓{" "}
            {new Date(a.unlocked_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Achievements() {
  const [achiev, setAchiev] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get("/achievements/")
      .then((r) => setAchiev(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlocked = achiev.filter((a) => a.unlocked);
  const locked = achiev.filter((a) => !a.unlocked);
  const totalPts = unlocked.reduce((s, a) => s + a.pts_reward, 0);
  const displayed =
    filter === "unlocked" ? unlocked : filter === "locked" ? locked : achiev;
  const pct =
    achiev.length > 0 ? Math.round((unlocked.length / achiev.length) * 100) : 0;
  const currentTier = getBadgeTier(unlocked.length);

  return (
    <div style={{ minHeight: "100vh", animation: "fadeIn .35s ease" }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD" />
      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 26,
              color: "var(--accent)",
              letterSpacing: 3,
            }}
          >
            🏅 ACHIEVEMENTS & BADGES
          </h1>
          <p style={{ color: "var(--text-dim)", marginTop: 8 }}>
            Earn medals in the field — unlock badge tiers as you progress
          </p>
        </div>

        {/* Badge tier card */}
        <div style={{ marginBottom: 24 }}>
          <BadgeTierCard
            tier={currentTier}
            unlockedCount={unlocked.length}
            total={achiev.length || 12}
          />
        </div>

        {/* Next tier hint */}
        {unlocked.length < 12 && (
          <div
            style={{
              background: "rgba(0,184,255,.06)",
              border: "1px solid rgba(0,184,255,.2)",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 20,
              fontSize: 12,
              color: "var(--text-dim)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>
              {BADGE_TIERS.find((t) => unlocked.length < t.min)?.icon || "🔱"}
            </span>
            <span>
              Next tier:{" "}
              <strong style={{ color: "var(--accent)" }}>
                {BADGE_TIERS.find((t) => unlocked.length < t.min)?.tier ||
                  "LEGENDARY"}
              </strong>{" "}
              — unlock{" "}
              <strong style={{ color: "var(--gold)" }}>
                {Math.max(
                  0,
                  (BADGE_TIERS.find((t) => unlocked.length < t.min)?.min ||
                    12) - unlocked.length,
                )}{" "}
                more achievement{unlocked.length < 11 ? "s" : ""}
              </strong>
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {[
            {
              label: "Unlocked",
              value: unlocked.length,
              color: "var(--accent)",
            },
            { label: "Locked", value: locked.length, color: "var(--text-dim)" },
            {
              label: "Points Earned",
              value: totalPts.toLocaleString(),
              color: "var(--green)",
            },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div
                className="stat-val"
                style={{ color: s.color, fontSize: 32 }}
              >
                {s.value}
              </div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--text-dim)",
              fontFamily: "var(--font-head)",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            <span>COMPLETION</span>
            <span
              style={{ color: pct === 100 ? "var(--green)" : "var(--accent)" }}
            >
              {pct}%
            </span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div
              className="progress-fill pf-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                fontFamily: "var(--font-head)",
                color: "var(--green)",
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              🏆 ALL ACHIEVEMENTS UNLOCKED — LEGENDARY STATUS!
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          {[
            ["all", "All"],
            ["unlocked", "Unlocked ✓"],
            ["locked", "Locked"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: "7px 18px",
                background: filter === val ? "var(--accent2)" : "transparent",
                border: `1px solid ${filter === val ? "var(--accent2)" : "var(--border)"}`,
                color: filter === val ? "#fff" : "var(--text-dim)",
                fontFamily: "var(--font-head)",
                fontSize: 10,
                letterSpacing: 1,
                borderRadius: 6,
                cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              {label}
            </button>
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--text-dim)",
            }}
          >
            {displayed.length} shown
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner" />
            <div className="page-loading-text">LOADING MEDALS...</div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏅</div>
            <div className="empty-title">
              {filter === "unlocked" ? "NO ACHIEVEMENTS YET" : "ALL ACHIEVED!"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {filter === "unlocked"
                ? "Complete levels to earn your first achievement!"
                : "You've earned every achievement!"}
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {displayed.map((a, i) => (
              <AchievementCard key={a.id} a={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
