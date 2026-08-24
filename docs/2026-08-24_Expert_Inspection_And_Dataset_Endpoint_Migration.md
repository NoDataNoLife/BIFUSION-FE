# 전문가 검수 실 API 전면 연동 및 데이터셋 엔드포인트 이전 (`/datasets`)

* **일자:** 2026-08-24
* **작업 브랜치:** `feat/expert-and-dataset-api-integration`

---

## 1. 개요 및 배경
백엔드 최신 리팩토링(PR #180 Dataset Controller 분리 및 수정 API 추가, PR #179 레시피 삭제, PR #174/#175/#181/#182 전문가 검수 API 5종)에 맞춰, 프론트엔드의 데이터셋 엔드포인트를 `/datasets`로 정규화하고 전문가 검수 대시보드 및 상세 검수 인터랙션을 실 서버 API와 전면 연동했습니다.

---

## 2. 주요 작업 내역

### 1) 데이터셋 엔드포인트 `/datasets` 이전 (PR #180 대응)
* **`DatasetCreateForm.tsx`:** `POST /community/datasets` ➡️ `POST /datasets`로 변경
* **`useCommunityStore.ts`:**
  - 데이터셋 상세 조회: `GET /community/datasets/{id}` ➡️ `GET /datasets/{id}`
  - 데이터셋 삭제: `DELETE /community/datasets/{id}` ➡️ `DELETE /datasets/{id}`
  - 데이터셋 수정 API 연동: `updateDataset(id, payload)` (`PATCH /datasets/{id}`) 신규 구현

### 2) 레시피 삭제 API 연동 (PR #179 대응)
* **`useCommunityStore.ts`:** `deleteRecipe(recipeId)` (`DELETE /community/recipes/{recipeId}`) 액션 추가
* **`RecipeDetail.tsx` & `CommunityPage.tsx`:** 작성자 본인일 때 삭제 버튼 노출 및 클릭 시 실 삭제 API 호출 후 목록 자동 갱신

### 3) 전문가 검수(Expert Inspection) 실 API 전면 연동 (PR #174, #175, #181, #182 대응)
* **`src/store/useExpertStore.ts` 신규 구축:**
  - `fetchInspectionRequests(status)`: `GET /api/v1/inspections` (검수 요청 목록 조회)
  - `startInspection(requestId)`: `POST /api/v1/inspections/{requestId}/start` (검수 착수)
  - `fetchInspectionDetail(requestId)`: `GET /api/v1/inspections/{requestId}` (검수 상세 및 샘플 이미지 목록 조회)
  - `saveDraftComment(requestId, draftComment)`: `POST /api/v1/inspections/{requestId}/draft-comment` (최종 코멘트 임시저장)
  - `saveImageComment(requestId, imageId, comment)`: `POST /api/v1/inspections/{requestId}/images/{imageId}/comment` (이미지별 코멘트 저장)
  - `submitInspectionResult(requestId, status, finalComment)`: `POST /api/v1/inspections/{requestId}/result` (최종 승인/반려 제출)
* **`ExpertPage.tsx`:**
  - Mock(`mockReviewRequests`) 제거 ➡️ 상태별(`PENDING`, `IN_PROGRESS`, `COMPLETED`) 실 서버 요청 목록 렌더링
  - "검수 시작하기" 클릭 시 `startInspection` API 호출 후 검수 중 탭으로 자동 전환
* **`ReviewDetailPage.tsx`:**
  - 실제 검수 대상의 합성 샘플 이미지 목록 바인딩
  - 이미지별 코멘트 입력/수정 시 `saveImageComment` 실시간 API 저장
  - 상단 "임시 저장" 클릭 시 `saveDraftComment` 호출
  - "최종 승인" 및 "검수 반려" 시 `submitInspectionResult` 호출

---

## 3. 검증 결과
* `npx vite build` 2,276개 모듈 번들 빌드 성공 (Exit Code 0)
* 데이터셋 생성/상세/삭제 시 `/datasets/**` 경로로 정상 요청됨을 확인
* 전문가 검수 목록 조회 및 이미지별 코멘트 저장 API 인터페이스 무결성 확인
