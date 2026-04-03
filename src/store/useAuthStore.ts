import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// [1] 데이터의 생김새(타입)를 정의합니다. (TypeScript)
interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

// [2] 지갑(Store)에 담길 내용과, 지갑을 조작하는 방법(함수)을 정의합니다.
interface AuthState {
  user: User | null;         // 현재 로그인한 유저 정보 (없으면 null)
  isAuthenticated: boolean;  // 로그인 여부 (true/false)
  login: (user: User) => void; // 로그인 시킬 때 부르는 함수
  logout: () => void;          // 로그아웃 시킬 때 부르는 함수
}

/**
 * [3] 실제 지갑(Store)을 만듭니다.
 * create: Zustand의 핵심 함수입니다.
 * persist: "새로고침해도 데이터 안 날아가게 해줘!"라는 특수 기능(미들웨어)입니다.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // --- (A) 초기 데이터 값 ---
      user: null,
      isAuthenticated: false,

      // --- (B) 데이터를 바꾸는 함수들 (set 함수를 사용합니다) ---
      // set({ 새데이터 }) 라고 하면 지갑 속의 데이터가 바뀝니다.
      login: (userData) => set({ 
        user: {
          ...userData,
          profileImage: userData.profileImage || '/defalutUserProfile.png'
        }, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // 이 이름으로 브라우저(LocalStorage)에 저장됩니다.
    }
  )
);
