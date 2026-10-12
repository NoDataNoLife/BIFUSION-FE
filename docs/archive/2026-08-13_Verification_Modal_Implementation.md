# 전문가 검증 요청 모달 UI 구현 및 연동

## 개요

Research Hub(커뮤니티) 내에서 업로드된 데이터셋이나 레시피에 대해 "전문가 검증"을 요청할 수 있는 모달 UI를 선제적으로 구현하여 백엔드 팀과 데이터 페이로드(Payload) 및 흐름을 논의하기 위한 시안을 작성했습니다.

## 주요 작업 내역

1. **`VerificationRequestModal` 컴포넌트 신규 생성**
   - **위치**: `src/components/community/modals/VerificationRequestModal.tsx`
   - **기능**:
     - `reason` (검증 요청 사항 - Textarea): 전문가에게 중점적으로 검토받고 싶은 부분 입력 (다크모드 스타일링 완벽 적용)
     - `reward` (희망 제공 리워드 - Number Input): 전문가에게 지급할 포인트 설정 (기본값 500P)
     - `onSubmit`: 이유와 리워드 값을 부모 컴포넌트로 전달
   - **UI/UX**: 전체 다크모드 톤앤매너(`bg-card`, `bg-background`, `border-border`)에 맞추어 `lucide-react` 아이콘(`Award`, `AlertCircle`)과 함께 디자인 구성.

2. **상세 페이지 2곳 연동 완료**
   - **`AssetDatasetDetail.tsx`**
     - 기존에 존재하던 "검증 신청하기" 버튼에 `onClick={() => setShowVerificationModal(true)}` 이벤트 바인딩.
     - 하단에 모달 컴포넌트 마운트 로직 추가.
     - *사이드 작업*: 누락되었던 `handleDeleteConfirm` 선언을 추가하여 Lint 에러(이름을 찾을 수 없습니다) 해결.
   - **`RecipeDetail.tsx`**
     - 설정(`config`) 탭이 아닌 사이드바에 기존에 렌더링되던 "전문가 검증을 신청하세요" 카드 버튼에 이벤트 바인딩.
     - 하단에 모달 컴포넌트 마운트 로직 추가.

## 향후 백엔드 협업 포인트 (TODO)

- **API Endpoint**: `POST /community/verification-requests` 형태의 API 설계 논의
- **Request Body**:

  ```json
  {
    "assetId": "string (레시피 또는 데이터셋 ID)",
    "assetType": "DATASET | RECIPE",
    "reason": "string (요청 사항)",
    "reward": "number (포인트)"
  }
  ```

- **Response**: 생성된 검증 요청글 ID 또는 상태값 반환

## PR 준비 및 배포 브랜치

- **브랜치명**: `feature/verification-modal`
- 본 문서와 함께 PR에 포함되어 백엔드 팀이 기획을 직관적으로 확인하고 API 스펙을 역제안할 수 있도록 돕습니다.
