import { useEffect, useRef, useState, useCallback } from "react";

const W = 340;
const H = 480;
const GRAVITY = 0.55;
const JUMP_FORCE = -12;
const DUCK_SIZE = 38;
const PLATFORM_H = 14;
const SCROLL_SPEED = 2.5;

interface Platform {
  id: number;
  x: number;
  y: number;
  w: number;
  hasSpike?: boolean;
  hasCoin?: boolean;
  coinCollected?: boolean;
}

interface GameState {
  duck: { x: number; y: number; vy: number; onGround: boolean };
  platforms: Platform[];
  score: number;
  coins: number;
  alive: boolean;
  pidCounter: number;
  tick: number;
  worldX: number;
}

interface Props {
  onCoinsEarned: (n: number) => void;
}

function makePlatform(x: number, y: number, id: number): Platform {
  const w = 60 + Math.random() * 80;
  const hasSpike = Math.random() < 0.2 && y < H - 40;
  const hasCoin = !hasSpike && Math.random() < 0.5;
  return { id, x, y, w, hasSpike, hasCoin, coinCollected: false };
}

function initPlatforms(): Platform[] {
  const plats: Platform[] = [];
  plats.push({ id: 0, x: 0, y: H - 40, w: W, hasSpike: false, hasCoin: false, coinCollected: false });
  let px = 180;
  let py = H - 130;
  for (let i = 1; i < 12; i++) {
    px += 80 + Math.random() * 60;
    py = Math.max(100, Math.min(H - 100, py + (Math.random() - 0.5) * 120));
    plats.push(makePlatform(px, py, i));
  }
  return plats;
}

