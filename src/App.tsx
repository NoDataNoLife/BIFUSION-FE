import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

// Dashboard 정석 페이지들
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import AssetsPage from './pages/dashboard/AssetsPage';
import ExpertPage from './pages/dashboard/ExpertPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import CommunityPage from './pages/dashboard/CommunityPage';

// 임시 컴포넌트들
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-500 mt-2">이 페이지는 현재 준비 중입니다.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. 랜딩 페이지 */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        
        {/* 2. 대시보드 (중첩 라우팅) */}
        <Route path="/dashboard" element={<DashboardPage />}>
          {/* 기본 경로: /dashboard */}
          <Route index element={<DashboardHomePage />} />
          
          {/* 기능 경로들 */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="expert" element={<ExpertPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="community" element={<CommunityPage />} />
          
          {/* 나머지 준비 중인 페이지들 */}
          <Route path="settings" element={<Placeholder title="Settings" />} />
          <Route path="activities" element={<Placeholder title="Activities" />} />
        </Route>

        {/* 3. 404 및 예외 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
