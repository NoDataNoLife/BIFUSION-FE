/** Enable only after the matching backend change is deployed. */
export const invitationRolesEnabled = true;
export const commentOnlyReviewsEnabled = import.meta.env?.VITE_COMMENT_ONLY_REVIEWS_ENABLED === 'true';

/** release #264 계약 적용. false 환경변수로 긴급 비활성화할 수 있다. */
export const augmentationRecipesEnabled = import.meta.env?.VITE_AUGMENTATION_RECIPES_ENABLED !== 'false';

/** Screen preview is public; API-dependent actions remain separately gated. */
export const augmentationRecipeScreenEnabled = true;
