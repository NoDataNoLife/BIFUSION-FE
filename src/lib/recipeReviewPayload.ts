/** No fabricated/default scores when the comment-only backend is enabled. */
export function recipeReviewPayload(content: string, commentOnly: boolean, rating = 5, parentReviewId?: number) {
  const text = content.trim();
  if (!text) throw new Error('댓글 내용을 입력해 주세요.');
  if (parentReviewId != null) return { content: text, parentReviewId };
  if (commentOnly) return { content: text };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('평점을 선택해 주세요.');
  return { content: text, rating };
}
