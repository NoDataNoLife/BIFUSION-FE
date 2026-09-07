import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import OAuth2RedirectHandler from "./pages/auth/OAuth2RedirectHandler";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Dashboard 정석 페이지들
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import ProjectDetailPage from "./pages/dashboard/ProjectDetailPage";
import AugmentSetupPage from "./pages/dashboard/AugmentSetupPage";
import AugmentProgressPage from "./pages/dashboard/AugmentProgressPage";
import AugmentResultPage from "./pages/dashboard/AugmentResultPage";
import TrainSetupPage from "./pages/dashboard/TrainSetupPage";
import TrainProgressPage from "./pages/dashboard/TrainProgressPage";
import TrainResultPage from "./pages/dashboard/TrainResultPage";
import InferenceSetupPage from "./pages/dashboard/InferenceSetupPage";
import InferenceProgressPage from "./pages/dashboard/InferenceProgressPage";
import InferenceResultPage from "./pages/dashboard/InferenceResultPage";
import AssetsPage from "./pages/dashboard/AssetsPage";
import ExpertPage from "./pages/dashboard/ExpertPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import CommunityPage from "./pages/dashboard/CommunityPage";
import ActivitiesPage from "./pages/dashboard/ActivitiesPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import OnboardingPage from "./pages/OnboardingPage";

// 임시 컴포넌트들
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-muted-foreground mt-2">
      이 페이지는 현재 준비 중입니다.
    </p>
  </div>
);

function App() {
  const { isAuthenticated, isInitialized, fetchUser } = useAuthStore();

  useEffect(() => {
    // 앱이 처음 로드될 때만 세션 체크 (쿠키 기반 인증 확인)
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  if (!isInitialized) {
    // 초기화 중에는 로딩 표시
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 1. 루트 경로: 로그인 상태면 대시보드로 자동 이동 */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <Navbar />
                <LandingPage />
              </>
            )
          }
        />

        {/* 2. 대시보드 및 보호된 경로 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<DashboardHomePage />} />

            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />

            {/* Augment Workflow */}
            <Route
              path="projects/:projectId/jobs/:jobId/setup"
              element={<AugmentSetupPage />}
            />
            <Route
              path="projects/:projectId/jobs/:jobId/progress"
              element={<AugmentProgressPage />}
            />
            <Route
              path="projects/:projectId/jobs/:jobId/result"
              element={<AugmentResultPage />}
            />

            {/* Train Workflow */}
            <Route
              path="projects/:projectId/train/:jobId/setup"
              element={<TrainSetupPage />}
            />
            <Route
              path="projects/:projectId/train/:jobId/progress"
              element={<TrainProgressPage />}
            />
            <Route
              path="projects/:projectId/train/:jobId/result"
              element={<TrainResultPage />}
            />

            {/* Inference Workflow */}
            <Route
              path="projects/:projectId/inference/:jobId/setup"
              element={<InferenceSetupPage />}
            />
            <Route
              path="projects/:projectId/inference/:jobId/progress"
              element={<InferenceProgressPage />}
            />
            <Route
              path="projects/:projectId/inference/:jobId/result"
              element={<InferenceResultPage />}
            />

            <Route path="assets" element={<AssetsPage />} />
            <Route path="expert" element={<ExpertPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="users/:userId" element={<ProfilePage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>

          {/* 추가 정보 입력 페이지 */}
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* 3. OAuth2 리다이렉트 핸들러 (인증 결과 처리 전용) */}
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* 4. 404 및 예외 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
