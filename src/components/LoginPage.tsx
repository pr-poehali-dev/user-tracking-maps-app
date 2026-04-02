import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onLogin: (user: { id: number; name: string; account_type: string; initials: string }, sessionId: string) => void;
}

const AUTH_URL = "https://functions.poehali.dev/dcf39eed-73a5-4fdb-bfd8-106c1a4abca2";

export default function LoginPage({ onLogin }: Props) {
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    let result = "+";
    if (digits.length > 0) result += digits.slice(0, 1);
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length > 4) result += ") " + digits.slice(4, 7);
    if (digits.length > 7) result += "-" + digits.slice(7, 9);
    if (digits.length > 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone("+" + raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
      } else {
        localStorage.setItem("session_id", data.session_id);
        onLogin(data.user, data.session_id);
      }
    } catch {
      setError("Ошибка сети. Проверьте подключение.");
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = formatPhone(phone.replace(/\D/g, ""));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 grid-bg">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 neon-glow">
          <Icon name="Activity" size={32} className="text-primary" />
        </div>
        <h1 className="font-display text-3xl text-white tracking-widest uppercase">TrackPro</h1>
        <p className="text-muted-foreground text-sm mt-1">Спортивный трекер треков</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm animate-slide-up">
        <div className="stat-card rounded-2xl p-6">
          <h2 className="font-display text-lg text-white uppercase tracking-wider mb-6 text-center">Вход в систему</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                Номер телефона
              </label>
              <div className="relative">
                <Icon name="Phone" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={displayPhone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (999) 999-99-99"
                  required
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-white font-mono-data text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  <Icon name={showPwd ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase transition-all hover:bg-primary/90 neon-glow disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="LogIn" size={16} />
              )}
              {loading ? "Вхожу..." : "Войти"}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div className="mt-4 p-4 rounded-xl border border-border/50 bg-muted/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Тестовые аккаунты</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Администратор:</span>
              <span className="font-mono-data text-xs text-white">+79000000001 / admin123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Гонщик:</span>
              <span className="font-mono-data text-xs text-white">+79000000002 / racer123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
