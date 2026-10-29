/** Enable only after the matching backend change is deployed. */
export const invitationRolesEnabled = true;
export const commentOnlyReviewsEnabled = import.meta.env?.VITE_COMMENT_ONLY_REVIEWS_ENABLED === 'true';

/** Proposed recipe API: enable only after BE contract and deployment are verified. */
export const augmentationRecipesEnabled = import.meta.env?.VITE_AUGMENTATION_RECIPES_ENABLED === 'true';

/** Screen preview is public; API-dependent actions remain separately gated. */
export const augmentationRecipeScreenEnabled = true;
