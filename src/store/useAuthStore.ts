import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  login: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: ({ accessToken, refreshToken, user }) => set({ 
        user: {
          ...user,
          profileImage: user.profileImage || '/defalutUserProfile.png'
        },
        accessToken,
        refreshToken,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false 
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : userData
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
