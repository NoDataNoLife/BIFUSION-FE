# 커뮤니티 상세 페이지 API 연동 및 작성자 권한(수정/삭제) 구현 문서

## 1. 개요

기존에 하드코딩된 Mock 데이터로 렌더링되던 커뮤니티(Research Hub) 상세 페이지들을 백엔드 API와 실제 연동하고, 각 페이지에 **"작성자 본인 여부"**를 판별하여 수정/삭제 권한을 부여하는 로직을 추가했습니다.

## 2. 주요 구현 내용

### 2.1 Zustand 스토어 (`useCommunityStore.ts`) 확장

- **DatasetDetailResponse 타입 추가**: 기존 `DatasetListResponse` 타입에 상세 조회용 필드(`usageExample` 등)를 포함하여 확장했습니다.
- **새로운 상태(State) 추가**: `datasetDetail` (단일 데이터셋 상세 정보) 상태를 추가했습니다.
- **새로운 액션(Action) 추가**:
  - `fetchDatasetDetail(datasetId)`: 특정 쇼케이스 데이터셋의 상세 정보를 불러옵니다.
  - `createQnaAnswer(qnaId, content)`: 특정 QnA 게시글에 답변을 등록하고, 성공 시 `fetchQnaDetail`을 재호출하여 화면을 즉시 갱신(Refetch)합니다.

### 2.2 작성자 권한 판별 로직 적용 (`isAuthor`)

커뮤니티의 모든 상세 페이지 컴포넌트(`CommunityDatasetDetail`, `QnaDetail`, `RecruitmentDetail`)에서 다음과 같은 일관된 로직으로 작성자 본인 여부를 판별합니다.

```tsx
// 현재 로그인한 유저 정보 가져오기
const { user } = useAuthStore();
// 게시글 작성자 ID와 현재 로그인한 유저 ID 비교
const isAuthor = user?.userId === postDetail?.author.userId;
```

판별 결과(`isAuthor`)가 `true`일 경우, 화면 헤더 영역에 **[수정]** 및 **[삭제]** 버튼 렌더링을 활성화합니다. (현재 삭제 동작은 mock alert으로 연동되어 있으며, 추후 실제 delete API 연결 예정)

### 2.3 컴포넌트별 상세 연동 내용

#### A. QnaDetail.tsx (전문가 QnA 상세)

- **Props 변경**: 기존에 객체(`qaPost`)를 통째로 넘겨받던 방식에서, ID(`qnaId`)만 넘겨받아 컴포넌트 내부에서 `fetchQnaDetail`을 호출해 데이터를 스스로 가져오도록 변경했습니다.
- **답변 렌더링**: 로컬 State(`comments`) 배열로 렌더링하던 로직을 폐기하고, 백엔드 응답 데이터인 `qnaDetail.answers`를 순회하며 실제 데이터를 렌더링합니다.
- **답변 등록**: 텍스트 에어리어에서 `handleSubmitComment` 실행 시 `createQnaAnswer` API가 호출됩니다.

#### B. CommunityDatasetDetail.tsx (데이터셋 쇼케이스 상세)

- **Props 변경**: `QnaDetail`과 동일하게 `datasetId`를 받아 `fetchDatasetDetail`을 호출합니다.
- **마크다운 렌더링**: 백엔드에서 넘겨주는 `usageExample` 필드가 존재할 경우, `ReactMarkdown`과 `rehype-highlight`를 통해 코드 하이라이팅이 적용된 풍부한 설명서가 렌더링됩니다.

#### C. RecruitmentDetail.tsx (팀원 모집 공고 상세)

- **권한에 따른 하단 UI 분기 완벽 대응**:
  - `isAuthor`가 **true**일 경우: 하단에 폼 대신 **지원자 목록 리스트(`applications`)**가 카드 형태로 노출되며, 각 지원자별 상태(PENDING)에 따라 `[수락]`/`[거절]` 버튼(`updateApplicationStatus`)이 표시됩니다.
  - `isAuthor`가 **false**일 경우: 기존과 동일하게 자신의 이력서 url과 동기를 입력하여 제출할 수 있는 **[팀 합류 지원하기] 폼**이 노출됩니다.

## 3. 브랜치 및 향후 계획

- **브랜치명**: `feature/community-api-integration`
- **백엔드 논의 필요 사항**: 삭제(Delete) 버튼 클릭 시 호출할 각 도메인별 삭제 API Endpoint 스펙 확인이 필요합니다.
