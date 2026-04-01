# BIFFUSION Frontend Implementation Roadmap

이 문서는 BIFFUSION 프로젝트의 프론트엔드 개발을 위한 상세 TODO 리스트입니다. `context-bifusion.txt`와 API 명세, 그리고 `reference_img`의 디자인 가이드를 바탕으로 작성되었습니다.

## 1. 초기 환경 설정 (Base Setup) ✅

- [x] **shadcn/ui 및 Tailwind CSS 구성**
  - [x] Tailwind CSS v4 테마 설정 및 커스텀 컬러 시스템 구축
  - [x] 다크/라이트 모드 기본 지원 설정
- [x] **Global State (Zustand) 정의**
  - [x] `useAuthStore`: 사용자 인증 정보 및 로컬 스토리지 유지(`persist`) 기능 구현
- [x] **API 계층 강화 (TanStack Query + Axios)**
  - [x] TanStack Query(React Query) 도입 및 `QueryClientProvider` 설정
  - [x] `src/lib/axios.ts` 기초 설정 완료
- [x] **Layout 시스템 및 정석 라우팅 구축**
  - [x] `Navbar.tsx` 고도화 (로그인 상태에 따른 메뉴 분기 및 모의 로그인 구현)
  - [x] `Sidebar.tsx` 구현 (URL 기반 내비게이션 및 NavLink 연동)
  - [x] **Page-based Routing 구조 확립**: `src/pages/dashboard/` 하위 정석 구조 리팩토링

## 2. 인증 및 사용자 (Auth & User) 🔄

- [ ] **Google OAuth2 로그인 연동**
  - [x] **모의 로그인(Mock Login) 구현**: 랜딩 페이지 및 네비바 연동 완료
  - [ ] `POST /api/v1/oauth2/authorization/google` 실제 API 연동
- [x] **사용자 프로필 및 활동 내역**
  - [x] `ProfilePage.tsx` 이식 완료: 사용자 정보, 통계, 참여 프로젝트 및 활동 피드 UI 구현
  - [ ] 실제 API 연동 (`GET /api/v1/users/me`)

## 3. Private Workspace (Project Track) 🔄

- [x] **프로젝트 대시보드**
  - [x] `DashboardHomePage.tsx`: 전체 현황, 퀵 액션, 리소스 사용량 UI 구현
  - [x] `ProjectsPage.tsx`: 프로젝트 목록 조회, 검색 필터, 생성 모달 UI 구현
  - [ ] 실제 API 연동 (`GET /api/v1/projects`)
- [ ] **데이터 관리**
  - [x] `AssetDatasetDetail.tsx`: 데이터셋 상세 정보 및 파일 목록 UI 이식 완료
  - [ ] `POST /api/v1/images/upload`: 의료 이미지 업로드 UI 실제 구현

## 4. AI Workflow (Jobs: Augment -> Train -> Inference)

- [ ] **Data Augmentation (데이터 증강)**
  - [ ] `AugmentPage.tsx` 이식 필요 (현재 Placeholder)
  - [ ] 증강 파라미터 설정 UI 및 결과 프리뷰 연동
- [ ] **Model Training (모델 학습)**
  - [ ] `TrainPage.tsx` 이식 필요
- [ ] **전문가 검수 (Expert Track)**
  - [x] `ExpertPage.tsx` 이식 완료: 검수 대기/진행/완료 탭 및 통계 UI
  - [x] `ReviewDetailPage.tsx` 이식 완료: 전문가 정밀 검수 및 코멘트 UI

## 5. Public Community (Public Track) 🔄

- [x] **Dataset 및 Recipe 탐색**
  - [x] `AssetsPage.tsx` 이식 완료: 보유 레시피 및 데이터셋 관리 UI
  - [x] `RecipeDetail.tsx` 이식 완료: 레시피 상세 정보, 통계, 리뷰 UI
- [ ] **커뮤니티 메인**
  - [ ] `CommunityPage.tsx` 이식 필요 (현재 Placeholder)
- [ ] **레시피 공유 및 리뷰**
  - [ ] 리뷰 작성 기능 실제 구현

## 6. UI/UX 정교화 (Design & Refinement) 🔄

- [x] **모던 UI 스타일 적용**
  - [x] 둥근 모서리(2xl, 3xl), 입체적 그림자, 포인트 컬러(primary) 시스템 적용
- [ ] **반응형 디자인**
  - [ ] 모바일 환경 최적화 점검
- [ ] **알림 시스템**
  - [ ] `NotificationCenter` 컴포넌트 이식 및 연동

## 7. 검증 및 배포 준비

- [ ] **API 명세 대조 및 타입 정의**
  - [ ] `src/types/api.ts` 명세서 기반 구축
- [ ] **Build Optimization**
  - [x] Vite 빌드 환경 점검 및 중복 익스포트 에러 해결
