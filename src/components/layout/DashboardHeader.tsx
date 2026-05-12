import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import NotificationCenter from "./NotificationCenter";
import { useThemeMode } from "../../hooks/useThemeMode";

export default function DashboardHeader() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const userInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : "??";

  return (
    <header className="h-20 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-border flex items-center justify-end px-10 flex-shrink-0 z-40 transition-colors">
      <div className="flex items-center gap-6 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-gray-50 dark:bg-muted text-gray-500 dark:text-foreground/70 hover:bg-gray-100 dark:hover:bg-muted/80 transition-all active:scale-95"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
              isNotificationOpen
                ? "bg-primary/10 text-primary"
                : "bg-gray-50 dark:bg-muted text-gray-500 dark:text-foreground/70 hover:bg-gray-100 dark:hover:bg-muted/80"
            }`}
          >
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-background animate-pulse"></span>
          </button>

          <NotificationCenter
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        <div className="w-px h-8 bg-gray-100 dark:bg-border"></div>

        <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-gray-900 dark:text-foreground leading-tight group-hover:text-primary transition-colors">
              {user?.nickname || user?.name || "사용자"}
            </p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest leading-tight">
              Researcher
            </p>
          </div>
          <div className="relative">
            {user?.profileImage ? (
              <img
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
