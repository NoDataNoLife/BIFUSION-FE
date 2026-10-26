import type { RecipeDetailResponse } from '../store/useCommunityStore';

export interface RecipeDraft {
  title: string; description: string; overview: string; modelName: string;
  steps: string; sampler: string; cfgScale: string; seed: string; resolution: string; batchSize: string;
  features: string[]; recommendations: string[];
}
export const newRecipeDraft = (): RecipeDraft => ({
  title: '', description: '', overview: '', modelName: 'BIFUSION-Diffusion-v2.1',
  steps: '50', sampler: 'Euler a', cfgScale: '7.5', seed: '42', resolution: '512x512', batchSize: '4',
  features: [], recommendations: [],
});
export function draftFromRecipe(recipe: RecipeDetailResponse): RecipeDraft {
  if (recipe.isDeleted) throw new Error('삭제된 레시피는 불러올 수 없습니다.');
  const settings = recipe.settings;
  return {
    title: recipe.title ?? '', description: recipe.description ?? '', overview: recipe.overview?.content ?? '',
    modelName: settings?.model ?? '', steps: settings?.steps == null ? '' : String(settings.steps),
    sampler: settings?.sampler ?? '', cfgScale: settings?.cfgScale == null ? '' : String(settings.cfgScale),
    seed: settings?.seed == null ? '' : String(settings.seed), resolution: settings?.resolution ?? '',
    batchSize: settings?.batchSize == null ? '' : String(settings.batchSize),
    features: [...(recipe.overview?.features ?? [])], recommendations: [...(recipe.overview?.recommendations ?? [])],
  };
}
export function recipeRegistrationPayload(draft: RecipeDraft, isPublic: boolean) {
  const { title, description, overview, modelName, sampler, resolution, features, recommendations } = draft;
  if (![title, description, modelName, sampler, resolution].every(value => value.trim())) throw new Error('필수 기본 정보와 생성 설정을 입력해 주세요.');
  const integer = (value: string, label: string, minimum: number) => {
    const number = Number(value);
    if (!value.trim() || !Number.isInteger(number) || number < minimum || number > 2147483647) throw new Error(`${label} 값을 확인해 주세요.`);
    return number;
  };
  const scale = Number(draft.cfgScale);
  if (!draft.cfgScale.trim() || !Number.isFinite(scale) || scale < 0) throw new Error('CFG Scale 값을 확인해 주세요.');
  // Register as MINE. Sending forkedFromId would classify the new item as FORKED again.
  return { title: title.trim(), description: description.trim(), modelName: modelName.trim(),
    steps: integer(draft.steps, '스텝', 1), sampler: sampler.trim(), cfgScale: scale,
    seed: integer(draft.seed, '시드', -2147483648), resolution: resolution.trim(), batchSize: integer(draft.batchSize, '배치 크기', 1),
    overview: overview.trim() || undefined, features: [...features], recommendations: [...recommendations], isPublic };
}
