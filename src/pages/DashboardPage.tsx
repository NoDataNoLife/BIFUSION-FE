import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  const userInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* 1. 고정 사이드바 */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 (공통) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs">
                  {userInitial}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 하위 라우트가 렌더링되는 곳 */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
