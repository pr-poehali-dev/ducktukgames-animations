import { useState, useEffect, useCallback } from "react";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

interface Upgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  multiplier: number;
  emoji: string;
  count: number;
}

const BASE_UPGRADES: Omit<Upgrade, "count">[] = [
  { id: "beak", name: "Золотой клюв", desc: "+2 за клик", cost: 50, multiplier: 2, emoji: "✨" },
  { id: "wings", name: "Крылья удачи", desc: "+5 за клик", cost: 200, multiplier: 5, emoji: "🪶" },
  { id: "hat", name: "Шляпа детектива", desc: "+15 за клик", cost: 800, multiplier: 15, emoji: "🎩" },
  { id: "rocket", name: "Реактор", desc: "+50 за клик", cost: 3000, multiplier: 50, emoji: "⚡" },
];

interface Props {
  onCoinsEarned: (n: number) => void;
}

export default function ClickerGame({ onCoinsEarned }: Props) {
  const [clicks, setClicks] = useState(0);
  const [coins, setCoins] = useState(0);
  const [perClick, setPerClick] = useState(1);
  const [effects, setEffects] = useState<ClickEffect[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(
    BASE_UPGRADES.map((u) => ({ ...u, count: 0 }))
  );
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();
      setEffects((prev) => [...prev, { id, x, y }]);
      setTimeout(() => setEffects((prev) => prev.filter((ef) => ef.id !== id)), 700);

      setClicks((c) => c + 1);
      setCoins((c) => c + perClick);
      onCoinsEarned(perClick);

      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    },
    [perClick, onCoinsEarned]
  );

  const buyUpgrade = (upg: Upgrade) => {
    if (coins < upg.cost) return;
    setCoins((c) => c - upg.cost);
    setUpgrades((prev) =>
      prev.map((u) =>
        u.id === upg.id
          ? { ...u, count: u.count + 1, cost: Math.floor(u.cost * 2.2) }
          : u
      )
    );
    setPerClick((p) => p + upg.multiplier);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Left: clicker */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-white/40 text-sm font-russo mb-1">МОНЕТ СОБРАНО</div>
          <div className="font-russo text-5xl text-gradient-yellow">{coins.toLocaleString()}</div>
          <div className="text-white/30 text-xs mt-1">+{perClick} за клик · {clicks} кликов</div>
        </div>

        <div className="relative">
          <button
            onClick={handleClick}
            className="relative w-44 h-44 rounded-full flex items-center justify-center select-none transition-transform active:scale-90"
            style={{
              background: "radial-gradient(circle at 35% 35%, #FFD93D, #FF6B35)",
              boxShadow: "0 0 60px rgba(255,107,53,0.6), 0 0 120px rgba(255,217,61,0.3)",
              transform: isShaking ? "scale(0.93)" : "scale(1)",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
          >
            <span
              className="text-7xl"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}
            >
              🦆
            </span>

            {effects.map((ef) => (
              <span
                key={ef.id}
                className="absolute font-russo text-duck-yellow text-xl pointer-events-none"
                style={{
                  left: ef.x,
                  top: ef.y,
                  animation: "floatUp 0.7s ease-out forwards",
                  transform: "translate(-50%,-50%)",
                }}
              >
                +{perClick}
              </span>
            ))}
          </button>

          {/* Spin ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent pointer-events-none animate-spin-slow"
            style={{
              borderTopColor: "#FFD93D",
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "#FF6B35",
              margin: "-8px",
            }}
          />
        </div>

        <p className="text-white/30 text-xs">Нажимай на утку!</p>
      </div>

      {/* Right: upgrades */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="font-russo text-white/50 text-xs tracking-widest mb-2">УЛУЧШЕНИЯ</div>
        {upgrades.map((upg) => {
          const canAfford = coins >= upg.cost;
          return (
            <button
              key={upg.id}
              onClick={() => buyUpgrade(upg)}
              disabled={!canAfford}
              className={`w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all duration-200 ${
                canAfford
                  ? "bg-duck-yellow/10 border border-duck-yellow/30 hover:bg-duck-yellow/20 hover:border-duck-yellow/60"
                  : "bg-white/3 border border-white/8 opacity-50 cursor-not-allowed"
              }`}
            >
              <span className="text-2xl">{upg.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-russo text-white text-sm leading-none">{upg.name}</div>
                <div className="text-white/40 text-xs mt-0.5">{upg.desc}</div>
                {upg.count > 0 && (
                  <div className="text-duck-cyan text-xs mt-0.5">куплено: {upg.count}</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-russo text-duck-yellow text-sm">🪙{upg.cost}</div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, -180%); }
        }
      `}</style>
    </div>
  );
}
