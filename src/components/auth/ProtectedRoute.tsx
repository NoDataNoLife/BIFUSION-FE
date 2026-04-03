import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  // 로그인되지 않은 경우 메인(랜딩) 페이지로 이동
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 로그인된 경우 하위 라우트(Outlet) 렌더링
  return <Outlet />;
}
