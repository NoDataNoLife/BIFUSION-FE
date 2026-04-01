import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleMockLogin = () => {
    const mockUser = {
      id: "google-12345",
      email: "yeom@bifusion.com",
      name: "염승빈",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=yeom",
    };
    login(mockUser);
    navigate("/dashboard");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-background/80 backdrop-blur-md border-b border-border px-8 h-20 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
          B
        </div>
        <span className="text-xl font-black tracking-tighter text-foreground hidden sm:block">bifusion</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors"
        >
          서비스 소개
        </Link>
        
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            <LayoutDashboard size={18} />
            대시보드
          </Link>
        ) : (
          <button
            onClick={handleMockLogin}
            className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors"
          >
            시작하기
          </button>
        )}

        <div className="w-px h-5 bg-border mx-2"></div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors text-foreground/70"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                <img src={user?.profileImage} alt={user?.name} className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="로그아웃"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleMockLogin}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
