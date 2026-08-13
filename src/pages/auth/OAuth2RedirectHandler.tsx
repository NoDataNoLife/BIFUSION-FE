import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    // 1. 쿼리(?a=b) 또는 해시(#/path?a=b) 기반 콜백에서 토큰 추출 시도
    const hashQuery = location.hash.includes("?")
      ? location.hash.substring(location.hash.indexOf("?"))
      : "";
    const rawQuery = location.search || hashQuery;
    const params = new URLSearchParams(rawQuery);

    const accessToken =
      params.get("accessToken") ||
      params.get("access_token") ||
      params.get("token");
    const refreshToken =
      params.get("refreshToken") || params.get("refresh_token");
    const isNewUser =
      (params.get("isNewUser") || params.get("is_new_user")) === "true";
    const userStr =
      params.get("user") || params.get("userInfo") || params.get("user_info");

    const processLogin = async () => {
      try {
        if (accessToken && refreshToken) {
          if (userStr) {
            // 쿼리에 유저 정보가 있는 경우
            const user = JSON.parse(decodeURIComponent(userStr));
            login({ user });
          } else {
            // 토큰만 있는 경우 (쿠키 기반 연동)
            await fetchUser();
          }
        } else {
          // 토큰이 없더라도 쿠키 방식일 수 있으므로 유저 정보를 페치해봄
          await fetchUser();
        }

        // 로그인 성공 시 이동 (fetchUser가 실패하면 내부적으로 logout 처리됨)
        if (useAuthStore.getState().isAuthenticated) {
          if (isNewUser) {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else {
          console.error("인증 데이터가 유효하지 않음");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("인증 처리 중 오류 발생:", error);
        navigate("/", { replace: true });
      }
    };

    processLogin();
  }, [location, login, fetchUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-bold animate-pulse">
          로그인 중입니다. 잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
}
