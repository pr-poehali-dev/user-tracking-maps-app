import { useState } from "react";
import Icon from "@/components/ui/icon";

const tracks = [
  {
    id: 1,
    name: "Утренняя пробежка",
    date: "Сег, 7:15",
    distance: "8.4",
    time: "42:18",
    pace: "5:02",
    hr: 154,
    elevation: "+87м",
    type: "Бег",
    shared: true,
    likes: 12,
    points: [[10,70],[20,60],[35,50],[50,45],[65,40],[75,35],[80,42],[78,55],[70,65],[55,70],[40,72],[25,75],[12,72]],
  },
  {
    id: 2,
    name: "Велопрогулка по набережной",
    date: "Вч, 18:30",
    distance: "22.1",
    time: "1:08:45",
    pace: "3:07",
    hr: 138,
    elevation: "+124м",
    type: "Велосипед",
    shared: false,
    likes: 0,
    points: [[8,65],[22,55],[38,48],[55,50],[68,44],[80,38],[85,45],[82,58],[72,66],[58,68],[44,70],[28,68],[15,67]],
  },
  {
    id: 3,
    name: "Интервальная тренировка",
    date: "2 дн назад",
    distance: "6.2",
    time: "31:05",
    pace: "5:01",
    hr: 171,
    elevation: "+42м",
    type: "Бег",
    shared: true,
    likes: 27,
    points: [[15,60],[25,50],[40,55],[50,45],[60,50],[70,42],[78,50],[74,60],[64,66],[50,68],[36,65],[22,62],[16,61]],
  },
  {
    id: 4,
    name: "Долгая воскресная пробежка",
    date: "4 дн назад",
    distance: "15.8",
    time: "1:24:32",
    pace: "5:21",
    hr: 148,
    elevation: "+215м",
    type: "Бег",
    shared: true,
    likes: 34,
    points: [[12,72],[20,62],[30,52],[42,45],[54,42],[65,38],[74,32],[80,40],[78,52],[72,62],[62,68],[50,72],[38,74],[26,75],[14,73]],
  },
];

const typeIcon: Record<string, string> = {
  "Бег": "Footprints",
  "Велосипед": "Bike",
};

const typeColor: Record<string, string> = {
  "Бег": "text-primary",
  "Велосипед": "text-blue-400",
};

function MiniTrack({ points }: { points: number[][] }) {
  const w = 100, h = 40;
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const norm = points.map(([px, py]) => [
    ((px - minX) / (maxX - minX || 1)) * (w - 8) + 4,
    ((py - minY) / (maxY - minY || 1)) * (h - 8) + 4,
  ]);
  const d = norm.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <path d={d} fill="none" stroke="hsl(142,76%,46%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 3px rgba(34,197,94,0.6))' }} />
    </svg>
  );
}

export default function HistoryPage() {
  const [shareId, setShareId] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const handleShare = (id: number) => {
    setShareId(id);
    setTimeout(() => setShareId(null), 2000);
  };

  const handleLike = (id: number) => {
    setLikedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalKm = tracks.reduce((s, t) => s + parseFloat(t.distance), 0);
  const totalRuns = tracks.length;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white uppercase tracking-wider">История</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:border-primary/50 transition-all">
            <Icon name="Filter" size={12} />
            Фильтр
          </button>
        </div>

        {/* Summary */}
        <div className="card-dark rounded-xl p-4 flex gap-4">
          <div className="flex-1 text-center">
            <div className="font-display text-2xl neon-text">{totalKm.toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">км за месяц</div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="font-display text-2xl text-white">{totalRuns}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">тренировок</div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 text-center">
            <div className="font-display text-2xl text-amber-400">4</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">нед. подряд</div>
          </div>
        </div>

        {/* Track List */}
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            className="stat-card rounded-xl p-4 animate-slide-up"
            style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={typeIcon[track.type] as "Footprints"} size={14} className={typeColor[track.type]} />
                  <span className="font-display text-sm text-white uppercase tracking-wider">{track.name}</span>
                  {track.shared && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded uppercase tracking-wider">публичный</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{track.date}</span>
              </div>
              <div className="text-right">
                <div className="font-display text-xl neon-text">{track.distance} <span className="text-xs text-muted-foreground font-body">км</span></div>
              </div>
            </div>

            {/* Mini track preview */}
            <div className="mb-3 opacity-60 hover:opacity-100 transition-opacity">
              <MiniTrack points={track.points} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: "Время", value: track.time },
                { label: "Темп", value: track.pace },
                { label: "Пульс", value: `${track.hr}`, color: "text-red-400" },
                { label: "Набор", value: track.elevation },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className={`font-mono-data text-sm ${color || 'text-white'}`}>{value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => handleLike(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  likedIds.includes(track.id)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'border border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400'
                }`}
              >
                <Icon name="Heart" size={12} />
                {track.likes + (likedIds.includes(track.id) ? 1 : 0)}
              </button>
              <button
                onClick={() => handleShare(track.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  shareId === track.id
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Icon name={shareId === track.id ? "Check" : "Share2"} size={12} />
                {shareId === track.id ? 'Скопировано!' : 'Поделиться'}
              </button>
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-primary/50 transition-all">
                <Icon name="BarChart2" size={12} />
                Детали
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
