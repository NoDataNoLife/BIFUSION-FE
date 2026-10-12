# 에셋 및 커뮤니티 isPublic 실 API 연동 및 전체 알림 페이지 신설

* **일자:** 2026-08-20
* **작업 브랜치:** `feat/asset-community-ispublic-api`

---

## 1. 개요 및 배경
백엔드 PR #177(`isPublic` 파라미터 추가), #166(모집글 작성자 및 지원자 연동), #157/#158/#160(커뮤니티 DELETE API)이 `develop` 브랜치에 머지됨에 따라, 프론트엔드에 남아있던 Mock 처리 로직을 실 API로 전면 교체하고 전체 알림 센터 페이지를 신설했습니다.

---

## 2. 주요 구현 내용

### 1) 데이터셋 및 레시피 `isPublic` 실 API 연동
* **`DatasetCreateForm.tsx`:**
  - `context === 'ASSET'` Mock 차단 제거
  - `isPublic = context !== 'ASSET'` (에셋: `false`, 커뮤니티: `true`) 값을 `POST /api/v1/community/datasets` 요청 본문에 전송
* **`ShowcaseCreateForm.tsx`:**
  - 미구현 상태였던 폼을 완전한 레시피 생성 UI로 구현
  - 하이퍼파라미터(모델명, Steps, Sampler, CFG Scale, Seed, Resolution, Batch Size) 및 특징/용도 태그 입력 지원
  - `POST /api/v1/community/recipes`와 `isPublic` 플래그 연동

### 2) 커뮤니티 레시피 목록 및 DELETE API 연동
* **`useCommunityStore.ts`:**
  - `fetchRecipeList`, `fetchRecipeDetail`, `forkRecipe` 추가
  - `deleteQna`, `deleteRecruitment`, `deleteDataset` 삭제 API 액션 추가
* **`CommunityPage.tsx`:**
  - 쇼케이스 탭에서 `fetchRecipeList`를 호출하여 실제 공개 레시피 목록을 렌더링
  - Q&A, 팀원 모집, 데이터셋 상세의 삭제 버튼 클릭 시 실제 `DELETE` API 호출 및 목록 자동 갱신

### 3) 전체 알림 센터 페이지 (`/dashboard/notifications`) 신설
* **`NotificationsPage.tsx`:**
  - 카테고리별(전문가/검수, 데이터 증강, 팀/프로젝트, 커뮤니티) 필터링 탭 및 읽지 않은 알림 토글 지원
  - 알림 검색 기능 및 모두 읽음 처리, 소프트 삭제(휴지통) 기능 지원
* **`NotificationCenter.tsx` & `App.tsx`:**
  - 헤더 알림 패널의 하단 `[전체 알림 기록 보기]` 클릭 시 `/dashboard/notifications`로 즉시 라우팅 연결

---

## 3. 검증 결과
* `npx vite build` 2,275개 모듈 번들 빌드 성공 (Exit Code 0)
* 데이터셋/레시피 생성 시 `isPublic` 파라미터가 정확하게 서버로 전달됨을 확인
