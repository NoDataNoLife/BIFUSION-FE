# BIFUSION 프론트엔드 개발 일지: 라우팅 보호 및 AI 워크플로우

이 문서는 2026-04-03에 진행된 프론트엔드 작업의 핵심 로직을 설명합니다. 로그인한 사용자만 특정 페이지에 들어갈 수 있게 막는 '라우팅 보호' 기술과, BIFUSION의 핵심인 3단계 AI 워크플로우가 프론트엔드에서 어떻게 구현되었는지 코드와 함께 살펴봅니다.

---

## 1. 로그인 안 한 사람 쫓아내기: `ProtectedRoute` 도입

웹 서비스에서는 "로그인한 유저만 볼 수 있는 페이지(예: 대시보드)"가 반드시 존재합니다. 누군가 주소창에 강제로 `/dashboard`를 치고 들어올 때, 로그인 상태를 검사해서 쫓아내는 기능이 필요합니다.

### 💡 어떻게 구현했나요?
리액트 라우터(React Router)와 Zustand 전역 상태(앞선 일지 참고)를 조합하여 톨게이트 역할을 하는 컴포넌트를 만들었습니다.

**[실제 동작 로직: `ProtectedRoute.tsx`]**
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute() {
  // 1. Zustand 창고에서 현재 유저 정보를 꺼내옵니다.
  const { user } = useAuthStore();

  // 2. 유저 정보가 없으면(null) 얄짤없이 홈 화면('/')으로 쫓아냅니다.
  // replace 속성을 주면 뒤로가기를 눌러도 다시 대시보드로 돌아갈 수 없게 막습니다.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. 유저 정보가 있다면 무사 통과! Outlet은 "자식 컴포넌트들을 보여줘라"라는 뜻입니다.
  return <Outlet />;
}
```

**[라우터 적용 예시: `App.tsx`]**
```tsx
<Routes>
  {/* 이 ProtectedRoute로 감싸진 아래의 모든 경로는 "보호구역"이 됩니다. */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardHomePage />} />
    <Route path="/projects" element={<ProjectsPage />} />
  </Route>
</Routes>
```
이 로직 덕분에 이제 로그아웃 버튼을 누르면 `user` 상태가 `null`이 되면서, 보고 있던 대시보드 화면에서 즉시 쫓겨나 메인 랜딩 페이지로 이동하게 됩니다!

---

## 2. 3단계 AI 워크플로우 설계

BIFUSION의 핵심 가치인 모델 학습 과정은 **데이터 증강(Augment) ➡️ 모델 학습(Train) ➡️ 결과 추론(Inference)** 3단계로 나뉩니다.

### 💡 화면을 어떻게 나누었나요?
하나의 페이지에 모든 기능을 다 때려 넣으면 코드가 너무 복잡해집니다. 그래서 우리는 단계를 세분화하여 폴더와 컴포넌트를 분리했습니다.

* **`Setup` (설정 화면)**: 유저가 학습에 사용할 데이터셋을 고르고 파라미터를 입력하는 폼(Form) 컴포넌트.
* **`Progress` (진행 화면)**: 서버로 학습을 요청(API POST)한 뒤, "학습 중입니다..."라는 로딩 바를 보여주는 컴포넌트.
* **`Result` (결과 화면)**: 서버에서 학습이 끝났다는 응답(Response)을 받으면 정확도 그래프와 결과를 보여주는 컴포넌트.

각 워크플로우(Augment, Train, Inference)마다 위 3가지 컴포넌트가 세트로 존재하며, 유저의 클릭에 따라 `Setup -> Progress -> Result` 순으로 컴포넌트를 갈아 끼우며 화면을 부드럽게 전환합니다.

---

## 3. 네비게이션(Navbar)의 이중 생활

서비스 성격에 따라 상단 메뉴바(Header)의 생김새와 기능이 완전히 달라야 합니다.

1. **랜딩 페이지용 Navbar**: 
   * 목적: 우리 서비스를 구경 온 손님을 꼬시는 것.
   * 구성: 서비스 소개, 요금제 안내, 그리고 커다란 '로그인/시작하기' 버튼.
2. **워크스페이스용 Header (대시보드 내)**: 
   * 목적: 실제 일을 하러 들어온 연구원의 편의성 극대화.
   * 구성: 팀원의 알림을 확인하는 🔔 아이콘(NotificationCenter), 통합 검색창, 내 프로필 설정 버튼.

라우팅 주소(현재 유저가 `/`에 있는지 `/dashboard`에 있는지)에 따라 위 두 개의 네비게이션 중 알맞은 것을 화면 최상단에 렌더링하도록 분리했습니다.
