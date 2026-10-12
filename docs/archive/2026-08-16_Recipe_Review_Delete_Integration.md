# 레시피 리뷰 삭제 기능 연동

## 개요
사용자가 커뮤니티나 자신의 에셋에서 레시피에 남겨진 리뷰(댓글)를 삭제할 수 있도록 프론트엔드 UI를 구성하고, 백엔드 삭제 API와 연동했습니다.

## 주요 변경 사항

### 1. 삭제 버튼 권한 표시 로직 (`RecipeDetail.tsx`)
```typescript
{/* 본인이 작성한 리뷰이거나, 레시피 작성자인 경우에만 삭제 버튼 표시 */}
{(isAuthor || review.author === user?.name) && (
  <button 
    onClick={() => handleDeleteReview(review.id)}
    className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
  >
    <Trash2 size={16} />
  </button>
)}
```
* 해당 리뷰를 직접 쓴 사용자이거나, 레시피의 소유자인 경우에만 우측에 쓰레기통 아이콘이 나타나게 방어 로직을 추가했습니다.

### 2. 리뷰 삭제 API 연동 (`useCommunityStore.ts`)
```typescript
deleteRecipeReview: async (recipeId: number, reviewId: number) => {
  try {
    await api.delete(`/community/recipes/${recipeId}/reviews/${reviewId}`);
  } catch (error) {
    throw error;
  }
}
```
* 실제 백엔드 API (`DELETE /community/recipes/{recipeId}/reviews/{reviewId}`)를 호출하도록 스토어 액션을 작성했습니다.
* 삭제 성공 시 프론트엔드에서 리뷰 목록 상태를 다시 불러오거나(혹은 업데이트), 실패 시 에러 메시지를 띄우는 예외 처리를 적용했습니다.

## 기대 효과
* 불건전한 리뷰나 자신이 잘못 작성한 리뷰를 유저 스스로 관리할 수 있습니다.
