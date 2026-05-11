import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러(토큰 만료) 발생 시 토큰 갱신 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도한 적이 없을 때 실행
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // /auth/refresh 호출하여 토큰 갱신
        // authApi는 baseURL이 '/auth'이므로 '/refresh'만 호출
        await authApi.post('/refresh');

        // 토큰 갱신 성공 시 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token까지 만료된 경우 로그아웃 처리
        console.error('Refresh token expired or invalid');
        // circular dependency 피하기 위해 로컬스토리지 비우고 홈으로 이동
        localStorage.removeItem('auth-storage');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = axios.create({
  baseURL: '/auth',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
