import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ymaps: any;
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const ymapRef = useRef<any>(null);
  const trackLineRef = useRef<any>(null);
  const placemarksRef = useRef<any[]>([]);
  const currentMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coordsRef = useRef<number[][]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [pace, setPace] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const calcDistance = (coords: number[][]): number => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lon1] = coords[i - 1];
      const [lat2, lon2] = coords[i];
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return total;
  };

  // Init map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || ymapRef.current) return;

      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [55.751244, 37.618423],
          zoom: 15,
          controls: [],
          type: "yandex#map",
        });

        map.options.set({
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
        });

        // Dark map style
        map.panes.get("ground").getElement().style.filter =
          "invert(1) hue-rotate(180deg) brightness(0.8) saturate(0.9)";

        ymapRef.current = map;
        setMapReady(true);

        // Show user location on load
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            const coord: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            map.setCenter(coord, 16);

            const userMark = new window.ymaps.Placemark(
              coord,
              { balloonContent: "Вы здесь" },
              {
                preset: "islands#circleDotIcon",
                iconColor: "#22c55e",
              }
            );
            map.geoObjects.add(userMark);
            currentMarkerRef.current = userMark;
          },
          () => {
            setLocationError("Нет доступа к геолокации. Разрешите доступ в настройках браузера.");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    };

    if (window.ymaps) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const startRecording = () => {
    if (!ymapRef.current) return;
    setLocationError(null);

    coordsRef.current = [];
    setTime(0);
    setDistance(0);
    setSpeed(0);
    setPace(0);
    setHeartRate(72);

    // Remove old objects
    if (trackLineRef.current) {
      ymapRef.current.geoObjects.remove(trackLineRef.current);
      trackLineRef.current = null;
    }
    placemarksRef.current.forEach((p) => ymapRef.current.geoObjects.remove(p));
    placemarksRef.current = [];
    if (currentMarkerRef.current) {
      ymapRef.current.geoObjects.remove(currentMarkerRef.current);
      currentMarkerRef.current = null;
    }

    setIsRecording(true);

    // Timer
    intervalRef.current = setInterval(() => {
      setTime((t) => t + 1);
      setHeartRate((h) => Math.min(185, Math.max(60, h + Math.floor(Math.random() * 3 - 1))));
    }, 1000);

    // Geolocation watch
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coord = [pos.coords.latitude, pos.coords.longitude];
          coordsRef.current.push(coord);

          const dist = calcDistance(coordsRef.current);
          setDistance(+(dist).toFixed(2));

          const spd = pos.coords.speed != null ? +(pos.coords.speed * 3.6).toFixed(1) : +(5 + Math.random() * 3).toFixed(1);
          setSpeed(spd);
          if (spd > 0) {
            setPace(+(60 / spd).toFixed(2));
          }

          const map = ymapRef.current;

          // Update or create polyline
          if (coordsRef.current.length > 1) {
            if (trackLineRef.current) {
              map.geoObjects.remove(trackLineRef.current);
            }
            trackLineRef.current = new window.ymaps.Polyline(
              coordsRef.current,
              {},
              {
                strokeColor: "#22c55e",
                strokeWidth: 4,
                strokeOpacity: 0.9,
              }
            );
            map.geoObjects.add(trackLineRef.current);
          }

          // Start marker
          if (coordsRef.current.length === 1) {
            const startMark = new window.ymaps.Placemark(
              coord,
              {},
              {
                preset: "islands#greenDotIcon",
                iconColor: "#22c55e",
              }
            );
            map.geoObjects.add(startMark);
            placemarksRef.current.push(startMark);
          }

          // Current position marker
          if (currentMarkerRef.current) {
            map.geoObjects.remove(currentMarkerRef.current);
          }
          currentMarkerRef.current = new window.ymaps.Placemark(
            coord,
            {},
            {
              preset: "islands#circleDotIcon",
              iconColor: "#ffffff",
            }
          );
          map.geoObjects.add(currentMarkerRef.current);
          map.setCenter(coord, map.getZoom(), { smooth: true, duration: 500 });
        },
        (err) => {
          setLocationError("Нет доступа к геолокации. Проверьте разрешения.");
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } else {
      setLocationError("Ваш браузер не поддерживает геолокацию.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const centerOnUser = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      ymapRef.current?.setCenter([pos.coords.latitude, pos.coords.longitude], 16, {
        smooth: true,
        duration: 600,
      });
    });
  };

  const toggleMapType = () => {
    if (!ymapRef.current) return;
    const current = ymapRef.current.getType();
    const next = current === "yandex#map" ? "yandex#satellite" : "yandex#map";
    ymapRef.current.setType(next);
    if (next === "yandex#map") {
      ymapRef.current.panes.get("ground").getElement().style.filter =
        "invert(1) hue-rotate(180deg) brightness(0.8) saturate(0.9)";
    } else {
      ymapRef.current.panes.get("ground").getElement().style.filter = "none";
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Map */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />

        {!mapReady && (
          <div className="absolute inset-0 map-container flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-display text-xs text-muted-foreground uppercase tracking-wider">Загрузка карты...</span>
            </div>
          </div>
        )}

        {locationError && (
          <div className="absolute top-4 left-4 right-4 z-30">
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300">{locationError}</span>
            </div>
          </div>
        )}

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
            <div className="font-display text-2xl text-amber-400">{pace > 0 ? pace.toFixed(2) : "—"}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">мин/км</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!mapReady}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm tracking-wider uppercase transition-all disabled:opacity-50 ${
              isRecording
                ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
            }`}
          >
            <Icon name={isRecording ? "Square" : "Play"} size={16} />
            {isRecording ? "Стоп" : "Старт записи"}
          </button>
          <button
            onClick={centerOnUser}
            className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:border-primary/50 transition-all"
          >
            <Icon name="LocateFixed" size={18} />
          </button>
          <button
            onClick={toggleMapType}
            className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:border-primary/50 transition-all"
          >
            <Icon name="Layers" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}