export default function ParkourGame({ onCoinsEarned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    duck: { x: 60, y: H - 80, vy: 0, onGround: false },
    platforms: initPlatforms(),
    score: 0,
    coins: 0,
    alive: true,
    pidCounter: 20,
    tick: 0,
    worldX: 0,
  });
  const rafRef = useRef(0);
  const jumpQueued = useRef(false);
  const [gamePhase, setGamePhase] = useState<"idle" | "playing" | "dead">("idle");
  const [displayScore, setDisplayScore] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);

  const resetState = () => {
    stateRef.current = {
      duck: { x: 60, y: H - 80, vy: 0, onGround: false },
      platforms: initPlatforms(),
      score: 0,
      coins: 0,
      alive: true,
      pidCounter: 20,
      tick: 0,
      worldX: 0,
    };
    setDisplayScore(0);
    setDisplayCoins(0);
  };

  const doJump = useCallback(() => {
    const s = stateRef.current;
    if (s.duck.onGround) {
      s.duck.vy = JUMP_FORCE;
      s.duck.onGround = false;
    } else {
      jumpQueued.current = true;
    }
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    if (!s.alive) return;

    s.tick++;
    s.score++;
    s.worldX += SCROLL_SPEED;

    // physics
    s.duck.vy += GRAVITY;
    s.duck.y += s.duck.vy;
    s.duck.onGround = false;

    // platform collision
    for (const p of s.platforms) {
      const screenX = p.x - s.worldX;
      if (
        s.duck.x + DUCK_SIZE > screenX + 4 &&
        s.duck.x < screenX + p.w - 4 &&
        s.duck.y + DUCK_SIZE > p.y &&
        s.duck.y + DUCK_SIZE < p.y + PLATFORM_H + s.duck.vy + 2 &&
        s.duck.vy >= 0
      ) {
        s.duck.y = p.y - DUCK_SIZE;
        s.duck.vy = 0;
        s.duck.onGround = true;

        if (p.hasSpike) {
          s.alive = false;
          setGamePhase("dead");
          setDisplayScore(Math.floor(s.score / 10));
          return;
        }

        if (jumpQueued.current) {
          s.duck.vy = JUMP_FORCE;
          s.duck.onGround = false;
          jumpQueued.current = false;
        }
      }

      // coin pick
      if (p.hasCoin && !p.coinCollected) {
        const screenXC = p.x - s.worldX + p.w / 2 - 10;
        const coinY = p.y - 28;
        if (s.duck.x < screenXC + 20 && s.duck.x + DUCK_SIZE > screenXC && s.duck.y < coinY + 20 && s.duck.y + DUCK_SIZE > coinY) {
          p.coinCollected = true;
          s.coins += 3;
          setDisplayCoins(s.coins);
          onCoinsEarned(3);
        }
      }
    }

    jumpQueued.current = false;

    // fell off
    if (s.duck.y > H + 80) {
      s.alive = false;
      setGamePhase("dead");
      setDisplayScore(Math.floor(s.score / 10));
      return;
    }

    // spawn new platforms
    const lastX = Math.max(...s.platforms.map((p) => p.x));
    if (lastX - s.worldX < W + 100) {
      const newX = lastX + 80 + Math.random() * 70;
      const newY = Math.max(80, Math.min(H - 80, s.platforms[s.platforms.length - 1].y + (Math.random() - 0.5) * 130));
      s.platforms.push(makePlatform(newX, newY, s.pidCounter++));
    }

    // remove off-screen
    s.platforms = s.platforms.filter((p) => p.x - s.worldX > -200);

    // === DRAW ===
    // Sky gradient
    ctx.fillStyle = "#07070F";
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 73 + s.tick * 0.3) % W);
      const sy = (i * 47) % (H * 0.7);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Buildings bg
    for (let i = 0; i < 6; i++) {
      const bx = ((i * 120 - (s.worldX * 0.2) % 720) + 720) % 720 - 60;
      const bh = 80 + (i * 37) % 120;
      ctx.fillStyle = `rgba(${20 + i * 5},${10 + i * 3},${40 + i * 4},0.8)`;
      ctx.fillRect(bx, H - bh, 70, bh);
      // windows
      for (let wr = 0; wr < 3; wr++) {
        for (let wc = 0; wc < 2; wc++) {
          ctx.fillStyle = Math.random() > 0.7 ? "rgba(255,217,61,0.6)" : "rgba(255,255,255,0.08)";
          ctx.fillRect(bx + 8 + wc * 26, H - bh + 10 + wr * 22, 14, 14);
        }
      }
    }

    // Platforms
    for (const p of s.platforms) {
      const sx = p.x - s.worldX;
      if (sx > W + 20 || sx + p.w < -20) continue;

      // platform body
      const grad = ctx.createLinearGradient(sx, p.y, sx, p.y + PLATFORM_H);
      grad.addColorStop(0, "#7B2FBE");
      grad.addColorStop(1, "#4a1a7a");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(sx, p.y, p.w, PLATFORM_H, 4);
      ctx.fill();

      // glow top
      ctx.strokeStyle = "rgba(123,47,190,0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + 4, p.y + 1);
      ctx.lineTo(sx + p.w - 4, p.y + 1);
      ctx.stroke();

      // spikes
      if (p.hasSpike) {
        ctx.fillStyle = "#FF3CAC";
        const sCount = Math.floor(p.w / 18);
        for (let si = 0; si < sCount; si++) {
          const sx2 = sx + si * 18 + 5;
          ctx.beginPath();
          ctx.moveTo(sx2, p.y);
          ctx.lineTo(sx2 + 8, p.y - 14);
          ctx.lineTo(sx2 + 16, p.y);
          ctx.fill();
        }
      }

      // coin
      if (p.hasCoin && !p.coinCollected) {
        const cx = sx + p.w / 2 - 10;
        const cy = p.y - 30;
        const pulse = Math.sin(s.tick * 0.1) * 2;
        ctx.fillStyle = "#FFD93D";
        ctx.beginPath();
        ctx.arc(cx + 10, cy + 10 + pulse, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FF6B35";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🪙", cx + 10, cy + 15 + pulse);
        ctx.textAlign = "left";
      }
    }

    // Duck
    const dx = s.duck.x;
    const dy = s.duck.y;
    const squish = s.duck.onGround ? 1.15 : (s.duck.vy < 0 ? 0.85 : 1.0);

    ctx.save();
    ctx.translate(dx + DUCK_SIZE / 2, dy + DUCK_SIZE / 2);
    ctx.scale(squish, 2 - squish);
    ctx.translate(-(DUCK_SIZE / 2), -(DUCK_SIZE / 2));

    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    ctx.ellipse(DUCK_SIZE / 2, DUCK_SIZE * 0.65, DUCK_SIZE * 0.45, DUCK_SIZE * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(DUCK_SIZE / 2, DUCK_SIZE * 0.28, DUCK_SIZE * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF6B35";
    ctx.beginPath();
    ctx.moveTo(DUCK_SIZE * 0.75, DUCK_SIZE * 0.28);
    ctx.lineTo(DUCK_SIZE * 0.95, DUCK_SIZE * 0.32);
    ctx.lineTo(DUCK_SIZE * 0.75, DUCK_SIZE * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0D0D1A";
    ctx.beginPath();
    ctx.arc(DUCK_SIZE * 0.62, DUCK_SIZE * 0.23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD
    ctx.fillStyle = "rgba(255,217,61,0.9)";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`🏃 ${Math.floor(s.score / 10)}м`, 8, 24);
    ctx.fillText(`🪙 ${s.coins}`, 8, 44);

    setDisplayScore(Math.floor(s.score / 10));
    rafRef.current = requestAnimationFrame(loop);
  }, [onCoinsEarned]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ([" ", "ArrowUp", "w"].includes(e.key)) {
        e.preventDefault();
        doJump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [doJump]);

  useEffect(() => {
    if (gamePhase === "playing") {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [gamePhase, loop]);

  const startGame = () => {
    cancelAnimationFrame(rafRef.current);
    resetState();
    setGamePhase("playing");
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{ width: W, boxShadow: "0 0 40px rgba(0,245,255,0.2)" }}
        onClick={gamePhase === "playing" ? doJump : undefined}
      >
        <canvas ref={canvasRef} width={W} height={H} />

        {gamePhase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-6">
            <div className="text-6xl animate-float">🦅</div>
            <div className="font-russo text-white text-2xl">Паркур Утки</div>
            <p className="text-white/50 text-sm text-center px-8">Пробел / тап на экран — прыжок. Собирай монеты, избегай шипов!</p>
            <button onClick={startGame} className="btn-primary px-8 py-3 rounded-full font-russo text-base">Прыгать!</button>
          </div>
        )}

        {gamePhase === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
            <div className="text-5xl">💫</div>
            <div className="font-russo text-white text-xl">Упал!</div>
            <div className="font-russo text-duck-yellow text-3xl">{displayScore} м</div>
            <div className="text-duck-yellow/70 text-sm">заработано 🪙{displayCoins}</div>
            <button onClick={startGame} className="btn-primary px-8 py-3 rounded-full font-russo mt-2">Снова!</button>
          </div>
        )}
      </div>

      <button
        onPointerDown={doJump}
        className="w-20 h-20 rounded-full bg-duck-cyan/10 border-2 border-duck-cyan/40 flex items-center justify-center text-3xl active:scale-90 transition-transform"
        style={{ boxShadow: "0 0 20px rgba(0,245,255,0.2)" }}
      >
        ⬆️
      </button>
      <p className="text-white/20 text-xs">Тап или Пробел — прыжок</p>
    </div>
  );
}
