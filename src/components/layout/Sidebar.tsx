import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  User,
  Users,
  Menu,
  X,
  Award,
  ClipboardCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import ImageWithFallback from "../common/ImageWithFallback";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, onNavigate }: SidebarProps) {
  const { user } = useAuthStore();

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
    { id: "inspections", label: "내가 요청한 검수", icon: ClipboardCheck, path: "/dashboard/inspections" },
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
      className={`bg-card dark:bg-card border-r border-border dark:border-border flex flex-col shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`border-b border-border dark:border-border flex items-center ${
        isCollapsed ? "flex-col gap-3 px-3 py-4" : "justify-between p-6"
      }`}>
        <Link
          to="/dashboard"
          onClick={onNavigate}
          aria-label="BIFUSION 대시보드 홈으로 이동"
          title="대시보드 홈"
          className="flex items-center rounded-lg hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <img
            src={isCollapsed ? "/logo1.png" : "/logo_og.png"}
            alt="BIFUSION"
            className={`${isCollapsed ? "h-8 w-8" : "h-9 w-auto"} object-contain dark:brightness-105 dark:drop-shadow-[0_2px_8px_rgba(240,165,58,0.25)] transition-all`}
          />
        </Link>
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? '메뉴 펼치기' : '메뉴 닫기'}
          className={`p-2 hover:bg-muted rounded-lg transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="대시보드 탐색" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              aria-label={item.label}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted"
                } ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div className="p-4 border-t border-border dark:border-border">
        <NavLink
          to="/dashboard/profile"
          onClick={onNavigate}
          aria-label="내 프로필"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-3 rounded-xl transition-all
            ${isActive ? "bg-muted dark:bg-muted" : "hover:bg-muted dark:hover:bg-muted"}
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          {user?.profileImage ? (
            <ImageWithFallback
              src={user.profileImage}
              alt={user.name || "사용자"}
              className="w-10 h-10 rounded-full shrink-0 object-cover ring-2 ring-white dark:ring-background"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-foreground dark:text-foreground truncate">
                {user?.nickname || user?.name || "사용자"}
              </p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
