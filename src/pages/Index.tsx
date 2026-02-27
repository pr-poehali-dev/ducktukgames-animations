import { useState } from "react";
import Icon from "@/components/ui/icon";

const GAMES = [
  {
    id: "clicker",
    title: "Strange Things Кликер",
    subtitle: "Кликай до безумия",
    description: "Загадочная утка ждёт твоих кликов. Собирай монеты, открывай тайны и прокачивай способности в мире странных вещей.",
    emoji: "🦆",
    tag: "КЛИКЕР",
    tagColor: "#FF3CAC",
    gradient: "from-[#1a0a2e] via-[#16213e] to-[#0f0f23]",
    borderGlow: "rgba(255, 60, 172, 0.4)",
    accentColor: "#FF3CAC",
    img: "https://cdn.poehali.dev/projects/93e5e6c8-d2d9-47b4-8e1b-eeea3182f6bc/files/69d8666f-3dd4-42d5-bce0-8b13db82250b.jpg",
    players: "12.4K",
    rating: "4.9",
  },
  {
    id: "racing",
    title: "Гонки Утят",
    subtitle: "Педаль в пол!",
    description: "Управляй утёнком на супербыстрой машинке. Обгоняй соперников, собирай бонусы и стань чемпионом уточьих гонок!",
    emoji: "🏎️",
    tag: "ГОНКИ",
    tagColor: "#FFD93D",
    gradient: "from-[#1a1200] via-[#2a1a00] to-[#0f0a00]",
    borderGlow: "rgba(255, 217, 61, 0.4)",
    accentColor: "#FFD93D",
    img: "https://cdn.poehali.dev/projects/93e5e6c8-d2d9-47b4-8e1b-eeea3182f6bc/files/facb0e1d-f9ea-4cce-812e-5a89d0f846d6.jpg",
    players: "8.7K",
    rating: "4.8",
  },
  {
    id: "parkour",
    title: "Паркур Утки",
    subtitle: "Прыгай выше всех",
    description: "Утка-паркурщик покоряет городские крыши. Прыгай, уворачивайся, лети над пропастью — только для настоящих смельчаков!",
    emoji: "🦅",
    tag: "ПАРКУР",
    tagColor: "#00F5FF",
    gradient: "from-[#001a1a] via-[#001520] to-[#000d1a]",
    borderGlow: "rgba(0, 245, 255, 0.4)",
    accentColor: "#00F5FF",
    img: "https://cdn.poehali.dev/projects/93e5e6c8-d2d9-47b4-8e1b-eeea3182f6bc/files/6e64ec0c-4b36-4fa6-9325-98e7087e84c3.jpg",
    players: "6.2K",
    rating: "4.7",
  },
];

const SHOP_ITEMS = [
  { id: 1, name: "Золотая уточка", price: 500, emoji: "🦆", rarity: "Редкий", color: "#FFD93D", game: "Все игры" },
  { id: 2, name: "Реактивный двигатель", price: 1200, emoji: "🚀", rarity: "Эпический", color: "#FF3CAC", game: "Гонки" },
  { id: 3, name: "Плащ-невидимка", price: 800, emoji: "🦸", rarity: "Редкий", color: "#00F5FF", game: "Паркур" },
  { id: 4, name: "Мегаклик x10", price: 2000, emoji: "⚡", rarity: "Легендарный", color: "#FF6B35", game: "Кликер" },
  { id: 5, name: "Шляпа детектива", price: 300, emoji: "🎩", rarity: "Обычный", color: "#7B2FBE", game: "Все игры" },
  { id: 6, name: "Нитро-ускорение", price: 950, emoji: "💨", rarity: "Эпический", color: "#FFD93D", game: "Гонки" },
];

const RARITY_COLORS: Record<string, string> = {
  "Обычный": "#9ca3af",
  "Редкий": "#3b82f6",
  "Эпический": "#a855f7",
  "Легендарный": "#f59e0b",
};

type Section = "games" | "shop";

