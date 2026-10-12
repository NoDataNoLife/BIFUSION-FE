# 전문가 검증 모달 API 연동

## 개요
기존에 프론트엔드 내에서 콘솔 로그만 출력하던 `VerificationRequestModal`을 실제 백엔드 API와 연동하여, 사용자가 데이터셋이나 레시피에 대해 전문가 검증을 요청할 수 있도록 기능을 구현했습니다.

## 주요 변경 사항

### 1. `useCommunityStore` 상태 관리 및 API 액션 추가
```typescript
requestExpertVerification: async (targetType, targetId, reason, reward) => {
  try {
    await api.post('/api/v1/experts/verification/request', {
      targetType,
      targetId,
      reason,
      reward
    });
  } catch (error) {
    throw error;
  }
}
```
* 백엔드의 `POST /api/v1/experts/verification/request` 엔드포인트를 호출하는 `requestExpertVerification` 함수를 추가했습니다.

### 2. UI 컴포넌트 연동 (`AssetDatasetDetail.tsx`, `RecipeDetail.tsx`)
```typescript
const handleVerificationSubmit = async (reason: string, reward: number) => {
  try {
    await requestExpertVerification('DATASET', dataset.id, reason, reward);
    alert('검증 요청이 완료되었습니다.');
    setShowVerificationModal(false);
  } catch (error) {
    alert('검증 요청에 실패했습니다.');
  }
};
```
* 모달의 `onSubmit` 이벤트 핸들러를 수정하여 스토어의 `requestExpertVerification` 액션을 호출합니다.
* 성공 시 알림 메시지와 함께 모달이 자동으로 닫히도록 흐름을 개선했습니다.

## 기대 효과
* 사용자가 직접 자신의 자산(레시피, 데이터셋)을 전문가에게 검증 요청할 수 있는 플로우 완성.
