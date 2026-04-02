import { useState } from "react";
import Icon from "@/components/ui/icon";

const friends = [
  { name: "Алексей К.", km: "38.2", runs: 12, avatar: "А", color: "bg-blue-500" },
  { name: "Мария П.", km: "51.7", runs: 15, avatar: "М", color: "bg-purple-500" },
  { name: "Дмитрий В.", km: "29.4", runs: 9, avatar: "Д", color: "bg-amber-500" },
  { name: "Елена С.", km: "44.1", runs: 11, avatar: "Е", color: "bg-pink-500" },
];

const achievements = [
  { icon: "🏃", title: "Первые 5 км", desc: "Пробежал первые 5 км", done: true },
  { icon: "🔥", title: "7 дней подряд", desc: "Тренировки 7 дней без перерыва", done: true },
  { icon: "⚡", title: "Скоростной забег", desc: "Темп ниже 5 мин/км", done: true },
  { icon: "🏆", title: "Марафон", desc: "Пробежать 42 км", done: false },
  { icon: "🌄", title: "Горный трекер", desc: "Набрать 1000м высоты", done: false },
  { icon: "👥", title: "Социальный бегун", desc: "Поделиться 5 треками", done: false },
];

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [compareMode, setCompareMode] = useState<number | null>(null);
  const [name, setName] = useState("Иван Петров");
  const [goal, setGoal] = useState("50");

  const myKm = 51.5;
  const goalKm = parseFloat(goal) || 50;
  const goalPct = Math.min((myKm / goalKm) * 100, 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-4 animate-fade-in">

        {/* Profile Header */}
        <div className="stat-card rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="font-display text-2xl neon-text">ИП</span>
            </div>
            <div className="flex-1">
              {editMode ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-muted border border-primary/50 rounded-lg px-3 py-1 text-white font-display text-lg w-full mb-1"
                />
              ) : (
                <h3 className="font-display text-xl text-white uppercase tracking-wider">{name}</h3>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">@ivan.runner</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase tracking-wider">Про</span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 rounded-lg border transition-all ${
                editMode ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <Icon name={editMode ? "Check" : "Pencil"} size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "47", l: "Тренировок" },
              { v: "412", l: "Км всего" },
              { v: "23", l: "Подписчиков" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="font-display text-xl neon-text">{v}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-sm text-white uppercase tracking-wider">Цель на неделю</span>
            <div className="flex items-center gap-1.5">
              {editMode ? (
                <input
                  type="number"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="bg-muted border border-primary/50 rounded px-2 py-0.5 text-primary font-mono-data text-sm w-16 text-right"
                />
              ) : (
                <span className="font-mono-data text-sm text-primary">{myKm}</span>
              )}
              <span className="text-xs text-muted-foreground">/ {goal} км</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div className="progress-bar h-full rounded-full transition-all duration-1000" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground">Осталось {Math.max(0, goalKm - myKm).toFixed(1)} км</span>
            <span className="text-[10px] neon-text font-mono-data">{goalPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Friends comparison */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm text-white uppercase tracking-wider">Друзья</h3>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors">Найти друзей</button>
          </div>
          <div className="space-y-2">
            {/* Me */}
            <div className="stat-card rounded-xl p-3 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-sm font-display neon-text">ИП</div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-white font-display">Вы</span>
                    <span className="font-mono-data text-sm neon-text">{myKm} км</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div className="progress-bar h-full rounded-full" style={{ width: `${(myKm / 60) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {friends.map((f, i) => (
              <div key={f.name} className="stat-card rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center text-sm font-display text-white`}>{f.avatar}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-white">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-data text-sm text-muted-foreground">{f.km} км</span>
                        <button
                          onClick={() => setCompareMode(compareMode === i ? null : i)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                            compareMode === i
                              ? 'border-primary/50 bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {compareMode === i ? 'Скрыть' : 'Сравнить'}
                        </button>
                      </div>
                    </div>
                    <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-white/30 h-full rounded-full transition-all duration-700" style={{ width: `${(parseFloat(f.km) / 60) * 100}%` }} />
                    </div>
                    {compareMode === i && (
                      <div className="mt-2 grid grid-cols-3 gap-2 pt-2 border-t border-border animate-fade-in">
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Пробежки</div>
                          <div className="font-mono-data text-xs text-white">{f.runs} vs {47}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Км</div>
                          <div className="font-mono-data text-xs text-white">{f.km} vs {myKm}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-muted-foreground">Лидер</div>
                          <div className={`font-mono-data text-xs ${parseFloat(f.km) > myKm ? 'text-red-400' : 'neon-text'}`}>
                            {parseFloat(f.km) > myKm ? f.name.split(' ')[0] : 'Вы'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="font-display text-sm text-white uppercase tracking-wider mb-3">Достижения</h3>
          <div className="grid grid-cols-3 gap-2 pb-4">
            {achievements.map(({ icon, title, desc, done }) => (
              <div
                key={title}
                className={`stat-card rounded-xl p-3 text-center transition-all ${
                  done ? 'border-primary/20' : 'opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-[10px] font-display text-white uppercase tracking-wider leading-tight">{title}</div>
                {done && <div className="mt-1 w-4 h-0.5 bg-primary mx-auto" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
