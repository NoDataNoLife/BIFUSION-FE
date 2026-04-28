# BIFUSION 개발 일지 (2026-04-28)

## 1. 개요

레시피(Recipe) 자산의 영속적인 Fork 시스템을 구축하고, 커뮤니티 페이지와 Assets 페이지 간의 데이터 일관성을 확보함.

## 2. 작업 상세 내역

### 2.1 Zustand 기반 Fork 전역 상태 관리 (`src/store/useAssetStore.ts`)

- **목적**: 사용자가 Fork한 레시피 목록을 브라우저 종료 후에도 유지.
- **구현 로직**:
  - `persist` 미들웨어를 사용하여 `localStorage`에 `forkedRecipeIds` 배열을 저장.
  - `toggleFork(id)`: 이미 존재하면 제거, 없으면 추가하는 토글 방식.
  - `isForked(id)`: 현재 레시피의 Fork 여부를 즉시 판단하는 헬퍼 함수.

### 2.2 통합 Mock 데이터 시스템 구축 (`src/store/mockData.ts`)

- **문제 배경**: 각 페이지에서 Mock 데이터를 별도로 정의하여 ID 및 정보 불일치 발생.
- **해결**: 모든 페이지가 참조하는 단일 소스(`ALL_RECIPES`)를 생성하여 데이터 정합성 보장.

### 2.3 Assets 페이지 필터링 로직 고도화 (`src/pages/dashboard/AssetsPage.tsx`)

- **구현 로직**:
  - `forkedRecipeIds`를 구독하여 'Fork한 레시피' 탭에서는 해당 ID에 맞는 데이터만 출력.
  - '내 레시피' 탭에서는 `author === '염승빈'` 조건으로 필터링하여 사용자 소유 자산 구분.

### 2.4 커뮤니티 페이지 연동 (`src/pages/dashboard/CommunityPage.tsx`)

- 통합 Mock 데이터를 기반으로 쇼케이스 리스트를 구성하여, 커뮤니티에서 Fork 클릭 시 Assets 페이지로 즉시 반영되도록 구현.

---

## 3. 트러블슈팅 로그

### Issue 1: 페이지 간 데이터 불일치 및 연동 실패

- **현상**: 커뮤니티에서 'Lung Cancer' 레시피를 Fork했는데, Assets 페이지에서는 '심장 질환' 레시피가 나타나거나 목록에 뜨지 않음.
- **원인**:
  1. 커뮤니티(ID: `SC-001`)와 Assets(ID: `1`) 간의 ID 체계 불일치.
  2. ID가 같아도(`1`) 각 페이지 Mock 데이터에서 정의한 이름이 서로 달랐음.
- **해결**: `mockData.ts`를 신설하여 ID와 데이터 구조를 전역적으로 통일함.

### Issue 2: Vite/TypeScript `SyntaxError` (Requested module does not provide an export named 'Recipe')

- **현상**: 개발 서버에서 `Recipe` 인터페이스를 가져올 때 구문 오류 발생.
- **원인**: TypeScript의 `interface`는 런타임에 값이 존재하지 않는데, 이를 일반 `import` 구문으로 가져오려 할 때 Vite 번들러가 혼동을 일으킴.
- **해결**: `import { ..., type Recipe } from ...`와 같이 `type` 키워드를 명시하여 컴파일 타임에만 사용됨을 보장함.

### Issue 3: Git 브랜치 관리 및 작업 통합

- **현상**: `feature/dashboard-migration` 브랜치에서 너무 많은 작업이 누적되어 관리가 어려워짐.
- **해결**:
  1. 현재까지의 작업을 `main`으로 강제 머지 및 원격 푸시.
  2. 새로운 기능 단위 브랜치(`feature/asset-fork-system`)를 생성하여 작업 분리.
  3. 향후 **Pull Request(PR)** 기반의 정석적인 협업 프로세스 도입 결정.

## 4. 향후 과제

- 실제 API 연동 시 `useAssetStore`를 React Query의 캐시 데이터와 동기화.
- 레시피 상세 페이지 외에 데이터셋(Dataset)에 대한 Fork/저장 기능 확장.
- GitHub Issues를 생성하여 작업 단위를 티켓화하고 PR 메시지에 이슈 번호 기록.
