import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-background/80 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="/logo 1.png"
          alt="Bifusion Logo"
          className="h-8 w-auto object-contain"
        />
        {/* <span className="text-foreground font-bold tracking-tight">Bifusion</span> */}
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          Home
        </Link>
        <Link
          to="/test"
          className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          Test
        </Link>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