const TICKER_ITEMS = [
  "🦆 Strange Things Кликер",
  "🏎️ Гонки Утят",
  "🦅 Паркур Утки",
  "🪙 Зарабатывай монеты",
  "🛒 Трать в магазине",
  "⭐ Топ рейтинг",
];

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("games");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [coins, setCoins] = useState(1500);
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
  const [shopFilter, setShopFilter] = useState("Все");

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (coins >= item.price && !purchasedItems.includes(item.id)) {
      setCoins((c) => c - item.price);
      setPurchasedItems((p) => [...p, item.id]);
    }
  };

  const filteredShop =
    shopFilter === "Все"
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((i) => i.game === shopFilter || i.game === "Все игры");

  return (
    <div className="min-h-screen bg-duck-darker grid-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, #FF3CAC, transparent)" }}
        />
        <div
          className="absolute top-[30%] right-[-5%] w-80 h-80 rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, #FFD93D, transparent)" }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-72 h-72 rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, #00F5FF, transparent)" }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="text-4xl" style={{ display: "inline-block", animation: "wiggle 2s ease-in-out infinite" }}>
            🦆
          </div>
          <div>
            <h1 className="font-russo text-2xl text-gradient-yellow leading-none">DUCKTUK</h1>
            <span className="font-russo text-sm text-duck-orange tracking-[0.3em] leading-none">GAMES</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {(["games", "shop"] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-5 py-2 rounded-xl font-russo text-sm transition-all duration-200 ${
                activeSection === s
                  ? "bg-gradient-to-r from-duck-yellow to-duck-orange text-duck-dark shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {s === "games" ? "🎮 Игры" : "🛒 Магазин"}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 bg-duck-yellow/10 border border-duck-yellow/30 px-4 py-2 rounded-full">
          <span className="text-xl">🪙</span>
          <span className="font-russo text-duck-yellow text-lg">{coins.toLocaleString()}</span>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden flex gap-2 px-4 pt-4 relative z-10">
        {(["games", "shop"] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 py-2.5 rounded-xl font-russo text-sm transition-all duration-200 ${
              activeSection === s
                ? "bg-gradient-to-r from-duck-yellow to-duck-orange text-duck-dark"
                : "bg-white/5 text-white/60 border border-white/10"
            }`}
          >
            {s === "games" ? "🎮 Игры" : "🛒 Магазин"}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">

        {/* ===== GAMES ===== */}
        {activeSection === "games" && (
          <div className="animate-slide-up">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-duck-pink/10 border border-duck-pink/30 px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-duck-pink animate-pulse inline-block" />
                <span className="font-russo text-duck-pink text-xs tracking-widest">ИГРАЙ ПРЯМО СЕЙЧАС</span>
              </div>
              <h2 className="font-russo text-5xl md:text-7xl mb-4 leading-none">
                <span className="text-white">ТРИ </span>
                <span className="text-gradient-yellow">КРУТЫЕ</span>
                <br />
                <span className="text-white">ИГРЫ</span>
              </h2>
              <p className="text-white/50 text-lg max-w-lg mx-auto font-nunito">
                Выбирай любую игру, зарабатывай монеты и трать их в магазине на крутые предметы
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GAMES.map((game, i) => (
                <div
                  key={game.id}
                  className="card-game rounded-3xl overflow-hidden cursor-pointer group"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    boxShadow:
                      selectedGame === game.id
                        ? `0 0 40px ${game.borderGlow}`
                        : undefined,
                  }}
                  onClick={() =>
                    setSelectedGame(selectedGame === game.id ? null : game.id)
                  }
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={game.img}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-70`}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="font-russo text-xs px-3 py-1 rounded-full"
                        style={{
                          background: `${game.tagColor}22`,
                          color: game.tagColor,
                          border: `1px solid ${game.tagColor}55`,
                        }}
                      >
                        {game.tag}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-duck-yellow text-xs">⭐</span>
                      <span className="font-russo text-white text-xs">{game.rating}</span>
                    </div>
                    <div className="absolute bottom-3 right-4 text-4xl animate-float">
                      {game.emoji}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-russo text-white text-lg leading-tight mb-1">
                      {game.title}
                    </h3>
                    <p
                      className="text-sm font-bold mb-3"
                      style={{ color: game.accentColor }}
                    >
                      {game.subtitle}
                    </p>

                    {selectedGame === game.id && (
                      <p className="text-white/60 text-sm mb-4 leading-relaxed animate-slide-up">
                        {game.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <Icon name="Users" size={12} />
                        <span>{game.players} игроков</span>
                      </div>
                      <button
                        className="btn-primary px-5 py-2 rounded-full text-sm font-russo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Играть
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Marquee */}
            <div className="mt-14 overflow-hidden border-y border-duck-yellow/10 py-3">
              <div className="flex animate-marquee whitespace-nowrap gap-12">
                {[...Array(2)].map((_, ri) => (
                  <span key={ri} className="flex items-center gap-12">
                    {TICKER_ITEMS.map((t) => (
                      <span
                        key={t}
                        className="font-russo text-white/20 text-sm tracking-widest"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { label: "Игроков онлайн", value: "3.2K", icon: "Users", color: "#00F5FF" },
                { label: "Игр сыграно", value: "1.2M", icon: "Gamepad2", color: "#FFD93D" },
                { label: "Предметов", value: "48", icon: "ShoppingBag", color: "#FF3CAC" },
              ].map((s) => (
                <div key={s.label} className="card-game rounded-2xl p-5 text-center">
                  <Icon
                    name={s.icon as "Users"}
                    size={28}
                    className="mx-auto mb-2"
                    style={{ color: s.color }}
                  />
                  <div className="font-russo text-2xl text-white">{s.value}</div>
                  <div className="text-white/40 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SHOP ===== */}
        {activeSection === "shop" && (
          <div className="animate-slide-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-duck-yellow/10 border border-duck-yellow/30 px-4 py-1.5 rounded-full mb-5">
                <span className="text-duck-yellow text-xs">🛒</span>
                <span className="font-russo text-duck-yellow text-xs tracking-widest">
                  МАГАЗИН ПРЕДМЕТОВ
                </span>
              </div>
              <h2 className="font-russo text-5xl md:text-6xl mb-3 leading-none">
                <span className="text-gradient-yellow">ПРОКАЧАЙ</span>
                <br />
                <span className="text-white">УТКУ</span>
              </h2>
              <p className="text-white/50 font-nunito">
                У тебя{" "}
                <span className="text-duck-yellow font-bold">
                  {coins.toLocaleString()} монет
                </span>{" "}
                — трать с умом
              </p>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
              {["Все", "Кликер", "Гонки", "Паркур"].map((f) => (
                <button
                  key={f}
                  onClick={() => setShopFilter(f)}
                  className={`px-5 py-2 rounded-full font-russo text-sm whitespace-nowrap transition-all ${
                    shopFilter === f
                      ? "bg-gradient-to-r from-duck-yellow to-duck-orange text-duck-dark"
                      : "bg-white/5 text-white/50 border border-white/10 hover:border-duck-yellow/30 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShop.map((item, i) => {
                const owned = purchasedItems.includes(item.id);
                const canAfford = coins >= item.price;
                return (
                  <div
                    key={item.id}
                    className="shop-item-card rounded-2xl p-5 relative overflow-hidden"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ background: RARITY_COLORS[item.rarity] }}
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{
                          background: `${item.color}15`,
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        {item.emoji}
                      </div>
                      <span
                        className="text-xs font-russo px-2.5 py-1 rounded-full"
                        style={{
                          color: RARITY_COLORS[item.rarity],
                          background: `${RARITY_COLORS[item.rarity]}15`,
                          border: `1px solid ${RARITY_COLORS[item.rarity]}30`,
                        }}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    <h3 className="font-russo text-white text-base mb-1">{item.name}</h3>
                    <p className="text-white/40 text-xs mb-4">{item.game}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">🪙</span>
                        <span
                          className="font-russo text-lg"
                          style={{ color: item.color }}
                        >
                          {item.price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={owned || !canAfford}
                        className={`px-4 py-2 rounded-xl font-russo text-sm transition-all ${
                          owned
                            ? "bg-white/10 text-white/40 cursor-not-allowed"
                            : canAfford
                            ? "btn-primary"
                            : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                        }`}
                      >
                        {owned ? "✓ Куплено" : canAfford ? "Купить" : "Мало монет"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 card-game rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-russo text-white text-xl mb-1">Нужно больше монет?</h3>
                <p className="text-white/50 text-sm">Играй в любую из трёх игр и зарабатывай</p>
              </div>
              <button
                onClick={() => setActiveSection("games")}
                className="btn-primary px-7 py-3 rounded-full text-sm font-russo"
              >
                🎮 Играть и зарабатывать
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5 mt-16 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🦆</span>
          <span className="font-russo text-white/30 text-sm">DUCKTUKGAMES</span>
        </div>
        <p className="text-white/20 text-xs">© 2026 Ducktukgames. Все права защищены 🦆</p>
      </footer>
    </div>
  );
}
