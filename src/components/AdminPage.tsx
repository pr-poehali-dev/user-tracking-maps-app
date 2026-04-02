import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/dcf39eed-73a5-4fdb-bfd8-106c1a4abca2";

interface Racer {
  id: number;
  name: string;
  account_type: string;
  initials: string;
  phone: string;
}

interface Props {
  sessionId: string;
  onViewRacer: (racer: Racer) => void;
  onLogout: () => void;
}

const COLORS = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500"];

const mockStats: Record<number, { km: string; runs: number; lastRun: string }> = {
  2: { km: "51.5", runs: 47, lastRun: "Сегодня" },
  3: { km: "38.2", runs: 32, lastRun: "Вчера" },
  4: { km: "72.1", runs: 58, lastRun: "2 дн назад" },
};

export default function AdminPage({ sessionId, onViewRacer, onLogout }: Props) {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${AUTH_URL}?action=racers`, {
      headers: { "X-Session-Id": sessionId },
    })
      .then(r => r.json())
      .then(data => {
        if (data.racers) setRacers(data.racers);
        else setError(data.error || "Ошибка загрузки");
      })
      .catch(() => setError("Ошибка сети"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const filtered = racers.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  const totalKm = racers.reduce((s, r) => s + parseFloat(mockStats[r.id]?.km || "0"), 0);
  const totalRuns = racers.reduce((s, r) => s + (mockStats[r.id]?.runs || 0), 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-4 animate-fade-in">

        {/* Admin header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white uppercase tracking-wider">Кабинет админа</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Управление гонщиками</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400 transition-all text-xs font-display uppercase tracking-wider"
          >
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card rounded-xl p-3 text-center">
            <div className="font-display text-2xl neon-text">{racers.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Гонщиков</div>
          </div>
          <div className="stat-card rounded-xl p-3 text-center">
            <div className="font-display text-2xl text-white">{totalKm.toFixed(0)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Всего км</div>
          </div>
          <div className="stat-card rounded-xl p-3 text-center">
            <div className="font-display text-2xl text-amber-400">{totalRuns}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Тренировок</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* Racers list */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} className="text-red-400" />
            <span className="text-xs text-red-300">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Гонщики · {filtered.length}
            </p>
            {filtered.map((racer, idx) => {
              const stats = mockStats[racer.id];
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={racer.id} className="stat-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: "both" }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center font-display text-white text-sm flex-shrink-0`}>
                      {racer.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm text-white uppercase tracking-wider truncate">{racer.name}</span>
                        {stats && (
                          <span className="font-mono-data text-xs neon-text ml-2 flex-shrink-0">{stats.km} км</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="font-mono-data text-xs text-muted-foreground">{racer.phone}</span>
                        {stats && (
                          <span className="text-[10px] text-muted-foreground">{stats.lastRun}</span>
                        )}
                      </div>
                      {stats && (
                        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="progress-bar h-full rounded-full"
                            style={{ width: `${Math.min((parseFloat(stats.km) / 80) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onViewRacer(racer)}
                      className="flex-shrink-0 p-2 rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all ml-1"
                      title="Открыть кабинет гонщика"
                    >
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}