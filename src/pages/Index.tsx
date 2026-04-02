import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import MapPage from "@/components/MapPage";
import StatsPage from "@/components/StatsPage";
import HistoryPage from "@/components/HistoryPage";
import ProfilePage from "@/components/ProfilePage";
import LoginPage from "@/components/LoginPage";
import AdminPage from "@/components/AdminPage";

const AUTH_URL = "https://functions.poehali.dev/dcf39eed-73a5-4fdb-bfd8-106c1a4abca2";

interface User {
  id: number;
  name: string;
  account_type: string;
  initials: string;
}

interface ViewedRacer {
  id: number;
  name: string;
  account_type: string;
  initials: string;
  phone: string;
}

type Tab = "map" | "stats" | "history" | "profile";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "map", label: "Карта", icon: "Map" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "history", label: "История", icon: "Clock" },
  { id: "profile", label: "Профиль", icon: "User" },
];

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [viewedRacer, setViewedRacer] = useState<ViewedRacer | null>(null);

  // Restore session on load
  useEffect(() => {
    const saved = localStorage.getItem("session_id");
    if (!saved) { setAuthChecked(true); return; }

    fetch(`${AUTH_URL}/me`, { headers: { "X-Session-Id": saved } })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setUser(data);
          setSessionId(saved);
        } else {
          localStorage.removeItem("session_id");
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(false));

    setAuthChecked(true);
  }, []);

  const handleLogin = (u: User, sid: string) => {
    setUser(u);
    setSessionId(sid);
  };

  const handleLogout = async () => {
    await fetch(`${AUTH_URL}/logout`, {
      method: "POST",
      headers: { "X-Session-Id": sessionId },
    }).catch(() => {});
    localStorage.removeItem("session_id");
    setUser(null);
    setSessionId("");
    setViewedRacer(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center grid-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-primary" />
          </div>
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  // Admin without viewing a racer — show admin panel
  if (user.account_type === "admin" && !viewedRacer) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Icon name="ShieldCheck" size={14} className="text-amber-400" />
            </div>
            <span className="font-display text-lg text-white tracking-widest uppercase">TrackPro</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase tracking-wider ml-1">Админ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="font-display text-xs text-amber-400">{user.initials}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <AdminPage
            sessionId={sessionId}
            onViewRacer={r => { setViewedRacer(r); setActiveTab("map"); }}
            onLogout={handleLogout}
          />
        </main>
      </div>
    );
  }

  // Racer view (or admin viewing a racer)
  const currentUser = viewedRacer
    ? { id: viewedRacer.id, name: viewedRacer.name, account_type: viewedRacer.account_type, initials: viewedRacer.initials }
    : user;

  const isAdminView = user.account_type === "admin" && !!viewedRacer;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isAdminView ? "bg-amber-500/20 border border-amber-500/30" : "bg-primary/20 border border-primary/30"}`}>
            <Icon name="Activity" size={14} className={isAdminView ? "text-amber-400" : "text-primary"} />
          </div>
          <span className="font-display text-lg text-white tracking-widest uppercase">TrackPro</span>
          {isAdminView && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase tracking-wider ml-1">
              {viewedRacer?.name.split(" ")[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            <span className="font-mono-data text-[10px] text-muted-foreground uppercase tracking-wider">GPS</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center">
            <span className="font-display text-[10px] text-white">{currentUser.initials}</span>
          </div>
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
          <ProfilePage
            user={currentUser}
            isAdminView={isAdminView}
            onLogout={handleLogout}
            onBackToAdmin={() => setViewedRacer(null)}
          />
        </div>
      </main>

      {/* Bottom Nav */}
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
            <span className={`font-display text-[10px] uppercase tracking-wider ${activeTab === id ? "neon-text" : ""}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
