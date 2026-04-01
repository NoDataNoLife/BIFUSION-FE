# BIFFUSION Frontend Implementation Roadmap

이 문서는 BIFFUSION 프로젝트의 프론트엔드 개발을 위한 상세 TODO 리스트입니다. `context-bifusion.txt`와 API 명세, 그리고 `reference_img`의 디자인 가이드를 바탕으로 작성되었습니다.

## 1. 초기 환경 설정 (Base Setup)

- [ ] **shadcn/ui 도입 및 구성**
  - `components.json` 설정 및 기본 UI 컴포넌트 설치 (Button, Input, Card, Dialog, Tabs, etc.)
  - Tailwind CSS 테마 설정 (`reference_img/land-dark.png`, `land-white.png` 참고하여 다크/라이트 모드 지원)
- [ ] **Global State (Zustand) 정의**
  - `useAuthStore`: 사용자 인증 정보 및 토큰 관리
  - `useProjectStore`: 현재 선택된 프로젝트 및 워크스페이스 상태 관리
- [ ] **API 계층 강화 (TanStack Query + Axios)**
  - `src/lib/axios.ts` 내 인터셉터 보완 (에러 핸들링, 토큰 갱신 로직)
  - 커스텀 훅 구조화 (`src/hooks/api/...`)
- [ ] **Layout 시스템 구축**
  - `Navbar.tsx` 고도화 (로그인 상태에 따른 메뉴 분기)
  - `Sidebar.tsx` 구현 (Private/Public 트랙 전환 및 메뉴 내비게이션)

## 2. 인증 및 사용자 (Auth & User)

- [ ] **Google OAuth2 로그인 연동**
  - `POST /api/v1/oauth2/authorization/google` 처리 로직
- [ ] **사용자 프로필 및 활동 내역**
  - `GET /api/v1/users/me`: 현재 로그인 사용자 정보 연동
  - `GET /api/v1/users/{userId}/activities`: 사용자 활동 피드 구현 (Infinite Scroll 권장)

## 3. Private Workspace (Project Track)

- [ ] **프로젝트 대시보드**
  - `GET /api/v1/projects`: 프로젝트 목록 조회 및 카드 UI 구현
  - `POST /api/v1/projects`: 신규 프로젝트 생성 모달 구현
- [ ] **협업 기능**
  - `PUT /api/v1/projects/{projectId}/invitations/{invitationId}`: 초대 수락/거절 UI
- [ ] **데이터 관리**
  - `POST /api/v1/images/upload`: 의료 이미지 (Single) 업로드 UI 및 프로그레스 바

## 4. AI Workflow (Jobs: Augment -> Train -> Inference)

- [ ] **Data Augmentation (데이터 증강)**
  - `POST /api/v1/projects/{projectId}/jobs/augment`: 증강 파라미터 설정 UI (Recipe 선택 및 커스텀 설정)
  - `GET /api/v1/projects/{projectId}/jobs/{jobId}/images`: 증강된 이미지 결과 프리뷰 (Normal vs Anomaly 비교)
- [ ] **Model Training (모델 학습)**
  - `POST /api/v1/projects/{projectId}/jobs/train`: 학습 시작 요청
  - `POST /api/v1/projects/{projectId}/jobs/{jobId}/train/download`: 학습 완료된 `.pth` 모델 다운로드 기능
- [ ] **실시간 상태 모니터링**
  - `GET /api/v1/projects/{projectId}/jobs`: SSE(Server-Sent Events)를 활용한 작업 진행률 실시간 반영

## 5. Public Community (Public Track)

- [ ] **Dataset 및 Recipe 탐색**
  - `GET /api/v1/community/datasets`: 공개 데이터셋 리스트 및 상세 페이지
  - `GET /api/v1/recipes/search`: Augmentation 레시피 검색 및 필터링
- [ ] **레시피 생성 및 공유**
  - `POST /api/v1/recipes/new`: 새로운 증강 레시피 작성 및 배포 UI
  - `POST /api/v1/recipes/{recipe_id}/fork`: 기존 레시피 복사 및 수정 기능
- [ ] **리뷰 및 피드백**
  - `GET/POST /api/v1/recipes/{recipe_id}/reviews`: 레시피 평점 및 댓글 시스템

## 6. UI/UX 정교화 (Design & Refinement)

- [ ] **다크/라이트 모드 최적화**
  - `land-dark.png`와 `land-white.png`의 시각적 계층 구조(land-hierarchy.png) 반영
- [ ] **반응형 디자인**
  - 모바일 및 태블릿 환경 고려한 레이아웃 대응
- [ ] **알림 시스템**
  - `GET /api/v1/notifications`: 실시간 알림 팝업 및 알림함 구현

## 7. 검증 및 배포 준비

- [ ] **Unit/Integration Test**
  - 주요 비즈니스 로직 및 API 연동 테스트
- [ ] **Build Optimization**
  - Vite 빌드 설정 최적화 및 배포 환경 점검
