import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  User,
  Users,
  Menu,
  X,
  Award,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import ImageWithFallback from "../common/ImageWithFallback";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "projects",
      label: "My Projects",
      icon: FolderKanban,
      path: "/dashboard/projects",
    },
    { id: "assets", label: "Assets", icon: Package, path: "/dashboard/assets" },
    { id: "expert", label: "Expert", icon: Award, path: "/dashboard/expert" },
    {
      id: "community",
      label: "Community",
      icon: Users,
      path: "/dashboard/community",
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-card border-r border-gray-200 dark:border-border flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img
              src={isDarkMode ? "/B_logo_dots.png" : "/B_logo.png"}
              alt="Bifusion"
              className="h-9 w-auto object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
          ) : (
            <X className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted"
                } ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div className="p-4 border-t border-gray-200 dark:border-border">
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-3 rounded-xl transition-all
            ${isActive ? "bg-gray-100 dark:bg-muted" : "hover:bg-gray-50 dark:hover:bg-muted"}
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          {user?.profileImage ? (
            <ImageWithFallback
              src={user.profileImage}
              alt={user.name || "사용자"}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2 ring-white dark:ring-background"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                {user?.nickname || user?.name || "사용자"}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
