import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { authApi } from '../lib/axios';

const safeEncodeUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('data:')) return url;
  try {
    return encodeURI(decodeURI(url));
  } catch (e) {
    try {
      return encodeURI(url);
    } catch {
      return url;
    }
  }
};

interface User {
  userId: number;
  email: string;
  name: string;
  nickname: string;
  organization?: string;
  contact?: string;
  websiteUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  profileImage?: string;
  profileImageUrl?: string;
  planType?: 'BASIC' | 'PRO';
  expertStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  // API 응답 매핑 필드 추가
  introduction?: string | null;
  location?: string | null;
  website?: string | null;
  isExpert?: boolean;
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
  updateOrganization: (organization: string) => Promise<boolean>;
  updateWebsite: (websiteUrl: string) => Promise<boolean>;
  updateProfileImage: (file: File) => Promise<boolean>;
  changePlan: (planType: 'BASIC' | 'PRO') => Promise<boolean>;
  applyExpert: (file: File) => Promise<boolean>;
  fetchUser: () => Promise<boolean>;
  fetchUserProfile: (userId: number) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      login: ({ user }) => set({ 
        user: {
          ...user,
          profileImage: safeEncodeUrl(user.profileImage || user.profileImageUrl || '/defaultUserProfile.png')
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
              user: state.user ? { ...state.user, bio: newBio, introduction: newBio, updatedAt } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update bio:', error);
          return false;
        }
      },

      updateOrganization: async (organization: string) => {
        try {
          const response = await api.put('/profile/location', { organization });
          if (response.data.success) {
            // 서버 응답의 location 필드가 있다면 그것을 쓰거나, 보낸 값을 사용함
            const updatedAt = response.data.data.updatedAt;
            set((state) => ({
              user: state.user ? { ...state.user, organization, location: organization, updatedAt } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update organization:', error);
          return false;
        }
      },

      updateWebsite: async (websiteUrl: string) => {
        try {
          const response = await api.put('/profile/website', { websiteUrl });
          if (response.data.success) {
            const updatedAt = response.data.data.updatedAt;
            set((state) => ({
              user: state.user ? { ...state.user, websiteUrl, website: websiteUrl, updatedAt } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update website:', error);
          return false;
        }
      },

      updateProfileImage: async (file: File) => {
        try {
          const user = get().user;
          if (!user) return false;

          const formData = new FormData();
          formData.append('image', file);

          const response = await api.put('/profile/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            const newProfileImageUrl = response.data.data.profileImageUrl;
            set((state) => ({
              user: state.user ? { ...state.user, profileImage: safeEncodeUrl(newProfileImageUrl) } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to update profile image:', error);
          return false;
        }
      },

      changePlan: async (planType: 'BASIC' | 'PRO') => {
        try {
          const response = await api.put('/users/me/plan', { planType });
          if (response.data.success) {
            set((state) => ({
              user: state.user ? { ...state.user, planType } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to change plan:', error);
          return false;
        }
      },

      applyExpert: async (file: File) => {
        try {
          const formData = new FormData();
          formData.append('certificationFile', file);
          const response = await api.post('/users/me/expert', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          if (response.data.success) {
            set((state) => ({
              user: state.user ? { ...state.user, expertStatus: 'PENDING' } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to apply for expert verification:', error);
          return false;
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/users/me');
          const userData = response.data.data || response.data; 
          
          const currentUser = get().user;
          set({ 
            user: {
              ...currentUser,
              ...userData,
              profileImage: safeEncodeUrl(userData.profileImage || userData.profileImageUrl || currentUser?.profileImage || '/defaultUserProfile.png'),
              bio: userData.bio || currentUser?.bio,
              websiteUrl: userData.websiteUrl || currentUser?.websiteUrl
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

      fetchUserProfile: async (userId: number) => {
        try {
          const response = await api.get(`/users/${userId}`);
          if (response.data.success) {
            const profileData = response.data.data;
            set((state) => ({
              user: state.user ? {
                ...state.user,
                ...profileData,
                bio: profileData.introduction ?? state.user.bio,
                organization: profileData.location ?? state.user.organization,
                websiteUrl: profileData.website ?? state.user.websiteUrl,
                isExpert: profileData.isExpert ?? state.user.isExpert,
                createdAt: profileData.createdAt ?? state.user.createdAt,
              } : {
                userId: profileData.userId,
                name: profileData.name,
                nickname: profileData.nickname,
                email: '',
                bio: profileData.introduction,
                introduction: profileData.introduction,
                organization: profileData.location,
                location: profileData.location,
                websiteUrl: profileData.website,
                website: profileData.website,
                createdAt: profileData.createdAt,
                isExpert: profileData.isExpert,
                profileImage: '/defaultUserProfile.png',
              } as User
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
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
