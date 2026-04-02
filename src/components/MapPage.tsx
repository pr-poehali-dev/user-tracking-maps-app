import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const TRACK_POINTS = [
  { x: 15, y: 70 }, { x: 18, y: 62 }, { x: 22, y: 55 }, { x: 28, y: 50 },
  { x: 35, y: 47 }, { x: 42, y: 44 }, { x: 50, y: 42 }, { x: 57, y: 38 },
  { x: 63, y: 33 }, { x: 68, y: 28 }, { x: 72, y: 23 }, { x: 75, y: 30 },
  { x: 78, y: 38 }, { x: 80, y: 46 }, { x: 78, y: 54 }, { x: 74, y: 60 },
  { x: 70, y: 65 }, { x: 64, y: 68 }, { x: 57, y: 70 }, { x: 50, y: 72 },
  { x: 43, y: 70 }, { x: 37, y: 66 }, { x: 32, y: 70 }, { x: 27, y: 74 },
  { x: 22, y: 76 }, { x: 17, y: 75 }, { x: 14, y: 73 },
];

export default function MapPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [pace, setPace] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 1);
        setProgress(p => {
          const next = Math.min(p + 0.4, 100);
          return next;
        });
        setDistance(d => +(d + 0.003).toFixed(3));
        setSpeed(+(5.8 + Math.random() * 2.4 - 0.8).toFixed(1));
        setHeartRate(h => Math.floor(h + Math.random() * 3 - 1));
        setPace(+(5.2 + Math.random() * 0.4 - 0.2).toFixed(2));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const currentPointIndex = Math.floor((progress / 100) * (TRACK_POINTS.length - 1));
  const currentPoint = TRACK_POINTS[currentPointIndex] || TRACK_POINTS[0];
  const visiblePoints = TRACK_POINTS.slice(0, currentPointIndex + 1);

  const polylinePoints = visiblePoints.map(p => `${p.x}% ${p.y}%`).join(', ');

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Map */}
      <div className="map-container flex-1 relative min-h-0">
        {/* SVG Track */}
        <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
          {/* Full ghost track */}
          <polyline
            points={TRACK_POINTS.map(p => `${p.x * 4},${p.y * 3.5}`).join(' ')}
            fill="none"
            stroke="rgba(34,197,94,0.15)"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          {/* Completed track */}
          {visiblePoints.length > 1 && (
            <polyline
              points={visiblePoints.map(p => `${p.x * 4},${p.y * 3.5}`).join(' ')}
              fill="none"
              stroke="hsl(142, 76%, 46%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.8))' }}
            />
          )}
          {/* Start marker */}
          <circle
            cx={TRACK_POINTS[0].x * 4}
            cy={TRACK_POINTS[0].y * 3.5}
            r="6"
            fill="hsl(142, 76%, 46%)"
            style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,1))' }}
          />
          {/* Current position */}
          {isRecording && (
            <>
              <circle
                cx={currentPoint.x * 4}
                cy={currentPoint.y * 3.5}
                r="10"
                fill="rgba(34,197,94,0.2)"
                stroke="hsl(142, 76%, 46%)"
                strokeWidth="1"
              />
              <circle
                cx={currentPoint.x * 4}
                cy={currentPoint.y * 3.5}
                r="5"
                fill="white"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}
              />
            </>
          )}
        </svg>

        {/* Map labels */}
        <div className="absolute top-4 left-4 z-20">
          <div className="card-dark rounded-lg px-3 py-2 flex items-center gap-2">
            <Icon name="MapPin" size={14} className="text-primary" />
            <span className="font-display text-xs text-muted-foreground tracking-widest uppercase">Москва, Парк Горького</span>
          </div>
        </div>

        {/* Live stats overlay */}
        {isRecording && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <div className="card-dark rounded-lg px-3 py-2 text-center min-w-[80px]">
              <div className="font-display text-2xl neon-text">{speed}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">км/ч</div>
            </div>
            <div className="card-dark rounded-lg px-3 py-2 text-center min-w-[80px]">
              <div className="font-display text-2xl text-red-400">{heartRate}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">уд/мин</div>
            </div>
          </div>
        )}

        {/* Time overlay */}
        {isRecording && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="card-dark rounded-xl px-5 py-3 flex items-center gap-4">
              <div className="recording-dot" />
              <span className="font-mono-data text-2xl text-white font-medium">{formatTime(time)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="card-dark border-t border-border px-4 py-3">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="font-display text-2xl neon-text">{distance.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">км</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl text-white">{formatTime(time)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">время</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl text-amber-400">{isRecording ? pace.toFixed(2) : "—"}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">мин/км</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="progress-bar h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm tracking-wider uppercase transition-all ${
              isRecording
                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 neon-glow'
            }`}
          >
            <Icon name={isRecording ? "Square" : "Play"} size={16} />
            {isRecording ? 'Стоп' : 'Старт записи'}
          </button>
          <button className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:border-primary/50 transition-all">
            <Icon name="LocateFixed" size={18} />
          </button>
          <button className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:border-primary/50 transition-all">
            <Icon name="Layers" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
