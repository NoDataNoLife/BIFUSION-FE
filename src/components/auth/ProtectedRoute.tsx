import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // 1. 로그인되지 않은 경우 루트(랜딩 페이지)로 이동
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 2. 로그인되었으나 온보딩이 안 된 경우 (닉네임이 없는 경우로 판단)
  // 온보딩 페이지 자체가 보호된 경로 안에 있다면 무한 루프 주의
  // 현재 App.tsx 구조 상 /onboarding은 ProtectedRoute 내부에 있음
  if (isAuthenticated && !user?.nickname && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 로그인 및 온보딩이 완료된 경우
  return children ? <>{children}</> : <Outlet />;
}
