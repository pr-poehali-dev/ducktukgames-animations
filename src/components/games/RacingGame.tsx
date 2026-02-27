import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onCoinsEarned: (n: number) => void;
}

const ROAD_W = 340;
const GAME_H = 480;
const LANE_COUNT = 3;
const LANE_W = ROAD_W / LANE_COUNT;
const DUCK_W = 48;
const DUCK_H = 60;
const ENEMY_W = 44;
const ENEMY_H = 58;

interface Enemy {
  id: number;
  lane: number;
  y: number;
}

export default function RacingGame({ onCoinsEarned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    lane: 1,
    y: GAME_H - 90,
    enemies: [] as Enemy[],
    speed: 3,
    score: 0,
    coins: 0,
    alive: true,
    roadOffset: 0,
    tick: 0,
    enemyId: 0,
    keys: { left: false, right: false },
  });
  const rafRef = useRef(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);

  const getX = (lane: number) => lane * LANE_W + LANE_W / 2 - DUCK_W / 2 + (ROAD_W - ROAD_W) / 2;

  const reset = () => {
    const s = stateRef.current;
    s.lane = 1;
    s.y = GAME_H - 90;
    s.enemies = [];
    s.speed = 3;
    s.score = 0;
    s.coins = 0;
    s.alive = true;
    s.roadOffset = 0;
    s.tick = 0;
    s.enemyId = 0;
    setScore(0);
    setCoins(0);
  };

  const drawRoad = (ctx: CanvasRenderingContext2D, offset: number) => {
    // road bg
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, ROAD_W, GAME_H);

    // lane lines
    const dashH = 40;
    const gapH = 30;
    const total = dashH + gapH;
    for (let lane = 1; lane < LANE_COUNT; lane++) {
      ctx.fillStyle = "rgba(255,217,61,0.25)";
      const x = lane * LANE_W - 2;
      let y = (offset % total) - total;
      while (y < GAME_H) {
        ctx.fillRect(x, y, 4, dashH);
        y += total;
      }
    }

    // edges
    ctx.fillStyle = "#FF6B35";
    ctx.fillRect(0, 0, 4, GAME_H);
    ctx.fillRect(ROAD_W - 4, 0, 4, GAME_H);
  };

  const drawDuck = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // body
    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    ctx.ellipse(x + DUCK_W / 2, y + DUCK_H * 0.6, DUCK_W / 2, DUCK_H * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    ctx.arc(x + DUCK_W / 2, y + DUCK_H * 0.22, DUCK_W * 0.28, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = "#FF6B35";
    ctx.beginPath();
    ctx.moveTo(x + DUCK_W / 2 + DUCK_W * 0.28, y + DUCK_H * 0.22);
    ctx.lineTo(x + DUCK_W / 2 + DUCK_W * 0.48, y + DUCK_H * 0.26);
    ctx.lineTo(x + DUCK_W / 2 + DUCK_W * 0.28, y + DUCK_H * 0.3);
    ctx.closePath();
    ctx.fill();
    // eye
    ctx.fillStyle = "#0D0D1A";
    ctx.beginPath();
    ctx.arc(x + DUCK_W / 2 + 4, y + DUCK_H * 0.18, 3, 0, Math.PI * 2);
    ctx.fill();
    // wheels
    ctx.fillStyle = "#333";
    [[8, DUCK_H - 8], [DUCK_W - 14, DUCK_H - 8]].forEach(([wx, wy]) => {
      ctx.beginPath();
      ctx.arc(x + wx, y + wy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#555";
      ctx.beginPath();
      ctx.arc(x + wx, y + wy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#333";
    });
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "#FF3CAC";
    ctx.beginPath();
    ctx.ellipse(x + ENEMY_W / 2, y + ENEMY_H * 0.6, ENEMY_W / 2, ENEMY_H * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF3CAC";
    ctx.beginPath();
    ctx.arc(x + ENEMY_W / 2, y + ENEMY_H * 0.24, ENEMY_W * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7B2FBE";
    ctx.beginPath();
    ctx.moveTo(x + ENEMY_W / 2 - ENEMY_W * 0.28, y + ENEMY_H * 0.22);
    ctx.lineTo(x + ENEMY_W / 2 - ENEMY_W * 0.5, y + ENEMY_H * 0.26);
    ctx.lineTo(x + ENEMY_W / 2 - ENEMY_W * 0.28, y + ENEMY_H * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0D0D1A";
    ctx.beginPath();
    ctx.arc(x + ENEMY_W / 2 - 4, y + ENEMY_H * 0.19, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF3CAC";
    ctx.beginPath();
    ctx.arc(x + ENEMY_W / 2 - 4, y + ENEMY_H * 0.19, 1.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    s.tick++;
    s.roadOffset += s.speed;
    s.score++;
    s.speed = 3 + Math.floor(s.score / 200) * 0.5;

    // coins every 100 score
    if (s.score % 100 === 0) {
      s.coins += 5;
      setCoins(s.coins);
      onCoinsEarned(5);
    }

    // move player
    if (s.keys.left && s.lane > 0) { s.lane--; s.keys.left = false; }
    if (s.keys.right && s.lane < LANE_COUNT - 1) { s.lane++; s.keys.right = false; }

    // spawn enemies
    if (s.tick % Math.max(60 - Math.floor(s.score / 300), 25) === 0) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      s.enemies.push({ id: s.enemyId++, lane, y: -ENEMY_H });
    }

    // move enemies
    s.enemies = s.enemies.map((e) => ({ ...e, y: e.y + s.speed + 1 })).filter((e) => e.y < GAME_H + ENEMY_H);

    // collision
    const px = getX(s.lane);
    const py = s.y;
    for (const e of s.enemies) {
      const ex = getX(e.lane);
      const ey = e.y;
      if (
        e.lane === s.lane &&
        ey + ENEMY_H > py + 10 &&
        ey < py + DUCK_H - 10
      ) {
        s.alive = false;
        setGameState("dead");
        setScore(Math.floor(s.score / 10));
        return;
      }
    }

    // draw
    drawRoad(ctx, s.roadOffset);
    s.enemies.forEach((e) => drawEnemy(ctx, getX(e.lane), e.y));
    drawDuck(ctx, px, py);

    // score overlay
    ctx.fillStyle = "rgba(255,217,61,0.9)";
    ctx.font = "bold 14px 'Russo One', sans-serif";
    ctx.fillText(`🏁 ${Math.floor(s.score / 10)}м`, 8, 24);
    ctx.fillText(`🪙 ${s.coins}`, 8, 44);

    setScore(Math.floor(s.score / 10));
    rafRef.current = requestAnimationFrame(loop);
  }, [onCoinsEarned]);

  const startGame = () => {
    reset();
    setGameState("playing");
    setTimeout(() => {
      rafRef.current = requestAnimationFrame(loop);
    }, 50);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") stateRef.current.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") stateRef.current.keys.right = true;
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState, loop]);

  const moveLeft = () => { stateRef.current.keys.left = true; };
  const moveRight = () => { stateRef.current.keys.right = true; };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="relative rounded-2xl overflow-hidden" style={{ width: ROAD_W, boxShadow: "0 0 40px rgba(255,107,53,0.3)" }}>
        <canvas ref={canvasRef} width={ROAD_W} height={GAME_H} />

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-6">
            <div className="text-6xl animate-float">🏎️</div>
            <div className="font-russo text-white text-2xl text-center">Гонки Утят</div>
            <p className="text-white/50 text-sm text-center px-8">← → или кнопки внизу для движения. Уворачивайся от врагов!</p>
            <button onClick={startGame} className="btn-primary px-8 py-3 rounded-full font-russo text-base">Поехали!</button>
          </div>
        )}

        {gameState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
            <div className="text-5xl">💥</div>
            <div className="font-russo text-white text-xl">Авария!</div>
            <div className="font-russo text-duck-yellow text-3xl">{score} м</div>
            <div className="text-duck-yellow/70 text-sm">заработано 🪙{coins}</div>
            <button onClick={startGame} className="btn-primary px-8 py-3 rounded-full font-russo mt-2">Снова!</button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex gap-6">
        <button
          onPointerDown={moveLeft}
          className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl active:bg-white/20 transition-all active:scale-90"
        >
          ←
        </button>
        <div className="flex items-center font-russo text-white/30 text-xs">УПРАВЛЕНИЕ</div>
        <button
          onPointerDown={moveRight}
          className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl active:bg-white/20 transition-all active:scale-90"
        >
          →
        </button>
      </div>
    </div>
  );
}
