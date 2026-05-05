import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    // URL에서 쿼리 파라미터를 추출합니다.
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const isNewUser = params.get('isNewUser') === 'true';
    
    // 유저 데이터가 복잡할 경우 JSON 스트링으로 올 수도 있습니다.
    const userStr = params.get('user');
    
    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // 스토어에 로그인 정보 저장
        login({ accessToken, refreshToken, user });

        // 신규 유저라면 프로필 설정(회원가입 추가 정보) 페이지로, 
        // 기존 유저라면 대시보드로 이동
        if (isNewUser) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('인증 데이터 파싱 오류:', error);
        navigate('/login', { replace: true });
      }
    } else {
      // 데이터가 부족하면 로그인 페이지로 되돌림
      navigate('/login', { replace: true });
    }
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 font-bold animate-pulse">로그인 중입니다. 잠시만 기다려주세요...</p>
      </div>
    </div>
  );
}
