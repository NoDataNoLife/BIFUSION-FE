# 커뮤니티 API 연동 및 UI 폼 상세 로직 문서

본 문서는 BIFUSION 프로젝트의 `Research Hub(커뮤니티)` 페이지 내 게시글 생성 폼 및 리스트 렌더링에 대한 상세 설계 및 구현 로직을 정리한 문서입니다.

## 1. 개요 및 구조
커뮤니티 기능은 크게 4가지 카테고리(데이터셋, 전문가 Q&A, 팀원 모집, 쇼케이스)로 나뉩니다.
사용자가 게시글을 생성할 때, 통합된 하나의 모달(`CreatePostModal.tsx`)에서 1단계로 카테고리를 선택하고, 2단계에서 각 카테고리에 맞는 맞춤형 폼(Form)으로 전환되는 구조를 가집니다.

## 2. 모달 및 폼 라우팅 로직
`CreatePostModal.tsx`는 `step` 상태를 가지고 있어, `step === 1`일 때는 4개의 카테고리 선택 버튼을 렌더링하고, 사용자가 선택 시 `step`을 2로 변경하며 선택된 `postType`에 해당하는 하위 폼 컴포넌트를 동적으로 렌더링합니다.
- `postType === 'dataset'` ➔ `<DatasetCreateForm />`
- `postType === 'qa'` ➔ `<QnaCreateForm />`
- `postType === 'recruitment'` ➔ `<RecruitmentCreateForm />`
- `postType === 'showcase'` ➔ `<ShowcaseCreateForm />` (임시)

## 3. 개별 폼 컴포넌트 상세 구현 및 백엔드 DTO 매핑

### 3.1 전문가 Q&A (`QnaCreateForm.tsx`)
- **API 연동**: `POST /api/v1/community/qna`
- **백엔드 DTO (`ExpertQnaRequest`)**: `title`, `content`, `tags`
- **구현 로직**: 
  - 상태 관리: `useState`를 통해 제목, 내용, 태그 배열을 관리합니다.
  - 태그 입력: 사용자가 텍스트를 입력하고 Enter 키를 누르면 `e.preventDefault()`로 폼 제출을 막고 태그 배열(`tags`)에 문자열을 추가합니다. `x` 버튼 클릭 시 배열에서 삭제됩니다.
  - 제출 시: `title`, `content` 필수 검증 후 axios를 통해 POST 요청을 보내고, 성공 시 `useCommunityStore`의 `fetchQnaList()`를 호출하여 최신 목록을 갱신합니다.

### 3.2 팀원 모집 (`RecruitmentCreateForm.tsx`)
- **API 연동**: `POST /api/v1/community/recruitments`
- **백엔드 DTO (`RecruitmentRequest`)**: `jobTitle`, `organization`, `description`, `teamSize`, `deadline` 및 리스트 형태(`requirements`, `responsibilities`, `benefits`, `tags`)
- **구현 로직**: 
  - 배열 필드가 4개나 존재하여, 공통으로 배열 요소를 추가/삭제할 수 있는 헬퍼 함수(`handleAddToList`, `handleRemoveFromList`)를 구현하여 코드 중복을 최소화했습니다.
  - `deadline`은 `type="date"` 인풋을 통해 `YYYY-MM-DD` 형식으로 수집합니다.

### 3.3 데이터셋 기여 (`DatasetCreateForm.tsx`)
- **API 연동**: `POST /api/v1/files/temp` (파일 업로드), `POST /api/v1/community/datasets` (데이터셋 생성)
- **백엔드 DTO (`DatasetCreateRequest`)**: `title`, `description`, `category`, `license`, `format`, `imageType`, `resolution`, `classes`, `usageExample`, `tags`, **`fileId`**
- **구현 로직 (중요)**:
  1. 폼 데이터 외에 사용자가 `input type="file"`을 통해 파일을 선택하도록 `File` 객체를 상태로 저장합니다.
  2. 폼 제출 시, 텍스트 데이터보다 **파일 업로드를 먼저 수행**합니다.
  3. `FormData` 객체에 `files` 필드로 파일을 담아 `POST /api/v1/files/temp` (Content-Type: `multipart/form-data`)로 전송합니다.
  4. 백엔드의 `TempFileUploadResponse` 리스트를 응답받아, 첫 번째 파일의 고유 `fileId`를 추출합니다.
  5. 확보한 `fileId`와 나머지 텍스트 데이터를 묶어 `POST /api/v1/community/datasets`로 최종 데이터셋 생성 요청을 보냅니다.

## 4. 전역 상태 및 리스트 조회 로직
- **`useCommunityStore.ts` (Zustand)**
  - 각 카테고리의 리스트 데이터(`qnaList`, `datasetList`, `recruitmentList`)와 로딩 상태(`isLoading...`)를 전역으로 관리합니다.
  - 백엔드의 응답 구조인 `PageResponse`를 파싱하여 `response.data.data.content`를 리스트 상태에 저장합니다.
- **`CommunityPage.tsx`**
  - 컴포넌트 마운트 및 탭(`activeTab`) 변경 시 `useEffect`를 통해 스토어의 데이터 패치 함수(`fetchQnaList`, `fetchDatasetList`)를 트리거합니다.
  - 불러온 데이터가 없는 경우를 대비한 Empty State UI를 적용하여 UX를 개선했습니다. (예: "등록된 전문가 Q&A가 없습니다.")

> 추후 백엔드에 팀원 모집 목록 조회(`GET /api/v1/community/recruitments`) API가 추가되면, `CommunityPage.tsx` 내의 주석 처리된 mock 데이터를 스토어 데이터로 손쉽게 교체할 수 있습니다.
