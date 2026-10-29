/** Enable only after the matching backend change is deployed. */
export const invitationRolesEnabled = true;
export const commentOnlyReviewsEnabled = import.meta.env?.VITE_COMMENT_ONLY_REVIEWS_ENABLED === 'true';

/**
 * FE 연동 스위치. BE 배포만으로 자동 활성화되지 않는다.
 * 활성화 전 FE 작업: 실제 응답 → 설정 5개 자동 입력, 등록 payload 정합성,
 * 개인 저장/공개 사본/포크 불러오기 통합 검증. 이후 환경변수를 true로 설정한다.
 */
export const augmentationRecipesEnabled = import.meta.env?.VITE_AUGMENTATION_RECIPES_ENABLED === 'true';

/** Screen preview is public; API-dependent actions remain separately gated. */
export const augmentationRecipeScreenEnabled = true;
