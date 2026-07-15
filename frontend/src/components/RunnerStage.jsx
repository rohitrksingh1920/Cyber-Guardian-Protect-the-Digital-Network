import { useEffect, useRef, useState, useCallback } from "react";

/**
 * RunnerStage — Subway-Surfers-style 3-lane runner used as the
 * "complete the level" gameplay segment before each quiz.
 *
 * Player dodges MALWARE (jump), ducks under FIREWALLS (slide),
 * switches lanes around TROJAN BLOCKERS (full lane, must change lane),
 * and collects DATA PACKETS for score.
 *
 * Props:
 *   levelId   - number 1-6, used to scale difficulty
 *   color     - accent color for this level's theme
 *   label     - short level label shown in HUD ("PASSWORD FORTRESS")
 *   targetScore - score needed to clear the run and unlock the quiz
 *   onComplete  - called with { score, dataCollected } when target reached
 */
export default function RunnerStage({
  levelId = 1,
  color = "#00b8ff",
  label = "RUN",
  targetScore = 400,
  onComplete,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, data: 0, lives: 3 });
  const [phase, setPhase] = useState("intro"); // intro | running | hit | cleared
  const [flash, setFlash] = useState(false);

  const W = 480;
  const H = 600;
  const LANES = [W / 2 - 130, W / 2, W / 2 + 130];
  const GROUND_Y = H - 90;
  const PLAYER_W = 38;
  const PLAYER_H = 56;

  const baseSpeed = 5.5 + levelId * 0.4;

  const initState = useCallback(() => {
    stateRef.current = {
      lane: 1,
      vy: 0,
      jumpT: 0,
      slideT: 0,
      speed: baseSpeed,
      obstacles: [],
      packets: [],
      spawnCooldown: 60,
      score: 0,
      data: 0,
      lives: 3,
      frame: 0,
      invuln: 0,
      done: false,
    };
  }, [baseSpeed]);

  // --- input ---
  const doJump = useCallback(() => {
    const s = stateRef.current;
    if (!s || phase !== "running") return;
    if (s.jumpT > 0 || s.slideT > 0) return;
    s.jumpT = 1;
  }, [phase]);

  const doSlide = useCallback(() => {
    const s = stateRef.current;
    if (!s || phase !== "running") return;
    if (s.jumpT > 0 || s.slideT > 0) return;
    s.slideT = 1;
  }, [phase]);

  const moveLane = useCallback(
    (dir) => {
      const s = stateRef.current;
      if (!s || phase !== "running") return;
      s.lane = Math.max(0, Math.min(2, s.lane + dir));
    },
    [phase],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowUp", "w", "W", " "].includes(e.key)) {
        e.preventDefault();
        doJump();
      } else if (["ArrowDown", "s", "S"].includes(e.key)) {
        e.preventDefault();
        doSlide();
      } else if (["ArrowLeft", "a", "A"].includes(e.key)) {
        moveLane(-1);
      } else if (["ArrowRight", "d", "D"].includes(e.key)) {
        moveLane(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doJump, doSlide, moveLane]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let sx = 0,
      sy = 0;
    const ts = (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const te = (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) moveLane(1);
        else if (dx < -30) moveLane(-1);
      } else {
        if (dy > 30) doSlide();
        else if (dy < -30) doJump();
      }
    };
    el.addEventListener("touchstart", ts);
    el.addEventListener("touchend", te);
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchend", te);
    };
  }, [doJump, doSlide, moveLane]);

  // --- start run ---
  const startRun = () => {
    initState();
    setHud({ score: 0, data: 0, lives: 3 });
    setPhase("running");
  };

  // --- main loop ---
  useEffect(() => {
    if (phase !== "running") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      const s = stateRef.current;
      if (!s || s.done) return;
      s.frame++;

      // jump/slide progression
      if (s.jumpT > 0) {
        s.jumpT += 0.045;
        if (s.jumpT >= 2) s.jumpT = 0;
      }
      if (s.slideT > 0) {
        s.slideT += 0.045;
        if (s.slideT >= 2) s.slideT = 0;
      }
      if (s.invuln > 0) s.invuln--;

      // speed ramps with score
      s.speed = baseSpeed + Math.min(7, s.score / 250);

      // spawn
      s.spawnCooldown--;
      if (s.spawnCooldown <= 0) {
        const roll = Math.random();
        if (roll < 0.3) {
          const lane = Math.floor(Math.random() * 3);
          for (let i = 0; i < 3; i++) {
            s.packets.push({ lane, y: -60 - i * 46, id: Math.random() });
          }
        } else if (roll < 0.55) {
          const lane = Math.floor(Math.random() * 3);
          s.obstacles.push({
            type: "trojan",
            lane,
            y: -160,
            id: Math.random(),
          });
          if (Math.random() < 0.6) {
            const free = [0, 1, 2].filter((l) => l !== lane);
            const fl = free[Math.floor(Math.random() * free.length)];
            s.packets.push({ lane: fl, y: -100, id: Math.random() });
          }
        } else {
          const lane = Math.floor(Math.random() * 3);
          const type = Math.random() < 0.5 ? "malware" : "firewall";
          s.obstacles.push({ type, lane, y: -60, id: Math.random() });
        }
        s.spawnCooldown = Math.max(28, 62 - levelId * 3 - s.score / 60);
      }

      // move
      s.obstacles.forEach((o) => (o.y += s.speed));
      s.packets.forEach((p) => (p.y += s.speed));
      s.obstacles = s.obstacles.filter((o) => o.y < H + 80);
      s.packets = s.packets.filter((p) => p.y < H + 40);

      // player vertical pos
      let playerLift = 0;
      if (s.jumpT > 0 && s.jumpT < 2) {
        playerLift =
          Math.sin(Math.min(s.jumpT, 1) * Math.PI * (s.jumpT < 1 ? 1 : 0)) * 0;
        const t = s.jumpT;
        playerLift = Math.sin(Math.min(t, 1) * Math.PI) * 95;
      }
      const isSliding = s.slideT > 0 && s.slideT < 2;

      // collisions
      const px = LANES[s.lane];
      const pTop = GROUND_Y - PLAYER_H - playerLift;
      const pBot = GROUND_Y - playerLift;

      for (const o of s.obstacles) {
        if (o.hit) continue;
        const oy = o.y;
        const closeY = oy > pTop - 10 && oy < pBot + 20;
        if (o.lane !== s.lane || !closeY) continue;
        let avoided = false;
        if (o.type === "malware" && playerLift > 35) avoided = true;
        if (o.type === "firewall" && isSliding) avoided = true;
        if (o.type === "trojan") avoided = false;
        if (!avoided && s.invuln === 0) {
          o.hit = true;
          s.lives -= 1;
          s.invuln = 70;
          setFlash(true);
          setTimeout(() => setFlash(false), 200);
          if (s.lives <= 0) {
            s.done = true;
            setPhase("hit");
            setHud({ score: Math.floor(s.score), data: s.data, lives: 0 });
            return;
          }
        }
      }

      // packets pickup
      s.packets = s.packets.filter((p) => {
        const closeY = p.y > pTop - 10 && p.y < pBot + 20;
        if (p.lane === s.lane && closeY) {
          s.data += 1;
          s.score += 15;
          return false;
        }
        return true;
      });

      s.score += 0.5;

      if (s.score >= targetScore) {
        s.done = true;
        setPhase("cleared");
        setHud({ score: Math.floor(s.score), data: s.data, lives: s.lives });
        return;
      }

      if (s.frame % 4 === 0) {
        setHud({ score: Math.floor(s.score), data: s.data, lives: s.lives });
      }

      draw(ctx, s, playerLift, isSliding);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "cleared" && onComplete) {
      onComplete({ score: hud.score, dataCollected: hud.data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function draw(ctx, s, playerLift, isSliding) {
    ctx.clearRect(0, 0, W, H);

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, "#040d1c");
    sky.addColorStop(1, "#071a36");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // parallax server towers
    const off = (s.frame * (s.speed * 0.15)) % 80;
    ctx.fillStyle = "rgba(0,184,255,0.07)";
    for (let i = -1; i < 8; i++) {
      const bx = i * 80 - off;
      const bh = 60 + ((i * 37) % 90);
      ctx.fillRect(bx, GROUND_Y - bh - 40, 46, bh);
    }
    ctx.fillStyle = "rgba(0,184,255,0.04)";
    for (let i = -1; i < 6; i++) {
      const bx = i * 110 - ((off * 1.6) % 110);
      const bh = 90 + ((i * 53) % 130);
      ctx.fillRect(bx, GROUND_Y - bh - 10, 64, bh);
    }

    // ground
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    groundGrad.addColorStop(0, "#0b1f3f");
    groundGrad.addColorStop(1, "#020812");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // lane lines (scrolling grid, perspective-ish)
    ctx.strokeStyle = "rgba(0,223,255,0.35)";
    ctx.lineWidth = 2;
    const scroll = (s.frame * s.speed) % 40;
    for (let lx of [
      LANES[0] - 65,
      LANES[1] - 65,
      LANES[2] - 65,
      LANES[2] + 65,
    ]) {
      ctx.beginPath();
      ctx.moveTo(lx, GROUND_Y);
      ctx.lineTo(lx, H);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,223,255,0.15)";
    for (let y = GROUND_Y + (scroll % 40); y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // obstacles
    s.obstacles.forEach((o) => {
      const x = LANES[o.lane];
      if (o.type === "malware") {
        ctx.save();
        ctx.translate(x, o.y);
        ctx.fillStyle = "#ff1744";
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(8, 8);
        ctx.moveTo(8, -8);
        ctx.lineTo(-8, 8);
        ctx.stroke();
        ctx.restore();
      } else if (o.type === "firewall") {
        ctx.save();
        ctx.fillStyle = "rgba(255,145,0,0.85)";
        ctx.shadowColor = "#ff9100";
        ctx.shadowBlur = 10;
        ctx.fillRect(x - 38, o.y - 95, 76, 22);
        ctx.shadowBlur = 0;
        for (let i = -3; i <= 3; i++) {
          ctx.fillStyle = "rgba(255,200,100,0.6)";
          ctx.fillRect(x + i * 11 - 2, o.y - 95, 3, 22);
        }
        ctx.restore();
      } else if (o.type === "trojan") {
        ctx.save();
        ctx.fillStyle = "#3a0d4d";
        ctx.shadowColor = "#e040fb";
        ctx.shadowBlur = 16;
        ctx.fillRect(x - 42, o.y - 210, 84, 210);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(224,64,251,0.8)";
        ctx.fillRect(x - 42, o.y - 14, 84, 14);
        ctx.fillStyle = "#1a0524";
        for (let wy = 0; wy < 3; wy++) {
          ctx.fillRect(x - 22, o.y - 180 + wy * 60, 18, 24);
          ctx.fillRect(x + 4, o.y - 180 + wy * 60, 18, 24);
        }
        ctx.restore();
      }
    });

    // data packets
    s.packets.forEach((p) => {
      const x = LANES[p.lane];
      const spin = Math.abs(Math.sin(s.frame * 0.15 + p.id * 10));
      ctx.save();
      ctx.translate(x, p.y);
      ctx.scale(0.4 + spin * 0.6, 1);
      ctx.fillStyle = "#00e676";
      ctx.shadowColor = "#00e676";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // player (guardian)
    const px = LANES[s.lane];
    const pH = isSliding ? PLAYER_H * 0.55 : PLAYER_H;
    const pTopY = GROUND_Y - pH - playerLift;
    ctx.save();
    if (s.invuln > 0 && Math.floor(s.frame / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    const r = 10;
    const w = PLAYER_W;
    ctx.beginPath();
    ctx.moveTo(px - w / 2 + r, pTopY);
    ctx.arcTo(px + w / 2, pTopY, px + w / 2, pTopY + pH, r);
    ctx.arcTo(px + w / 2, pTopY + pH, px - w / 2, pTopY + pH, r);
    ctx.arcTo(px - w / 2, pTopY + pH, px - w / 2, pTopY, r);
    ctx.arcTo(px - w / 2, pTopY, px + w / 2, pTopY, r);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // visor
    ctx.fillStyle = "#04111f";
    ctx.fillRect(px - w / 2 + 6, pTopY + 10, w - 12, 10);
    ctx.restore();

    // ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(px, GROUND_Y + 6, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: W,
          marginBottom: 10,
          fontFamily: "var(--font-head)",
          fontSize: 12,
          letterSpacing: 1,
        }}
      >
        <span style={{ color }}>{label}</span>
        <span style={{ color: "var(--gold)" }}>
          SCORE {hud.score} / {targetScore}
        </span>
        <span style={{ color: "var(--green)" }}>📦 {hud.data}</span>
        <span style={{ color: "var(--red)" }}>
          {"❤".repeat(hud.lives)}
          {"♡".repeat(Math.max(0, 3 - hud.lives))}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${color}55`,
          boxShadow: flash ? `0 0 0 4px ${"#ff1744"}` : `0 0 30px ${color}20`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", touchAction: "none" }}
        />

        {phase === "intro" && (
          <Overlay>
            <h2
              style={{
                color,
                fontFamily: "var(--font-head)",
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              {label}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-dim)",
                maxWidth: 320,
                lineHeight: 1.6,
              }}
            >
              Dodge red MALWARE (jump), duck under orange FIREWALLS (slide),
              switch lanes around purple TROJAN blocks, and collect green DATA
              PACKETS. Reach{" "}
              <b style={{ color: "var(--gold)" }}>{targetScore} score</b> to
              clear the run and unlock the security quiz.
            </p>
            <p
              style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}
            >
              Arrow keys / WASD or swipe
            </p>
            <button onClick={startRun} style={btnStyle(color)}>
              ▶ START RUN
            </button>
          </Overlay>
        )}

        {phase === "hit" && (
          <Overlay>
            <h2
              style={{
                color: "var(--red)",
                fontFamily: "var(--font-head)",
                fontSize: 18,
              }}
            >
              SYSTEM BREACHED
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>
              Score: {hud.score} • Data: {hud.data}
            </p>
            <button onClick={startRun} style={btnStyle(color)}>
              ↻ RETRY RUN
            </button>
          </Overlay>
        )}

        {phase === "cleared" && (
          <Overlay>
            <h2
              style={{
                color: "var(--green)",
                fontFamily: "var(--font-head)",
                fontSize: 18,
              }}
            >
              RUN CLEARED ✅
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>
              Score: {hud.score} • Data Packets: {hud.data}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
              Loading security quiz…
            </p>
          </Overlay>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <CtrlBtn onClick={() => moveLane(-1)}>⬅</CtrlBtn>
        <CtrlBtn onClick={doJump}>⬆ JUMP</CtrlBtn>
        <CtrlBtn onClick={doSlide}>⬇ SLIDE</CtrlBtn>
        <CtrlBtn onClick={() => moveLane(1)}>➡</CtrlBtn>
      </div>
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(2,8,18,0.88)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

function btnStyle(color) {
  return {
    marginTop: 18,
    padding: "10px 26px",
    background: `${color}22`,
    border: `1px solid ${color}`,
    color,
    fontFamily: "var(--font-head)",
    fontSize: 12,
    letterSpacing: 1,
    borderRadius: 6,
  };
}

function CtrlBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        borderRadius: 8,
        fontFamily: "var(--font-head)",
        fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}
