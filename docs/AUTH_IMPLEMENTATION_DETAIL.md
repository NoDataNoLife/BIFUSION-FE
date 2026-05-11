# BIFUSION 인증 시스템 상세 기술 명세서 (Junior Dev Guide)

이 문서는 주니어 개발자도 이해할 수 있도록 BIFUSION 프로젝트에 적용된 **OAuth2 소셜 로그인 및 세션 관리 로직**을 상세히 설명합니다.

---

## 1. 전체 흐름 요약 (The Big Picture)

우리 프로젝트는 **백엔드 중심의 인증 방식**을 사용합니다. 프론트엔드가 직접 구글에 요청하는 것이 아니라, 백엔드가 모든 인증을 처리하고 프론트엔드에게는 결과(쿠키)만 전달하는 방식입니다.

1. **로그인 시작**: 사용자가 버튼을 누르면 백엔드 주소로 리다이렉트됩니다.
2. **인증 완료**: 구글 인증이 끝나면 백엔드는 브라우저에 **HttpOnly 쿠키**를 심어줍니다.
3. **세션 확인**: 프론트엔드가 켜지면 브라우저에 심어진 쿠키를 백엔드에 보내서 "나 누구야?"라고 물어봅니다.
4. **로그인 완료**: 백엔드가 유저 정보를 주면, 프론트엔드 상태(Zustand)에 저장합니다.

---

## 2. 핵심 기술 포인트 설명

### 2.1 HttpOnly 쿠키와 `withCredentials`

백엔드(`CookieUtil.java`)에서 쿠키를 생성할 때 `.httpOnly(true)` 설정을 사용합니다.

* **왜?**: 자바스크립트(`document.cookie`)로 쿠키를 읽을 수 없게 만들어 XSS 공격으로부터 토큰을 보호하기 위해서입니다.
* **어떻게?**: 자바스크립트로 못 읽기 때문에, Axios 설정에서 `withCredentials: true`를 반드시 켜줘야 합니다. 그래야 브라우저가 API를 보낼 때 쿠키를 자동으로 포함해서 보냅니다.

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

3.3 `OAuth2RedirectHandler.tsx` (콜백 처리)
백엔드에서 구글 로그인이 성공하면 우리 쪽으로 리다이렉트를 시키는데, 이때 추가적인 정보 처리나 페이지 이동을 담당합니다.

1.  백엔드가 쿠키를 심어준 상태로 리다이렉트 시킴.
2.  이 핸들러가 실행되면서 `fetchUser()`를 호출.
3.  성공하면 대시보드나 온보딩 페이지로 이동.

---

## 5. 고급: 토큰 자동 갱신 (Silent Refresh) 로직

사용자가 로그인 후 활동하다 보면 토큰(Access Token)이 만료됩니다. 이때 사용자를 로그아웃시키지 않고 몰래 토큰을 바꿔치기하는 기술입니다.

### 5.1 왜 사용하나요?
*   보안상 Access Token은 수명을 짧게(예: 30분) 가져갑니다.
*   하지만 30분마다 로그아웃되면 사용자 경험이 최악이겠죠?
*   따라서 유효한 **Refresh Token**이 있다면, API 요청 실패 시 자동으로 갱신을 시도합니다.

### 5.2 Axios 응답 인터셉터 (Response Interceptor)
`src/lib/axios.ts` 파일에 구현된 이 로직은 API 응답이 돌아올 때마다 실행되는 **'관문'** 역할을 합니다.

```typescript
// src/lib/axios.ts의 핵심 로직
api.interceptors.response.use(
  (response) => response, // 성공하면 그냥 통과!
  async (error) => {
    const originalRequest = error.config;

    // 만약 에러가 401(Unauthorized)이고, 아직 재시도를 안 했다면?
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // "나 지금 재시도 중이야"라고 표시 (무한루프 방지)

      try {
        // 백엔드의 /auth/refresh 엔드포인트 호출
        await authApi.post('/refresh'); 

        // 성공했다면? 방금 실패했던 그 요청을 다시 시도해서 사용자에게 결과를 돌려줌!
        return api(originalRequest);
      } catch (refreshError) {
        // 만약 리프레시 토큰마저 만료됐다면... 진짜 로그아웃
        localStorage.removeItem('auth-storage');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### 5.3 작동 시나리오
1.  **API 호출**: 유저가 프로젝트 목록을 불러오려 함.
2.  **토큰 만료**: 하필 이때 토큰이 만료되어 서버가 `401` 에러를 보냄.
3.  **가로채기**: 인터셉터가 에러를 잡고 잠깐 기다리라고 함.
4.  **갱신 요청**: 백엔드에 `/auth/refresh` 요청을 보냄. (쿠키는 브라우저가 알아서 실어줌)
5.  **성공**: 백엔드가 새 쿠키를 구워줌.
6.  **재시도**: 실패했던 프로젝트 목록 호출을 다시 실행.
7.  **완료**: 유저는 에러가 났었는지도 모른 채 프로젝트 목록을 보게 됨!

---

## 6. 주니어 개발자를 위한 팁
*   **500 에러**: 서버 내부 에러입니다. 주로 우리 코드의 오타나 중복된 괄호 `{}` 때문에 Vite가 빌드에 실패했을 때 브라우저에 나타납니다.
*   **404 에러**: 주소를 찾을 수 없을 때입니다. `/api/v1/api/v1` 처럼 주소가 중복되지 않았는지, 또는 프록시 설정이 빠지지 않았는지 확인하세요.
*   **자동 로그인**: 사용자가 로그인 버튼을 안 눌렀는데 대시보드로 간다면, 브라우저가 이전에 받아둔 유효한 쿠키를 가지고 있기 때문입니다. (버그가 아니라 아주 잘 만든 기능입니다!)
*   **무한 루프**: 인터셉터에서 재시도 로직(`_retry` 플래그)이 없으면, 401 에러가 계속 날 경우 무한히 서버에 요청을 보낼 수 있으니 주의해야 합니다.

---
*마지막 업데이트: 2026-05-12*

---
*문서 작성일: 2026-05-12*
