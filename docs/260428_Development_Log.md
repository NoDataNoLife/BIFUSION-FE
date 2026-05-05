# BIFUSION 개발 일지 (2026-04-28)

## 1. 개요

레시피(Recipe) 자산의 영속적인 Fork 시스템을 구축하고, 커뮤니티 페이지와 Assets 페이지 간의 데이터 일관성을 확보함. 또한 실제 API 명세에 맞춰 데이터 구조를 리팩토링함.

## 2. 작업 상세 내역

### 2.1 Zustand 기반 Fork 전역 상태 관리 (`src/store/useAssetStore.ts`)

- **목적**: 사용자가 Fork한 레시피 목록을 브라우저 종료 후에도 유지.
- **구현 로직**:
  - `persist` 미들웨어를 사용하여 `localStorage`에 `forkedRecipeIds` 배열을 저장.
  - `toggleFork(id)`: 이미 존재하면 제거, 없으면 추가하는 토글 방식.
  - `isForked(id)`: 현재 레시피의 Fork 여부를 즉시 판단하는 헬퍼 함수.

### 2.2 통합 Mock 데이터 시스템 구축 (`src/store/mockData.ts`)

- **해결**: 모든 페이지가 참조하는 단일 소스(`ALL_RECIPES`)를 생성하여 데이터 정합성 보장.

### 2.3 API 명세 동기화 및 리팩토링

- **목적**: 백엔드 API 명세서(JSON)와 프론트엔드 데이터 구조를 일치시켜 향후 통합 비용 최소화.
- **주요 변경**:
  - `name` → `title`, `thumbnail` → `thumbnailUrl`, `forkCount` → `forkedCount` 등으로 필드명 변경.
  - `overview`, `settings` 등 중첩 객체 구조 도입 및 UI 연동.
  - 하드코딩된 작성자 비교 로직을 `useAuthStore`의 현재 유저 정보와 비교하도록 동적화.

### 2.4 Assets 페이지 필터링 로직 고도화 (`src/pages/dashboard/AssetsPage.tsx`)

- **구현 로직**:
  - `forkedRecipeIds`를 구독하여 'Fork한 레시피' 탭에서는 해당 ID에 맞는 데이터만 출력.
  - '내 레시피' 탭에서는 `author === user.name` 조건으로 필터링하여 사용자 소유 자산 구분.

### 2.5 커뮤니티 페이지 연동 (`src/pages/dashboard/CommunityPage.tsx`)

- 통합 Mock 데이터를 기반으로 쇼케이스 리스트를 구성하여, 커뮤니티에서 Fork 클릭 시 Assets 페이지로 즉시 반영되도록 구현.

---

## 3. 트러블슈팅 로그

### Issue 1: 페이지 간 데이터 불일치 및 연동 실패

- **현상**: 커뮤니티에서 'Lung Cancer' 레시피를 Fork했는데, Assets 페이지에서는 '심장 질환' 레시피가 나타남.
- **원인**: 각 페이지에서 ID `1`에 서로 다른 레시피 이름을 매핑하여 발생한 문제.
- **해결**: `mockData.ts`를 신설하여 ID와 데이터 구조를 전역적으로 통일함.

### Issue 2: Vite/TypeScript `SyntaxError`

- **현상**: `Recipe` 인터페이스를 가져올 때 구문 오류 발생.
- **해결**: `import { type Recipe }`와 같이 `type` 키워드를 명시하여 해결.

### Issue 3: 컴포넌트 간 작성자 관리 도구 노출 불일치

- **현상**: Assets 페이지에서는 보이는 '레시피 삭제' 등의 도구가 커뮤니티 페이지를 통해 진입하면 보이지 않음.
- **원인**: `RecipeDetail` 호출 시 `isAuthor` Props를 커뮤니티 페이지에서 누락함.
- **해결**: `CommunityPage`에서도 현재 로그인 유저와 작성자 명을 비교하여 `isAuthor` 값을 주입하도록 수정.

## 4. 향후 과제

- 실제 API 연동 시 `useAssetStore`를 React Query의 캐시 데이터와 동기화.
- 레시피 상세 페이지 외에 데이터셋(Dataset)에 대한 Fork/저장 기능 확장.
