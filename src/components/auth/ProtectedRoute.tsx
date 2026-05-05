import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  // 로그인되지 않은 경우 루트(랜딩 페이지)로 이동
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 로그인된 경우: children이 있으면 children을, 없으면 Outlet을 렌더링
  return children ? <>{children}</> : <Outlet />;
}
