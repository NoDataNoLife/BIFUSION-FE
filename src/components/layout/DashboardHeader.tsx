import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, Menu } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../lib/axios";
import { useNotificationStore } from "../../store/useNotificationStore";
import NotificationCenter from "./NotificationCenter";
import { useThemeMode } from "../../hooks/useThemeMode";
import ImageWithFallback from "../common/ImageWithFallback";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const unreadCount = useNotificationStore(state => state.unreadCount);
  useEffect(() => {
    if (!user?.userId) return;
    let disposed = false;
    const refresh = async () => {
      try {
        const response = await api.get('/notifications', { params: { isRead: false, size: 1 } });
        if (!disposed) useNotificationStore.setState({ unreadCount: response.data?.data?.totalElements ?? 0 });
      } catch { /* 목록을 열면 조회 오류를 안내합니다. */ }
    };
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => { disposed = true; window.clearInterval(timer); };
  }, [user?.userId]);

  const userInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : "??";

  return (
    <header className="h-20 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border dark:border-border flex items-center justify-end px-4 sm:px-10 shrink-0 z-40 transition-colors">
      <button onClick={onMenuClick} aria-label="탐색 메뉴 열기" className="md:hidden p-3 rounded-2xl bg-muted text-muted-foreground"><Menu size={20} /></button>
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-muted dark:bg-muted text-muted-foreground dark:text-foreground/70 hover:bg-muted dark:hover:bg-muted/80 transition-all active:scale-95"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            aria-label="알림 열기"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
              isNotificationOpen
                ? "bg-primary/10 text-primary"
                : "bg-muted dark:bg-muted text-muted-foreground dark:text-foreground/70 hover:bg-muted dark:hover:bg-muted/80"
            }`}
          >
            <Bell size={22} />
            {unreadCount > 0 && <span aria-label={`읽지 않은 알림 ${unreadCount}개`} className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-background" />}
          </button>

          <NotificationCenter
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        <div className="w-px h-8 bg-muted dark:bg-border"></div>

        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-foreground dark:text-foreground leading-tight group-hover:text-primary transition-colors">
              {user?.nickname || user?.name || "사용자"}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-widest leading-tight">
              Researcher
            </p>
          </div>
          <div className="relative">
            {user?.profileImage ? (
              <ImageWithFallback
                src={user.profileImage}
                alt={user.name}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 bg-primary/10 dark:bg-primary/15 rounded-2xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                {userInitial}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-background rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
