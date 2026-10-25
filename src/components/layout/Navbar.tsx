import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../../hooks/useThemeMode";

export default function Navbar() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-8 h-20 flex items-center justify-between transition-colors">
      <Link to="/" aria-label="BIFUSION 홈" className="flex items-center gap-3 group">
        <img src="/logo1.png" alt="BIFUSION" className="w-8 h-8 left-0" />
      </Link>

      <div className="flex items-center gap-3 sm:gap-8">
        <a
          href="#features"
          className="text-xs sm:text-sm whitespace-nowrap font-bold text-foreground/70 hover:text-primary transition-colors"
        >
          주요 기능
        </a>
        <a
          href="#how-it-works"
          className="text-xs sm:text-sm whitespace-nowrap font-bold text-foreground/70 hover:text-primary transition-colors"
        >
          사용 방법
        </a>
        <a
          href="#ants"
          className="text-xs sm:text-sm whitespace-nowrap font-bold text-foreground/70 hover:text-primary transition-colors"
        >
          앤트 안내
        </a>

        <div className="w-px h-5 bg-border mx-1 sm:mx-2"></div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors text-foreground/70"
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
