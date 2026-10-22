import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import DashboardHeader from "../components/layout/DashboardHeader";

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenu = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    const dialog = mobileMenu.current;
    if (mobileMenuOpen && !dialog?.open) dialog?.showModal();
    if (!mobileMenuOpen && dialog?.open) dialog.close();
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen bg-background dark:bg-background">
      {/* 1. 고정 사이드바 */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      <dialog ref={mobileMenu} aria-label="탐색 메뉴" onCancel={() => setMobileMenuOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}
        className="m-0 p-0 h-dvh max-h-dvh max-w-[85vw] border-0 bg-transparent backdrop:bg-black/40 md:hidden">
        <div className="h-full flex"><Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} onNavigate={() => setMobileMenuOpen(false)} /></div>
      </dialog>

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* 하위 라우트가 렌더링되는 곳 */}
        <main className="flex-1 overflow-auto bg-background dark:bg-background custom-scrollbar transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
