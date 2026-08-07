import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// 환경 변수(Vercel 등)에서 백엔드 주소를 주입받습니다. 로컬(undefined)일 경우 빈 문자열을 써서 vite proxy(/api/v1)를 태웁니다.
const SERVER_URL = import.meta.env.VITE_API_URL || '';

// 1. Auth 관련 인스턴스 먼저 선언 (참조 에러 방지)
export const authApi = axios.create({
  baseURL: `${SERVER_URL}/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 기본 API 인스턴스
const api = axios.create({
  baseURL: `${SERVER_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (Zustand 상태를 보낼 필요가 있다면 사용)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러(토큰 만료) 발생 시 토큰 갱신 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authApi.post('/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token expired or invalid');
        // Zustand 상태까지 완전히 초기화
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
