import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import DashboardHeader from "../components/layout/DashboardHeader";

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-background">
      {/* 1. 고정 사이드바 */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <DashboardHeader />

        {/* 하위 라우트가 렌더링되는 곳 */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-background custom-scrollbar transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
