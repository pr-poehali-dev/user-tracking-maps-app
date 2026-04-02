import Icon from "@/components/ui/icon";

const weekData = [
  { day: "Пн", km: 5.2, active: false },
  { day: "Вт", km: 8.7, active: false },
  { day: "Ср", km: 0, active: false },
  { day: "Чт", km: 12.1, active: false },
  { day: "Пт", km: 6.3, active: false },
  { day: "Сб", km: 15.8, active: true },
  { day: "Вс", km: 3.4, active: false },
];

const maxKm = Math.max(...weekData.map(d => d.km));

const monthData = [42, 58, 37, 61, 55, 48, 72, 65, 50, 43, 68, 71];

const records = [
  { label: "Лучший темп", value: "4:12", unit: "мин/км", icon: "Zap", color: "text-amber-400" },
  { label: "Макс. дистанция", value: "21.1", unit: "км", icon: "Route", color: "neon-text" },
  { label: "Макс. пульс", value: "187", unit: "уд/мин", icon: "Heart", color: "text-red-400" },
  { label: "Подъём", value: "1240", unit: "м", icon: "TrendingUp", color: "text-blue-400" },
];

const totalStats = [
  { label: "Тренировок", value: "47", icon: "Activity" },
  { label: "Всего км", value: "412", icon: "Route" },
  { label: "Часов", value: "38.5", icon: "Clock" },
  { label: "Калорий", value: "31.4k", icon: "Flame" },
];

export default function StatsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white uppercase tracking-wider">Статистика</h2>
          <div className="flex gap-2">
            {["Нед", "Мес", "Год"].map((p, i) => (
              <button key={p} className={`px-3 py-1 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
                i === 0 ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary/50'
              }`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-2 gap-3">
          {totalStats.map(({ label, value, icon }) => (
            <div key={label} className="stat-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={icon as "Activity"} size={18} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-xl text-white">{value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Bar Chart */}
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-sm text-white uppercase tracking-wider">Эта неделя</span>
            <span className="font-mono-data text-xs text-primary">51.5 км</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weekData.map(({ day, km, active }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ${
                    active ? 'progress-bar' : km === 0 ? 'bg-muted' : 'bg-primary/30'
                  }`}
                  style={{ height: `${km === 0 ? 4 : (km / maxKm) * 88}px` }}
                />
                <span className={`text-[10px] font-display uppercase ${active ? 'neon-text' : 'text-muted-foreground'}`}>{day}</span>
                {km > 0 && <span className="text-[9px] font-mono-data text-muted-foreground">{km}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly line chart */}
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-sm text-white uppercase tracking-wider">Месячный объём</span>
            <span className="font-mono-data text-xs text-muted-foreground">км/нед</span>
          </div>
          <div className="relative h-20">
            <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142,76%,46%)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(142,76%,46%)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline
                points={monthData.map((v, i) => `${(i / (monthData.length - 1)) * 300},${80 - (v / 80) * 70}`).join(' ')}
                fill="none"
                stroke="hsl(142,76%,46%)"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.6))' }}
              />
              <polygon
                points={[
                  ...monthData.map((v, i) => `${(i / (monthData.length - 1)) * 300},${80 - (v / 80) * 70}`),
                  '300,80', '0,80'
                ].join(' ')}
                fill="url(#lineGrad)"
              />
              {monthData.map((v, i) => (
                <circle
                  key={i}
                  cx={(i / (monthData.length - 1)) * 300}
                  cy={80 - (v / 80) * 70}
                  r="2.5"
                  fill="hsl(142,76%,46%)"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Records */}
        <div>
          <h3 className="font-display text-sm text-white uppercase tracking-wider mb-3">Личные рекорды</h3>
          <div className="grid grid-cols-2 gap-3">
            {records.map(({ label, value, unit, icon, color }) => (
              <div key={label} className="stat-card rounded-xl p-4">
                <Icon name={icon as "Zap"} size={16} className={`${color} mb-2`} />
                <div className={`font-display text-xl ${color}`}>{value} <span className="text-xs font-body text-muted-foreground">{unit}</span></div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heart rate zones */}
        <div className="stat-card rounded-xl p-4 mb-4">
          <span className="font-display text-sm text-white uppercase tracking-wider block mb-4">Зоны пульса</span>
          {[
            { zone: "Z1 Восстановление", pct: 15, color: "bg-blue-400", range: "< 120" },
            { zone: "Z2 Аэробная", pct: 35, color: "bg-green-400", range: "120–140" },
            { zone: "Z3 Аэробная+", pct: 28, color: "bg-amber-400", range: "140–160" },
            { zone: "Z4 Анаэробная", pct: 17, color: "bg-orange-500", range: "160–175" },
            { zone: "Z5 Максимум", pct: 5, color: "bg-red-500", range: "> 175" },
          ].map(({ zone, pct, color, range }) => (
            <div key={zone} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">{zone}</span>
                <span className="font-mono-data text-xs text-white">{pct}% · {range}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
