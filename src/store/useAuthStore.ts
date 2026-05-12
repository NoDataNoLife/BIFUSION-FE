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
  bio?: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (data: { user: User }) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  updateNickname: (nickname: string) => Promise<boolean>;
  updateBio: (bio: string) => Promise<boolean>;
  fetchUser: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      login: ({ user }) => set({ 
        user: {
          ...user,
          profileImage: user.profileImage || '/defaultUserProfile.png'
        },
        isAuthenticated: true,
        isInitialized: true
      }),
      
      logout: async () => {
        try {
          await authApi.post('/logout');
        } catch (error) {
          console.error('Failed to logout from server:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false,
            isInitialized: true 
          });
          localStorage.removeItem('auth-storage');
        }
      },

      deleteAccount: async () => {
        try {
          await api.delete('/users/me');
          set({ 
            user: null, 
            isAuthenticated: false,
            isInitialized: true 
          });
          localStorage.removeItem('auth-storage');
          return true;
        } catch (error) {
          console.error('Failed to delete account:', error);
          // 실패하더라도 안전을 위해 로컬 세션은 정리 시도할 수 있음
          return false;
        }
      },

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : userData
      })),

      updateNickname: async (nickname: string) => {
        try {
          const response = await api.put('/profile/nickname', { nickname });
          if (response.data.success) {
            const { nickname: newNickname, updatedAt } = response.data.data;
            set((state) => ({
              user: state.user ? { ...state.user, nickname: newNickname, updatedAt } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update nickname:', error);
          return false;
        }
      },

      updateBio: async (bio: string) => {
        try {
          const response = await api.put('/profile/introduction', { bio });
          if (response.data.success) {
            const { bio: newBio, updatedAt } = response.data.data;
            set((state) => ({
              user: state.user ? { ...state.user, bio: newBio, updatedAt } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update bio:', error);
          return false;
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/users/me');
          const userData = response.data.data || response.data; 
          
          set({ 
            user: {
              ...userData,
              profileImage: userData.profileImage || '/defaultUserProfile.png'
            },
            isAuthenticated: true,
            isInitialized: true
          });
          return true;
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ 
            user: null, 
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
        isAuthenticated: state.isAuthenticated
        // isInitialized와 토큰은 보안 및 세션 검증을 위해 저장하지 않음
      }),
    }
  )
);
