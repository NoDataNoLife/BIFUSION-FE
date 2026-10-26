/** Enable only after the matching backend change is deployed. */
export const invitationRolesEnabled = import.meta.env?.VITE_INVITATION_ROLES_ENABLED === 'true';
export const commentOnlyReviewsEnabled = import.meta.env?.VITE_COMMENT_ONLY_REVIEWS_ENABLED === 'true';
