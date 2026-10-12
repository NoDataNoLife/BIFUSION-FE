# 팀원 모집 UI 하드코딩 제거 및 중복 지원(409) 트러블슈팅

## 1. 개요
팀원 모집 상세 페이지(`RecruitmentDetail`) 및 전문가 Q&A 상세 페이지(`QnaDetail`)에서 발생한 권한/하드코딩 및 API 에러를 해결하고, 기지원자 상태 UI 분기를 적용했습니다.

---

## 2. 주요 트러블슈팅 및 작업 내역

### 1) 팀원 모집 중복 지원 시 409 Conflict 에러 방어
* **원인:** 백엔드 `RecruitServiceImpl`에서 `existsByRecruit_RecruitIdAndUser_UserId` 검증을 통해 이미 지원한 유저의 재지원을 409 에러(`ALREADY_APPLIED`)로 차단하고 있었으나, 프론트에서 이를 인지하지 못하고 계속 폼을 노출하여 사용자 혼란 발생.
* **해결:**
  - `recruitmentDetail.applications` 목록에서 현재 로그인 유저의 지원 여부(`myApplication`)를 자동 탐색.
  - 이미 지원한 경우 지원 폼을 숨기고, 현재 지원 상태(`PENDING`, `ACCEPTED`, `REJECTED`)를 보여주는 전용 상태 카드 렌더링.
  - 전송 시 409 발생 시 명확한 안내 알림(`"이미 지원한 모집글입니다."`) 출력.

### 2) 팀원 모집글 상세 하드코딩 제거 및 태그 아이콘 수정
* **원인:**
  - 태그(`tags[0]`) 렌더링 시 `MapPin`(위치 핀) 아이콘을 사용하여 태그(예: "백수")가 위치 정보로 오해되는 UI 버그 발생.
  - 핵심 자격 요건(`requirements`), 팀 활동 혜택(`benefits`)이 목업 텍스트로 하드코딩되어 있던 문제.
* **해결:**
  - `MapPin` ➡️ `Tag` 아이콘으로 변경 및 `tags.join(', ')` 전체 출력.
  - 백엔드 실제 응답 필드(`requirements`, `responsibilities`, `benefits`)를 동적 맵핑하도록 UI 전면 개편.

### 3) 전문가 QnA 권한 제어 (`QnaDetail`)
* 일반 연구자 유저에게 전문가 전용 답변 작성 폼이 노출되던 문제를 차단하고, `user.isExpert` 여부에 따라 전문가 전용 안내 컴포넌트 렌더링 분기 적용.

---

## 3. 관련 커밋 및 브랜치
* **브랜치:** `fix/recruitment-ui`
* **주요 커밋:** `ec05a1f`, `146fc5c`, `bd4348e`
