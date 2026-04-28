# BIFFUSION Development Log

이 문서는 BIFFUSION 프론트엔드 프로젝트의 개발 과정, 주요 기술적 결정 사항 및 아키텍처 변화를 기록합니다.

## 📅 2026-04-01: 초기 인프라 구축 및 프로토타입 이식 시작

### 🏗️ 아키텍처 및 기술 스택 설정

1. **상태 관리 (State Management):**
    * **Zustand** 도입: Redux 대비 가볍고 직관적인 전역 상태 관리를 위해 선택. `useAuthStore`를 통해 사용자 인증 및 로컬 스토리지 유지(`persist`) 기능 구현.
2. **서버 상태 관리 (Server State):**
    * **TanStack Query (React Query)** 도입: API 호출의 로딩, 에러, 캐싱 처리를 자동화하여 UX 향상.
3. **라우팅 (Routing):**
    * **React Router Dom** 기반 중첩 라우팅(`Nested Routes`) 구축.
    * Figma 프로토타입의 `state` 기반 네비게이션을 실제 웹 표준인 **URL 기반 라우팅**으로 전환.
4. **스타일링 (Styling):**
    * **Tailwind CSS v4** 사용. 디자인 토큰(primary, secondary 등)을 정의하여 디자인 팀의 디테일 수정에 유연하게 대응 가능하도록 설정.

### 🔄 대대적인 리팩토링: Page-based Routing 정석 구조 도입

초기에는 `src/components/dashboard/`에 페이지급 파일들이 모여 있었으나, 유지보수성과 직관성을 위해 **정석적인 프론트엔드 구조**로 리팩토링을 단행했습니다.

* **`src/pages/dashboard/`**: 각 URL 주소와 1:1 매칭되는 페이지 컴포넌트 배치. (예: `ProjectsPage.tsx`, `ProfilePage.tsx`)
* **`src/components/dashboard/`**: 페이지 내부에서 재사용되거나 복잡한 로직을 가진 상세 조각 컴포넌트 배치. (예: `RecipeDetail.tsx`, `ReviewDetailPage.tsx`)
* **결과**: `App.tsx`에서 전체 서비스의 메뉴 구조를 한눈에 파악할 수 있게 됨.

### ✨ 구현된 주요 기능 및 페이지

1. **로그인 시뮬레이션 (Mock Auth):**
    * 랜딩 페이지 및 네비바에서 구글 로그인 버튼 클릭 시 가짜 유저 데이터로 `Zustand` 스토어를 업데이트하고 대시보드로 이동하는 흐름 구현. 실제 API 연동 시 백엔드 호출 코드만 추가하면 되도록 설계.
2. **대시보드 홈 (`DashboardHomePage`):** 전체 프로젝트 현황, 퀵 액션, 리소스 사용량 및 활동 피드 구현.
3. **프로젝트 리스트 (`ProjectsPage`):** 검색, 필터링, 새 프로젝트 생성 모달 및 참여/관리 프로젝트 구분 표시.
4. **자산 관리 (`AssetsPage`):** Fork한 레시피, 내 레시피, 데이터셋 목록 관리 및 각각의 상세 보기(`RecipeDetail`, `AssetDatasetDetail`) 연동.
5. **전문가 대시보드 (`ExpertPage`):** 전문가 전용 검수 워크플로우(대기/진행/완료) 및 정밀 검수 페이지 구현.
6. **사용자 프로필 (`ProfilePage`):** 활동 통계, 프로필 수정 UI, 참여 프로젝트 및 커뮤니티 활동 내역 표시.

### 💡 주요 해결 과제 (Troubleshooting)

* **흰 화면(Runtime Error) 해결:** `lucide-react` 아이콘(`Zap`) 임포트 누락으로 인한 렌더링 에러 해결.
* **경로 참조 에러 해결:** 파일 이동 후 `../../../`와 `../../` 간의 상대 경로 계산 오류 수정.
* **방어 코드 강화:** `user` 정보가 `null`일 경우를 대비하여 Optional Chaining(`?.`) 및 기본값 처리를 통해 런타임 에러 방지.

---

## 🚀 향후 계획

1. **API 명세서 대조 및 `src/types/api.ts` 정의:** 백엔드 명세서와 UI 데이터 구조 일치화.
2. **실제 API 연동:** TanStack Query를 사용하여 가짜 데이터를 실제 서버 데이터로 교체.
3. **커뮤니티 페이지 이식:** `CommunityPage.tsx` 정석 구조로 이식 및 레시피 공유 기능 활성화.
4. **AI 워크플로우 완성:** Augment, Train, Inference 설정 페이지 구현.
