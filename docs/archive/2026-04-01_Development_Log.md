# BIFFUSION 프론트엔드 개발 일지: 초기 인프라 및 아키텍처 구축

이 문서는 BIFFUSION 프론트엔드 프로젝트를 처음 구축할 때 어떤 기술을 왜 선택했는지, 그리고 프로젝트의 뼈대(폴더 구조)를 어떻게 잡았는지 상세히 설명하는 가이드입니다. 프로젝트에 처음 합류하신 분들이 전체 그림을 잡는 데 도움이 되기를 바랍니다.

---

## 1. 아키텍처 및 기술 스택 설정

프론트엔드 애플리케이션을 튼튼하게 만들기 위해 크게 4가지 핵심 도구를 선택했습니다.

### 1) 전역 상태 관리: Zustand

리액트에서 여러 컴포넌트가 공통으로 써야 하는 데이터(예: 로그인한 유저 정보)를 관리할 때 씁니다. Redux보다 설정이 훨씬 간단해서 채택했습니다.

**[실제 사용 예시: `useAuthStore.ts`]**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 우리가 관리할 데이터의 모양(타입)을 정합니다.
interface AuthState {
  user: { id: string; name: string } | null;
  login: (userData: any) => void;
  logout: () => void;
}

// 2. 창고(Store)를 만듭니다.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // 초기 상태는 로그인 안 된 상태(null)
      
      // 로그인 함수: 호출되면 user 상태를 userData로 바꿉니다.
      login: (userData) => set({ user: userData }),
      
      // 로그아웃 함수: 호출되면 user 상태를 다시 null로 돌립니다.
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' } // 이 옵션을 주면 새로고침해도 로그인이 풀리지 않게 LocalStorage에 자동 저장됩니다!
  )
);
```

### 2) 서버 상태 관리: TanStack Query (React Query)

서버에서 데이터를 가져오고(GET), 캐싱하고, 로딩 상태나 에러 처리를 획기적으로 줄여주는 도구입니다. 서버와의 통신은 무조건 이 친구를 거치게 됩니다.

### 3) 라우팅: React Router Dom

웹 브라우저의 주소창(URL)에 따라 알맞은 화면을 띄워주는 역할을 합니다.

**[실제 적용된 중첩 라우팅 구조]**
우리는 화면의 "틀(Layout)"과 "알맹이(Page)"를 분리하는 중첩 라우팅을 사용했습니다.

```tsx
<Routes>
  {/* 대시보드 레이아웃: 좌측 메뉴바와 상단 헤더는 고정됩니다. */}
  <Route element={<DashboardLayout />}>
    {/* 주소창에 따라 알맹이 컴포넌트만 쏙쏙 바뀝니다. */}
    <Route path="/dashboard" element={<DashboardHomePage />} />
    <Route path="/projects" element={<ProjectsPage />} />
  </Route>
</Routes>
```

### 4) 스타일링: Tailwind CSS v4

CSS 파일을 따로 만들지 않고 HTML 클래스 이름만으로 디자인을 입히는 도구입니다. `text-primary`처럼 프로젝트만의 색상 테마를 정의해서 사용하고 있습니다.

---

## 2. 폴더 구조의 비밀 (리팩토링 내역)

원래는 모든 컴포넌트가 한 폴더에 뒤섞여 있었으나, 유지보수를 위해 역할에 따라 폴더를 엄격하게 나누었습니다.

* **`src/pages/` (페이지 컴포넌트)**
  * URL 주소와 1:1로 매칭되는 큼지막한 화면들입니다. (예: `ProjectsPage.tsx`, `ProfilePage.tsx`)
  * 이 파일들을 열어보면 전체 화면이 어떻게 구성되는지 한눈에 볼 수 있습니다.
* **`src/components/` (조각 컴포넌트)**
  * 페이지 내부를 구성하는 작은 블록들입니다. (예: `RecipeDetail.tsx`, 버튼, 모달 등)
  * 다른 페이지에서도 재사용하기 위해 분리해 둡니다.

---

## 3. 핵심 트러블슈팅 (에러 해결 사례)

코딩을 하다 보면 겪게 되는 흔한 에러들과 방어 코드 작성법입니다.

### 💡 데이터가 아직 안 왔을 때 뻗는 에러 (Optional Chaining)

서버에서 유저 정보를 받아오기도 전에 화면을 그리려고 하면 에러가 납니다. 이럴 때는 `?.` (옵셔널 체이닝)을 적극 활용합니다.

```tsx
// ❌ 위험한 코드: user가 아직 null이면 프로그램이 뻗어버립니다.
<p>{user.name}님 환영합니다!</p> 

// ✅ 안전한 코드: user가 null이면 에러 없이 통과하고 기본값을 보여줍니다.
<p>{user?.name || '게스트'}님 환영합니다!</p>
```

### 💡 아이콘 임포트 누락 에러

`lucide-react` 같은 라이브러리에서 아이콘을 쓸 때, 반드시 상단에 `import { 아이콘이름 } from 'lucide-react'`가 있는지 확인해야 합니다. 임포트 없이 쓰면 하얀 화면(Runtime Error)만 뜨게 됩니다.
