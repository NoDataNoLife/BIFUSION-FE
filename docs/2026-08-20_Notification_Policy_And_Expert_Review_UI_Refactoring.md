# 알림 정책 수립 및 전문가 검수 대시보드 리팩토링

## 1. 개요
백엔드 팀과의 알림(Notification) 도메인 스펙 및 Soft Delete 정책을 최종 확정하고, 전문가 검수 대시보드(`ExpertPage`) 및 검수 상세 페이지(`ReviewDetailPage`)의 UI 요구사항을 반영했습니다.

---

## 2. 주요 작업 내역

### 1) 알림(Notification) 전체 스펙 및 Soft Delete 정책 수립
* **도메인별 알림 유형 정의:**
  - `AUGMENTATION_SUCCESS`, `AUGMENTATION_FAILED` (데이터 증강)
  - `PROJECT_INVITATION`, `INVITATION_ACCEPTED`, `INVITATION_REJECTED` (팀/프로젝트)
  - `EXPERT_APPROVED`, `EXPERT_REJECTED`, `RECIPE_REVIEW_REQUESTED`, `RECIPE_REVIEW_ACCEPTED`, `RECIPE_APPROVED`, `RECIPE_REJECTED`, `DATASET_VERIFIED`, `DATASET_VERIFY_REJECTED` (전문가 인증/검수)
  - `QNA_ANSWERED`, `RECIPE_REVIEW`, `RECRUITMENT_APPLY`, `RECRUITMENT_ACCEPTED`, `RECRUITMENT_REJECTED` (커뮤니티)
* **프론트엔드 라우팅(Deep Link) DTO 규격:**
  - `targetId` (PK) 및 `targetType` (`PROJECT`, `JOB`, `RECIPE`, `DATASET`, `QNA`, `RECRUITMENT`) 필드 포함 합의.
* **알림 Soft Delete 정책:**
  - 알림 삭제 시 DB에서 하드 삭제하지 않고 `is_deleted = true` 플래그 관리.
  - 헤더 알림 팝업에서는 숨기되, 「전체 알림 조회(`/dashboard/notifications`)」 페이지에서 과거 이력을 보존 조회하도록 정책 확정.

### 2) 전문가 검수 대시보드 UI 리팩토링 (`ExpertPage`, `ReviewDetailPage`)
* **데이터 타입 뱃지 제거:** 카드 썸네일 우측 상단의 `CT SCAN`, `X-RAY` 뱃지 및 상세 상단의 불필요한 데이터 타입 표시 전면 제거.
* **검수 완료 카드 상세조회 네비게이션:**
  - '검수 완료' 탭의 정적 카드를 클릭 가능한 버튼(`"승인 완료 / 반려됨 • 검수 결과 보기"`)으로 개편.
  - 클릭 시 `ReviewDetailPage`로 이동하여 최종 승인/반려 상태와 작성된 코멘트를 읽기 전용(Read-only)으로 조회하도록 구현.

### 3) 에셋/커뮤니티 `isPublic` 플래그 아키텍처 수용
* 백엔드 PR #177을 통해 `POST /community/datasets`, `POST /community/recipes`에 `isPublic` 파라미터가 공식 반영됨에 따라, 프론트엔드 내 자산(Assets) 생성 시 `isPublic: false`를 전송하여 비공개 보관하도록 연동 준비 완료.

---

## 3. 관련 커밋 및 브랜치
* **브랜치:** `fix/recruitment-ui`
* **주요 커밋:** `22a2960`, `1b11c1b`
