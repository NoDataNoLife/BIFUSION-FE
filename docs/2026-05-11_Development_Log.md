# BIFUSION 프론트엔드 개발 일지: 로그인(Auth)과 보안의 정석

이 문서는 2026-05-11에 진행된 로그인 및 회원가입 관련 로직을 설명합니다. 사용자 인증(Auth)은 보안과 직결되기 때문에 프론트엔드에서 가장 까다로운 부분 중 하나입니다. 토큰(Token)을 어떻게 다루고 보안을 유지했는지 코드를 통해 차근차근 알아봅니다.

---

## 1. OAuth2 로그인과 '쿠키(Cookie)'의 마법

사용자가 "구글로 로그인하기" 버튼을 누르면, 구글 창이 뜨고 로그인이 완료된 후 다시 우리 사이트(`/login/success`)로 돌아오게 됩니다. 

### 🚨 초보적인 실수: 토큰을 직접 만지기
보통 로그인을 하면 서버가 '너는 인증된 유저야'라는 증표인 JWT 토큰(AccessToken, RefreshToken)을 줍니다. 초창기에는 이 토큰을 프론트엔드 코드(Zustand 전역 변수나 LocalStorage)에 직접 저장해 두고 사용하려 했습니다.

**하지만 이는 해킹(XSS 공격)에 매우 취약한 방식입니다.** 나쁜 해커가 자바스크립트 코드를 심어서 우리가 저장해둔 토큰을 훔쳐 갈 수 있기 때문입니다.

### 💡 안전한 해결책: `httpOnly` 쿠키 사용
그래서 우리는 백엔드 개발자분들과 합의하여, 토큰을 프론트엔드가 아예 만질 수 없게 **`httpOnly` 속성이 걸린 쿠키(Cookie)**로 구워달라고 요청했습니다.

*   `httpOnly` 쿠키는 자바스크립트 코드로 절대 읽을 수 없습니다. (해커도 못 훔쳐 갑니다!)
*   대신, 프론트엔드가 백엔드로 API 요청(Axios)을 보낼 때 브라우저가 알아서 이 쿠키를 쓱~ 끼워 넣어서 서버로 보냅니다.

**[실제 적용된 Axios 설정: `src/lib/axios.ts`]**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // 이 옵션 하나가 마법을 부립니다!
  // 요청을 보낼 때 브라우저가 쿠키(토큰)를 알아서 같이 보내게 해줍니다.
  withCredentials: true, 
});
```
결론적으로 프론트엔드는 토큰이 어떻게 생겼는지 알 필요도 없이, 그저 "나 로그인된 유저니까 데이터 줘!"라고 요청만 하면 됩니다.

---

## 2. 닉네임이 없으면 나가세요! (온보딩 강제하기)

사용자가 구글 로그인을 처음 하면, 이름과 이메일만 있지 '닉네임'이나 '소속' 같은 필수 정보가 없습니다. 이런 유저들은 무조건 정보 입력 화면(`/onboarding`)으로 보내서 빈칸을 채우게 만들어야 합니다.

### 💡 어떻게 강제할까요?
앞서 만들었던 톨게이트 컴포넌트(`ProtectedRoute`)의 검문 조건을 더 깐깐하게 업그레이드했습니다.

**[업그레이드된 `ProtectedRoute.tsx`]**
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute() {
  const { user } = useAuthStore();

  // 1. 아예 로그인을 안 한 사람 -> 메인 페이지로 쫓아냄
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. 로그인은 했는데 닉네임(nickname)이 없는 사람 -> 온보딩 페이지로 강제 이동!
  // (이 조건을 안 걸면 주소창에 /dashboard를 쳐서 꼼수로 들어올 수 있습니다.)
  if (!user.nickname) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. 로그인도 했고 닉네임도 있는 완벽한 유저 -> 무사 통과
  return <Outlet />;
}
```
단순히 "로그인 했냐 안 했냐"를 넘어서, "우리가 원하는 필수 정보를 다 적었느냐"까지 검사함으로써 꼼수를 쓰는 유저들을 완벽하게 차단할 수 있었습니다.
