import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import NotificationCenter from '../components/layout/NotificationCenter';

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const userInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* 1. 고정 사이드바 */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 상단 헤더 (공통) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 flex-shrink-0 z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="프로젝트, 데이터셋, 레시피 검색..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-[1.25rem] text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 pl-10">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-3 rounded-2xl transition-all active:scale-95 ${
                  isNotificationOpen ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white animate-pulse"></span>
              </button>

              <NotificationCenter 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
              />
            </div>

            <div className="w-px h-8 bg-gray-100"></div>

            <div 
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{user?.name || '사용자'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Researcher</p>
              </div>
              <div className="relative">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm" />
                ) : (
                  <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                    {userInitial}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* 하위 라우트가 렌더링되는 곳 */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
