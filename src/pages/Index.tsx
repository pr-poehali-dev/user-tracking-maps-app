import { useState } from "react";
import Icon from "@/components/ui/icon";
import MapPage from "@/components/MapPage";
import StatsPage from "@/components/StatsPage";
import HistoryPage from "@/components/HistoryPage";
import ProfilePage from "@/components/ProfilePage";

type Tab = "map" | "stats" | "history" | "profile";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "map", label: "Карта", icon: "Map" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "history", label: "История", icon: "Clock" },
  { id: "profile", label: "Профиль", icon: "User" },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("map");

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Icon name="Activity" size={14} className="text-primary" />
          </div>
          <span className="font-display text-lg text-white tracking-widest uppercase">TrackPro</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            <span className="font-mono-data text-[10px] text-muted-foreground uppercase tracking-wider">GPS: Активен</span>
          </div>
          <button className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/50 transition-all">
            <Icon name="Bell" size={14} />
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "map" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <MapPage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "stats" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <StatsPage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "history" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <HistoryPage />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === "profile" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
          <ProfilePage />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex border-t border-border bg-card flex-shrink-0">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative ${
              activeTab === id ? "text-primary" : "text-muted-foreground hover:text-white"
            }`}
          >
            {activeTab === id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
            <Icon name={icon as "Map"} size={18} />
            <span className={`font-display text-[10px] uppercase tracking-wider ${activeTab === id ? 'neon-text' : ''}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
