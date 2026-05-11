import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { authApi } from '../lib/axios';

interface User {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  organization?: string;
  contact?: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  fetchUser: () => Promise<boolean>;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: false,

      login: ({ accessToken, refreshToken, user }) => set({ 
        user: {
          ...user,
          profileImage: user.profileImage || '/defalutUserProfile.png'
        },
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isInitialized: true
      }),

      setTokens: ({ accessToken, refreshToken }) => set({
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken
      }),
      
      logout: async () => {
        try {
          await authApi.post('/logout');
        } catch (error) {
          console.error('Failed to logout from server:', error);
        } finally {
          set({ 
            user: null, 
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true // 로그아웃 후에도 초기화는 완료된 상태로 간주
          });
          localStorage.removeItem('auth-storage');
        }
      },

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : userData
      })),

      fetchUser: async () => {
        try {
          const response = await api.get('/users/me');
          const userData = response.data.data || response.data; 
          
          set({ 
            user: {
              ...userData,
              profileImage: userData.profileImage || '/defalutUserProfile.png'
            },
            isAuthenticated: true,
            isInitialized: true
          });
          return true;
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // fetchUser 실패 시 로그아웃 처리하되 isInitialized는 true로 설정
          set({ 
            user: null, 
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true 
          });
          return false;
        }
      },

      setInitialized: (value) => set({ isInitialized: value })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized
      }),
    }
  )
);
