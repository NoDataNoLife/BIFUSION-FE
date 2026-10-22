# 기존 UI 유지를 위한 최소 백엔드 요청

작성일: 2026-10-22. 확인 기준: BE `origin/main`의 `d000caba`.
아래 경로 제안은 합의 전이며, FE에서 존재하지 않는 API를 호출하지 않는다.
일반 목록·상세·파일 다운로드·프로필·알림은 기존 API로 연결하며 화면 복원을 위해 새 API가 필요하지 않다.

## 우선 요청: 신규 집계 API 1개

대시보드의 스토리지와 월간 증강 카드를 채우기 위한 `GET /api/v1/users/me/resource-usage`를 제안한다.
기존 사용자 정보의 `points`는 이미 제공되므로 중복 구현하지 않는다.

필요한 최소 응답 (`CommonResponse.data`):

```json
{
  "storageUsedBytes": 0,
  "storageLimitBytes": null,
  "monthlyAugmentations": 0,
  "monthlyAugmentationLimit": null,
  "periodStart": "2026-10-01T00:00:00+09:00",
  "periodEnd": "2026-11-01T00:00:00+09:00"
}
```

- 로그인한 사용자가 소유한 파일의 실제 저장 용량을 바이트로 집계한다. 프로젝트 공유 파일·중복 참조·삭제 파일의 포함 기준을 확정한다.
- 월간 증강 횟수의 단위를 명확히 한다. 제안: 기간 내 성공한 AUGMENT 작업 수(생성 이미지 수와 구분).
- 한도가 없는 경우 `null`, 사용량이 실제로 없는 경우 `0`. 미집계도 `0`으로 대신하지 않는다.
- 기간은 시작 포함·끝 제외이며 타임존을 명시한다. 예시 수치는 요청 형식 설명용이다.
- 한도 정책이 아직 없다면 사용량만 먼저 제공해도 된다. FE는 한도 없이 수치만 표시할 수 있다.
- 제공 전 FE는 카드 구조와 아이콘을 유지하고 ‘집계 준비 중’으로 표시한다.

## 기존 응답 보완: 프로필 노출 상태

`GET /api/v1/mypage/activities`의 각 항목에 `isMyPageVisible: boolean`을 추가해 달라.
현재 `isPublic`은 콘텐츠 자체의 공개 여부이며 프로필 노출 여부와 다르다.
`PATCH /api/v1/users/me/activities/visibility`로 저장한 노출 상태를 새로고침 후 다시 읽을 수 있어야 한다.

- 예: `{ "activityId": 10, "type": "RECIPE", "isPublic": true, "isMyPageVisible": false, ... }`
- 기존 PATCH는 유지 가능하다. 응답에서 저장된 노출 상태를 명확히 하거나, 위 GET 재조회로 확정할 수 있게 한다.
- 콘텐츠가 비공개이면 다른 사람의 프로필 조회에 노출되지 않아야 한다.
- FE는 필드가 제공되기 전까지 ‘콘텐츠 공개 여부’와 ‘프로필에 표시/숨김’ 명령을 구분한다. 저장됐다고 콘텐츠 공개 상태를 바꾸지 않는다.

## 검수 신청을 활성화할 때 필요한 계약

현재 `POST /api/v1/inspections`는 `AUGMENTED_DATA`만 지원한다.
`targetId`는 증강 설정(AugmentationConfig) ID이므로 `datasetId`를 그대로 보내면 안 된다.

최소 제안: 증강 데이터셋 상세 응답에 검수 대상을 제공한다.

```json
{
  "inspectionTarget": {
    "targetType": "AUGMENTED_DATA",
    "targetId": 123,
    "canRequest": true
  }
}
```

- 소유자·대상 매핑·중복 신청 가능 여부를 서버에서 판정한다. 최종 POST에서도 권한·포인트·중복을 다시 검증한다.
- 원본 데이터셋이나 레시피는 현재 범위에서 신청 준비 중으로 표시해도 된다.
- 두 종류까지 검수를 지원하려면 기존 신청 API의 타입만 허용하는 것으로 끝나지 않는다. 전문가 목록·상세·샘플·승인/거절·결과 조회까지 지원 범위를 함께 확정해야 한다. 이는 별도 기능 확장이다.

## 기존 응답의 집계 수정

`GET /api/v1/community/recipes/{recipeId}`의 `reviewCount`가 `RecipeDetailResponse.from()`에서 `0`으로 고정돼 있다.
실제 최상위 리뷰 수를 집계하도록 수정해 달라. 답글 포함 여부는 리뷰 목록의 `totalElements`와 일치시키면 된다.
FE는 리뷰 목록 API의 `totalElements`가 있으면 그 값을 우선 표시한다.

## 이번 배포에 추가하지 않아도 되는 API

- 프로젝트 목록·작업 상태: `/projects`, `/projects/{projectId}/jobs` 사용 가능. 통합 대시보드 API는 성능 개선이 필요할 때 검토.
- 포인트: `/users/me.points` 사용 가능.
- 커뮤니티 검색·정렬·페이지 이동: 기존 `/community/*` 사용 가능.
- 내 자산 전체 검색: 현재 `/assets/recipes`, `/assets/datasets`에는 `keyword`가 없어 FE는 ‘현재 페이지 검색’으로 안내. 전체 검색이 필요할 때 기존 목록에 `keyword` 추가.
- 팀 협업·작업 완료 타임라인: 현재 `/mypage/activities`는 본인 커뮤니티 글 내역만 제공. FE는 그 범위를 명확히 표시하며 통합 협업 피드는 별도 요구사항으로 둔다.
- 압축 파일 내부 목록: 현재 단일 업로드 파일 정보와 다운로드를 제공. 내부 파일 열람 API는 필수가 아니다.

## 전달용 요약

프론트는 기존 디자인을 복원하고 기존 API 연동을 유지했습니다. 우선 필요한 신규 API는 대시보드의 스토리지·월간 증강 집계 1개입니다. 기존 활동 조회에 프로필 노출 상태(isMyPageVisible)를 추가하고, 레시피 상세의 0으로 고정된 reviewCount를 실제 집계로 바꿔주시면 됩니다. 증강 자산 화면에서 검수 신청까지 연결하려면 datasetId와 별개인 검수 targetType/targetId 매핑이 필요합니다. 원본 데이터·레시피 검수 확대는 별도 범위로 합의하면 됩니다.
