# BIFUSION 개발 일지 (2026-05-11)

## 1. 개요
백엔드 API 업데이트에 맞춰 Google OAuth2 소셜 로그인 연동을 완료하고, 보안이 강화된 쿠키 기반 세션 관리 및 신규 유저 온보딩 프로세스를 구축함. 이 과정에서 겪은 수많은 시행착오와 코드 리뷰를 통한 보안 강화 과정을 주니어 개발자의 시각에서 상세히 기록함.

---

## 2. 작업 상세 내역 및 코드 분석

### 2.1 백엔드 중심 쿠키 인증 시스템 (`withCredentials`)
우리 프로젝트는 보안을 위해 **HttpOnly 쿠키** 방식을 사용합니다. 자바스크립트가 토큰을 직접 읽지 못하게 막아 보안을 강화한 방식입니다.

*   **핵심 설정 (`src/lib/axios.ts`)**:
    ```typescript
    const api = axios.create({
      baseURL: '/api/v1',
      withCredentials: true, // 브라우저가 쿠키를 자동으로 실어 보내게 만듬!
    });
    ```
*   **Vite 프록시 설정 (`vite.config.ts`)**:
    프론트(3000)와 백엔드(8080) 포트가 달라 발생하는 CORS 에러를 해결하고, `/api/v1`과 `/auth` 경로를 정확히 라우팅함.

### 2.2 자동 세션 복구 및 초기화 (`App.tsx`)
사용자가 새로고침을 해도 로그인 상태가 풀리지 않게 앱이 켜질 때 딱 한 번 백엔드에 "나 누구야?"라고 물어봅니다.

```typescript
// src/App.tsx
function App() {
  const { isInitialized, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchUser(); // 앱 시작 시 서버 쿠키 확인
    }
  }, [isInitialized, fetchUser]);

  if (!isInitialized) return <LoadingSpinner />; // 확인 전까지는 하얀 화면 방지
  return <Router>...</Router>;
}
```

### 2.3 Silent Refresh (토큰 자동 갱신)
Access Token은 수명이 짧습니다(30분). 만료될 때마다 로그아웃되면 안 되므로, Axios 인터셉터를 이용해 **몰래** 갱신합니다.

```typescript
// src/lib/axios.ts (인터셉터)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401(만료) 에러가 나면 인터셉터가 가로챔!
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 
      try {
        await authApi.post('/refresh'); // 새 토큰(쿠키) 받기
        return api(originalRequest);   // 실패했던 원래 요청 다시 보내기!
      } catch (e) {
        useAuthStore.getState().logout(); // 리프레시도 안 되면 진짜 로그아웃
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 3. ⚠️ 치명적 문제와 해결 (Troubleshooting)

### Issue 1: 무한 로그인 루프 (Logout-Login Loop)
*   **현상**: 로그아웃 버튼을 눌렀는데, 0.1초 만에 다시 자동으로 로그인됨.
*   **원인**: 로그아웃 후 `isAuthenticated`가 `false`가 되면서 `LandingPage`로 리다이렉트되는데, 이때 메인 페이지에 있던 자동 로그인 로직이 즉시 실행되어 버림.
*   **해결**: 세션 체크 로직을 `App.tsx`로 옮기고, `isInitialized` 상태를 도입하여 **"앱이 처음 켜질 때만"** 확인하도록 제한함.

### Issue 2: 404 및 500 라우팅 에러
*   **현상**: API 호출 시 `/api/v1/api/v1/auth/logout` 처럼 주소가 꼬여서 404 발생.
*   **원인**: Axios `baseURL`에 이미 `/api/v1`이 있는데, 호출 시 또 붙여줌.
*   **해결**: 호출 경로에서 `/api/v1`을 제거하고, 인증 전용인 `authApi` 인스턴스를 분리하여 관리.

---

## 4. 💡 코드 리뷰를 통해 배운 보안 레슨 (매우 중요!)

코드 리뷰 과정에서 주니어 개발자가 흔히 저지르는 **심각한 보안/설계 실수** 3가지를 발견하고 수정함.

### Lesson 1: 세션 상태를 로컬 스토리지에 저장하지 마라! (Critical)
*   **실수**: `isInitialized: true` 상태를 `localStorage`에 저장해버림.
*   **결과**: 사용자가 며칠 뒤에 다시 들어와도 로컬 스토리지엔 여전히 `true`라고 적혀있음. 앱은 "아, 나 이미 확인 끝났어!"라고 착각하고 서버에 세션 확인(`fetchUser`)을 안 보냄. 결과적으로 **만료된 유저 정보가 화면에 계속 떠 있는 보안 사고** 발생.
*   **수정**: `isInitialized`를 `persist` 대상에서 제외(partialize). 앱을 켤 때마다 **무조건 서버에 물어보도록** 강제함.

### Lesson 2: HttpOnly 환경에선 토큰을 만지지 마라!
*   **실수**: 전역 상태(Store)에 `accessToken`, `refreshToken` 변수를 만들어둠.
*   **교훈**: 백엔드가 `httpOnly` 쿠키를 준다면, 프론트는 토큰값을 알 수도 없고 알 필요도 없음. 변수에 담아두는 행위 자체가 XSS 공격의 타겟이 됨.
*   **수정**: Store에서 토큰 관련 필드를 모두 삭제하고, 오직 서버에서 준 유저 정보(`user`)로만 로그인 여부를 판단함.

### Lesson 3: ProtectedRoute는 온보딩까지 책임져야 한다.
*   **실수**: 로그인 여부만 체크하고 온보딩 완료 여부는 체크 안 함.
*   **결과**: 신규 유저가 URL을 직접 쳐서 `/dashboard`에 들어올 수 있었음.
*   **수정**: `ProtectedRoute`에서 닉네임 유무를 체크하여 미완료 유저는 무조건 `/onboarding`으로 쫓아내도록 강화.

---

## 5. 향후 과제
- 프로필 페이지에서 온보딩 정보 수정 기능 추가.
- 전문가 인증 신청 시 파일 업로드(S3 연동) 구현.

---
*마지막 업데이트: 2026-05-12*
