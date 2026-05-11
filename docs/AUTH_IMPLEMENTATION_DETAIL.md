# BIFUSION 인증 시스템 상세 기술 명세서 (Junior Dev Guide)

이 문서는 주니어 개발자도 이해할 수 있도록 BIFUSION 프로젝트에 적용된 **OAuth2 소셜 로그인 및 세션 관리 로직**을 상세히 설명합니다.

---

## 1. 전체 흐름 요약 (The Big Picture)

우리 프로젝트는 **백엔드 중심의 인증 방식**을 사용합니다. 프론트엔드가 직접 구글에 요청하는 것이 아니라, 백엔드가 모든 인증을 처리하고 프론트엔드에게는 결과(쿠키)만 전달하는 방식입니다.

1.  **로그인 시작**: 사용자가 버튼을 누르면 백엔드 주소로 리다이렉트됩니다.
2.  **인증 완료**: 구글 인증이 끝나면 백엔드는 브라우저에 **HttpOnly 쿠키**를 심어줍니다.
3.  **세션 확인**: 프론트엔드가 켜지면 브라우저에 심어진 쿠키를 백엔드에 보내서 "나 누구야?"라고 물어봅니다.
4.  **로그인 완료**: 백엔드가 유저 정보를 주면, 프론트엔드 상태(Zustand)에 저장합니다.

---

## 2. 핵심 기술 포인트 설명

### 2.1 HttpOnly 쿠키와 `withCredentials`
백엔드(`CookieUtil.java`)에서 쿠키를 생성할 때 `.httpOnly(true)` 설정을 사용합니다.
*   **왜?**: 자바스크립트(`document.cookie`)로 쿠키를 읽을 수 없게 만들어 XSS 공격으로부터 토큰을 보호하기 위해서입니다.
*   **어떻게?**: 자바스크립트로 못 읽기 때문에, Axios 설정에서 `withCredentials: true`를 반드시 켜줘야 합니다. 그래야 브라우저가 API를 보낼 때 쿠키를 자동으로 포함해서 보냅니다.

```typescript
// src/lib/axios.ts
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // 이게 있어야 쿠키가 자동으로 서버에 전달됩니다!
});
```

### 2.2 Vite 프록시 (Proxy) 설정
개발 환경에서 프론트는 `3000`, 백엔드는 `8080` 포트를 사용합니다. 포트가 다르면 브라우저는 보안상의 이유로 요청을 막습니다(CORS). 이를 속이기 위해 프록시를 사용합니다.

```typescript
// vite.config.ts
proxy: {
  '/api/v1': { target: 'http://localhost:8080' }, // 프론트의 /api/v1 요청을 백엔드로 몰래 전달
  '/auth': { target: 'http://localhost:8080' }    // 로그아웃 요청 등을 위해 추가
}
```

---

## 3. 구현된 코드 상세 분석

### 3.1 `useAuthStore.ts` (전역 상태 관리)
Zustand를 사용하여 로그인 상태를 관리합니다. 가장 중요한 로직은 `fetchUser`와 `logout`입니다.

```typescript
// src/store/useAuthStore.ts

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... 초기값 (user, isAuthenticated 등)
      
      // 로그아웃: 백엔드에 알리고 프론트 상태도 지웁니다.
      logout: async () => {
        try {
          await authApi.post('/logout'); // 백엔드 세션 종료
        } finally {
          set({ user: null, isAuthenticated: false, isInitialized: true });
          localStorage.removeItem('auth-storage');
        }
      },

      // 세션 체크: 브라우저에 쿠키가 있다면 유저 정보를 가져옵니다.
      fetchUser: async () => {
        try {
          const response = await api.get('/users/me'); // axios가 자동으로 쿠키를 실어 보냄
          const userData = response.data.data; // 백엔드 공통 응답 구조에서 데이터 추출
          set({ user: userData, isAuthenticated: true, isInitialized: true });
          return true;
        } catch (error) {
          // 쿠키가 없거나 만료된 경우
          set({ user: null, isAuthenticated: false, isInitialized: true });
          return false;
        }
      }
    })
  )
);
```

### 3.2 `App.tsx` (자동 로그인 로직)
사용자가 새로고침을 하거나 사이트에 처음 들어왔을 때, "로그인 상태인지"를 딱 한 번만 체크합니다.

```typescript
// src/App.tsx 로직 설명
function App() {
  const { isInitialized, fetchUser } = useAuthStore();

  useEffect(() => {
    // 앱이 처음 켜질 때 (isInitialized가 false일 때) 딱 한 번만 실행!
    if (!isInitialized) {
      fetchUser(); // 쿠키가 있는지 확인하러 감
    }
  }, [isInitialized, fetchUser]);

  // 로딩 중에는 하얀 화면 대신 스피너를 보여줌
  if (!isInitialized) return <LoadingSpinner />;

  return <Router>...</Router>;
}
```

### 3.3 `OAuth2RedirectHandler.tsx` (콜백 처리)
백엔드에서 구글 로그인이 성공하면 우리 쪽으로 리다이렉트를 시키는데, 이때 추가적인 정보 처리나 페이지 이동을 담당합니다.

1.  백엔드가 쿠키를 심어준 상태로 리다이렉트 시킴.
2.  이 핸들러가 실행되면서 `fetchUser()`를 호출.
3.  성공하면 대시보드나 온보딩 페이지로 이동.

---

## 4. 주니어 개발자를 위한 팁
*   **500 에러**: 서버 내부 에러입니다. 주로 우리 코드의 오타나 중복된 괄호 `{}` 때문에 Vite가 빌드에 실패했을 때 브라우저에 나타납니다.
*   **404 에러**: 주소를 찾을 수 없을 때입니다. `/api/v1/api/v1` 처럼 주소가 중복되지 않았는지, 또는 프록시 설정이 빠지지 않았는지 확인하세요.
*   **자동 로그인**: 사용자가 로그인 버튼을 안 눌렀는데 대시보드로 간다면, 브라우저가 이전에 받아둔 유효한 쿠키를 가지고 있기 때문입니다. (버그가 아니라 아주 잘 만든 기능입니다!)

---
*문서 작성일: 2026-05-12*
